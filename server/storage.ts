import {
  users,
  courses,
  categories,
  courseMaterials,
  enrollments,
  studentActivity,
  type User,
  type UpsertUser,
  type Course,
  type InsertCourse,
  type CourseWithDetails,
  type Category,
  type InsertCategory,
  type CourseMaterial,
  type InsertCourseMaterial,
  type Enrollment,
  type InsertEnrollment,
  type EnrollmentWithDetails,
  type StudentActivity,
  type InsertStudentActivity,
  type ActivityWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, avg, sum, count, like, or, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, updates: Partial<User>): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Course operations (Teacher)
  getCoursesByTeacher(teacherId: string): Promise<CourseWithDetails[]>;
  getCourseById(id: string): Promise<CourseWithDetails | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: string): Promise<void>;

  // Course operations (Student)
  getPublishedCourses(filters?: any): Promise<CourseWithDetails[]>;
  searchCourses(query: string, filters?: any): Promise<CourseWithDetails[]>;
  getCourseForStudent(courseId: string, studentId?: string): Promise<CourseWithDetails | undefined>;
  getEnrolledCourses(studentId: string): Promise<CourseWithDetails[]>;

  // Course materials operations
  getMaterialsByCourse(courseId: string): Promise<CourseMaterial[]>;
  createCourseMaterial(material: InsertCourseMaterial): Promise<CourseMaterial>;
  updateCourseMaterial(id: string, material: Partial<InsertCourseMaterial>): Promise<CourseMaterial>;
  deleteCourseMaterial(id: string): Promise<void>;

  // Enrollment operations
  getEnrollmentsByCourse(courseId: string): Promise<EnrollmentWithDetails[]>;
  getEnrollmentsByTeacher(teacherId: string): Promise<EnrollmentWithDetails[]>;
  getEnrollmentsByStudent(studentId: string): Promise<EnrollmentWithDetails[]>;
  getStudentEnrollment(courseId: string, studentId: string): Promise<Enrollment | undefined>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(id: string, enrollment: Partial<InsertEnrollment>): Promise<Enrollment>;
  updateProgress(enrollmentId: string, progress: number): Promise<void>;

  // Review operations
  createReview(enrollmentId: string, rating: number, review: string): Promise<void>;
  getCourseReviews(courseId: string): Promise<EnrollmentWithDetails[]>;

  // Activity operations
  getRecentActivityByTeacher(teacherId: string, limit?: number): Promise<ActivityWithDetails[]>;
  getStudentActivity(studentId: string, limit?: number): Promise<ActivityWithDetails[]>;
  createActivity(activity: InsertStudentActivity): Promise<StudentActivity>;

  // Analytics operations
  getTeacherStats(teacherId: string): Promise<{
    totalCourses: number;
    totalStudents: number;
    totalRevenue: number;
    avgRating: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  // Course operations
  async getCoursesByTeacher(teacherId: string): Promise<CourseWithDetails[]> {
    const result = await db
      .select({
        course: courses,
        teacher: users,
        category: categories,
        enrollmentCount: sql<number>`count(distinct ${enrollments.id})`.as("enrollment_count"),
        avgRating: sql<number>`avg(${enrollments.rating})`.as("avg_rating"),
        revenue: sql<number>`sum(${courses.price})`.as("revenue"),
      })
      .from(courses)
      .leftJoin(users, eq(courses.teacherId, users.id))
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
      .where(eq(courses.teacherId, teacherId))
      .groupBy(courses.id, users.id, categories.id)
      .orderBy(desc(courses.createdAt));

    const coursesWithMaterials = await Promise.all(
      result.map(async (row) => {
        const materials = await this.getMaterialsByCourse(row.course.id);
        return {
          ...row.course,
          teacher: row.teacher!,
          category: row.category,
          enrollmentCount: row.enrollmentCount || 0,
          avgRating: row.avgRating || null,
          revenue: row.revenue || 0,
          materials,
        };
      })
    );

    return coursesWithMaterials;
  }

  async getCourseById(id: string): Promise<CourseWithDetails | undefined> {
    const [result] = await db
      .select({
        course: courses,
        teacher: users,
        category: categories,
        enrollmentCount: sql<number>`count(distinct ${enrollments.id})`.as("enrollment_count"),
        avgRating: sql<number>`avg(${enrollments.rating})`.as("avg_rating"),
        revenue: sql<number>`sum(${courses.price})`.as("revenue"),
      })
      .from(courses)
      .leftJoin(users, eq(courses.teacherId, users.id))
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
      .where(eq(courses.id, id))
      .groupBy(courses.id, users.id, categories.id);

    if (!result) return undefined;

    const materials = await this.getMaterialsByCourse(id);

    return {
      ...result.course,
      teacher: result.teacher!,
      category: result.category,
      enrollmentCount: result.enrollmentCount || 0,
      avgRating: result.avgRating || null,
      revenue: result.revenue || 0,
      materials,
    };
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db
      .insert(courses)
      .values(course)
      .returning();
    return newCourse;
  }

  async updateCourse(id: string, courseUpdate: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...courseUpdate, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  async deleteCourse(id: string): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  // Course materials operations
  async getMaterialsByCourse(courseId: string): Promise<CourseMaterial[]> {
    return await db
      .select()
      .from(courseMaterials)
      .where(eq(courseMaterials.courseId, courseId))
      .orderBy(courseMaterials.orderIndex);
  }

  async createCourseMaterial(material: InsertCourseMaterial): Promise<CourseMaterial> {
    const [newMaterial] = await db
      .insert(courseMaterials)
      .values(material)
      .returning();
    return newMaterial;
  }

  async updateCourseMaterial(id: string, materialUpdate: Partial<InsertCourseMaterial>): Promise<CourseMaterial> {
    const [updatedMaterial] = await db
      .update(courseMaterials)
      .set(materialUpdate)
      .where(eq(courseMaterials.id, id))
      .returning();
    return updatedMaterial;
  }

  async deleteCourseMaterial(id: string): Promise<void> {
    await db.delete(courseMaterials).where(eq(courseMaterials.id, id));
  }

  // Enrollment operations
  async getEnrollmentsByCourse(courseId: string): Promise<EnrollmentWithDetails[]> {
    const result = await db
      .select({
        enrollment: enrollments,
        course: courses,
        student: users,
      })
      .from(enrollments)
      .leftJoin(courses, eq(enrollments.courseId, courses.id))
      .leftJoin(users, eq(enrollments.studentId, users.id))
      .where(eq(enrollments.courseId, courseId))
      .orderBy(desc(enrollments.enrolledAt));

    return result.map((row) => ({
      ...row.enrollment,
      course: row.course!,
      student: row.student!,
    }));
  }

  async getEnrollmentsByTeacher(teacherId: string): Promise<EnrollmentWithDetails[]> {
    const result = await db
      .select({
        enrollment: enrollments,
        course: courses,
        student: users,
      })
      .from(enrollments)
      .leftJoin(courses, eq(enrollments.courseId, courses.id))
      .leftJoin(users, eq(enrollments.studentId, users.id))
      .where(eq(courses.teacherId, teacherId))
      .orderBy(desc(enrollments.enrolledAt));

    return result.map((row) => ({
      ...row.enrollment,
      course: row.course!,
      student: row.student!,
    }));
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db
      .insert(enrollments)
      .values(enrollment)
      .returning();
    return newEnrollment;
  }

  async updateEnrollment(id: string, enrollmentUpdate: Partial<InsertEnrollment>): Promise<Enrollment> {
    const [updatedEnrollment] = await db
      .update(enrollments)
      .set(enrollmentUpdate)
      .where(eq(enrollments.id, id))
      .returning();
    return updatedEnrollment;
  }

  // Student-specific enrollment operations
  async getEnrollmentsByStudent(studentId: string): Promise<EnrollmentWithDetails[]> {
    const result = await db
      .select({
        enrollment: enrollments,
        course: courses,
        student: users,
      })
      .from(enrollments)
      .leftJoin(courses, eq(enrollments.courseId, courses.id))
      .leftJoin(users, eq(enrollments.studentId, users.id))
      .where(eq(enrollments.studentId, studentId))
      .orderBy(desc(enrollments.enrolledAt));

    return result.map((row) => ({
      ...row.enrollment,
      course: row.course!,
      student: row.student!,
    }));
  }

  async getStudentEnrollment(courseId: string, studentId: string): Promise<Enrollment | undefined> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.courseId, courseId), eq(enrollments.studentId, studentId)));
    return enrollment;
  }

  async updateProgress(enrollmentId: string, progress: number): Promise<void> {
    await db
      .update(enrollments)
      .set({ progress, completedAt: progress === 100 ? new Date() : null })
      .where(eq(enrollments.id, enrollmentId));
  }

  // Review operations
  async createReview(enrollmentId: string, rating: number, review: string): Promise<void> {
    await db
      .update(enrollments)
      .set({ rating, review, reviewedAt: new Date() })
      .where(eq(enrollments.id, enrollmentId));
  }

  async getCourseReviews(courseId: string): Promise<EnrollmentWithDetails[]> {
    const result = await db
      .select({
        enrollment: enrollments,
        course: courses,
        student: users,
      })
      .from(enrollments)
      .leftJoin(courses, eq(enrollments.courseId, courses.id))
      .leftJoin(users, eq(enrollments.studentId, users.id))
      .where(and(eq(enrollments.courseId, courseId), sql`${enrollments.rating} IS NOT NULL`))
      .orderBy(desc(enrollments.reviewedAt));

    return result.map((row) => ({
      ...row.enrollment,
      course: row.course!,
      student: row.student!,
    }));
  }

  // Activity operations
  async getRecentActivityByTeacher(teacherId: string, limit = 10): Promise<ActivityWithDetails[]> {
    const result = await db
      .select({
        activity: studentActivity,
        student: users,
        course: courses,
        material: courseMaterials,
      })
      .from(studentActivity)
      .leftJoin(users, eq(studentActivity.studentId, users.id))
      .leftJoin(courses, eq(studentActivity.courseId, courses.id))
      .leftJoin(courseMaterials, eq(studentActivity.materialId, courseMaterials.id))
      .where(eq(courses.teacherId, teacherId))
      .orderBy(desc(studentActivity.createdAt))
      .limit(limit);

    return result.map((row) => ({
      ...row.activity,
      student: row.student!,
      course: row.course!,
      material: row.material,
    }));
  }

  async createActivity(activity: InsertStudentActivity): Promise<StudentActivity> {
    const [newActivity] = await db
      .insert(studentActivity)
      .values(activity)
      .returning();
    return newActivity;
  }

  async getStudentActivity(studentId: string, limit = 10): Promise<ActivityWithDetails[]> {
    const result = await db
      .select({
        activity: studentActivity,
        student: users,
        course: courses,
        material: courseMaterials,
      })
      .from(studentActivity)
      .leftJoin(users, eq(studentActivity.studentId, users.id))
      .leftJoin(courses, eq(studentActivity.courseId, courses.id))
      .leftJoin(courseMaterials, eq(studentActivity.materialId, courseMaterials.id))
      .where(eq(studentActivity.studentId, studentId))
      .orderBy(desc(studentActivity.createdAt))
      .limit(limit);

    return result.map((row) => ({
      ...row.activity,
      student: row.student!,
      course: row.course!,
      material: row.material,
    }));
  }

  // Analytics operations
  async getTeacherStats(teacherId: string): Promise<{
    totalCourses: number;
    totalStudents: number;
    totalRevenue: number;
    avgRating: number;
  }> {
    const [stats] = await db
      .select({
        totalCourses: sql<number>`count(distinct ${courses.id})`.as("total_courses"),
        totalStudents: sql<number>`count(distinct ${enrollments.studentId})`.as("total_students"),
        totalRevenue: sql<number>`coalesce(sum(${courses.price}), 0)`.as("total_revenue"),
        avgRating: sql<number>`coalesce(avg(${enrollments.rating}), 0)`.as("avg_rating"),
      })
      .from(courses)
      .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
      .where(eq(courses.teacherId, teacherId));

    return {
      totalCourses: stats.totalCourses || 0,
      totalStudents: stats.totalStudents || 0,
      totalRevenue: stats.totalRevenue || 0,
      avgRating: stats.avgRating || 0,
    };
  }

  // Student course operations
  async getPublishedCourses(filters?: any): Promise<CourseWithDetails[]> {
    const conditions = [eq(courses.status, "published")];
    
    // Apply filters if provided
    if (filters) {
      if (filters.category) {
        conditions.push(eq(courses.categoryId, filters.category));
      }
      if (filters.priceMin) {
        conditions.push(gte(courses.price, filters.priceMin.toString()));
      }
      if (filters.priceMax) {
        conditions.push(lte(courses.price, filters.priceMax.toString()));
      }
      if (filters.difficulty) {
        conditions.push(eq(courses.difficultyLevel, filters.difficulty));
      }
    }

    const result = await db
      .select({
        course: courses,
        teacher: users,
        category: categories,
        enrollmentCount: sql<number>`count(distinct ${enrollments.id})`.as("enrollment_count"),
        avgRating: sql<number>`avg(${enrollments.rating})`.as("avg_rating"),
        revenue: sql<number>`sum(${courses.price})`.as("revenue"),
      })
      .from(courses)
      .leftJoin(users, eq(courses.teacherId, users.id))
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
      .where(and(...conditions))
      .groupBy(courses.id, users.id, categories.id)
      .orderBy(desc(courses.createdAt));

    const coursesWithMaterials = await Promise.all(
      result.map(async (row) => {
        const materials = await this.getMaterialsByCourse(row.course.id);
        return {
          ...row.course,
          teacher: row.teacher!,
          category: row.category,
          enrollmentCount: row.enrollmentCount || 0,
          avgRating: row.avgRating || null,
          revenue: row.revenue || 0,
          materials,
        };
      })
    );

    return coursesWithMaterials;
  }

  async searchCourses(query: string, filters?: any): Promise<CourseWithDetails[]> {
    const searchConditions = [
      eq(courses.status, "published"),
      or(
        like(courses.title, `%${query}%`),
        like(courses.description, `%${query}%`)
      )
    ];

    if (filters) {
      if (filters.category) {
        searchConditions.push(eq(courses.categoryId, filters.category));
      }
      if (filters.priceMin) {
        searchConditions.push(gte(courses.price, filters.priceMin.toString()));
      }
      if (filters.priceMax) {
        searchConditions.push(lte(courses.price, filters.priceMax.toString()));
      }
      if (filters.difficulty) {
        searchConditions.push(eq(courses.difficultyLevel, filters.difficulty));
      }
    }

    const result = await db
      .select({
        course: courses,
        teacher: users,
        category: categories,
        enrollmentCount: sql<number>`count(distinct ${enrollments.id})`.as("enrollment_count"),
        avgRating: sql<number>`avg(${enrollments.rating})`.as("avg_rating"),
        revenue: sql<number>`sum(${courses.price})`.as("revenue"),
      })
      .from(courses)
      .leftJoin(users, eq(courses.teacherId, users.id))
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
      .where(and(...searchConditions))
      .groupBy(courses.id, users.id, categories.id)
      .orderBy(desc(courses.createdAt));

    const coursesWithMaterials = await Promise.all(
      result.map(async (row) => {
        const materials = await this.getMaterialsByCourse(row.course.id);
        return {
          ...row.course,
          teacher: row.teacher!,
          category: row.category,
          enrollmentCount: row.enrollmentCount || 0,
          avgRating: row.avgRating || null,
          revenue: row.revenue || 0,
          materials,
        };
      })
    );

    return coursesWithMaterials;
  }

  async getCourseForStudent(courseId: string, studentId?: string): Promise<CourseWithDetails | undefined> {
    const course = await this.getCourseById(courseId);
    
    if (!course) return undefined;

    if (studentId) {
      const enrollment = await this.getStudentEnrollment(courseId, studentId);
      return {
        ...course,
        isEnrolled: !!enrollment,
        userProgress: enrollment?.progress || 0,
      };
    }

    return course;
  }

  async getEnrolledCourses(studentId: string): Promise<CourseWithDetails[]> {
    const enrollmentsData = await this.getEnrollmentsByStudent(studentId);
    
    const coursesWithDetails = await Promise.all(
      enrollmentsData.map(async (enrollment) => {
        const course = await this.getCourseById(enrollment.courseId);
        if (!course) return null;
        
        return {
          ...course,
          isEnrolled: true,
          userProgress: enrollment.progress,
        };
      })
    );

    return coursesWithDetails.filter(Boolean) as CourseWithDetails[];
  }
}

export const storage = new DatabaseStorage();
