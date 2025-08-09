-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR UNIQUE,
  "first_name" VARCHAR,
  "last_name" VARCHAR,
  "profile_image_url" VARCHAR,
  "role" VARCHAR DEFAULT 'student' CHECK ("role" IN ('teacher', 'student', 'admin')),
  "bio" TEXT,
  "website" VARCHAR,
  "hashed_password" VARCHAR,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS "categories" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS "courses" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR NOT NULL,
  "description" TEXT,
  "price" VARCHAR,
  "thumbnail_url" VARCHAR,
  "category_id" VARCHAR REFERENCES "categories"("id"),
  "teacher_id" VARCHAR NOT NULL REFERENCES "users"("id"),
  "status" VARCHAR DEFAULT 'draft' CHECK ("status" IN ('draft', 'published', 'archived')),
  "difficulty_level" VARCHAR DEFAULT 'beginner' CHECK ("difficulty_level" IN ('beginner', 'intermediate', 'advanced')),
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);

-- Create course_materials table
CREATE TABLE IF NOT EXISTS "course_materials" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "course_id" VARCHAR NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
  "title" VARCHAR NOT NULL,
  "description" TEXT,
  "type" VARCHAR NOT NULL CHECK ("type" IN ('video', 'pdf', 'text', 'quiz')),
  "content" TEXT,
  "file_url" VARCHAR,
  "order_index" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT now()
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS "enrollments" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "student_id" VARCHAR NOT NULL REFERENCES "users"("id"),
  "course_id" VARCHAR NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
  "enrolled_at" TIMESTAMP DEFAULT now(),
  "completed_at" TIMESTAMP,
  "progress" INTEGER DEFAULT 0,
  "rating" INTEGER,
  "review" TEXT,
  UNIQUE("student_id", "course_id")
);

-- Create student_activity table
CREATE TABLE IF NOT EXISTS "student_activity" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "student_id" VARCHAR NOT NULL REFERENCES "users"("id"),
  "course_id" VARCHAR NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
  "material_id" VARCHAR REFERENCES "course_materials"("id") ON DELETE CASCADE,
  "activity_type" VARCHAR NOT NULL CHECK ("activity_type" IN ('view', 'complete', 'quiz_attempt', 'discussion')),
  "duration_minutes" INTEGER,
  "score" INTEGER,
  "created_at" TIMESTAMP DEFAULT now()
);

-- Create admin_notifications table
CREATE TABLE IF NOT EXISTS "admin_notifications" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR NOT NULL,
  "message" TEXT NOT NULL,
  "type" VARCHAR DEFAULT 'info' CHECK ("type" IN ('info', 'warning', 'error', 'success')),
  "is_read" BOOLEAN DEFAULT false,
  "user_id" VARCHAR REFERENCES "users"("id"),
  "created_at" TIMESTAMP DEFAULT now()
);

-- Create system_logs table
CREATE TABLE IF NOT EXISTS "system_logs" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "action" VARCHAR NOT NULL,
  "user_id" VARCHAR REFERENCES "users"("id"),
  "details" JSONB,
  "ip_address" VARCHAR,
  "user_agent" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS "reports" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "reporter_id" VARCHAR NOT NULL REFERENCES "users"("id"),
  "reported_user_id" VARCHAR REFERENCES "users"("id"),
  "course_id" VARCHAR REFERENCES "courses"("id"),
  "type" VARCHAR NOT NULL CHECK ("type" IN ('spam', 'inappropriate', 'copyright', 'other')),
  "description" TEXT NOT NULL,
  "status" VARCHAR DEFAULT 'pending' CHECK ("status" IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  "created_at" TIMESTAMP DEFAULT now(),
  "resolved_at" TIMESTAMP,
  "resolved_by" VARCHAR REFERENCES "users"("id")
);

-- Create feature_flags table
CREATE TABLE IF NOT EXISTS "feature_flags" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR NOT NULL UNIQUE,
  "description" TEXT,
  "is_enabled" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);

-- Create platform_settings table
CREATE TABLE IF NOT EXISTS "platform_settings" (
  "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" VARCHAR NOT NULL UNIQUE,
  "value" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);

-- Create sessions table for authentication
CREATE TABLE IF NOT EXISTS "sessions" (
  "sid" VARCHAR NOT NULL COLLATE "default",
  "sess" JSON NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL
) WITH (OIDS=FALSE);

ALTER TABLE "sessions" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" ("expire");

-- Insert some default categories
INSERT INTO "categories" ("name", "description") VALUES
  ('Programming', 'Learn programming languages and software development'),
  ('Design', 'Graphic design, UI/UX, and creative arts'),
  ('Business', 'Business management, marketing, and entrepreneurship'),
  ('Data Science', 'Data analysis, machine learning, and statistics'),
  ('Languages', 'Foreign language learning and communication')
ON CONFLICT DO NOTHING;

-- Insert some default feature flags
INSERT INTO "feature_flags" ("name", "description", "is_enabled") VALUES
  ('course_recommendations', 'Enable AI-powered course recommendations', true),
  ('dark_mode', 'Enable dark mode for the platform', true),
  ('social_features', 'Enable social features like comments and discussions', false),
  ('live_streaming', 'Enable live streaming for courses', false),
  ('mobile_app', 'Enable mobile app features', false)
ON CONFLICT DO NOTHING;

-- Insert some default platform settings
INSERT INTO "platform_settings" ("key", "value", "description") VALUES
  ('site_name', 'EduManage', 'The name of the platform'),
  ('max_file_size', '100', 'Maximum file upload size in MB'),
  ('allow_registrations', 'true', 'Whether new user registrations are allowed'),
  ('maintenance_mode', 'false', 'Whether the site is in maintenance mode'),
  ('default_course_price', '0', 'Default course price in dollars')
ON CONFLICT DO NOTHING;
