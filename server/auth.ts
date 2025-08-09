import express, { type Express, type RequestHandler } from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import MemoryStore from "memorystore";

// Simple auth system without Replit dependencies
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const MemStore = MemoryStore(session);
  const sessionStore = new MemStore({
    checkPeriod: sessionTtl
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'supersecretkey123',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.use(getSession());
  
  // Login endpoint
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      // For demo purposes, create a simple admin user if it doesn't exist
      let user = await storage.getUserByEmail(email);
      
      // Create default admin user if logging in with admin credentials
      if (!user && email === 'admin@example.com' && password === 'admin123') {
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await storage.createUser({
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          hashedPassword
        });
      }
      
      // Create default teacher user
      if (!user && email === 'teacher@example.com' && password === 'teacher123') {
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await storage.createUser({
          email: 'teacher@example.com',
          firstName: 'Teacher',
          lastName: 'User',
          role: 'teacher',
          hashedPassword
        });
      }
      
      // Create default student user
      if (!user && email === 'student@example.com' && password === 'student123') {
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await storage.createUser({
          email: 'student@example.com',
          firstName: 'Student',
          lastName: 'User',
          role: 'student',
          hashedPassword
        });
      }
      
      if (!user || !user.hashedPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const isValid = await bcrypt.compare(password, user.hashedPassword);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Store user in session
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl
      };
      
      res.json({ 
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profileImageUrl: user.profileImageUrl
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Logout endpoint
  app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Could not log out' });
      }
      res.json({ message: 'Logout successful' });
    });
  });
  
  // Get current user
  app.get('/api/auth/user', isAuthenticated, (req: any, res) => {
    res.json(req.user);
  });
}

export const isAuthenticated: RequestHandler = (req: any, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  req.user = req.session.user;
  next();
};

// Role-based middleware
export const requireRole = (role: string): RequestHandler => {
  return (req: any, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== role) {
      return res.status(403).json({ message: `${role} access required` });
    }
    
    next();
  };
};

export const requireAdmin: RequestHandler = requireRole('admin');
export const requireTeacher: RequestHandler = (req: any, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Teacher or admin access required' });
  }
  
  next();
};
