# JointFinanceDashboard

## Running the project

This project includes both a frontend React app and a backend Express API.

### Start both services together

Use the combined startup script to run the backend and frontend at the same time:

```bash
npm run start
```

- The frontend runs on `http://localhost:8443` by default
- The backend API runs on `http://localhost:4000`

If port `8443` is already in use, Vite will automatically choose the next available port.

Vite is configured to proxy `/api` requests to the backend, so the app can request data from `/api/...` directly.

### Start services separately

Run backend only:

```bash
npm run backend
```

Run frontend only:

```bash
npm run dev
```
