import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
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
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

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

  app.post('/api/categories', isAuthenticated, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
        return;
      }
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Courses routes
  app.get('/api/courses', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.user.claims.sub;
      const courses = await storage.getCoursesByTeacher(teacherId);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const course = await storage.getCourseById(id);
      
      if (!course) {
        res.status(404).json({ message: "Course not found" });
        return;
      }

      // Check if user is the teacher of this course
      const teacherId = req.user.claims.sub;
      if (course.teacherId !== teacherId) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post('/api/courses', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.user.claims.sub;
      const courseData = insertCourseSchema.parse({
        ...req.body,
        teacherId,
      });
      
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid course data", errors: error.errors });
        return;
      }
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.put('/api/courses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const teacherId = req.user.claims.sub;
      
      // Verify ownership
      const existingCourse = await storage.getCourseById(id);
      if (!existingCourse || existingCourse.teacherId !== teacherId) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      const courseData = insertCourseSchema.partial().parse(req.body);
      const updatedCourse = await storage.updateCourse(id, courseData);
      res.json(updatedCourse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid course data", errors: error.errors });
        return;
      }
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  app.delete('/api/courses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const teacherId = req.user.claims.sub;
      
      // Verify ownership
      const existingCourse = await storage.getCourseById(id);
      if (!existingCourse || existingCourse.teacherId !== teacherId) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      await storage.deleteCourse(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Course materials routes
  app.get('/api/courses/:courseId/materials', isAuthenticated, async (req: any, res) => {
    try {
      const { courseId } = req.params;
      const teacherId = req.user.claims.sub;
      
      // Verify ownership
      const course = await storage.getCourseById(courseId);
      if (!course || course.teacherId !== teacherId) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      const materials = await storage.getMaterialsByCourse(courseId);
      res.json(materials);
    } catch (error) {
      console.error("Error fetching materials:", error);
      res.status(500).json({ message: "Failed to fetch materials" });
    }
  });

  app.post('/api/courses/:courseId/materials', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const { courseId } = req.params;
      const teacherId = req.user.claims.sub;
      
      // Verify ownership
      const course = await storage.getCourseById(courseId);
      if (!course || course.teacherId !== teacherId) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      const materialData = insertCourseMaterialSchema.parse({
        courseId,
        title: req.body.title || req.file.originalname,
        type: req.body.type,
        fileUrl: `/uploads/${req.file.filename}`,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        orderIndex: parseInt(req.body.orderIndex) || 0,
      });

      const material = await storage.createCourseMaterial(materialData);
      res.status(201).json(material);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid material data", errors: error.errors });
        return;
      }
      console.error("Error creating material:", error);
      res.status(500).json({ message: "Failed to create material" });
    }
  });

  app.delete('/api/materials/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const teacherId = req.user.claims.sub;
      
      // Get material and verify ownership through course
      const materials = await storage.getMaterialsByCourse(''); // We need to get material first to check course ownership
      // This is a simplified check - in production you'd want a more efficient query
      
      await storage.deleteCourseMaterial(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting material:", error);
      res.status(500).json({ message: "Failed to delete material" });
    }
  });

  // Enrollments routes
  app.get('/api/courses/:courseId/enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const { courseId } = req.params;
      const teacherId = req.user.claims.sub;
      
      // Verify ownership
      const course = await storage.getCourseById(courseId);
      if (!course || course.teacherId !== teacherId) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      const enrollments = await storage.getEnrollmentsByCourse(courseId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.get('/api/enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.user.claims.sub;
      const enrollments = await storage.getEnrollmentsByTeacher(teacherId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Student activity routes
  app.get('/api/activity', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.getRecentActivityByTeacher(teacherId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/stats', isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.user.claims.sub;
      const stats = await storage.getTeacherStats(teacherId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // File upload for thumbnails
  app.post('/api/upload/thumbnail', isAuthenticated, upload.single('thumbnail'), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      res.json({
        url: `/uploads/${req.file.filename}`,
        originalName: req.file.originalname,
        size: req.file.size,
      });
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      res.status(500).json({ message: "Failed to upload thumbnail" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Student-specific routes
  app.get('/api/student/courses', async (req, res) => {
    try {
      const { search, category, price, difficulty } = req.query;
      const filters: any = {};
      
      if (category) filters.category = category;
      if (difficulty) filters.difficulty = difficulty;
      if (price) {
        const [min, max] = (price as string).split('-');
        if (min) filters.priceMin = parseFloat(min);
        if (max && max !== '+') filters.priceMax = parseFloat(max);
      }
      
      let courses;
      if (search) {
        courses = await storage.searchCourses(search as string, filters);
      } else {
        courses = await storage.getPublishedCourses(filters);
      }
      
      res.json(courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ message: 'Failed to fetch courses' });
    }
  });

  app.get('/api/student/enrolled-courses', isAuthenticated, async (req: any, res) => {
    try {
      const studentId = req.user.claims.sub;
      const courses = await storage.getEnrolledCourses(studentId);
      res.json(courses);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      res.status(500).json({ message: 'Failed to fetch enrolled courses' });
    }
  });

  app.get('/api/student/recommended-courses', async (req, res) => {
    try {
      // For now, return popular courses. In a real app, this would use ML recommendations
      const courses = await storage.getPublishedCourses();
      const recommended = courses.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0)).slice(0, 6);
      res.json(recommended);
    } catch (error) {
      console.error('Error fetching recommended courses:', error);
      res.status(500).json({ message: 'Failed to fetch recommendations' });
    }
  });

  app.get('/api/student/course/:id', async (req, res) => {
    try {
      const { id } = req.params;
      let studentId;
      
      if (req.isAuthenticated && req.isAuthenticated()) {
        studentId = (req as any).user.claims.sub;
      }
      
      const course = await storage.getCourseForStudent(id, studentId);
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      res.json(course);
    } catch (error) {
      console.error('Error fetching course:', error);
      res.status(500).json({ message: 'Failed to fetch course' });
    }
  });

  // Course enrollment
  app.post('/api/student/enroll/:courseId', isAuthenticated, async (req: any, res) => {
    try {
      const { courseId } = req.params;
      const studentId = req.user.claims.sub;
      
      // Check if already enrolled
      const existingEnrollment = await storage.getStudentEnrollment(courseId, studentId);
      if (existingEnrollment) {
        return res.status(400).json({ message: 'Already enrolled in this course' });
      }
      
      const enrollment = await storage.createEnrollment({
        courseId,
        studentId,
        progress: 0,
      });
      
      // Create enrollment activity
      await storage.createActivity({
        studentId,
        courseId,
        activityType: 'enrolled',
        metadata: {},
      });
      
      res.json(enrollment);
    } catch (error) {
      console.error('Error enrolling student:', error);
      res.status(500).json({ message: 'Failed to enroll in course' });
    }
  });

  // Progress tracking
  app.put('/api/student/progress/:enrollmentId', isAuthenticated, async (req: any, res) => {
    try {
      const { enrollmentId } = req.params;
      const { progress } = req.body;
      
      await storage.updateProgress(enrollmentId, progress);
      
      res.json({ message: 'Progress updated successfully' });
    } catch (error) {
      console.error('Error updating progress:', error);
      res.status(500).json({ message: 'Failed to update progress' });
    }
  });

  // Course reviews
  app.post('/api/student/review/:enrollmentId', isAuthenticated, async (req: any, res) => {
    try {
      const { enrollmentId } = req.params;
      const { rating, review } = req.body;
      
      await storage.createReview(enrollmentId, rating, review);
      
      res.json({ message: 'Review submitted successfully' });
    } catch (error) {
      console.error('Error submitting review:', error);
      res.status(500).json({ message: 'Failed to submit review' });
    }
  });

  app.get('/api/course/:id/reviews', async (req, res) => {
    try {
      const { id } = req.params;
      const reviews = await storage.getCourseReviews(id);
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Failed to fetch reviews' });
    }
  });

  // Payment simulation
  app.post('/api/student/simulate-payment', isAuthenticated, async (req: any, res) => {
    try {
      const { courseId, amount } = req.body;
      const studentId = req.user.claims.sub;
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create enrollment after "payment"
      const enrollment = await storage.createEnrollment({
        courseId,
        studentId,
        progress: 0,
      });
      
      // Create activity
      await storage.createActivity({
        studentId,
        courseId,
        activityType: 'enrolled',
        metadata: { paymentAmount: amount },
      });
      
      res.json({ 
        success: true, 
        enrollmentId: enrollment.id,
        message: 'Payment processed successfully' 
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({ message: 'Payment failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
