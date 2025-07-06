# Server (Backend) Application

This directory contains the Node.js/Koa.js backend application.

## Overview

This server handles API requests, user authentication, database interactions, and serves the frontend client.

## Configuration

Environment variables are managed via a `.env` file located in this directory. A template (`.env.template`) is provided for setup instructions.

## Running Locally

To run the server in development mode, use the following command from the project root:

```bash
npm run start --workspace=packages/server
```

## Building

To build the server for production, use the following command from the project root:

```bash
npm run build --workspace=packages/server
```