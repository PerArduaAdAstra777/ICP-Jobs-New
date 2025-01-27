# ICP Jobs

ICP Jobs is a decentralized application for managing student CVs and job requirements using the Internet Computer (ICP) platform.

## Project Structure

```
icp-jobs/
├── dist/
├── src/
│   ├── icp-jobs-backend/
│   │   ├── main.mo
│   ├── icp-jobs-frontend/
│   │   ├── app.js
│   │   ├── index.html
│   │   ├── styles.css
├── declarations/
│   ├── icp-jobs-backend.js
├── package.json
├── webpack.config.js
├── dfx.json
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/)
- [DFINITY SDK](https://sdk.dfinity.org/docs/download.html)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/icp-jobs.git
   cd icp-jobs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local Internet Computer replica:
   ```bash
   dfx start --background
   ```

4. Deploy the canisters:
   ```bash
   dfx deploy
   ```

## Development

To start the development server with hot module replacement:

```bash
npm start
```

This will open the application in your default web browser.

## Usage

### Adding a CV

1. Fill in the "Name", "Degrees", and "Skills" fields.
2. Click the "Add CV" button.

### Viewing Student CVs

1. Click the "View Students" button to fetch and display all student CVs.

### Searching Students by Skill

1. Select a skill from the dropdown.
2. Click the "Search" button to fetch and display students with the selected skill.

### Deleting All Records

1. Click the "Delete All Records" button to delete all student CVs and job requirements. (Only the owner can perform this action.)

## Project Files

### Backend

- **main.mo**: Contains the Motoko code for managing student CVs and job requirements.

### Frontend

- **app.js**: Contains the JavaScript code for interacting with the backend canister and handling UI events.
- **index.html**: The main HTML file for the application.
- **styles.css**: Contains the CSS styles for the application.

### Configuration

- **webpack.config.js**: Webpack configuration file for bundling the frontend assets.
- **dfx.json**: DFINITY configuration file for defining canisters and network settings.
- **package.json**: Contains the project dependencies and scripts.

## License

This project is licensed under the MIT License.
