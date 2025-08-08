import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["teacher", "student"] }).default("student"),
  bio: text("bio"),
  website: varchar("website"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Courses table
export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  categoryId: uuid("category_id").references(() => categories.id),
  teacherId: varchar("teacher_id").references(() => users.id).notNull(),
  status: varchar("status", { enum: ["draft", "published", "archived"] }).default("draft"),
  difficultyLevel: varchar("difficulty_level", { enum: ["beginner", "intermediate", "advanced"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course materials table
export const courseMaterials = pgTable("course_materials", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { enum: ["video", "pdf", "quiz", "assignment"] }).notNull(),
  fileUrl: varchar("file_url"),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type"),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enrollments table
export const enrollments = pgTable("enrollments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  studentId: varchar("student_id").references(() => users.id).notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  progress: integer("progress").default(0), // percentage 0-100
  rating: integer("rating"), // 1-5 stars
  review: text("review"),
  reviewedAt: timestamp("reviewed_at"),
});

// Student activity table
export const studentActivity = pgTable("student_activity", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => users.id).notNull(),
  courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  materialId: uuid("material_id").references(() => courseMaterials.id, { onDelete: "cascade" }),
  activityType: varchar("activity_type", { 
    enum: ["enrolled", "completed", "reviewed", "assignment_submitted", "quiz_completed"] 
  }).notNull(),
  metadata: jsonb("metadata"), // store additional activity data
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  enrollments: many(enrollments),
  activities: many(studentActivity),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  courses: many(courses),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  teacher: one(users, {
    fields: [courses.teacherId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [courses.categoryId],
    references: [categories.id],
  }),
  materials: many(courseMaterials),
  enrollments: many(enrollments),
  activities: many(studentActivity),
}));

export const courseMaterialsRelations = relations(courseMaterials, ({ one }) => ({
  course: one(courses, {
    fields: [courseMaterials.courseId],
    references: [courses.id],
  }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
  student: one(users, {
    fields: [enrollments.studentId],
    references: [users.id],
  }),
}));

export const studentActivityRelations = relations(studentActivity, ({ one }) => ({
  student: one(users, {
    fields: [studentActivity.studentId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [studentActivity.courseId],
    references: [courses.id],
  }),
  material: one(courseMaterials, {
    fields: [studentActivity.materialId],
    references: [courseMaterials.id],
  }),
}));

// Insert schemas
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseMaterialSchema = createInsertSchema(courseMaterials).omit({
  id: true,
  createdAt: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true,
  completedAt: true,
  reviewedAt: true,
});

export const insertStudentActivitySchema = createInsertSchema(studentActivity).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type CourseMaterial = typeof courseMaterials.$inferSelect;
export type InsertCourseMaterial = z.infer<typeof insertCourseMaterialSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type StudentActivity = typeof studentActivity.$inferSelect;
export type InsertStudentActivity = z.infer<typeof insertStudentActivitySchema>;

// Extended types for API responses
export type CourseWithDetails = Course & {
  teacher: User;
  category: Category | null;
  enrollmentCount: number;
  avgRating: number | null;
  revenue: number;
  materials: CourseMaterial[];
  isEnrolled?: boolean;
  userProgress?: number;
};

export type EnrollmentWithDetails = Enrollment & {
  course: Course;
  student: User;
};

export type ActivityWithDetails = StudentActivity & {
  student: User;
  course: Course;
  material: CourseMaterial | null;
};

// Student-specific types
export type StudentCourse = CourseWithDetails & {
  enrollment: Enrollment;
  completedMaterials: CourseMaterial[];
  nextMaterial: CourseMaterial | null;
};

export type CourseReview = {
  id: string;
  rating: number;
  review: string;
  reviewedAt: Date;
  student: User;
  course: Course;
};

export type CourseFilters = {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  search?: string;
};
