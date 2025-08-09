import {
  users,
  courses,
  categories,
  courseMaterials,
  enrollments,
  studentActivity,
  adminNotifications,
  systemLogs,
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
  type StudentActivity,
  type InsertStudentActivity,
  type PublicUser,
  type AdminDashboardStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, avg, sum, count, like, or, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    hashedPassword: string;
  }): Promise<User>;
  updateUserProfile(id: string, updates: Partial<User>): Promise<User>;
  getAllUsers(filters?: { search?: string; role?: string; status?: string }): Promise<PublicUser[]>;

  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Course operations
  getCoursesByTeacher(teacherId: string): Promise<CourseWithDetails[]>;
  getCourseDetails(courseId: string, userId?: string): Promise<CourseWithDetails | null>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(courseId: string, updates: Partial<Course>): Promise<Course>;
  getPublishedCourses(filters?: any): Promise<CourseWithDetails[]>;
  getAllCourses(filters?: { search?: string; status?: string; category?: string }): Promise<CourseWithDetails[]>;

  // Course material operations
  getCourseMaterials(courseId: string): Promise<CourseMaterial[]>;
  createCourseMaterial(material: InsertCourseMaterial): Promise<CourseMaterial>;

  // Enrollment operations
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  getStudentEnrollments(studentId: string): Promise<any[]>;

  // Student activity operations
  recordStudentActivity(activity: InsertStudentActivity): Promise<StudentActivity>;
  getStudentActivities(studentId: string): Promise<StudentActivity[]>;

  // Admin operations
  getAdminDashboardStats(): Promise<AdminDashboardStats>;
  getPlatformAnalytics(timeRange?: string): Promise<any>;
  // Admin notifications
  getAdminNotifications(): Promise<any[]>;
  getUnreadNotificationSummary(): Promise<{ count: number; pendingReports: number; activeUsers: number; systemAlerts: number }>;
  markAllNotificationsRead(): Promise<number>;
  // System logs
  getSystemLogs(filters?: {
    search?: string;
    severity?: string;
    userId?: string;
    entityType?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ total: number; logs: any[] }>;
  createSystemLog(log: {
    action: string;
    description?: string | null;
    userId?: string | null;
    entityType?: string | null;
    entityId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: any;
    severity?: string;
  }): Promise<any>;
  clearSystemLogs(olderThanDays?: number): Promise<number>;
}

export class Storage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const [result] = await db.insert(users).values(user).onConflictDoUpdate({
      target: users.email,
      set: { ...user, updatedAt: new Date() }
    }).returning();
    return result;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    hashedPassword: string;
  }): Promise<User> {
    const [result] = await db.insert(users).values({
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role as any,
      hashedPassword: userData.hashedPassword,
    }).returning();
    return result;
  }

  async updateUserProfile(id: string, updates: Partial<User>): Promise<User> {
    const [result] = await db.update(users).set({ ...updates, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return result;
  }

  async getAllUsers(filters?: { search?: string; role?: string; status?: string }): Promise<PublicUser[]> {
    let query = db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImageUrl: users.profileImageUrl,
      role: users.role,
      bio: users.bio,
      website: users.website,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users);

    if (filters?.search) {
      query = query.where(
        or(
          like(users.email, `%${filters.search}%`),
          like(users.firstName, `%${filters.search}%`),
          like(users.lastName, `%${filters.search}%`)
        )
      ) as any;
    }

    if (filters?.role) {
      query = query.where(eq(users.role, filters.role as any)) as any;
    }

    return await query;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [result] = await db.insert(categories).values(category).returning();
    return result;
  }

  // Course operations
  async getCoursesByTeacher(teacherId: string): Promise<CourseWithDetails[]> {
    const result = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        price: courses.price,
        thumbnailUrl: courses.thumbnailUrl,
        categoryId: courses.categoryId,
        teacherId: courses.teacherId,
        status: courses.status,
        difficultyLevel: courses.difficultyLevel,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        teacher: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          role: users.role,
          bio: users.bio,
          website: users.website,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
          createdAt: categories.createdAt,
        },
      })
      .from(courses)
      .leftJoin(users, eq(courses.teacherId, users.id))
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .where(eq(courses.teacherId, teacherId));

    return result.map((row: any) => ({ 
      ...row,
      enrollmentCount: 0,
      avgRating: null,
      revenue: 0,
      materials: [],
    }));
  }

  async getCourseDetails(courseId: string, userId?: string): Promise<CourseWithDetails | null> {
    const result = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        price: courses.price,
        thumbnailUrl: courses.thumbnailUrl,
        categoryId: courses.categoryId,
        teacherId: courses.teacherId,
        status: courses.status,
        difficultyLevel: courses.difficultyLevel,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        teacher: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          role: users.role,
          bio: users.bio,
          website: users.website,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
          createdAt: categories.createdAt,
        },
      })
      .from(courses)
      .leftJoin(users, eq(courses.teacherId, users.id))
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!result[0]) return null;

    const materials = await this.getCourseMaterials(courseId);

    return {
      ...result[0],
      enrollmentCount: 0,
      avgRating: null,
      revenue: 0,
      materials,
    } as CourseWithDetails;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [result] = await db.insert(courses).values(course).returning();
    return result;
  }

  async updateCourse(courseId: string, updates: Partial<Course>): Promise<Course> {
    const [result] = await db.update(courses).set({ ...updates, updatedAt: new Date() }).where(eq(courses.id, courseId)).returning();
    return result;
  }

  async getPublishedCourses(filters?: any): Promise<CourseWithDetails[]> {
    const result = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        price: courses.price,
        thumbnailUrl: courses.thumbnailUrl,
        categoryId: courses.categoryId,
        teacherId: courses.teacherId,
        status: courses.status,
        difficultyLevel: courses.difficultyLevel,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        teacher: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          role: users.role,
          bio: users.bio,
          website: users.website,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
          createdAt: categories.createdAt,
        },
      })
      .from(courses)
      .leftJoin(users, eq(courses.teacherId, users.id))
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .where(eq(courses.status, 'published'));

    return result.map((row: any) => ({
      ...row,
      enrollmentCount: 0,
      avgRating: null,
      revenue: 0,
      materials: [],
    }));
  }

  async getAllCourses(filters?: { search?: string; status?: string; category?: string }): Promise<CourseWithDetails[]> {
    const result = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        price: courses.price,
        thumbnailUrl: courses.thumbnailUrl,
        categoryId: courses.categoryId,
        teacherId: courses.teacherId,
        status: courses.status,
        difficultyLevel: courses.difficultyLevel,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        teacher: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          role: users.role,
          bio: users.bio,
          website: users.website,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
          createdAt: categories.createdAt,
        },
      })
      .from(courses)
      .leftJoin(users, eq(courses.teacherId, users.id))
      .leftJoin(categories, eq(courses.categoryId, categories.id));

    return result.map((row: any) => ({
      ...row,
      enrollmentCount: 0,
      avgRating: null,
      revenue: 0,
      materials: [],
      reportCount: 0,
      isActive: true,
    }));
  }

  // Course material operations
  async getCourseMaterials(courseId: string): Promise<CourseMaterial[]> {
    return await db.select().from(courseMaterials).where(eq(courseMaterials.courseId, courseId)).orderBy(courseMaterials.orderIndex);
  }

  async createCourseMaterial(material: InsertCourseMaterial): Promise<CourseMaterial> {
    const [result] = await db.insert(courseMaterials).values(material).returning();
    return result;
  }

  // Enrollment operations
  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [result] = await db.insert(enrollments).values(enrollment).returning();
    return result;
  }

  async getStudentEnrollments(studentId: string): Promise<any[]> {
    const result = await db
      .select({
        id: enrollments.id,
        courseId: enrollments.courseId,
        studentId: enrollments.studentId,
        enrolledAt: enrollments.enrolledAt,
        completedAt: enrollments.completedAt,
        progress: enrollments.progress,
        rating: enrollments.rating,
        review: enrollments.review,
        reviewedAt: enrollments.reviewedAt,
        course: {
          id: courses.id,
          title: courses.title,
          description: courses.description,
          price: courses.price,
          thumbnailUrl: courses.thumbnailUrl,
          status: courses.status,
          difficultyLevel: courses.difficultyLevel,
        },
      })
      .from(enrollments)
      .leftJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.studentId, studentId));

    return result;
  }

  // Student activity operations
  async recordStudentActivity(activity: InsertStudentActivity): Promise<StudentActivity> {
    const [result] = await db.insert(studentActivity).values(activity).returning();
    return result;
  }

  async getStudentActivities(studentId: string): Promise<StudentActivity[]> {
    return await db.select().from(studentActivity).where(eq(studentActivity.studentId, studentId)).orderBy(desc(studentActivity.createdAt));
  }

  // Admin operations
  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    // Get total counts
    const [userCount] = await db.select({ count: count() }).from(users);
    const [courseCount] = await db.select({ count: count() }).from(courses);
    const [enrollmentCount] = await db.select({ count: count() }).from(enrollments);
    
    // Calculate revenue (sum of course prices for enrolled courses)
    const [revenueResult] = await db
      .select({ total: sum(courses.price) })
      .from(enrollments)
      .leftJoin(courses, eq(enrollments.courseId, courses.id));

    return {
      totalUsers: userCount.count,
      totalCourses: courseCount.count,
      totalEnrollments: enrollmentCount.count,
      totalRevenue: Number(revenueResult.total) || 0,
      activeUsers: userCount.count, // Simplified
      newUsersThisMonth: 0, // Simplified
      coursesPublishedThisMonth: 0, // Simplified
      enrollmentsThisMonth: 0, // Simplified
      revenueThisMonth: 0, // Simplified
      averageRating: 4.5, // Simplified
    };
  }

  async getPlatformAnalytics(timeRange?: string): Promise<any> {
    // Simplified analytics
    return {
      userGrowth: [],
      courseGrowth: [],
      enrollmentGrowth: [],
      topCategories: [],
      topCourses: [],
      topTeachers: [],
      recentActivity: [],
    };
  }

  // Admin notifications
  async getAdminNotifications(): Promise<any[]> {
    const rows = await db.select().from(adminNotifications).orderBy(desc(adminNotifications.createdAt));
    return rows as any[];
  }

  async getUnreadNotificationSummary(): Promise<{ count: number; pendingReports: number; activeUsers: number; systemAlerts: number }> {
    const [unread] = await db.select({ c: count() }).from(adminNotifications).where(eq(adminNotifications.isRead as any, false as any));
    const [warnings] = await db.select({ c: count() }).from(adminNotifications).where(eq(adminNotifications.type as any, 'warning' as any));
    const [errors] = await db.select({ c: count() }).from(adminNotifications).where(eq(adminNotifications.type as any, 'error' as any));
    const [usersCount] = await db.select({ c: count() }).from(users);

    return {
      count: (unread?.c as unknown as number) ?? 0,
      pendingReports: (warnings?.c as unknown as number) ?? 0,
      activeUsers: (usersCount?.c as unknown as number) ?? 0,
      systemAlerts: (errors?.c as unknown as number) ?? 0,
    };
  }

  async markAllNotificationsRead(): Promise<number> {
    await db.update(adminNotifications).set({ isRead: true as any });
    const [unread] = await db.select({ c: count() }).from(adminNotifications).where(eq(adminNotifications.isRead as any, false as any));
    return (unread?.c as unknown as number) ?? 0;
  }

  // System logs
  async getSystemLogs(filters?: {
    search?: string;
    severity?: string;
    userId?: string;
    entityType?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ total: number; logs: any[] }> {
    const whereClauses: any[] = [];

    if (filters?.search) {
      whereClauses.push(
        or(
          like(systemLogs.action, `%${filters.search}%`),
          like(systemLogs.description, `%${filters.search}%`)
        ) as any
      );
    }
    if (filters?.severity) {
      whereClauses.push(eq(systemLogs.severity as any, filters.severity as any));
    }
    if (filters?.userId) {
      whereClauses.push(eq(systemLogs.userId, filters.userId));
    }
    if (filters?.entityType) {
      whereClauses.push(eq(systemLogs.entityType, filters.entityType));
    }
    if (filters?.dateFrom) {
      whereClauses.push(gte(systemLogs.createdAt as any, new Date(filters.dateFrom) as any));
    }
    if (filters?.dateTo) {
      whereClauses.push(lte(systemLogs.createdAt as any, new Date(filters.dateTo) as any));
    }

    const whereExpr = whereClauses.length > 0 ? (and(...whereClauses) as any) : undefined;

    const [totalRow] = await db.select({ c: count() }).from(systemLogs).where(whereExpr as any);
    const total = (totalRow?.c as unknown as number) ?? 0;

    const limit = Math.min(filters?.limit ?? 50, 200);
    const offset = filters?.offset ?? 0;

    const logs = await db
      .select()
      .from(systemLogs)
      .where(whereExpr as any)
      .orderBy(desc(systemLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return { total, logs };
  }

  async createSystemLog(log: {
    action: string;
    description?: string | null;
    userId?: string | null;
    entityType?: string | null;
    entityId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: any;
    severity?: string;
  }): Promise<any> {
    const [row] = await db
      .insert(systemLogs)
      .values({
        action: log.action,
        description: (log.description ?? null) as any,
        userId: (log.userId as any) ?? null,
        entityType: (log.entityType ?? null) as any,
        entityId: (log.entityId ?? null) as any,
        ipAddress: (log.ipAddress ?? null) as any,
        userAgent: (log.userAgent ?? null) as any,
        metadata: log.metadata ? JSON.stringify(log.metadata) : (null as any),
        severity: (log.severity as any) ?? ('low' as any),
      } as any)
      .returning();
    return row as any;
  }

  async clearSystemLogs(olderThanDays?: number): Promise<number> {
    if (!olderThanDays) {
      await db.delete(systemLogs);
      return 0;
    }
    const threshold = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    await db.delete(systemLogs).where(lte(systemLogs.createdAt as any, threshold as any));
    return 0;
  }
}

export const storage = new Storage();
