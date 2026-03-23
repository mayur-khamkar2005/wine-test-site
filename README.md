# Wine Quality Analyzer Web Application

## 1. Folder Structure

```text
wine-quality-analyzer/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── package.json
└── README.md
```

## 2. Backend Code

- Express API with modular flow: route -> controller -> service -> model.
- JWT authentication with bcrypt password hashing.
- MongoDB models for users and wine prediction history.
- Prediction service with score, rating, category, and feature contribution metrics.
- Dashboard and admin analytics endpoints.
- Security middleware: helmet, cors, rate limiting, compression, validation, centralized error handling.
- Admin bootstrap support using `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME`.

## 3. Frontend Code

- React + Vite SPA with protected routing and role-based admin access.
- Auth context for session restore, login, register, and logout.
- Wine analyzer form with validation and result visualization.
- Dashboard with charts and quick stats.
- History page with filters and pagination.
- Admin page with platform charts, user monitoring, and latest prediction records.
- Reusable UI components and a responsive wine-inspired design system.

## 4. Setup Instructions

1. Install dependencies.

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

2. Create environment files.

```bash
copy backend\\.env.example backend\\.env
copy frontend\\.env.example frontend\\.env
```

3. Update environment values.

- Set `MONGODB_URI` and `JWT_SECRET` in `backend/.env`.
- Keep `VITE_API_URL=http://localhost:5000/api/v1` in `frontend/.env`.
- To create an admin user automatically, set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` in `backend/.env`.

4. Start the app.

```bash
npm run dev
```

5. Production commands.

```bash
npm run build
npm run start
```
