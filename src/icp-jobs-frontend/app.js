import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as backend_idl, icpCanisterId as backend_id } from '../declarations/icp-jobs-backend';
import { AuthClient } from '@dfinity/auth-client';

async function init() {
  console.log('Initializing...');

  if (process.env.NODE_ENV === 'development') {
    // Use a local identity for development
    const agent = new HttpAgent();
    await agent.fetchRootKey(); // Required only for local development
    const backend = Actor.createActor(backend_idl, {
      agent,
      canisterId: backend_id,
    });
    console.log('Actor initialized in development mode:', backend);
    setupEventListeners(backend);
  } else {
    const authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
      handleAuthenticated(authClient);
    } else {
      await authClient.login({
        identityProvider: 'https://identity.ic0.app',
        onSuccess: () => {
          handleAuthenticated(authClient);
        }
      });
    }
  }

  async function handleAuthenticated(authClient) {
    const identity = authClient.getIdentity();
    const agent = new HttpAgent({ identity });
    await agent.fetchRootKey(); // Required only for local development
    const backend = Actor.createActor(backend_idl, {
      agent,
      canisterId: backend_id,
    });
    console.log('Actor initialized:', backend);
    setupEventListeners(backend);
  }

  function setupEventListeners(backend) {
    // Prevent form submission
    document.getElementById('job-form').addEventListener('submit', (event) => {
      event.preventDefault();
    });

    const skills = [
      "HTML", "CSS", "JavaScript", "React", "Node.js", "Python", "Java", "C++", "SQL", "NoSQL", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Linux", "Networking", "Security", "DevOps", "Machine Learning"
    ];

    const skillsDropdown = document.getElementById('skillsDropdown');
    skills.forEach(skill => {
      const option = document.createElement('option');
      option.value = skill;
      option.textContent = skill;
      skillsDropdown.appendChild(option);
    });

    skillsDropdown.addEventListener('change', () => {
      const skillsField = document.getElementById('skills');
      const selectedSkill = skillsDropdown.value; // Get the selected skill
      const currentSkills = skillsField.value.split(',').map(skill => skill.trim()).filter(skill => skill !== '');

      // Add the skill only if it's not already present
      if (!currentSkills.includes(selectedSkill)) {
        currentSkills.push(selectedSkill);
      }

      // Update the skills field
      skillsField.value = currentSkills.join(', ');
    });

    // Hook up your button listeners
    const addJobButton = document.getElementById('addJobButton');
    if (addJobButton) {
      addJobButton.addEventListener('click', async (event) => {
        event.preventDefault();
        console.log('Add Job button clicked');
        const name = document.getElementById('title').value;
        const degrees = document.getElementById('description').value.split(',').map(degree => degree.trim());
        const skills = document.getElementById('skills').value.split(',').map(skill => skill.trim());

        if (name && degrees.length > 0 && skills.length > 0) {
          console.log('Adding CV:', { name, degrees, skills });
          try {
            const result = await backend.addCV(name, degrees, skills);
            if (result === null) {
              console.log('CV already exists for this student.');
              alert('You have already added a CV.');
            } else {
              console.log('CV added successfully');
              fetchCVs();
              fetchSkills();
            }
          } catch (e) {
            console.error('Failed to add CV:', e);
          }
        } else {
          console.log('Please fill in all fields');
        }
      });
    }

    const viewStudentsButton = document.getElementById('viewStudentsButton');
    if (viewStudentsButton) {
      viewStudentsButton.addEventListener('click', fetchCVs);
    }

    const searchSkillButton = document.getElementById('searchSkillButton');
    if (searchSkillButton) {
      searchSkillButton.addEventListener('click', async () => {
        const skill = document.getElementById('skillDropdown').value;
        fetchStudentsBySkill(skill);
      });
    }

    const deleteRecordsButton = document.getElementById('deleteRecordsButton');
    if (deleteRecordsButton) {
      deleteRecordsButton.addEventListener('click', async () => {
        console.log('Delete All Records button clicked');
        try {
          await backend.deleteAllRecords();
          console.log('All records deleted successfully');
          // Re-fetch the list
          fetchCVs();
          // Re-fetch the skills
          fetchSkills();
        } catch (e) {
          console.error('Failed to delete records:', e);
        }
      });
    }

    async function fetchCVs() {
      try {
        console.log('Fetching CVs...');
        const cvs = await backend.getAllCVs();
        console.log('CVs fetched:', cvs);
        const cvsList = document.getElementById('jobs');
        cvsList.innerHTML = '';
        cvs.forEach((cv) => {
          const li = document.createElement('li');
          li.textContent = `${cv.name} - Degrees: ${cv.degrees.join(', ')} - Skills: ${cv.skills.join(', ')} (Posted at: ${new Date(Number(cv.postedAt / BigInt(1000000))).toLocaleString()})`;
          cvsList.appendChild(li);
        });
      } catch (error) {
        console.error('Failed to fetch CVs:', error);
      }
    }

    async function fetchSkills() {
      try {
        console.log('Fetching skills...');
        const cvs = await backend.getAllCVs();
        const skillsSet = new Set();
        cvs.forEach(cv => {
          cv.skills.forEach(skill => skillsSet.add(skill));
        });
        const skillDropdown = document.getElementById('skillDropdown');
        skillDropdown.innerHTML = '';
        skillsSet.forEach(skill => {
          const option = document.createElement('option');
          option.value = skill;
          option.textContent = skill;
          skillDropdown.appendChild(option);
        });
      } catch (error) {
        console.error('Failed to fetch skills:', error);
      }
    }

    async function fetchStudentsBySkill(skill) {
      try {
        console.log(`Fetching students with skill: ${skill}`);
        const cvs = await backend.getAllCVs();
        const filteredCVs = cvs.filter(cv => cv.skills.includes(skill));
        const studentsList = document.getElementById('students');
        studentsList.innerHTML = ''; // Clear the existing list
        filteredCVs.forEach((cv) => {
          const li = document.createElement('li');
          li.textContent = `${cv.name} - Degrees: ${cv.degrees.join(', ')} - Skills: ${cv.skills.join(', ')} (Posted at: ${new Date(Number(cv.postedAt / BigInt(1000000))).toLocaleString()})`;
          studentsList.appendChild(li);
        });
      } catch (error) {
        console.error('Failed to fetch students by skill:', error);
      }
    }

    // Fetch CVs and skills on startup
    fetchCVs();
    fetchSkills();
  }
}

window.addEventListener('DOMContentLoaded', init);
