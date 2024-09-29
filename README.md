# Data Tampering and Recovery CRUD Application

## Introduction
This project addresses data tampering and data recovery issues in a CRUD web application by implementing solutions in both the frontend and backend. The application ensures that data integrity is maintained by using cryptographic methods to detect any unauthorized changes. Additionally, a WORM (Write Once, Read Many) datastore is used for data recovery, allowing the backend to restore the last known valid state if tampering is detected.

## Installation Instructions
1. Clone the repository and navigate to the project root.
2. Navigate to both the `/client` and `/server` directories and install the dependencies:
   ```bash
   cd client
   npm install

   cd ../server
   npm install
   ```
3. Start the frontend and backend servers:
   ```bash
   cd client
   npm run start

   cd ../server
   npm run start
   ```

## Documentation
For a detailed explanation of the project’s design and technical specifications, refer to the [documentation folder](/docs).