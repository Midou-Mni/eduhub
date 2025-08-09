import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  text,
  sqliteTable,
  real,
  integer,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User storage table
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  role: text("role", { enum: ["teacher", "student", "admin"] }).default("student"),
  bio: text("bio"),
  website: text("website"),
  hashedPassword: text("hashed_password"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Categories table
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Courses table
export const courses = sqliteTable("courses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  categoryId: text("category_id").references(() => categories.id),
  teacherId: text("teacher_id").references(() => users.id).notNull(),
  status: text("status", { enum: ["draft", "published", "archived"] }).default("draft"),
  difficultyLevel: text("difficulty_level", { enum: ["beginner", "intermediate", "advanced"] }).notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Course materials table
export const courseMaterials = sqliteTable("course_materials", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  title: text("title", { length: 255 }).notNull(),
  description: text("description"),
  type: text("type", { enum: ["video", "pdf", "quiz", "assignment"] }).notNull(),
  content: text("content"),
  fileUrl: text("file_url"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  orderIndex: integer("order_index").default(0),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Enrollments table
export const enrollments = sqliteTable("enrollments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  studentId: text("student_id").references(() => users.id).notNull(),
  enrolledAt: integer("enrolled_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  completedAt: integer("completed_at", { mode: 'timestamp' }),
  progress: integer("progress").default(0), // percentage 0-100
  rating: integer("rating"), // 1-5 stars
  review: text("review"),
  reviewedAt: integer("reviewed_at", { mode: 'timestamp' }),
});

// Student activity table
export const studentActivity = sqliteTable("student_activity", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studentId: text("student_id").references(() => users.id).notNull(),
  courseId: text("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  materialId: text("material_id").references(() => courseMaterials.id, { onDelete: "cascade" }),
  activityType: text("activity_type", { 
    enum: ["enrolled", "completed", "reviewed", "assignment_submitted", "quiz_completed"] 
  }).notNull(),
  metadata: text("metadata"), // JSON string
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Admin notifications table
export const adminNotifications = sqliteTable("admin_notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: text("type", { enum: ["info", "warning", "error", "success"] }).default("info"),
  isRead: integer("is_read", { mode: 'boolean' }).default(false),
  userId: text("user_id").references(() => users.id),
  metadata: text("metadata"), // JSON string
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// System logs table
export const systemLogs = sqliteTable("system_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  action: text("action", { length: 100 }).notNull(),
  description: text("description"),
  userId: text("user_id").references(() => users.id),
  entityType: text("entity_type", { length: 50 }),
  entityId: text("entity_id", { length: 255 }),
  ipAddress: text("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  metadata: text("metadata"), // JSON string
  severity: text("severity", { enum: ["low", "medium", "high", "critical"] }).default("low"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
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

// Admin-related insert schemas
export const insertAdminNotificationSchema = createInsertSchema(adminNotifications).omit({
  id: true,
  createdAt: true,
});

export const insertSystemLogSchema = createInsertSchema(systemLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type PublicUser = Omit<User, 'hashedPassword'>;
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
export type AdminNotification = typeof adminNotifications.$inferSelect;
export type InsertAdminNotification = z.infer<typeof insertAdminNotificationSchema>;
export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;

// Extended types for API responses
export type CourseWithDetails = Course & {
  teacher: PublicUser;
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

export type CourseFilters = {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  search?: string;
};

// Admin-specific types
export type AdminDashboardStats = {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  activeUsers: number;
  newUsersThisMonth: number;
  coursesPublishedThisMonth: number;
  enrollmentsThisMonth: number;
  revenueThisMonth: number;
  averageRating: number;
};

export type UserWithStats = PublicUser & {
  courseCount: number;
  enrollmentCount: number;
  totalRevenue: number;
  isOnline: boolean;
};

export type CourseWithAdminDetails = CourseWithDetails & {
  reportCount: number;
  isActive: boolean;
  lastActivity?: Date;
};
