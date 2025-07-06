# HomeLab Lib

This repository contains the HomeLab Lib application, which includes both the backend server and the frontend client.

## Project Structure

- `packages/server`: Contains the Node.js/Koa.js backend application.
- `packages/client`: Contains the React.js frontend application.

## Getting Started

### Prerequisites

- Node.js (v22 or later)
- npm (Node Package Manager)

### Environment Setup

Create a `.env` file in the `packages/server` directory by copying the `.env.template` file and filling in the appropriate values:

```bash
cp packages/server/.env.template packages/server/.env
```

Then, edit `packages/server/.env` with your specific configurations.

### Installation

Navigate to the root of the monorepo (`homelab-lib`) and install the dependencies for both packages:

```bash
npm install
```

### Building the Application

To build both the client and server for production:

```bash
npm run build
```

This will create `build` directory in `packages/client` and `dist` directory in `packages/server`.

### Running the Application Locally

1.  **Start the Server:**
    From the root (`homelab-lib`):
    ```bash
npm run start --workspace=packages/server
    ```

2.  **Access the Application:**
    Open your web browser and navigate to `http://localhost:3214` (or the port you configured).

### Running with Docker

1.  **Build the Docker image:**
    From the root (`homelab-lib`):
    ```bash
docker build -t homelab-lib .
    ```

2.  **Run the Docker container:**
    ```bash
docker run -p 3214:3214 homelab-lib
    ```
    (Adjust port mapping if your server runs on a different port).
