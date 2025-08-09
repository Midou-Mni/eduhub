# EduManage Platform

EduManage is a modern, full-stack educational management platform designed for schools, teachers, students, and super admins. It provides comprehensive tools for course management, analytics, user management, content moderation, and platform configuration.

## Features

### Super Admin Dashboard
- Real-time platform statistics
- User management (CRUD, role management)
- Course management and moderation
- Advanced analytics (growth, retention, conversion)
- Platform settings and feature flags
- System logs and notifications
- Reports and content moderation

### Teacher Dashboard
- Course creation and management
- Student management and analytics
- Upload course materials (video, PDF, etc.)
- Dashboard and analytics
- Settings and profile management

### Student Dashboard
- Browse and enroll in courses
- Track progress and activities
- View course materials and complete assignments
- Personalized dashboard

### Core Technologies
- **Frontend:** React, TypeScript, Wouter, TanStack Query, Tailwind CSS, shadcn/ui
- **Backend:** Express.js, Drizzle ORM, PostgreSQL
- **Authentication:** Session-based, role-aware (admin, teacher, student)
- **Database:** PostgreSQL with comprehensive schema for users, courses, materials, enrollments, activities, admin tables
- **File Uploads:** Multer for server-side uploads
- **Charts & Analytics:** Recharts for data visualization

## Folder Structure
```
client/         # Frontend React app
server/         # Express.js backend
shared/         # Shared schema and types
.env            # Environment variables
setup_database.sql # SQL for database setup
setup-db.ts     # Node script for DB setup
```

## Demo Accounts
- **Admin:** admin@example.com / admin123
- **Teacher:** teacher@example.com / teacher123
- **Student:** student@example.com / student123

## License
MIT
