# 🚀 DevSync Dashboard

A full-stack Kanban board that syncs GitHub commits into a cloud database.

## 🛠️ Tech Stack
- **Frontend:** React, Vite, TypeScript, CSS3
- **Backend:** Node.js, Express
- **Database:** Supabase (PostgreSQL)
- **API:** GitHub Rest API (Octokit)

## ⚙️ Setup
1. Clone the repo.
2. Run `npm install` in both `/client` and `/server`.
3. Create a `.env` in `/server` with your GitHub and Supabase keys.
4. Run `node src/server.js` (Backend) and `npm run dev` (Frontend).