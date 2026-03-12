# Water Tracker

A full-stack web application for tracking daily water intake. Set a personal hydration goal, log water throughout the day, and monitor your progress with visual charts and streak tracking.

## Features

- **Water logging** -- quick presets (250/500/750/1000 ml) or custom amounts with optional notes
- **Daily goal** -- configurable target with a circular progress ring
- **Streak tracking** -- counts consecutive days meeting your goal
- **Weekly chart** -- bar chart showing the last 7 days of intake
- **Hydration reminders** -- configurable interval (15 min to 2 hours), quiet hours, and a toast notification with a quick "Log 250 ml" action
- **Authentication** -- email/password registration and login with JWT
- **Edit/delete entries** -- modify or remove today's logged entries

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Recharts, Vitest

**Backend:** Express.js, TypeScript, better-sqlite3, JWT, bcryptjs, Jest

**Tooling:** ESLint, Prettier, Docker Compose

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- npm (included with Node.js)
- [Docker](https://www.docker.com/) and Docker Compose (optional, for containerized setup)

## Getting Started

### Local Development

1. **Clone the repository**

   ```sh
   git clone <repository-url>
   cd water-tracker
   ```

2. **Install dependencies**

   ```sh
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Start the backend** (runs on http://localhost:3001)

   ```sh
   cd backend
   npm run dev
   ```

4. **Start the frontend** in a separate terminal (runs on http://localhost:5173)

   ```sh
   cd frontend
   npm run dev
   ```

5. **Open** http://localhost:5173 in your browser.

### Docker Compose

```sh
docker compose up --build
```

The frontend will be available at http://localhost:5173 and the backend at http://localhost:3001.

## Available Scripts

### Backend (`backend/`)

| Script           | Description                        |
| ---------------- | ---------------------------------- |
| `npm run dev`    | Start dev server with hot reload   |
| `npm run build`  | Compile TypeScript to `dist/`      |
| `npm start`      | Run compiled production build      |
| `npm test`       | Run tests (Jest)                   |
| `npm run lint`   | Lint source files (ESLint)         |
| `npm run format` | Format source files (Prettier)     |

### Frontend (`frontend/`)

| Script           | Description                        |
| ---------------- | ---------------------------------- |
| `npm run dev`    | Start Vite dev server              |
| `npm run build`  | Type-check and build for production|
| `npm run preview`| Preview production build           |
| `npm test`       | Run tests (Vitest)                 |
| `npm run lint`   | Lint source files (ESLint)         |
| `npm run format` | Format source files (Prettier)     |

## Project Structure

```
backend/
  src/
    middleware/auth.ts      JWT authentication middleware
    routes/auth.ts          Registration and login endpoints
    routes/water.ts         Water logging and reminder endpoints
    database.ts             SQLite schema and connection
    app.ts                  Express app setup
    index.ts                Server entry point
    __tests__/              Jest test suites

frontend/
  src/
    pages/
      Dashboard.tsx         Main application view
      LoginPage.tsx         Authentication page
    components/
      AddWaterForm.tsx      Water logging form with presets
      EntryList.tsx         Today's entries with edit/delete
      ProgressRing.tsx      Circular progress indicator
      GoalSetting.tsx       Daily goal editor
      WeeklyChart.tsx       7-day bar chart
      ReminderSettings.tsx  Reminder interval and quiet hours
      ReminderToast.tsx     Hydration reminder notification
    hooks/
      useWaterReminder.ts   Reminder timer and quiet hours logic
    api.ts                  API client (fetch wrapper)
    AuthContext.tsx          Authentication state (React Context)
    test/                   Vitest test suites
```

## API Endpoints

All `/water` endpoints require a `Bearer` token in the `Authorization` header.

| Method | Path                | Description                  |
| ------ | ------------------- | ---------------------------- |
| POST   | `/api/auth/register`| Create a new account         |
| POST   | `/api/auth/login`   | Log in                       |
| GET    | `/api/auth/me`      | Get current user             |
| GET    | `/api/water/today`  | List today's entries         |
| GET    | `/api/water/weekly` | Last 7 days summary          |
| GET    | `/api/water/streak` | Current streak count         |
| POST   | `/api/water`        | Log a water entry            |
| PUT    | `/api/water/goal`   | Update daily goal            |
| PUT    | `/api/water/:id`    | Edit an entry (today only)   |
| DELETE | `/api/water/:id`    | Delete an entry (today only) |
| GET    | `/api/water/reminders` | Get reminder settings     |
| PUT    | `/api/water/reminders` | Update reminder settings  |
