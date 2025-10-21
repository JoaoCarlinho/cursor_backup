# Cursor Backup – README

A code-generation agent application comprising a Flask API, PostgreSQL, MinIO, Ollama (local reasoning models) and a React front-end.
It allows users to upload files + context, then send prompts for reasoning / code generation via the backend API routes.

## Table of Contents

* [Prerequisites](#prerequisites)
* [Getting Started – macOS](#getting-started-macos)
* [Getting Started – Windows](#getting-started-windows)
* [Project Structure](#project-structure)
* [Usage](#usage)
* [API Overview](#api-overview)
* [React Front End](#react-front-end)
* [Troubleshooting](#troubleshooting)
* [License / Credits](#license-credits)

---

## Prerequisites

Before you start, ensure you have the following installed:

* Docker & Docker Compose

  * On **macOS**: Install via [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
  * On **Windows**: Install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
* Node.js & Yarn (for the React front-end)

  * Node.js version ~14+
  * Yarn package manager
* Git (to clone the repository)

---

## Getting Started – macOS

1. Clone the repo:

   ```bash
   git clone https://github.com/JoaoCarlinho/cursor_backup.git
   cd cursor_backup
   ```
2. Create environment variable file for Docker Compose (if required by repo). Example `.env` (adjust as needed):

   ```env
   POSTGRES_USER=cursor_user
   POSTGRES_PASSWORD=cursor_pass
   POSTGRES_DB=cursor_db
   MINIO_ACCESS_KEY=minioadmin
   MINIO_SECRET_KEY=minioadmin
   OLLAMA_MODEL_PATH=/models/ollama
   ```
3. Launch services with Docker Compose:

   ```bash
   docker-compose up --build
   ```

   * This will start:

     * PostgreSQL
     * MinIO object storage
     * Ollama (local reasoning model service)
     * Flask API server
   * Wait until you see logs indicating the Flask server is running (e.g., `* Running on http://0.0.0.0:5000/`).
4. (Optional) In another terminal, you can view logs or attach:

   ```bash
   docker-compose logs -f
   ```
5. Access API or front-end:

   * API: `http://localhost:5000` (default)
   * MinIO console: `http://localhost:9000` (using access/secret keys)
   * React front-end: (see the React section below)

---

## Getting Started – Windows

1. Clone the repository:

   ```powershell
   git clone https://github.com/JoaoCarlinho/cursor_backup.git
   cd cursor_backup
   ```
2. Create a `.env` file in the project root (as above).
3. Ensure Docker Desktop is running, and integration for “Use the WSL 2” is enabled if on Windows 10/11.
4. In PowerShell, run:

   ```powershell
   docker-compose up --build
   ```
5. Wait for all services to launch. Then access:

   * API: `http://localhost:5000`
   * MinIO: `http://localhost:9000`
6. For the React front-end, open a new PowerShell window and see the React section below.

---

## Project Structure

```
cursor_backup/
│  
├── api/                  # Flask backend code  
│   ├── app.py  
│   ├── routes/           # upload route, prompt route, context upload route  
│   ├── models.py         # ORM definitions (SQLAlchemy or similar)  
│   └── …  
├── docker-compose.yml    # Defines services: postgres, minio, ollama, api  
├── docker/                # Possibly Dockerfiles for each service  
│   ├── Flask/            # Dockerfile for Flask API  
│   ├── Ollama/           # Dockerfile for Ollama model service  
│   └── …  
├── react-frontend/       # React code base  
│   ├── package.json  
│   ├── src/  
│   └── …  
├── .env                  # Environment variables (git-ignored)  
└── README.md             # (this file)  
```

---

## Usage

### 1. Upload context / files

* Use the front-end (or API) to upload files (e.g., source code, documents) that provide context for reasoning.
* The API stores file metadata in PostgreSQL, and actual files / blobs in MinIO.
* The context is then available to the reasoning model during prompt processing.

### 2. Send prompt & get response

* On the front-end, type a prompt (e.g., “Generate a function to parse JSON to TypeScript types based on the uploaded schema file”).
* The front-end sends the prompt + context ID to the API route (e.g., `/api/v1/prompt`).
* The Flask API forwards the prompt + context to the Ollama service; receives the generated code / reasoning answer.
* The response is returned to the front-end and displayed to the user.

### 3. Offline / retry logic

* If network issues occur, you can retry submitting the prompt when re-connected (typical of the code generation agent behavior).
* Files already uploaded remain available as context for future prompts.

---

## API Overview

Here are key endpoints (adjust actual names based on code):

* `POST /api/v1/upload_context` – Upload one or more files + metadata. Returns a `context_id`.
* `GET /api/v1/contexts/:id/files` – List files in a context.
* `POST /api/v1/prompt` – Send a reasoning / code generation prompt with payload like:

  ```json
  {
    "context_id": "abc123",
    "prompt": "Write a function that takes the uploaded schema and outputs ..."
  }
  ```

  Returns:

  ```json
  {
    "response": "Here is the generated code: ..."
  }
  ```
* `GET /api/v1/models` – (Optional) List available reasoning models from Ollama.
* `POST /api/v1/sync` – (Optional) Trigger sync logic if needed for offline submission queue.

---

## React Front End

To run the front-end application (in `react-frontend/` directory):

1. Change into the directory:

   ```bash
   cd react-frontend
   ```
2. Install dependencies:

   ```bash
   yarn install
   ```
3. Start the development server:

   ```bash
   yarn start
   ```
4. The default browser will open (typically `http://localhost:3000`).
5. Use the UI to:

   * Upload context files
   * Select or create a session/context
   * Enter a prompt
   * View the generation result from the reasoning model
6. When done, you can build for production:

   ```bash
   yarn build
   ```

---

## Troubleshooting

* **Port conflicts**: Ensure ports `5000`, `9000`, `5432` are free (or update `docker-compose.yml`).
* **MinIO browser login**: Use `minioadmin/minioadmin` (or the keys you set via `.env`).
* **Ollama model not found**: Confirm the `model_path` and model(s) in the Dockerfile for Ollama are correct; logs will show loading status.
* **React app cannot reach API**: Check CORS configuration in the Flask backend; ensure `REACT_APP_API_URL` in React env points to `http://localhost:5000`.
* **Docker volumes / data persistence**: If you previously ran containers, you may need to `docker-compose down -v` to clean old volumes.

---

## License / Credits

This project is provided under the [MIT License](LICENSE).
Major components and inspiration: Flask, PostgreSQL, MinIO, Ollama, React.
Thanks to the contributors and the open source community.

---

---

That covers the full setup instructions for both macOS and Windows environments, backend + infrastructure services + front-end, and the main usage flow of the application as a context-aware code generation agent.

If you’d like, I can generate **sample environment files**, **docker-compose overrides**, or **example API payloads** to accompany this README.
