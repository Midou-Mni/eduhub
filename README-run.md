# How to Run EduManage

## Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL (local or remote)

## 1. Clone the Repository
```
git clone <your-repo-url>
cd EduManage
```

## 2. Install Dependencies
```
npm install
```

## 3. Configure Environment Variables
Edit `.env` and set your database connection string:
```
DATABASE_URL=postgresql://postgres:1234@localhost:5432/eduhub
```

## 4. Set Up the Database
Run the setup script to create tables and seed demo data:
```
npx tsx setup-db.ts
```

## 5. Start the Development Server
```
npm run dev
```

- The backend and frontend will start on port 5000 by default.
- Access the app at [http://localhost:5000](http://localhost:5000)

## 6. Login with Demo Accounts
- **Admin:** admin@example.com / admin123
- **Teacher:** teacher@example.com / teacher123
- **Student:** student@example.com / student123

## Troubleshooting
- If you see database errors, ensure PostgreSQL is running and the database exists.
- If you see port errors, change the `PORT` in `.env`.
- For more help, check the code comments or open an issue.
