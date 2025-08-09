import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, requireAdmin, requireTeacher } from "./auth";
import { 
  insertCourseSchema, 
  insertCourseMaterialSchema, 
  insertCategorySchema,
  insertEnrollmentSchema,
  insertStudentActivitySchema 
} from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'video/mp4',
      'video/mov',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, MOV, PDF, DOCX, PPTX, and images are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication first
  await setupAuth(app);

  // Categories routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', requireTeacher, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Course routes
  app.get('/api/courses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const courses = await storage.getCoursesByTeacher(userId);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const courseId = req.params.id;
      const userId = req.user.id;
      
      // Get course details with enrollment status
      const course = await storage.getCourseDetails(courseId, userId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post('/api/courses', requireTeacher, async (req: any, res) => {
    try {
      const courseData = insertCourseSchema.parse({
        ...req.body,
        teacherId: req.user.id
      });
      
      const course = await storage.createCourse(courseData);
      res.json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.put('/api/courses/:id', requireTeacher, async (req: any, res) => {
    try {
      const courseId = req.params.id;
      const updates = req.body;
      
      const course = await storage.updateCourse(courseId, updates);
      res.json(course);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  // Course materials routes
  app.get('/api/courses/:courseId/materials', isAuthenticated, async (req, res) => {
    try {
      const { courseId } = req.params;
      const materials = await storage.getCourseMaterials(courseId);
      res.json(materials);
    } catch (error) {
      console.error("Error fetching materials:", error);
      res.status(500).json({ message: "Failed to fetch materials" });
    }
  });

  app.post('/api/courses/:courseId/materials', requireTeacher, upload.single('file'), async (req: any, res) => {
    try {
      const { courseId } = req.params;
      const { title, description, type, content, orderIndex } = req.body;
      
      const materialData = insertCourseMaterialSchema.parse({
        courseId,
        title,
        description,
        type,
        content: req.file ? req.file.path : content,
        fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
        orderIndex: parseInt(orderIndex) || 0
      });
      
      const material = await storage.createCourseMaterial(materialData);
      res.json(material);
    } catch (error) {
      console.error("Error creating material:", error);
      res.status(500).json({ message: "Failed to create material" });
    }
  });

  // Enrollment routes
  app.post('/api/courses/:courseId/enroll', isAuthenticated, async (req: any, res) => {
    try {
      const { courseId } = req.params;
      const studentId = req.user.id;
      
      const enrollmentData = insertEnrollmentSchema.parse({
        studentId,
        courseId,
        enrolledAt: new Date()
      });
      
      const enrollment = await storage.createEnrollment(enrollmentData);
      res.json(enrollment);
    } catch (error) {
      console.error("Error enrolling in course:", error);
      res.status(500).json({ message: "Failed to enroll in course" });
    }
  });

  app.get('/api/student/enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const studentId = req.user.id;
      const enrollments = await storage.getStudentEnrollments(studentId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Student activity routes
  app.post('/api/student/activity', isAuthenticated, async (req: any, res) => {
    try {
      const studentId = req.user.id;
      const activityData = insertStudentActivitySchema.parse({
        ...req.body,
        studentId
      });
      
      const activity = await storage.recordStudentActivity(activityData);
      res.json(activity);
    } catch (error) {
      console.error("Error recording activity:", error);
      res.status(500).json({ message: "Failed to record activity" });
    }
  });

  app.get('/api/student/activity', isAuthenticated, async (req: any, res) => {
    try {
      const studentId = req.user.id;
      const activities = await storage.getStudentActivities(studentId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Browse courses (for students)
  app.get('/api/browse/courses', async (req, res) => {
    try {
      const filters = req.query;
      const courses = await storage.getPublishedCourses(filters);
      res.json(courses);
    } catch (error) {
      console.error("Error browsing courses:", error);
      res.status(500).json({ message: "Failed to browse courses" });
    }
  });

  // File serving
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Admin routes
  app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });

  app.get('/api/admin/analytics', requireAdmin, async (req, res) => {
    try {
      const { timeRange } = req.query;
      const analytics = await storage.getPlatformAnalytics(timeRange as string);
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const { search, role, status } = req.query;
      const users = await storage.getAllUsers({ search, role, status });
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.patch('/api/admin/users/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const user = await storage.updateUserProfile(id, updates);
      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  app.get('/api/admin/courses', requireAdmin, async (req, res) => {
    try {
      const { search, status, category } = req.query;
      const courses = await storage.getAllCourses({ search, status, category });
      res.json(courses);
    } catch (error) {
      console.error('Error fetching admin courses:', error);
      res.status(500).json({ message: 'Failed to fetch courses' });
    }
  });

  app.patch('/api/admin/courses/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const course = await storage.updateCourse(id, updates);
      res.json(course);
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({ message: 'Failed to update course' });
    }
  });

  // Real-time stats endpoint
  app.get('/api/admin/realtime-stats', requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching realtime stats:', error);
      res.status(500).json({ message: 'Failed to fetch realtime stats' });
    }
  });

  return createServer(app);
}
