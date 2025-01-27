import Time "mo:base/Time";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Principal "mo:base/Principal";
import msg "mo:base/ExperimentalCycles";
import Error "mo:base/Error";

actor JobBoard {

  // ------------------------------
  // 1. TYPE DEFINITIONS
  // ------------------------------

  /// Structure representing a student's CV.
  type StudentCV = {
    id: Nat;
    name: Text;
    degrees: [Text];
    skills: [Text];
    postedAt: Time.Time;
    principal: Principal;
  };

  /// Structure representing a job requirement posted by an employer.
  type JobRequirement = {
    id: Nat;
    title: Text;
    requiredSkills: [Text];
    postedAt: Time.Time;
    postedBy: Text;
  };

  // ------------------------------
  // 2. STORAGE
  // ------------------------------

  /// A buffer to hold all student CVs.
  let studentCVs = Buffer.Buffer<StudentCV>(0);

  /// A buffer to hold all job requirements.
  let jobRequirements = Buffer.Buffer<JobRequirement>(0);

  // Define the owner principal
  let owner: Principal = Principal.fromText("2vxsx-fae");

  // ------------------------------
  // 3. ADDING AND RETRIEVING CVS
  // ------------------------------

  /// Adds a new student CV to the canister, returns the created CV.
  public shared (msg) func addCV(
    name: Text,
    degrees: [Text],
    skills: [Text]
  ) : async StudentCV { // Updated return type
    let callerPrincipal = msg.caller;
    let existingCV = Array.find<StudentCV>(Buffer.toArray(studentCVs), func(cv: StudentCV): Bool {
      Principal.equal(cv.principal, callerPrincipal)
    });
    if (existingCV != null) {
      throw Error.reject("CV already exists for this principal"); // Throw an error instead of returning null
    };
    let newId = studentCVs.size();
    let newCV = {
      id = newId;
      name = name;
      degrees = degrees;
      skills = skills;
      postedAt = Time.now();
      principal = callerPrincipal;
    };
    studentCVs.add(newCV);
    return newCV; // Return the new CV directly
  };

  /// Retrieves the CV of the caller principal.
  public shared query (msg) func getCV() : async ?StudentCV {
    let callerPrincipal = msg.caller;
    let existingCV = Array.find<StudentCV>(Buffer.toArray(studentCVs), func(cv: StudentCV): Bool {
      Principal.equal(cv.principal, callerPrincipal)
    });
    return existingCV;
  };

  /// Returns all stored student CVs.
  public query func getAllCVs() : async [StudentCV] {
    return Buffer.toArray(studentCVs);
  };

  // ------------------------------
  // 4. ADDING AND RETRIEVING JOB REQUIREMENTS
  // ------------------------------

  /// Adds a new job requirement and returns it.
  public func addJobRequirement(
    title: Text,
    requiredSkills: [Text],
    postedBy: Text
  ) : async JobRequirement {
    let newId = jobRequirements.size();
    let requirement = {
      id = newId;
      title = title;
      requiredSkills = requiredSkills;
      postedAt = Time.now();
      postedBy = postedBy;
    };
    jobRequirements.add(requirement);
    return requirement;
  };

  /// Returns all stored job requirements.
  public query func getAllJobRequirements() : async [JobRequirement] {
    return Buffer.toArray(jobRequirements);
  };

  // ------------------------------
  // 5. HELPER FUNCTIONS
  // ------------------------------

  /// Checks if an array `arr` contains an element `x`.
  func arrayContains<T>(arr: [T], x: T) : Bool {
    switch (Array.find<T>(arr, func(item: T): Bool { item == x })) {
      case (null) { false };
      case (_)    { true };
    }
  };

  // ------------------------------
  // 6. MATCHING LOGIC
  // ------------------------------

  /// Returns an array of StudentCVs that match all required skills
  /// of the job requirement at `jobId`.
  public query func findMatchingCVs(jobId: Nat) : async ?[StudentCV] {
    if (jobId >= jobRequirements.size()) {
      return null;
    };
    let requirementOpt = jobRequirements.getOpt(jobId);
    switch (requirementOpt) {
      case (null) { return null };
      case (?requirement) {
        let required = requirement.requiredSkills;
        let matches = Array.filter<StudentCV>(
          Buffer.toArray(studentCVs),
          func(cv: StudentCV): Bool {
            for (skill in Array.vals(required)) {
              if (not arrayContains<Text>(cv.skills, skill)) {
                return false;
              };
            };
            return true;
          }
        );
        return ?matches;
      };
    };
  };

  // ------------------------------
  // 7. DELETING ALL RECORDS
  // ------------------------------

  /// Deletes all student CVs and job requirements.
  public shared (msg) func deleteAllRecords() : async () {
    if (Principal.equal(msg.caller, owner)) {
      studentCVs.clear();
      jobRequirements.clear();
    } else {
      throw Error.reject("Unauthorized: Only the owner can delete all records.");
    }
  };
}