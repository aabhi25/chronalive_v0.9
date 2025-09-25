import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scheduler } from "./services/scheduler";
import { CSVProcessor } from "./services/csvProcessor";
import { z } from "zod";
import { 
  insertTeacherSchema, 
  insertSubjectSchema, 
  insertClassSchema,
  updateClassSchema,
  insertSubstitutionSchema,
  insertTimetableChangeSchema,
  insertSchoolSchema,
  insertClassSubjectAssignmentSchema,
  insertTimetableStructureSchema,
  insertTeacherAttendanceSchema,
  insertStudentAttendanceSchema,
  bulkAttendanceSchema,
  updateTeacherDailyPeriodsSchema,
  insertAuditLogSchema,
  createAndAssignSubjectSchema,
  insertTeacherReplacementSchema,
  insertClassTeacherAssignmentSchema,
  insertStudentSchema,
  insertParentSchema,
  insertStudentParentSchema
} from "@shared/schema";
import multer from "multer";
import * as XLSX from "xlsx";
import { setupCustomAuth, authenticateToken as authMiddleware, verifyToken } from "./auth";
import { processChatMessage } from "./chatService";
import intentMappingService from "./intentMapping";
import { exportService } from "./services/exportService";
import downloadExcelRouter from "./routes/downloadExcel";
import { isFutureDate } from "../shared/utils";
import { format } from "date-fns";
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper function to generate consistent colors based on subject code
function generateColorForSubjectCode(subjectCode: string): string {
  // Predefined color palette for better visual distinction
  const colors = [
    "#3B82F6", // Blue
    "#EF4444", // Red  
    "#10B981", // Green
    "#F59E0B", // Amber
    "#8B5CF6", // Violet
    "#06B6D4", // Cyan
    "#F97316", // Orange
    "#84CC16", // Lime
    "#EC4899", // Pink
    "#6366F1", // Indigo
    "#14B8A6", // Teal
    "#DC2626", // Red-600
    "#7C3AED", // Purple
    "#059669", // Emerald
    "#D97706", // Orange-600
    "#2563EB", // Blue-600
    "#BE123C", // Rose
    "#0891B2", // Sky
    "#CA8A04", // Yellow-600
    "#9333EA"  // Purple-600
  ];
  
  // Generate consistent hash from subject code
  let hash = 0;
  for (let i = 0; i < subjectCode.length; i++) {
    const char = subjectCode.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use absolute value and modulo to get consistent color index
  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
}

// Helper function to generate grade-specific subject codes
async function generateGradeSpecificSubjectCode(subjectName: string, grade: string, schoolId: string): Promise<string> {
  // Generate base code from subject name
  const baseCode = subjectName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 3); // Shorter to make room for grade
  
  // Create grade-specific code
  let code = `${baseCode}${grade}`;
  let counter = 1;
  
  // Ensure uniqueness
  while (await storage.checkSubjectCodeExists(code, schoolId)) {
    code = `${baseCode}${grade}_${counter}`;
    counter++;
  }
  
  return code;
}

// Helper function to generate subject codes (fallback)
async function generateSubjectCode(subjectName: string, schoolId: string): Promise<string> {
  // Generate base code from subject name
  const baseCode = subjectName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 4);
  
  let code = baseCode;
  let counter = 1;
  
  // Ensure uniqueness
  while (await storage.checkSubjectCodeExists(code, schoolId)) {
    code = `${baseCode}${counter}`;
    counter++;
  }
  
  return code;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup custom authentication
  setupCustomAuth(app);

  // Auth routes
  app.get('/api/auth/user', authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      // Don't send password hash to client
      const { passwordHash, ...userWithoutPassword } = user;
      
      // For student users, get the student's name from the students table
      if (user.role === 'student' && user.studentId) {
        const student = await storage.getStudent(user.studentId);
        if (student) {
          userWithoutPassword.firstName = student.firstName;
          userWithoutPassword.lastName = student.lastName;
        }
      }
      // For parent users, get the parent's name from the parents table
      else if (user.role === 'parent' && user.parentId) {
        const parent = await storage.getParent(user.parentId);
        if (parent) {
          userWithoutPassword.firstName = parent.firstName;
          userWithoutPassword.lastName = parent.lastName;
        }
      }
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.put('/api/auth/profile', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, email } = req.body;
      
      // Validate input
      if (!firstName?.trim()) {
        return res.status(400).json({ message: "First name is required" });
      }
      
      if (!email?.trim()) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Check if email is already taken by another user
      if (email !== req.user.email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Email is already in use" });
        }
      }
      
      // Update user profile
      const updatedUser = await storage.updateUser(userId, {
        firstName: firstName.trim(),
        lastName: lastName?.trim() || null,
        email: email.trim(),
      });
      
      // Don't send password hash to client
      const { passwordHash, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Change user password
  app.put('/api/auth/password', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      // Validate input
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }
      
      if (!newPassword) {
        return res.status(400).json({ message: "New password is required" });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }
      
      // Verify current password
      const bcrypt = await import('bcryptjs');
      const isCurrentPasswordValid = await bcrypt.default.compare(currentPassword, req.user.passwordHash);
      
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedNewPassword = await bcrypt.default.hash(newPassword, 12);
      
      // Update password
      await storage.updateUser(userId, {
        passwordHash: hashedNewPassword,
        passwordChangedAt: new Date(),
      });
      
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Get school information for school admin
  app.get('/api/school-info', authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Allow school admins, students, and parents to access this endpoint
      if (user.role !== 'admin' && user.role !== 'student' && user.role !== 'parent') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (!user.schoolId) {
        return res.status(400).json({ message: "User is not associated with a school" });
      }
      
      const school = await storage.getSchool(user.schoolId);
      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }
      
      // Get teacher count for this school
      const teacherCount = await storage.getTeacherCountBySchool(user.schoolId);
      
      res.json({
        ...school,
        totalTeachers: teacherCount
      });
    } catch (error) {
      console.error("Error fetching school info:", error);
      res.status(500).json({ message: "Failed to fetch school information" });
    }
  });

  // School management endpoints (Super Admin only)
  app.get("/api/schools", authMiddleware, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      const schools = await storage.getSchoolsWithAdminEmails();
      res.json(schools);
    } catch (error) {
      console.error("Error fetching schools:", error);
      res.status(500).json({ message: "Failed to fetch schools" });
    }
  });

  app.post("/api/schools", authMiddleware, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      
      const { adminEmail, adminPassword, adminName, ...schoolData } = req.body;
      
      // Validate school data
      const validatedSchoolData = insertSchoolSchema.parse({
        ...schoolData,
        adminName
      });
      
      // Create school first
      const school = await storage.createSchool(validatedSchoolData);
      
      // Create admin account if credentials provided
      if (adminEmail && adminPassword) {
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.default.hash(adminPassword, 12);
        await storage.createUser({
          email: adminEmail,
          loginId: adminEmail, // Use email as loginId for admin users
          passwordHash: hashedPassword,
          role: "admin",
          schoolId: school.id,
          firstName: adminName,
          lastName: null,
          teacherId: null,
          studentId: null,
          parentId: null
        });
      }
      
      res.status(201).json(school);
    } catch (error) {
      console.error("Error creating school:", error);
      res.status(400).json({ message: "Invalid school data" });
    }
  });

  app.put("/api/schools/:id", authMiddleware, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      
      const { adminEmail, adminPassword, adminName, ...schoolData } = req.body;
      
      // Validate school data
      const validatedSchoolData = insertSchoolSchema.partial().parse({
        ...schoolData,
        adminName
      });
      
      // Update school first
      const school = await storage.updateSchool(req.params.id, validatedSchoolData);
      
      // Update admin account if new password provided
      if (adminEmail && adminPassword) {
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.default.hash(adminPassword, 12);
        
        // Try to find existing admin user for this school
        try {
          const existingUsers = await storage.getUsersBySchoolId(req.params.id);
          const existingAdmin = existingUsers.find(user => user.role === "admin");
          
          if (existingAdmin) {
            // Update existing admin
            await storage.updateUser(existingAdmin.id, {
              email: adminEmail,
              passwordHash: hashedPassword,
              firstName: adminName,
            });
          } else {
            // Create new admin if none exists
            await storage.createUser({
              email: adminEmail,
              loginId: adminEmail, // Use email as loginId for admin users
              passwordHash: hashedPassword,
              role: "admin",
              schoolId: school.id,
              firstName: adminName,
              lastName: null,
              teacherId: null,
              studentId: null,
              parentId: null
            });
          }
        } catch (error) {
          console.error("Error managing admin account:", error);
          // Continue without failing the school update
        }
      }
      
      res.json(school);
    } catch (error) {
      console.error("Error updating school:", error);
      res.status(400).json({ message: "Invalid school data" });
    }
  });

  // Update school status (activate/deactivate)
  app.patch("/api/schools/:id/status", authMiddleware, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }

      const { id } = req.params;
      const { isActive } = req.body;
      
      console.log(`Updating school ${id} status to ${isActive}`);
      
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: "isActive must be a boolean value" });
      }

      const updatedSchool = await storage.updateSchool(id, { isActive });
      
      console.log('Updated school:', updatedSchool);
      
      res.json(updatedSchool);
    } catch (error) {
      console.error("Error updating school status:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to update school status", error: errorMessage });
    }
  });

  // Stats endpoint (protected)
  app.get("/api/stats", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const stats = await storage.getStats(user.schoolId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Admin dashboard stats endpoint (super admin only)
  app.get("/api/admin/dashboard-stats", authMiddleware, async (req, res) => {
    try {
      // Only super admins can access this endpoint
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const stats = await storage.getAdminDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch admin dashboard stats" });
    }
  });

  // System Modules endpoints (super admin only)
  app.get("/api/system-modules", authMiddleware, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      
      const activeOnly = req.query.activeOnly === 'true';
      const modules = await storage.getSystemModules(activeOnly);
      res.json(modules);
    } catch (error) {
      console.error("Error fetching system modules:", error);
      res.status(500).json({ message: "Failed to fetch system modules" });
    }
  });

  app.post("/api/system-modules", authMiddleware, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      
      const module = await storage.createSystemModule(req.body);
      res.status(201).json(module);
    } catch (error) {
      console.error("Error creating system module:", error);
      res.status(400).json({ message: "Failed to create system module" });
    }
  });

  app.put("/api/system-modules/:id", authMiddleware, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      
      const module = await storage.updateSystemModule(req.params.id, req.body);
      res.json(module);
    } catch (error) {
      console.error("Error updating system module:", error);
      res.status(400).json({ message: "Failed to update system module" });
    }
  });

  app.delete("/api/system-modules/:id", authMiddleware, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      
      // Instead of actual deletion, mark as inactive
      await storage.updateSystemModule(req.params.id, { isActive: false });
      res.json({ message: "System module deactivated successfully" });
    } catch (error) {
      console.error("Error deleting system module:", error);
      res.status(500).json({ message: "Failed to delete system module" });
    }
  });

  // Role Permissions endpoints (super admin only)
  app.get("/api/role-permissions", authMiddleware, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      
      const { schoolId, role } = req.query;
      const permissions = await storage.getRolePermissions(schoolId as string, role as string);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      res.status(500).json({ message: "Failed to fetch role permissions" });
    }
  });

  app.post("/api/role-permissions", authMiddleware, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      
      const permissionData = {
        ...req.body,
        assignedBy: req.user?.id
      };
      
      const permission = await storage.setRolePermission(permissionData);
      res.status(201).json(permission);
    } catch (error) {
      console.error("Error creating role permission:", error);
      res.status(400).json({ message: "Failed to create role permission" });
    }
  });

  app.put("/api/role-permissions/:id", authMiddleware, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      
      const permissionData = {
        ...req.body,
        assignedBy: req.user?.id
      };
      
      const permission = await storage.updateRolePermission(req.params.id, permissionData);
      res.json(permission);
    } catch (error) {
      console.error("Error updating role permission:", error);
      res.status(400).json({ message: "Failed to update role permission" });
    }
  });

  app.delete("/api/role-permissions/:id", authMiddleware, async (req, res) => {
    try {
      if (req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin required." });
      }
      
      await storage.deleteRolePermission(req.params.id);
      res.json({ message: "Role permission deleted successfully" });
    } catch (error) {
      console.error("Error deleting role permission:", error);
      res.status(500).json({ message: "Failed to delete role permission" });
    }
  });

  // Post/Newsfeed routes
  app.get("/api/posts", authMiddleware, async (req, res) => {
    try {
      if (!req.user?.schoolId) {
        return res.status(400).json({ message: "User not associated with a school" });
      }

      const { feedScope, classId, offset, limit } = req.query;
      
      // Parse pagination parameters with defaults
      const parsedOffset = offset ? parseInt(offset as string, 10) : undefined;
      const parsedLimit = limit ? parseInt(limit as string, 10) : undefined;
      
      // Validate pagination parameters
      if (parsedOffset !== undefined && (isNaN(parsedOffset) || parsedOffset < 0)) {
        return res.status(400).json({ message: "Invalid offset parameter" });
      }
      
      if (parsedLimit !== undefined && (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50)) {
        return res.status(400).json({ message: "Invalid limit parameter (must be between 1 and 50)" });
      }
      
      const posts = await storage.getPosts(
        req.user.schoolId,
        feedScope as 'school' | 'class',
        classId as string,
        parsedOffset,
        parsedLimit
      );
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post("/api/posts", authMiddleware, async (req, res) => {
    try {
      const { content, feedScope, classId, attachments = [] } = req.body;

      // Role-based posting validation
      if (req.user?.role === 'student' || req.user?.role === 'parent') {
        return res.status(403).json({ message: "Students and parents cannot create posts" });
      }

      if (!req.user?.schoolId) {
        return res.status(400).json({ message: "User not associated with a school" });
      }

      // Additional validation for class posts
      if (feedScope === 'class') {
        if (!classId) {
          return res.status(400).json({ message: "Class ID required for class posts" });
        }

        // Teachers can only post in their assigned classes (unless school admin grants permission)
        if (req.user.role === 'teacher') {
          // TODO: Add validation to check if teacher is assigned to this class
        }
      }

      const post = await storage.createPost({
        content,
        feedScope: feedScope || 'school',
        classId: feedScope === 'class' ? classId : null,
        attachments,
        postedById: req.user.id,
        schoolId: req.user.schoolId,
        isActive: true,
      });

      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.get("/api/posts/my-feed", authMiddleware, async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const feed = await storage.getUserFeed(req.user.id);
      res.json(feed);
    } catch (error) {
      console.error("Error fetching user feed:", error);
      res.status(500).json({ message: "Failed to fetch user feed" });
    }
  });

  app.put("/api/posts/:id", authMiddleware, async (req, res) => {
    try {
      const { content, attachments } = req.body;
      const postId = req.params.id;

      // Get the original post to check ownership
      const originalPost = await storage.getPostById(postId);
      if (!originalPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Only post author or school admin can edit posts
      if (originalPost.postedById !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "You can only edit your own posts" });
      }

      const updatedPost = await storage.updatePost(postId, {
        content,
        attachments,
      });

      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", authMiddleware, async (req, res) => {
    try {
      const postId = req.params.id;

      // Get the original post to check ownership
      const originalPost = await storage.getPostById(postId);
      if (!originalPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Only post author or school admin can delete posts
      if (originalPost.postedById !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: "You can only delete your own posts" });
      }

      await storage.deletePost(postId);
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // File upload endpoint for newsfeed attachments
  app.post("/api/posts/upload-attachment", authMiddleware, upload.single('attachment'), async (req: any, res) => {
    try {
      console.log("[UPLOAD DEBUG] Upload request received");
      console.log("[UPLOAD DEBUG] User role:", req.user?.role);
      console.log("[UPLOAD DEBUG] File present:", !!req.file);
      
      if (!req.file) {
        console.log("[UPLOAD DEBUG] No file in request");
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log("[UPLOAD DEBUG] File details:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      // Role-based upload validation - only admin/teacher can upload
      if (req.user?.role === 'student' || req.user?.role === 'parent') {
        console.log("[UPLOAD DEBUG] User role not allowed:", req.user?.role);
        return res.status(403).json({ message: "Students and parents cannot upload attachments" });
      }

      // Simplified file validation for testing
      console.log("[UPLOAD DEBUG] Simplified validation - checking basic file types");
      
      // Only allow web-displayable image formats for grid display
      const allowedMimeTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain'
      ];
      
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        console.log("[UPLOAD DEBUG] MIME type not allowed:", req.file.mimetype);
        return res.status(400).json({ 
          message: `File type ${req.file.mimetype} not allowed. Only images, PDFs, and text files are supported.` 
        });
      }
      
      // Simple size check (5MB limit for now)
      if (req.file.size > 5 * 1024 * 1024) {
        console.log("[UPLOAD DEBUG] File too large:", req.file.size);
        return res.status(400).json({ 
          message: "File too large. Maximum size is 5MB" 
        });
      }

      // Generate cryptographically secure filename
      const fileId = crypto.randomUUID();
      const fileExtension = path.extname(req.file.originalname) || '.tmp';
      const secureFilename = `${fileId}${fileExtension}`;
      console.log("[UPLOAD DEBUG] Generated filename:", secureFilename);
      
      // Create secure uploads directory
      const uploadsDir = path.join(process.cwd(), 'attached_assets', 'secure_uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Save file to disk with secure filename
      const filePath = path.join(uploadsDir, secureFilename);
      fs.writeFileSync(filePath, req.file.buffer);
      
      // Store file metadata securely (for future database tracking)
      const fileMetadata = {
        id: fileId,
        originalName: req.file.originalname,
        filename: secureFilename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedBy: req.user.id,
        uploadedAt: new Date().toISOString(),
        schoolId: req.user.schoolId
      };
      
      console.log("[UPLOAD DEBUG] Upload successful, returning response");
      
      // Return file ID instead of direct path for security
      res.json({ 
        fileId: fileId,
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    } catch (error) {
      console.error("Error uploading attachment:", error);
      res.status(500).json({ message: "Failed to upload attachment" });
    }
  });

  // Simple approach: Use Bearer token from header or query parameter
  const simpleFileAuth = async (req: any, res: any, next: any) => {
    // Try Bearer token auth first (for API calls)
    const authHeader = req.headers.authorization;
    let token = authHeader && authHeader.split(" ")[1];
    
    // If no header token, try query parameter (for browser image loading)
    if (!token && req.query.token) {
      token = req.query.token;
    }
    
    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    try {
      const user = await storage.getUser(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      req.user = user;
      next();
    } catch (error) {
      console.error("Authentication error:", error);
      return res.status(500).json({ message: "Authentication failed" });
    }
  };

  // Secure file download endpoint with authentication and access control
  app.get("/api/files/:fileId", simpleFileAuth, async (req, res) => {
    try {
      const { fileId } = req.params;
      // console.log("[FILE ACCESS] Requested fileId:", fileId);
      
      // Validate file ID format (should be UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(fileId)) {
        // console.log("[FILE ACCESS] Invalid UUID format:", fileId);
        return res.status(400).json({ message: "Invalid file ID" });
      }

      // Security: Only allow access to files in the secure uploads directory
      const uploadsDir = path.join(process.cwd(), 'attached_assets', 'secure_uploads');
      // console.log("[FILE ACCESS] Looking in directory:", uploadsDir);
      
      // Find file with matching ID (files are named with their ID)
      const files = fs.readdirSync(uploadsDir);
      // console.log("[FILE ACCESS] Available files:", files.filter(f => f.includes(fileId)));
      const targetFile = files.find(file => file.startsWith(fileId));
      // console.log("[FILE ACCESS] Target file found:", targetFile);
      
      if (!targetFile) {
        // console.log("[FILE ACCESS] File not found on disk for fileId:", fileId);
        return res.status(404).json({ message: "File not found" });
      }
      
      const filePath = path.join(uploadsDir, targetFile);
      
      // Verify file exists and is within upload directory (prevent path traversal)
      if (!fs.existsSync(filePath) || !path.resolve(filePath).startsWith(path.resolve(uploadsDir))) {
        return res.status(404).json({ message: "File not found" });
      }

      // CRITICAL SECURITY: Verify user has access to this file
      // Find posts that contain this fileId and check access permissions
      // console.log("[FILE ACCESS] Looking for posts with fileId:", fileId);
      const posts = await storage.getPostsWithFileId(fileId);
      // console.log("[FILE ACCESS] Found posts:", posts.length, "posts containing fileId");
      if (posts.length === 0) {
        // console.log("[FILE ACCESS] No posts found containing fileId:", fileId);
        return res.status(404).json({ message: "File not found" });
      }

      // Check if user has access to at least one post containing this file
      let hasAccess = false;
      for (const post of posts) {
        // School-level access check
        if (post.feedScope === 'school') {
          if (req.user?.schoolId === post.schoolId) {
            hasAccess = true;
            break;
          }
        }
        // Class-level access check  
        else if (post.feedScope === 'class') {
          if (!post.classId) continue; // Skip if no class specified
          
          // Admin from same school can access any class
          if (req.user?.role === 'admin' && req.user?.schoolId === post.schoolId) {
            hasAccess = true;
            break;
          }
          // Teachers need to be assigned to teach in this specific class
          else if (req.user?.role === 'teacher' && req.user?.schoolId === post.schoolId && req.user?.teacherId) {
            const teacherClassAccess = await storage.isTeacherAssignedToClass(req.user.teacherId, post.classId);
            if (teacherClassAccess) {
              hasAccess = true;
              break;
            }
          }
          // Students need to be enrolled in this specific class
          else if (req.user?.role === 'student' && req.user?.schoolId === post.schoolId && req.user?.studentId) {
            const studentClassAccess = await storage.isStudentInClass(req.user.studentId, post.classId);
            if (studentClassAccess) {
              hasAccess = true;
              break;
            }
          }
          // Parents need to have children enrolled in this specific class
          else if (req.user?.role === 'parent' && req.user?.schoolId === post.schoolId && req.user?.parentId) {
            const parentClassAccess = await storage.isParentLinkedToClass(req.user.parentId, post.classId);
            if (parentClassAccess) {
              hasAccess = true;
              break;
            }
          }
        }
      }

      if (!hasAccess) {
        return res.status(404).json({ message: "File not found" }); // Return 404 to avoid leaking file existence
      }
      
      // Get file stats for proper headers
      const stats = fs.statSync(filePath);
      const fileExtension = path.extname(targetFile);
      
      // Set secure headers
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg', 
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain'
      };
      
      const contentType = mimeTypes[fileExtension] || 'application/octet-stream';
      
      res.set({
        'Content-Type': contentType,
        'Content-Length': stats.size,
        'Content-Disposition': `inline; filename="${fileId}${fileExtension}"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, max-age=3600'
      });
      
      // Stream file to response
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).json({ message: "Failed to serve file" });
    }
  });

  // Teacher endpoints (school-filtered for non-super-admin users)
  app.get("/api/teachers", authMiddleware, async (req, res) => {
    try {
      const user = req.user;
      let teachers;
      
      if (user?.role === "super_admin") {
        // Super admin can see all teachers
        teachers = await storage.getTeachers();
      } else if (user?.schoolId) {
        // School admin and teachers can only see their school's teachers
        teachers = await storage.getTeachers(user.schoolId);
      } else {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(teachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ message: "Failed to fetch teachers" });
    }
  });

  app.get("/api/teachers/:id", async (req, res) => {
    try {
      const teacher = await storage.getTeacher(req.params.id);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      res.json(teacher);
    } catch (error) {
      console.error("Error fetching teacher:", error);
      res.status(500).json({ message: "Failed to fetch teacher" });
    }
  });

  app.post("/api/teachers", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can create teachers
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const requestBody = { ...req.body };
      
      // For school admins, ensure the teacher belongs to their school
      if (user.role === 'admin') {
        if (!user.schoolId) {
          return res.status(400).json({ message: "User is not associated with a school" });
        }
        requestBody.schoolId = user.schoolId;
      } else if (user.role === 'super_admin') {
        // Super admin must provide schoolId
        if (!requestBody.schoolId) {
          return res.status(400).json({ message: "School ID is required for super admin" });
        }
      }

      // Auto-generate employeeId if not provided
      const generateEmployeeId = () => {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `EMP${timestamp}${random}`;
      };

      // Clean up empty strings and convert to null for optional fields
      const cleanedRequestBody = { ...requestBody };
      
      // Convert empty strings to null for optional fields
      const optionalFields = ['email', 'contactNumber', 'schoolIdNumber', 'aadhar', 'gender', 
                             'bloodGroup', 'designation', 'dateOfBirth', 'fatherHusbandName', 
                             'address', 'category', 'religion', 'profilePictureUrl'];
      
      optionalFields.forEach(field => {
        if (cleanedRequestBody[field] === '') {
          cleanedRequestBody[field] = null;
        }
      });

      // Validate data without employeeId first
      const schemaWithoutEmployeeId = insertTeacherSchema.omit({ employeeId: true });
      const validatedDataWithoutEmployeeId = schemaWithoutEmployeeId.parse(cleanedRequestBody);
      
      // Add generated employeeId
      const validatedData = {
        ...validatedDataWithoutEmployeeId,
        employeeId: generateEmployeeId()
      };
      
      const teacher = await storage.createTeacher(validatedData);
      res.status(201).json(teacher);
    } catch (error) {
      console.error("Error creating teacher:", error);
      
      // Handle specific database errors
      if (error && typeof error === 'object' && 'code' in error && 'constraint' in error) {
        if (error.code === '23505' && error.constraint === 'teachers_email_unique') {
          return res.status(400).json({ message: "A teacher with this email already exists" });
        }
      }
      
      res.status(400).json({ message: "Invalid teacher data" });
    }
  });

  // Update teacher daily periods configuration (must be before /api/teachers/:id)
  app.put("/api/teachers/daily-periods", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can configure daily periods
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = updateTeacherDailyPeriodsSchema.parse(req.body);
      const result = await storage.updateTeacherDailyPeriods(user.schoolId, validatedData);
      
      // Create audit log
      await storage.createAuditLog({
        schoolId: user.schoolId,
        userId: user.id,
        action: 'UPDATE',
        entityType: 'TEACHER',
        entityId: validatedData.teacherId || 'ALL',
        description: `Updated daily periods limit to ${validatedData.maxDailyPeriods}`,
        newValues: { maxDailyPeriods: validatedData.maxDailyPeriods, applyToAll: validatedData.applyToAll }
      });

      res.json(result);
    } catch (error) {
      console.error("Error updating teacher daily periods:", error);
      res.status(500).json({ message: "Failed to update teacher daily periods" });
    }
  });

  app.put("/api/teachers/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const teacherId = req.params.id;
      
      // Only school admins and super admins can update teachers
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check if teacher exists and belongs to the user's school (for school admins)
      const existingTeacher = await storage.getTeacher(teacherId);
      if (!existingTeacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      if (user.role === 'admin' && user.schoolId && existingTeacher.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - teacher not in your school" });
      }

      // Clean up empty strings and convert to null for optional fields
      const cleanedRequestBody = { ...req.body };
      
      // Convert empty strings to null for optional fields
      const optionalFields = ['email', 'contactNumber', 'schoolIdNumber', 'aadhar', 'gender', 
                             'bloodGroup', 'designation', 'dateOfBirth', 'fatherHusbandName', 
                             'address', 'category', 'religion', 'profilePictureUrl'];
      
      optionalFields.forEach(field => {
        if (cleanedRequestBody[field] === '') {
          cleanedRequestBody[field] = null;
        }
      });

      const validatedData = insertTeacherSchema.partial().parse(cleanedRequestBody);
      
      // Ensure school ID cannot be changed by school admins
      if (user.role === 'admin') {
        delete validatedData.schoolId;
      }

      const teacher = await storage.updateTeacher(teacherId, validatedData);
      res.json(teacher);
    } catch (error) {
      console.error("Error updating teacher:", error);
      res.status(400).json({ message: "Failed to update teacher" });
    }
  });

  app.delete("/api/teachers/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const teacherId = req.params.id;
      
      // Only school admins and super admins can delete teachers
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check if teacher exists and belongs to the user's school (for school admins)
      const existingTeacher = await storage.getTeacher(teacherId);
      if (!existingTeacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      if (user.role === 'admin' && user.schoolId && existingTeacher.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - teacher not in your school" });
      }

      await storage.deleteTeacher(teacherId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting teacher:", error);
      res.status(500).json({ message: "Failed to delete teacher" });
    }
  });

  // Teacher profile picture upload endpoint
  app.post("/api/teachers/:id/upload-profile-picture", authMiddleware, upload.single('profilePicture'), async (req: any, res) => {
    try {
      const user = req.user;
      const teacherId = req.params.id;
      
      // Only school admins and super admins can upload teacher profile pictures
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No profile picture uploaded" });
      }

      // Check if teacher exists and belongs to the user's school (for school admins)
      const existingTeacher = await storage.getTeacher(teacherId);
      if (!existingTeacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      if (user.role === 'admin' && user.schoolId && existingTeacher.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - teacher not in your school" });
      }

      // Validate file type - only allow images
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ 
          message: `File type ${req.file.mimetype} not allowed. Only images are supported.` 
        });
      }
      
      // File size check (2MB limit for profile pictures)
      if (req.file.size > 2 * 1024 * 1024) {
        return res.status(400).json({ 
          message: "File too large. Maximum size is 2MB" 
        });
      }

      // Generate secure filename
      const fileId = crypto.randomUUID();
      const fileExtension = path.extname(req.file.originalname) || '.jpg';
      const secureFilename = `${fileId}${fileExtension}`;
      
      // Create teacher profile pictures directory
      const profilePicturesDir = path.join(process.cwd(), 'Teachers Assets', 'Profile Picture');
      if (!fs.existsSync(profilePicturesDir)) {
        fs.mkdirSync(profilePicturesDir, { recursive: true });
      }
      
      // Save file to disk with secure filename
      const filePath = path.join(profilePicturesDir, secureFilename);
      fs.writeFileSync(filePath, req.file.buffer);
      
      // Update teacher record with profile picture URL
      const profilePictureUrl = `/api/teachers/${teacherId}/profile-picture/${fileId}${fileExtension}`;
      const updatedTeacher = await storage.updateTeacher(teacherId, { 
        profilePictureUrl: profilePictureUrl 
      });
      
      res.json({ 
        message: "Profile picture uploaded successfully",
        profilePictureUrl: profilePictureUrl,
        teacher: updatedTeacher
      });
    } catch (error) {
      console.error("Error uploading teacher profile picture:", error);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  });

  // Teacher profile picture serving endpoint
  app.get("/api/teachers/:id/profile-picture/:filename", async (req, res) => {
    try {
      const { id: teacherId, filename } = req.params;
      
      // Validate filename format (should be UUID + extension)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|jpeg|png|gif|webp)$/i;
      if (!uuidRegex.test(filename)) {
        return res.status(400).json({ message: "Invalid filename format" });
      }

      // Check if teacher exists
      const teacher = await storage.getTeacher(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      // Construct file path
      const profilePicturesDir = path.join(process.cwd(), 'Teachers Assets', 'Profile Picture');
      const filePath = path.join(profilePicturesDir, filename);
      
      // Verify file exists and is within profile pictures directory
      if (!fs.existsSync(filePath) || !path.resolve(filePath).startsWith(path.resolve(profilePicturesDir))) {
        return res.status(404).json({ message: "Profile picture not found" });
      }

      // Get file stats and determine content type
      const stats = fs.statSync(filePath);
      const fileExtension = path.extname(filename).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      };
      const contentType = mimeTypes[fileExtension] || 'image/jpeg';
      
      res.set({
        'Content-Type': contentType,
        'Content-Length': stats.size,
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
        'X-Content-Type-Options': 'nosniff'
      });
      
      // Stream file to response
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Error serving teacher profile picture:", error);
      res.status(500).json({ message: "Failed to serve profile picture" });
    }
  });

  // Bulk teacher upload endpoint
  app.post("/api/teachers/bulk-upload", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can bulk upload teachers
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { teachers } = req.body;
      
      if (!Array.isArray(teachers) || teachers.length === 0) {
        return res.status(400).json({ message: "No teachers data provided" });
      }

      const results = [];
      const errors = [];
      
      for (let i = 0; i < teachers.length; i++) {
        const teacherData = teachers[i];
        
        try {
          // Use original row number from client if available, otherwise fall back to calculated
          const originalRowNumber = teacherData.originalRowNumber || (i + 2);
          
          // Validate required fields
          if (!teacherData.name || !teacherData.contactNumber) {
            errors.push({
              row: originalRowNumber,
              error: "Name and contact number are required"
            });
            continue;
          }

          // Validate mobile number (10 digits)
          if (!/^\d{10}$/.test(teacherData.contactNumber)) {
            errors.push({
              row: originalRowNumber,
              error: "Mobile number must be exactly 10 digits"
            });
            continue;
          }

          // Check if teacher with same contact number already exists
          const existingTeachers = await storage.getTeachers(user.schoolId);
          const duplicateTeacher = existingTeachers.find(teacher => teacher.contactNumber === teacherData.contactNumber);
          if (duplicateTeacher) {
            errors.push({
              row: originalRowNumber,
              error: `Teacher with mobile number ${teacherData.contactNumber} already exists`
            });
            continue;
          }

          // Check for duplicate mobile numbers within current batch
          const currentBatchMobileDuplicate = teachers.slice(0, i).find(t => t.contactNumber === teacherData.contactNumber);
          if (currentBatchMobileDuplicate) {
            errors.push({
              row: originalRowNumber,
              error: `Duplicate mobile number ${teacherData.contactNumber} found in current upload batch`
            });
            continue;
          }

          // Check if email is unique (if provided)
          if (teacherData.email && teacherData.email.trim() !== '') {
            const email = teacherData.email.trim();
            
            // Check against existing teachers in database
            const duplicateEmail = existingTeachers.find(teacher => teacher.email === email);
            if (duplicateEmail) {
              errors.push({
                row: originalRowNumber,
                error: `Teacher with email ${email} already exists`
              });
              continue;
            }
            
            // Check for duplicate emails within current batch
            const currentBatchEmailDuplicate = teachers.slice(0, i).find(t => t.email?.trim() === email);
            if (currentBatchEmailDuplicate) {
              errors.push({
                row: originalRowNumber,
                error: `Duplicate email ${email} found in current upload batch`
              });
              continue;
            }
          }

          // Check if school ID is unique (if provided)
          if (teacherData.schoolIdNumber && teacherData.schoolIdNumber.trim() !== '') {
            const schoolId = teacherData.schoolIdNumber.trim();
            const duplicateSchoolId = existingTeachers.find(teacher => teacher.schoolIdNumber === schoolId);
            if (duplicateSchoolId) {
              errors.push({
                row: originalRowNumber,
                error: `School ID ${schoolId} already exists for teacher: ${duplicateSchoolId.name}`
              });
              continue;
            }
            
            // Check for duplicates within current batch
            const currentBatchDuplicate = teachers.slice(0, i).find(t => t.schoolIdNumber?.trim() === schoolId);
            if (currentBatchDuplicate) {
              errors.push({
                row: originalRowNumber,
                error: `Duplicate School ID ${schoolId} found in current upload batch`
              });
              continue;
            }
          }

          // Prepare teacher data for creation
          const teacherToCreate = {
            ...teacherData,
            schoolId: user.schoolId,
            employeeId: `EMP${Date.now()}${i}`, // Generate unique employee ID
            classes: [], // No classes initially as requested
            subjects: [], // No subjects initially as requested
            availability: {
              monday: true,
              tuesday: true,
              wednesday: true,
              thursday: true,
              friday: true,
              saturday: false,
              sunday: false
            },
            maxLoad: 6 // Default max load
          };

          const createdTeacher = await storage.createTeacher(teacherToCreate);
          results.push({
            row: originalRowNumber,
            success: true,
            teacher: createdTeacher
          });
          
        } catch (error) {
          console.error(`Error creating teacher at row ${originalRowNumber}:`, error);
          errors.push({
            row: originalRowNumber,
            error: error instanceof Error ? error.message : "Failed to create teacher"
          });
        }
      }

      res.json({
        success: true,
        imported: results.length,
        total: teachers.length,
        errors: errors,
        results: results
      });
      
    } catch (error) {
      console.error("Error in bulk teacher upload:", error);
      res.status(500).json({ message: "Failed to process bulk upload" });
    }
  });

  // Teacher Replacement endpoints
  // Check for conflicts before replacement
  app.get("/api/teachers/:id/replacement-conflicts", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const originalTeacherId = req.params.id;
      const { replacementTeacherId } = req.query;
      
      // Only school admins and super admins can check conflicts
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!replacementTeacherId) {
        return res.status(400).json({ message: "Replacement teacher ID is required" });
      }

      // Get all timetable entries for the original teacher
      const originalTeacherEntries = await storage.getTimetableEntriesByTeacher(originalTeacherId);
      
      // Get all timetable entries for the replacement teacher
      const replacementTeacherEntries = await storage.getTimetableEntriesByTeacher(replacementTeacherId as string);
      
      // Check for conflicts
      const conflicts = [];
      for (const originalEntry of originalTeacherEntries) {
        const conflict = replacementTeacherEntries.find(replacementEntry => 
          replacementEntry.day === originalEntry.day &&
          replacementEntry.period === originalEntry.period &&
          replacementEntry.isActive
        );
        
        if (conflict) {
          // Get class details for both entries
          const originalClass = await storage.getClass(originalEntry.classId);
          const conflictingClass = await storage.getClass(conflict.classId);
          
          conflicts.push({
            day: originalEntry.day,
            period: originalEntry.period,
            existingClass: conflictingClass ? `${conflictingClass.grade}-${conflictingClass.section}` : 'Unknown',
            conflictingClass: originalClass ? `${originalClass.grade}-${originalClass.section}` : 'Unknown',
            startTime: originalEntry.startTime,
            endTime: originalEntry.endTime
          });
        }
      }

      res.json({
        hasConflicts: conflicts.length > 0,
        conflictCount: conflicts.length,
        totalEntries: originalTeacherEntries.length,
        conflicts
      });
    } catch (error) {
      console.error("Error checking replacement conflicts:", error);
      res.status(500).json({ message: "Failed to check replacement conflicts" });
    }
  });

  // Replace teacher permanently
  app.post("/api/teachers/:id/replace", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const originalTeacherId = req.params.id;
      const { replacementTeacherId, reason } = req.body;
      
      // Only school admins and super admins can replace teachers
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!replacementTeacherId || !reason) {
        return res.status(400).json({ message: "Replacement teacher ID and reason are required" });
      }

      // Check if both teachers exist and belong to the same school
      const originalTeacher = await storage.getTeacher(originalTeacherId);
      const replacementTeacher = await storage.getTeacher(replacementTeacherId);
      
      if (!originalTeacher || !replacementTeacher) {
        return res.status(404).json({ message: "One or both teachers not found" });
      }

      if (user.role === 'admin' && user.schoolId) {
        if (originalTeacher.schoolId !== user.schoolId || replacementTeacher.schoolId !== user.schoolId) {
          return res.status(403).json({ message: "Access denied - teachers not in your school" });
        }
      }

      // Get all timetable entries for the original teacher
      const originalTeacherEntries = await storage.getTimetableEntriesByTeacher(originalTeacherId);
      
      // Check for conflicts first
      const replacementTeacherEntries = await storage.getTimetableEntriesByTeacher(replacementTeacherId);
      const conflicts = [];
      
      for (const originalEntry of originalTeacherEntries) {
        const conflict = replacementTeacherEntries.find(replacementEntry => 
          replacementEntry.day === originalEntry.day &&
          replacementEntry.period === originalEntry.period &&
          replacementEntry.isActive
        );
        
        if (conflict) {
          const originalClass = await storage.getClass(originalEntry.classId);
          const conflictingClass = await storage.getClass(conflict.classId);
          
          conflicts.push({
            day: originalEntry.day,
            period: originalEntry.period,
            existingClass: conflictingClass ? `${conflictingClass.grade}-${conflictingClass.section}` : 'Unknown',
            conflictingClass: originalClass ? `${originalClass.grade}-${originalClass.section}` : 'Unknown'
          });
        }
      }

      if (conflicts.length > 0) {
        return res.status(409).json({ 
          message: "Teacher replacement conflicts detected",
          conflicts,
          hasConflicts: true
        });
      }

      // Perform the replacement on global timetable (for future weeks)
      let replacedEntries = 0;
      for (const entry of originalTeacherEntries) {
        await storage.updateTimetableEntry(entry.id, {
          teacherId: replacementTeacherId
        });
        replacedEntries++;
      }

      // Update current and future weekly timetables with the replacement
      const today = new Date();
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() - today.getDay() + 1); // Monday of this week
      
      // Find all classes the original teacher was teaching
      const affectedClasses = Array.from(new Set(originalTeacherEntries.map(entry => entry.classId)));
      
      // Update weekly timetables for the next 4 weeks (current + 3 future weeks)
      for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
        const weekStart = new Date(currentWeekStart);
        weekStart.setDate(currentWeekStart.getDate() + (weekOffset * 7));
        
        for (const classId of affectedClasses) {
          try {
            // Get or create weekly timetable for this class and week
            let weeklyTimetable = await storage.getWeeklyTimetable(classId, weekStart);
            
            if (!weeklyTimetable) {
              // Create weekly timetable from global if it doesn't exist
              const globalTimetable = await storage.getTimetableEntriesForClass(classId);
              const weeklyTimetableData = globalTimetable.map((entry: any) => ({
                day: entry.day,
                period: entry.period,
                teacherId: entry.teacherId,
                subjectId: entry.subjectId,
                startTime: entry.startTime,
                endTime: entry.endTime,
                room: entry.room,
                isModified: false
              }));
              
              weeklyTimetable = await storage.createOrUpdateWeeklyTimetable(
                classId,
                weekStart,
                weeklyTimetableData,
                user.id,
                originalTeacher.schoolId
              );
            }
            
            // Update the weekly timetable to replace the teacher
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            // Update each period where the original teacher was assigned
            const originalTeacherPeriods = originalTeacherEntries.filter(entry => entry.classId === classId);
            for (const period of originalTeacherPeriods) {
              await storage.updateWeeklyTimetableEntry(
                classId,
                weekStart.toISOString().split('T')[0],
                weekEnd.toISOString().split('T')[0],
                period.day,
                period.period,
                {
                  teacherId: replacementTeacherId,
                  subjectId: period.subjectId,
                  isModified: true,
                  modificationReason: `Teacher replacement: ${originalTeacher.name} → ${replacementTeacher.name}`
                },
                user.id
              );
            }
          } catch (weeklyError) {
            console.error(`Error updating weekly timetable for class ${classId}, week ${weekStart.toISOString().split('T')[0]}:`, weeklyError);
          }
        }
      }

      // Update original teacher status to "left_school"
      await storage.updateTeacher(originalTeacherId, {
        status: 'left_school',
        isActive: false
      });

      // Create replacement history record
      const replacementRecord = await storage.createTeacherReplacement({
        originalTeacherId,
        replacementTeacherId,
        schoolId: originalTeacher.schoolId,
        replacementDate: new Date(),
        reason,
        affectedTimetableEntries: replacedEntries,
        conflictDetails: { hasConflicts: false },
        status: 'completed',
        replacedBy: user.id,
        completedAt: new Date()
      });

      res.json({
        message: "Teacher replacement completed successfully",
        replacement: replacementRecord,
        affectedEntries: replacedEntries,
        originalTeacher: {
          id: originalTeacher.id,
          name: originalTeacher.name,
          status: 'left_school'
        },
        replacementTeacher: {
          id: replacementTeacher.id,
          name: replacementTeacher.name
        }
      });
    } catch (error) {
      console.error("Error replacing teacher:", error);
      res.status(500).json({ message: "Failed to replace teacher" });
    }
  });

  // Get teacher replacement history
  app.get("/api/teacher-replacements", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can view replacement history
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      let replacements;
      if (user.role === 'super_admin') {
        // Super admin can see all replacements
        replacements = await storage.getAllTeacherReplacements();
      } else if (user.schoolId) {
        // School admin can only see their school's replacements
        replacements = await storage.getTeacherReplacementsBySchool(user.schoolId);
      } else {
        return res.status(400).json({ message: "School ID is required" });
      }

      res.json(replacements);
    } catch (error) {
      console.error("Error fetching teacher replacements:", error);
      res.status(500).json({ message: "Failed to fetch teacher replacement history" });
    }
  });

  // Teacher Attendance routes
  app.get("/api/teacher-attendance", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const { date, teacherId, startDate, endDate } = req.query;
      
      // Only school admins and super admins can view attendance
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      let attendance;
      
      if (teacherId) {
        // Get attendance for specific teacher with optional date range
        attendance = await storage.getTeacherAttendanceByTeacher(teacherId as string, startDate as string, endDate as string);
      } else if (user.schoolId) {
        // Get attendance for the school
        attendance = await storage.getTeacherAttendance(user.schoolId, date as string);
      } else {
        return res.status(400).json({ message: "School ID is required" });
      }
      
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching teacher attendance:", error);
      res.status(500).json({ message: "Failed to fetch teacher attendance" });
    }
  });

  app.post("/api/teacher-attendance", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can mark attendance
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Use user's schoolId - NEVER trust client-supplied schoolId
      const schoolId = user.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: "User is not associated with a school" });
      }

      const requestBody = { ...req.body };
      
      // Validate attendance date is not in the future
      if (requestBody.attendanceDate) {
        if (isFutureDate(requestBody.attendanceDate)) {
          return res.status(400).json({ message: "Attendance cannot be recorded for upcoming dates" });
        }
      }
      
      // Verify teacher belongs to user's school for security
      const teacher = await storage.getTeacher(requestBody.teacherId);
      if (!teacher || teacher.schoolId !== schoolId) {
        return res.status(403).json({ message: "Teacher not found or not in your school" });
      }
      
      // Add marked by information and schoolId from user
      requestBody.markedBy = user.id;
      requestBody.schoolId = schoolId;

      const validatedData = insertTeacherAttendanceSchema.parse(requestBody);
      const attendance = await storage.markTeacherAttendance(validatedData);
      res.status(201).json(attendance);
    } catch (error) {
      console.error("Error marking teacher attendance:", error);
      res.status(500).json({ message: "Failed to mark teacher attendance" });
    }
  });

  app.post("/api/teacher-attendance/bulk", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can mark bulk attendance
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = bulkAttendanceSchema.parse(req.body);
      
      // Verify teacher belongs to the user's school (for school admins)
      if (user.role === 'admin') {
        const teacher = await storage.getTeacher(validatedData.teacherId);
        if (!teacher || teacher.schoolId !== user.schoolId) {
          return res.status(403).json({ message: "Teacher not found or not in your school" });
        }
      }

      const attendanceRecords = await storage.markBulkTeacherAttendance(validatedData, user.id);
      res.status(201).json(attendanceRecords);
    } catch (error) {
      console.error("Error marking bulk teacher attendance:", error);
      res.status(500).json({ message: "Failed to mark bulk teacher attendance" });
    }
  });

  app.put("/api/teacher-attendance/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const attendanceId = req.params.id;
      
      // Only school admins and super admins can update attendance
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const requestBody = { ...req.body };
      requestBody.markedBy = user.id; // Update who modified it
      
      const validatedData = insertTeacherAttendanceSchema.partial().parse(requestBody);
      const attendance = await storage.updateTeacherAttendance(attendanceId, validatedData);
      res.json(attendance);
    } catch (error) {
      console.error("Error updating teacher attendance:", error);
      res.status(500).json({ message: "Failed to update teacher attendance" });
    }
  });

  app.delete("/api/teacher-attendance/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const attendanceId = req.params.id;
      
      // Only school admins and super admins can delete attendance
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteTeacherAttendance(attendanceId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting teacher attendance:", error);
      res.status(500).json({ message: "Failed to delete teacher attendance" });
    }
  });

  // Check if teacher is absent on a specific date
  app.get("/api/teacher-attendance/check/:teacherId/:date", authMiddleware, async (req: any, res) => {
    try {
      const { teacherId, date } = req.params;
      const isAbsent = await storage.isTeacherAbsent(teacherId, date);
      res.json({ isAbsent });
    } catch (error) {
      console.error("Error checking teacher absence:", error);
      res.status(500).json({ message: "Failed to check teacher absence" });
    }
  });

  // Student Attendance routes
  app.get("/api/student-attendance", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const { date, studentId, classId, startDate, endDate } = req.query;
      
      // Validate query parameters
      const querySchema = z.object({
        date: z.string().optional(),
        studentId: z.string().uuid().optional(),
        classId: z.string().uuid().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      });
      
      let validatedQuery;
      try {
        validatedQuery = querySchema.parse({ date, studentId, classId, startDate, endDate });
      } catch (error) {
        return res.status(400).json({ message: "Invalid query parameters" });
      }

      let attendance;
      
      if (user.role === 'student') {
        // Students can only view their own attendance
        const userStudent = await storage.getStudentByUserId(user.id);
        if (!userStudent) {
          return res.status(403).json({ message: "Student profile not found" });
        }
        
        // Force studentId to be the student's own ID
        if (validatedQuery.studentId && validatedQuery.studentId !== userStudent.id) {
          return res.status(403).json({ message: "Access denied: Can only view your own attendance" });
        }
        
        // Only allow fetching own attendance, no class or school-wide queries
        attendance = await storage.getStudentAttendanceByStudent(userStudent.id, validatedQuery.startDate, validatedQuery.endDate);
        
      } else if (user.role === 'teacher') {
        // Teachers can only view attendance for classes they are assigned to
        if (validatedQuery.studentId) {
          // Check if teacher has access to this student (student must be in a class the teacher teaches)
          const student = await storage.getStudent(validatedQuery.studentId);
          if (!student || student.schoolId !== user.schoolId) {
            return res.status(403).json({ message: "Access denied: Student not in your school" });
          }
          
          // Verify teacher is assigned to the student's class
          const teacherAssignment = await storage.getClassTeacherAssignment(student.classId, user.id);
          if (!teacherAssignment) {
            return res.status(403).json({ message: "Access denied: You are not assigned to this student's class" });
          }
          
          attendance = await storage.getStudentAttendanceByStudent(validatedQuery.studentId, validatedQuery.startDate, validatedQuery.endDate);
          
        } else if (validatedQuery.classId && validatedQuery.date) {
          // Verify teacher is assigned to this class
          const classInfo = await storage.getClass(validatedQuery.classId);
          if (!classInfo || classInfo.schoolId !== user.schoolId) {
            return res.status(403).json({ message: "Access denied: Class not in your school" });
          }
          
          const teacherAssignment = await storage.getClassTeacherAssignment(validatedQuery.classId, user.id);
          if (!teacherAssignment) {
            return res.status(403).json({ message: "Access denied: You are not assigned to this class" });
          }
          
          attendance = await storage.getStudentAttendanceByClass(validatedQuery.classId, validatedQuery.date);
          
        } else {
          return res.status(400).json({ message: "Teachers must specify either studentId or classId with date" });
        }
        
      } else if (user.role === 'admin' || user.role === 'super_admin') {
        // Admins can view any attendance in their school
        if (validatedQuery.studentId) {
          // Validate student belongs to user's school (for admin)
          if (user.role === 'admin') {
            const student = await storage.getStudent(validatedQuery.studentId);
            if (!student || student.schoolId !== user.schoolId) {
              return res.status(403).json({ message: "Access denied: Student not in your school" });
            }
          }
          attendance = await storage.getStudentAttendanceByStudent(validatedQuery.studentId, validatedQuery.startDate, validatedQuery.endDate);
          
        } else if (validatedQuery.classId && validatedQuery.date) {
          // Validate class belongs to user's school (for admin)
          if (user.role === 'admin') {
            const classInfo = await storage.getClass(validatedQuery.classId);
            if (!classInfo || classInfo.schoolId !== user.schoolId) {
              return res.status(403).json({ message: "Access denied: Class not in your school" });
            }
          }
          attendance = await storage.getStudentAttendanceByClass(validatedQuery.classId, validatedQuery.date);
          
        } else if (user.schoolId) {
          // Only admins can do school-wide queries
          attendance = await storage.getStudentAttendance(user.schoolId, validatedQuery.date);
          
        } else {
          return res.status(400).json({ message: "Missing required parameters" });
        }
        
      } else if (user.role === 'parent') {
        return res.status(403).json({ message: "Access denied: Parent access not implemented yet" });
        
      } else {
        return res.status(403).json({ message: "Access denied: Insufficient permissions" });
      }
      
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      res.status(500).json({ message: "Failed to fetch student attendance" });
    }
  });

  app.post("/api/student-attendance", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins, super admins, and teachers can mark student attendance
      if (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'teacher') {
        return res.status(403).json({ message: "Access denied: Insufficient permissions" });
      }

      // Prepare request body with schoolId before validation
      const requestBody = { ...req.body };
      
      // Validate attendance date is not in the future
      if (requestBody.attendanceDate) {
        if (isFutureDate(requestBody.attendanceDate)) {
          return res.status(400).json({ message: "Attendance cannot be recorded for upcoming dates" });
        }
      }
      
      // For admins/teachers, set schoolId from user. For super_admin, handle separately
      if (user.role === 'admin' || user.role === 'teacher') {
        if (!user.schoolId) {
          return res.status(400).json({ message: "User is not associated with a school" });
        }
        requestBody.schoolId = user.schoolId;
      } else if (user.role === 'super_admin') {
        // For super admin, we need to derive schoolId from student
        // We'll do a quick lookup before validation
        if (!requestBody.studentId) {
          return res.status(400).json({ message: "Student ID is required" });
        }
        const student = await storage.getStudent(requestBody.studentId);
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }
        requestBody.schoolId = student.schoolId;
      }
      
      // Set markedBy before validation
      requestBody.markedBy = user.id;
      
      // Now validate the complete request body
      const validatedData = insertStudentAttendanceSchema.parse(requestBody);
      
      // Additional security validation for admin/teacher
      if (user.role === 'admin' || user.role === 'teacher') {
        const student = await storage.getStudent(validatedData.studentId);
        if (!student || student.schoolId !== user.schoolId) {
          return res.status(403).json({ message: "Access denied: Student not in your school" });
        }
        
        // Validate class belongs to user's school
        if (validatedData.classId) {
          const classInfo = await storage.getClass(validatedData.classId);
          if (!classInfo || classInfo.schoolId !== user.schoolId) {
            return res.status(403).json({ message: "Access denied: Class not in your school" });
          }
        }
      } else if (user.role === 'super_admin') {
        // Additional validation for super admin
        if (validatedData.classId) {
          const classInfo = await storage.getClass(validatedData.classId);
          if (!classInfo) {
            return res.status(404).json({ message: "Class not found" });
          }
          
          // Ensure student and class belong to the same school
          if (validatedData.schoolId !== classInfo.schoolId) {
            return res.status(400).json({ message: "Student and class must belong to the same school" });
          }
        }
      }
      
      const attendance = await storage.markStudentAttendance(validatedData);
      res.status(201).json(attendance);
    } catch (error) {
      console.error("Error marking student attendance:", error);
      res.status(500).json({ message: "Failed to mark student attendance" });
    }
  });

  app.put("/api/student-attendance/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const attendanceId = req.params.id;
      
      // Only school admins, super admins, and teachers can update student attendance
      if (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'teacher') {
        return res.status(403).json({ message: "Access denied: Insufficient permissions" });
      }
      
      // Validate request body
      const validatedData = insertStudentAttendanceSchema.partial().parse(req.body);
      
      // Get existing attendance record to verify ownership
      const existingRecord = await storage.getStudentAttendanceById(attendanceId);
      if (!existingRecord) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      
      // Validate user has access to this student's attendance
      if (user.role === 'admin' || user.role === 'teacher') {
        if (existingRecord.schoolId !== user.schoolId) {
          return res.status(403).json({ message: "Access denied: Record not in your school" });
        }
      }
      
      // Set updatedBy to current user
      validatedData.markedBy = user.id;
      
      const attendance = await storage.updateStudentAttendance(attendanceId, validatedData);
      res.json(attendance);
    } catch (error) {
      console.error("Error updating student attendance:", error);
      res.status(500).json({ message: "Failed to update student attendance" });
    }
  });

  app.delete("/api/student-attendance/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const attendanceId = req.params.id;
      
      // Only school admins and super admins can delete student attendance
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied: Insufficient permissions" });
      }
      
      // Get existing attendance record to verify ownership
      const existingRecord = await storage.getStudentAttendanceById(attendanceId);
      if (!existingRecord) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      
      // Validate user has access to this student's attendance
      if (user.role === 'admin') {
        if (existingRecord.schoolId !== user.schoolId) {
          return res.status(403).json({ message: "Access denied: Record not in your school" });
        }
      }
      
      await storage.deleteStudentAttendance(attendanceId);
      res.json({ message: "Student attendance deleted successfully" });
    } catch (error) {
      console.error("Error deleting student attendance:", error);
      res.status(500).json({ message: "Failed to delete student attendance" });
    }
  });

  // Check if student is absent on a specific date
  app.get("/api/student-attendance/check/:studentId/:date", authMiddleware, async (req: any, res) => {
    try {
      const { studentId, date } = req.params;
      const user = req.user;
      
      // Permission check: admin/teacher can check any student, student can check themselves
      if (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'teacher') {
        if (user.role === 'student' && user.id !== studentId) {
          return res.status(403).json({ message: "Access denied: Can only check your own attendance" });
        } else if (user.role === 'parent') {
          return res.status(403).json({ message: "Access denied: Parent access not implemented yet" });
        }
      }
      
      const isAbsent = await storage.isStudentAbsent(studentId, date);
      res.json({ isAbsent });
    } catch (error) {
      console.error("Error checking student absence:", error);
      res.status(500).json({ message: "Failed to check student absence" });
    }
  });

  // Bulk mark all teachers present for a specific date
  app.post("/api/teacher-attendance/mark-all-present", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can mark bulk attendance
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { date } = req.body;
      if (!date) {
        return res.status(400).json({ message: "Date is required" });
      }

      // Validate attendance date is not in the future
      if (isFutureDate(date)) {
        return res.status(400).json({ message: "Attendance cannot be marked for future dates" });
      }

      // Use user's schoolId - NEVER trust client-supplied schoolId
      const schoolId = user.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: "User is not associated with a school" });
      }

      // Get all teachers for the user's school only
      const teachers = await storage.getTeachers(schoolId);
      
      // Mark teachers as present ONLY if they don't have attendance for this date
      let createdCount = 0;
      let skippedExistingCount = 0;
      const attendanceRecords = [];
      
      for (const teacher of teachers) {
        try {
          // Check if attendance already exists for this teacher and date
          const existingAttendance = await storage.getTeacherAttendanceByTeacher(teacher.id, date, date);
          
          if (existingAttendance && existingAttendance.length > 0) {
            // Skip - don't overwrite existing attendance records
            skippedExistingCount++;
            continue;
          }
          
          const attendanceData = {
            teacherId: teacher.id,
            schoolId: schoolId,
            attendanceDate: date,
            status: "present" as const,
            markedBy: user.id,
          };
          
          const attendance = await storage.markTeacherAttendance(attendanceData);
          attendanceRecords.push(attendance);
          createdCount++;
        } catch (error) {
          console.log(`Error marking teacher ${teacher.id} present:`, error);
          skippedExistingCount++;
        }
      }

      res.status(201).json({ 
        message: `Successfully marked ${createdCount} teachers as present`,
        createdCount,
        skippedExistingCount,
        totalTeachers: teachers.length,
        records: attendanceRecords 
      });
    } catch (error) {
      console.error("Error marking all teachers present:", error);
      res.status(500).json({ message: "Failed to mark all teachers present" });
    }
  });

  // Bulk mark all students in a class present for a specific date
  app.post("/api/student-attendance/mark-all-present", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can mark bulk attendance
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { date, classId } = req.body;
      if (!date || !classId) {
        return res.status(400).json({ message: "Date and classId are required" });
      }

      // Validate attendance date is not in the future
      if (isFutureDate(date)) {
        return res.status(400).json({ message: "Attendance cannot be marked for future dates" });
      }

      // Use user's schoolId - NEVER trust client-supplied schoolId
      const schoolId = user.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: "User is not associated with a school" });
      }

      // Verify the class belongs to the user's school for security
      const classInfo = await storage.getClass(classId);
      if (!classInfo || classInfo.schoolId !== schoolId) {
        return res.status(403).json({ message: "Class not found or not in your school" });
      }

      // Get all students for the class (already filtered by classId which is validated above)
      const students = await storage.getStudents(schoolId, classId);
      
      // Mark students as present ONLY if they don't have attendance for this date
      let createdCount = 0;
      let skippedExistingCount = 0;
      const attendanceRecords = [];
      
      for (const student of students) {
        try {
          // Check if attendance already exists for this student and date
          const existingAttendance = await storage.getStudentAttendanceByStudent(student.id, date, date);
          
          if (existingAttendance && existingAttendance.length > 0) {
            // Skip - don't overwrite existing attendance records
            skippedExistingCount++;
            continue;
          }
          
          const attendanceData = {
            studentId: student.id,
            classId: classId,
            schoolId: schoolId,
            attendanceDate: date,
            status: "present" as const,
            markedBy: user.id,
          };
          
          const attendance = await storage.markStudentAttendance(attendanceData);
          attendanceRecords.push(attendance);
          createdCount++;
        } catch (error) {
          console.log(`Error marking student ${student.id} present:`, error);
          skippedExistingCount++;
        }
      }

      res.status(201).json({ 
        message: `Successfully marked ${createdCount} students as present`,
        createdCount,
        skippedExistingCount,
        totalStudents: students.length,
        records: attendanceRecords 
      });
    } catch (error) {
      console.error("Error marking all students present:", error);
      res.status(500).json({ message: "Failed to mark all students present" });
    }
  });

  // Attendance Overview API endpoint
  app.get("/api/attendance/overview", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const { date } = req.query;
      
      // Only school admins and super admins can access attendance overview
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Use user's schoolId - NEVER trust client-supplied schoolId
      const schoolId = user.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: "User is not associated with a school" });
      }

      const selectedDate = date || format(new Date(), "yyyy-MM-dd");

      // Get all teachers and students for the school
      const teachers = await storage.getTeachers(schoolId);
      const classes = await storage.getClasses(schoolId);
      const allStudents = await storage.getStudents(schoolId);

      // Get attendance records for the selected date
      const teacherAttendance = await storage.getTeacherAttendance(schoolId, selectedDate);
      const studentAttendance = await storage.getStudentAttendance(schoolId, selectedDate);

      // Calculate teacher stats
      const totalTeachers = teachers.length;
      const presentTeachers = teacherAttendance.filter(att => att.status === 'present').length;
      const absentTeachers = teacherAttendance.filter(att => att.status === 'absent').length;
      const teacherAttendanceRate = totalTeachers > 0 ? Math.round((presentTeachers / totalTeachers) * 100) : 0;

      // Calculate student stats
      const totalStudents = allStudents.length;
      const presentStudents = studentAttendance.filter(att => att.status === 'present').length;
      const absentStudents = studentAttendance.filter(att => att.status === 'absent').length;
      const studentAttendanceRate = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;

      // Calculate class-wise attendance
      const classWiseAttendance = [];
      for (const classInfo of classes) {
        const classStudents = allStudents.filter(student => student.classId === classInfo.id);
        const classPresentStudents = studentAttendance.filter(att => 
          att.status === 'present' && classStudents.some(student => student.id === att.studentId)
        ).length;
        const classTotal = classStudents.length;
        const classAttendanceRate = classTotal > 0 ? Math.round((classPresentStudents / classTotal) * 100) : 0;
        
        classWiseAttendance.push({
          classId: classInfo.id,
          className: `Class ${classInfo.grade}${classInfo.section ? '-' + classInfo.section : ''}`,
          grade: classInfo.grade,
          section: classInfo.section,
          totalStudents: classTotal,
          presentStudents: classPresentStudents,
          attendanceRate: classAttendanceRate
        });
      }

      // Get teachers absent for 3+ consecutive days
      const threeWeeksAgo = new Date();
      threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
      // For simplicity, we'll get all attendance for the school and filter by date range
      const allTeacherAttendance = await storage.getTeacherAttendance(schoolId);
      const recentTeacherAttendance = allTeacherAttendance.filter(att => {
        const attendanceDate = new Date(att.attendanceDate);
        return attendanceDate >= threeWeeksAgo && attendanceDate <= new Date(selectedDate);
      });

      // Group by teacher and find consecutive absences
      const teacherAbsenceMap = new Map();
      teachers.forEach(teacher => {
        const teacherAttendanceRecords = recentTeacherAttendance
          .filter(att => att.teacherId === teacher.id)
          .sort((a, b) => new Date(a.attendanceDate).getTime() - new Date(b.attendanceDate).getTime());
        
        let consecutiveAbsences = 0;
        let maxConsecutiveAbsences = 0;
        let currentStreak = 0;
        
        // Check for consecutive absences ending on or before today
        for (let i = teacherAttendanceRecords.length - 1; i >= 0; i--) {
          const record = teacherAttendanceRecords[i];
          if (record.status === 'absent') {
            currentStreak++;
            maxConsecutiveAbsences = Math.max(maxConsecutiveAbsences, currentStreak);
          } else {
            break; // End of current streak
          }
        }
        
        if (maxConsecutiveAbsences >= 3) {
          teacherAbsenceMap.set(teacher.id, {
            teacher: teacher,
            consecutiveDays: maxConsecutiveAbsences
          });
        }
      });

      // Get students with low attendance (below 75%)
      const lowAttendanceStudents = [];
      for (const student of allStudents) {
        const studentAttendanceRecords = await storage.getStudentAttendanceByStudent(
          student.id,
          format(threeWeeksAgo, "yyyy-MM-dd"),
          selectedDate
        );
        
        const totalDays = studentAttendanceRecords.length;
        const presentDays = studentAttendanceRecords.filter(att => att.status === 'present').length;
        const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
        
        if (attendanceRate < 75 && totalDays > 0) {
          lowAttendanceStudents.push({
            student: student,
            attendanceRate: Math.round(attendanceRate),
            totalDays: totalDays,
            presentDays: presentDays
          });
        }
      }

      const overviewData = {
        date: selectedDate,
        summary: {
          teachers: {
            total: totalTeachers,
            present: presentTeachers,
            absent: absentTeachers,
            attendanceRate: teacherAttendanceRate
          },
          students: {
            total: totalStudents,
            present: presentStudents,
            absent: absentStudents,
            attendanceRate: studentAttendanceRate
          }
        },
        classWiseAttendance: classWiseAttendance.sort((a, b) => a.className.localeCompare(b.className)),
        alerts: {
          teachersAbsentConsecutive: Array.from(teacherAbsenceMap.values()),
          studentsLowAttendance: lowAttendanceStudents.slice(0, 10) // Limit to top 10
        }
      };

      res.json(overviewData);
    } catch (error) {
      console.error("Error fetching attendance overview:", error);
      res.status(500).json({ message: "Failed to fetch attendance overview" });
    }
  });

  // Student endpoints
  app.get("/api/students", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const schoolId = req.query.schoolId as string;
      const classId = req.query.classId as string;
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || undefined;
      
      // Only school admins and super admins can access students
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      let targetSchoolId: string | undefined;

      // For school admins, only show students from their school
      if (user.role === 'admin') {
        if (!user.schoolId) {
          return res.status(400).json({ message: "User is not associated with a school" });
        }
        targetSchoolId = user.schoolId;
      } else if (user.role === 'super_admin') {
        // Super admin can specify schoolId or see all
        targetSchoolId = schoolId;
      }

      const students = await storage.getStudents(targetSchoolId, classId, offset, limit);
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  // Student bulk import template endpoint (must come before generic :id route)
  app.get("/api/students/template", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can download template
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get classes for the school to include in template
      const classes = await storage.getClasses(user.role === 'super_admin' ? undefined : user.schoolId);
      
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      
      // Create sample data with headers
      const sampleData = [
        // Headers
        ["First Name*", "Last Name*", "Admission Number*", "Class*", "Roll Number", "Email", "Contact Number", "Date of Birth (YYYY-MM-DD)", "Gender", "Blood Group", "Address", "Emergency Contact"],
        // Sample row
        ["John", "Doe", "ADM001", "1 A", "1", "john.doe@example.com", "9876543210", "2010-05-15", "male", "A+", "123 Main Street, City", "9876543210"]
      ];

      // Add class options as comments or in a separate sheet
      if (classes.length > 0) {
        sampleData.push([]);
        sampleData.push(["Available Classes:"]);
        classes.forEach(cls => {
          sampleData.push([`${cls.grade} ${cls.section}`]);
        });
      }

      const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
      
      // Set column widths for better readability
      const columnWidths = [
        { wch: 15 }, // First Name
        { wch: 15 }, // Last Name
        { wch: 15 }, // Admission Number
        { wch: 10 }, // Class
        { wch: 10 }, // Roll Number
        { wch: 25 }, // Email
        { wch: 15 }, // Contact Number
        { wch: 15 }, // Date of Birth
        { wch: 10 }, // Gender
        { wch: 10 }, // Blood Group
        { wch: 30 }, // Address
        { wch: 15 }  // Emergency Contact
      ];
      worksheet['!cols'] = columnWidths;
      
      XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
      
      // Generate buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="student_import_template.xlsx"');
      
      res.send(buffer);
    } catch (error) {
      console.error("Error generating template:", error);
      res.status(500).json({ message: "Failed to generate template" });
    }
  });

  // Bulk upload students endpoint (must come before generic :id route)
  app.post("/api/students/bulk-upload", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can bulk upload students
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { students } = req.body;
      
      if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ message: "No students data provided" });
      }

      // Get classes for validation once for all students
      const classes = await storage.getClasses(user.schoolId);
      const classMap = new Map();
      classes.forEach(cls => {
        classMap.set(`${cls.grade} ${cls.section}`.toLowerCase(), cls.id);
        classMap.set(`${cls.grade}${cls.section}`.toLowerCase(), cls.id);
      });

      // Get existing students for duplicate checking
      const existingStudents = await storage.getStudents(user.schoolId);

      const results = [];
      const errors = [];
      
      for (let i = 0; i < students.length; i++) {
        const studentData = students[i];
        
        try {
          // Use original row number from client if available, otherwise fall back to calculated
          const originalRowNumber = studentData.originalRowNumber || (i + 2);
          
          // Validate required fields
          if (!studentData.firstName || !studentData.lastName || !studentData.admissionNumber || !studentData.classId) {
            errors.push({
              row: originalRowNumber,
              error: "First Name, Last Name, Admission Number, and Class are required"
            });
            continue;
          }

          // Check if student with same admission number already exists
          const duplicateStudent = existingStudents.find(student => student.admissionNumber === studentData.admissionNumber);
          if (duplicateStudent) {
            errors.push({
              row: originalRowNumber,
              error: `Student with admission number ${studentData.admissionNumber} already exists`
            });
            continue;
          }

          // Check for duplicate admission numbers within current batch
          const currentBatchAdmissionDuplicate = students.slice(0, i).find(s => s.admissionNumber === studentData.admissionNumber);
          if (currentBatchAdmissionDuplicate) {
            errors.push({
              row: originalRowNumber,
              error: `Duplicate admission number ${studentData.admissionNumber} found in current upload batch`
            });
            continue;
          }

          // Check for duplicate contact numbers (if provided)
          if (studentData.contactNumber && studentData.contactNumber.trim() !== '') {
            const duplicateContact = existingStudents.find(student => student.contactNumber === studentData.contactNumber);
            if (duplicateContact) {
              errors.push({
                row: originalRowNumber,
                error: `Student with contact number ${studentData.contactNumber} already exists`
              });
              continue;
            }
            
            // Check for duplicates within current batch
            const currentBatchContactDuplicate = students.slice(0, i).find(s => s.contactNumber === studentData.contactNumber);
            if (currentBatchContactDuplicate) {
              errors.push({
                row: originalRowNumber,
                error: `Duplicate contact number ${studentData.contactNumber} found in current upload batch`
              });
              continue;
            }
          }

          // Check for duplicate emails (if provided)
          if (studentData.email && studentData.email.trim() !== '') {
            const duplicateEmail = existingStudents.find(student => student.email === studentData.email);
            if (duplicateEmail) {
              errors.push({
                row: originalRowNumber,
                error: `Student with email ${studentData.email} already exists`
              });
              continue;
            }
            
            // Check for duplicates within current batch
            const currentBatchEmailDuplicate = students.slice(0, i).find(s => s.email === studentData.email);
            if (currentBatchEmailDuplicate) {
              errors.push({
                row: originalRowNumber,
                error: `Duplicate email ${studentData.email} found in current upload batch`
              });
              continue;
            }
          }

          // Validate and find class
          const className = studentData.classId?.toString().trim().toLowerCase();
          if (!className) {
            errors.push({
              row: originalRowNumber,
              error: "Class is required"
            });
            continue;
          } else {
            const classId = classMap.get(className);
            if (!classId) {
              errors.push({
                row: originalRowNumber,
                error: `Class "${studentData.classId}" not found. Available classes: ${Array.from(classMap.keys()).join(', ')}`
              });
              continue;
            } else {
              // Convert class name to actual class ID
              studentData.classId = classId;
            }
          }

          // Prepare student data for creation
          const studentToCreate = {
            ...studentData,
            schoolId: user.schoolId,
            status: 'active' as const
          };

          // Create student
          const newStudent = await storage.createStudent(studentToCreate);
          results.push(newStudent);

        } catch (error: any) {
          console.error(`Error processing student ${i + 1}:`, error);
          errors.push({
            row: originalRowNumber,
            error: error?.message || "Unknown error"
          });
        }
      }

      res.json({
        success: true,
        imported: results.length,
        total: students.length,
        errors: errors,
        students: results
      });

    } catch (error) {
      console.error("Error during bulk import:", error);
      res.status(500).json({ message: "Failed to process bulk import" });
    }
  });

  app.get("/api/students/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const requestedStudentId = req.params.id;
      
      // Allow admins, super admins, or students accessing their own data
      const isAuthorized = user.role === 'admin' || 
                          user.role === 'super_admin' || 
                          (user.role === 'student' && user.studentId === requestedStudentId);
      
      if (!isAuthorized) {
        return res.status(403).json({ message: "Access denied" });
      }

      const student = await storage.getStudent(requestedStudentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // School admins can only access students from their school
      if (user.role === 'admin' && student.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied. You can only access students from your school." });
      }

      // Students can only access their own data (double-check for security)
      if (user.role === 'student' && user.studentId !== requestedStudentId) {
        return res.status(403).json({ message: "Access denied. You can only access your own profile." });
      }

      res.json(student);
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.patch("/api/students/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can update students
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied. Only administrators can update student information." });
      }

      const studentId = req.params.id;
      const existingStudent = await storage.getStudent(studentId);
      if (!existingStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      // CRITICAL: Enforce tenant isolation - School admins can only update students from their school
      if (user.role === 'admin') {
        if (!user.schoolId) {
          return res.status(400).json({ message: "User is not associated with a school" });
        }
        if (existingStudent.schoolId !== user.schoolId) {
          return res.status(403).json({ message: "Access denied. You can only update students from your school." });
        }
      }

      // For super admins, verify the school exists and they have access
      if (user.role === 'super_admin' && existingStudent.schoolId) {
        const school = await storage.getSchool(existingStudent.schoolId);
        if (!school) {
          return res.status(400).json({ message: "Invalid school association" });
        }
      }

      // Use partial schema for PATCH updates and strip unknown fields
      const updateSchema = insertStudentSchema.omit({ schoolId: true }).partial();
      const validation = updateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid student data",
          errors: validation.error.errors 
        });
      }

      const updateData = validation.data;

      // Validate classId belongs to the same school if being changed
      if (updateData.classId && updateData.classId !== existingStudent.classId) {
        const classData = await storage.getClass(updateData.classId);
        if (!classData) {
          return res.status(400).json({ message: "Invalid class ID" });
        }
        if (classData.schoolId !== existingStudent.schoolId) {
          return res.status(400).json({ message: "Class must belong to the same school as the student" });
        }
      }

      // Check if admission number is changing (affects login credentials)
      const isAdmissionNumberChanging = updateData.admissionNumber && 
        updateData.admissionNumber !== existingStudent.admissionNumber;

      if (isAdmissionNumberChanging) {
        // Check if new admission number already exists
        const duplicateCheck = await storage.getStudentByAdmissionNumber(updateData.admissionNumber);
        if (duplicateCheck && duplicateCheck.id !== studentId) {
          return res.status(400).json({ message: "Admission number already exists" });
        }
      }

      // Preserve original schoolId and only apply validated updates
      const finalUpdateData = {
        ...updateData,
        schoolId: existingStudent.schoolId
      };

      // Update student information
      const updatedStudent = await storage.updateStudent(studentId, finalUpdateData);

      // If admission number changed, update related login credentials
      if (isAdmissionNumberChanging) {
        // This would need to be implemented in storage layer to update users table
        // For now, log the change for manual review
        console.log(`ADMIN ACTION: Student ${studentId} admission number changed from ${existingStudent.admissionNumber} to ${updateData.admissionNumber} by user ${user.id}`);
      }

      res.json(updatedStudent);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  app.post("/api/students", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can create students
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const requestBody = { ...req.body };
      
      // For school admins, ensure the student belongs to their school
      if (user.role === 'admin') {
        if (!user.schoolId) {
          return res.status(400).json({ message: "User is not associated with a school" });
        }
        requestBody.schoolId = user.schoolId;
      } else if (user.role === 'super_admin') {
        // Super admin must provide schoolId
        if (!requestBody.schoolId) {
          return res.status(400).json({ message: "School ID is required" });
        }
      }

      // Validate classId belongs to the same school if provided
      if (requestBody.classId) {
        const classData = await storage.getClass(requestBody.classId);
        if (!classData) {
          return res.status(400).json({ message: "Invalid class ID" });
        }
        if (classData.schoolId !== requestBody.schoolId) {
          return res.status(400).json({ message: "Class must belong to the same school as the student" });
        }
      }

      const validatedData = insertStudentSchema.parse(requestBody);
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data", errors: error.issues });
      }
      console.error("Error creating student:", error);
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  app.put("/api/students/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can update students
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const existingStudent = await storage.getStudent(req.params.id);
      if (!existingStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      // School admins can only update students from their school
      if (user.role === 'admin' && existingStudent.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const requestBody = { ...req.body };
      delete requestBody.id; // Prevent ID modification
      delete requestBody.schoolId; // Prevent school change

      // Validate classId belongs to the same school if provided
      if (requestBody.classId) {
        const classData = await storage.getClass(requestBody.classId);
        if (!classData) {
          return res.status(400).json({ message: "Invalid class ID" });
        }
        if (classData.schoolId !== existingStudent.schoolId) {
          return res.status(400).json({ message: "Class must belong to the same school as the student" });
        }
      }

      const student = await storage.updateStudent(req.params.id, requestBody);
      res.json(student);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data", errors: error.issues });
      }
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  app.delete("/api/students/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can delete students
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const existingStudent = await storage.getStudent(req.params.id);
      if (!existingStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      // School admins can only delete students from their school
      if (user.role === 'admin' && existingStudent.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteStudent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Student profile picture upload endpoint
  app.post("/api/students/:id/upload-profile-picture", authMiddleware, upload.single('profilePicture'), async (req: any, res) => {
    try {
      const user = req.user;
      const studentId = req.params.id;
      
      // Only school admins and super admins can upload student profile pictures
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No profile picture uploaded" });
      }

      // Check if student exists and belongs to the user's school (for school admins)
      const existingStudent = await storage.getStudent(studentId);
      if (!existingStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      if (user.role === 'admin' && user.schoolId && existingStudent.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - student not in your school" });
      }

      // Validate file type - only allow images
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ 
          message: `File type ${req.file.mimetype} not allowed. Only images are supported.` 
        });
      }
      
      // File size check (2MB limit for profile pictures)
      if (req.file.size > 2 * 1024 * 1024) {
        return res.status(400).json({ 
          message: "File too large. Maximum size is 2MB" 
        });
      }

      // Generate secure filename
      const fileId = crypto.randomUUID();
      const fileExtension = path.extname(req.file.originalname) || '.jpg';
      const secureFilename = `${fileId}${fileExtension}`;
      
      // Create student profile pictures directory
      const profilePicturesDir = path.join(process.cwd(), 'Student Assets', 'Profile Picture');
      if (!fs.existsSync(profilePicturesDir)) {
        fs.mkdirSync(profilePicturesDir, { recursive: true });
      }
      
      // Save file to disk with secure filename
      const filePath = path.join(profilePicturesDir, secureFilename);
      fs.writeFileSync(filePath, req.file.buffer);
      
      // Update student record with profile picture URL
      const profilePictureUrl = `/api/students/${studentId}/profile-picture/${fileId}${fileExtension}`;
      const updatedStudent = await storage.updateStudent(studentId, { 
        profilePictureUrl: profilePictureUrl 
      });
      
      res.json({ 
        message: "Profile picture uploaded successfully",
        profilePictureUrl: profilePictureUrl,
        student: updatedStudent
      });
    } catch (error) {
      console.error("Error uploading student profile picture:", error);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  });

  // Student profile picture serving endpoint
  app.get("/api/students/:id/profile-picture/:filename", async (req, res) => {
    try {
      const { id: studentId, filename } = req.params;
      
      // Validate filename format (should be UUID + extension)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|jpeg|png|gif|webp)$/i;
      if (!uuidRegex.test(filename)) {
        return res.status(400).json({ message: "Invalid filename format" });
      }

      // Check if student exists
      const student = await storage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Construct file path
      const profilePicturesDir = path.join(process.cwd(), 'Student Assets', 'Profile Picture');
      const filePath = path.join(profilePicturesDir, filename);
      
      // Verify file exists and is within profile pictures directory
      if (!fs.existsSync(filePath) || !path.resolve(filePath).startsWith(path.resolve(profilePicturesDir))) {
        return res.status(404).json({ message: "Profile picture not found" });
      }

      // Get file stats and determine content type
      const stats = fs.statSync(filePath);
      const fileExtension = path.extname(filename).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      };
      const contentType = mimeTypes[fileExtension] || 'image/jpeg';
      
      res.set({
        'Content-Type': contentType,
        'Content-Length': stats.size,
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
        'X-Content-Type-Options': 'nosniff'
      });
      
      // Stream file to response
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Error serving student profile picture:", error);
      res.status(500).json({ message: "Failed to serve profile picture" });
    }
  });

  // Parent endpoints
  app.get("/api/parents", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const schoolId = req.query.schoolId as string;
      
      // Only school admins and super admins can access parents
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      let targetSchoolId: string | undefined;

      // For school admins, only show parents from their school
      if (user.role === 'admin') {
        if (!user.schoolId) {
          return res.status(400).json({ message: "User is not associated with a school" });
        }
        targetSchoolId = user.schoolId;
      } else if (user.role === 'super_admin') {
        // Super admin can specify schoolId or see all
        targetSchoolId = schoolId;
      }

      const parents = await storage.getParents(targetSchoolId);
      res.json(parents);
    } catch (error) {
      console.error("Error fetching parents:", error);
      res.status(500).json({ message: "Failed to fetch parents" });
    }
  });

  app.get("/api/parents/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can access parents
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const parent = await storage.getParent(req.params.id);
      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }

      // School admins can only access parents from their school
      if (user.role === 'admin' && parent.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(parent);
    } catch (error) {
      console.error("Error fetching parent:", error);
      res.status(500).json({ message: "Failed to fetch parent" });
    }
  });

  app.post("/api/parents", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can create parents
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const requestBody = { ...req.body };
      const studentId = requestBody.studentId; // Extract studentId for linking
      delete requestBody.studentId; // Remove from parent data
      
      // For school admins, ensure the parent belongs to their school
      if (user.role === 'admin') {
        if (!user.schoolId) {
          return res.status(400).json({ message: "User is not associated with a school" });
        }
        requestBody.schoolId = user.schoolId;
      } else if (user.role === 'super_admin') {
        // Super admin must provide schoolId
        if (!requestBody.schoolId) {
          return res.status(400).json({ message: "School ID is required" });
        }
      }

      const validatedData = insertParentSchema.parse(requestBody);
      const parent = await storage.createParent(validatedData);

      // If studentId is provided, link the parent to the student
      if (studentId) {
        await storage.linkParentToStudent(parent.id, studentId);
      }

      res.status(201).json(parent);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data", errors: error.issues });
      }
      console.error("Error creating parent:", error);
      res.status(500).json({ message: "Failed to create parent" });
    }
  });

  app.put("/api/parents/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can update parents
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const existingParent = await storage.getParent(req.params.id);
      if (!existingParent) {
        return res.status(404).json({ message: "Parent not found" });
      }

      // School admins can only update parents from their school
      if (user.role === 'admin' && existingParent.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const requestBody = { ...req.body };
      delete requestBody.id; // Prevent ID modification
      delete requestBody.schoolId; // Prevent school change

      const parent = await storage.updateParent(req.params.id, requestBody);
      res.json(parent);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data", errors: error.issues });
      }
      console.error("Error updating parent:", error);
      res.status(500).json({ message: "Failed to update parent" });
    }
  });

  app.delete("/api/parents/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can delete parents
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const existingParent = await storage.getParent(req.params.id);
      if (!existingParent) {
        return res.status(404).json({ message: "Parent not found" });
      }

      // School admins can only delete parents from their school
      if (user.role === 'admin' && existingParent.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteParent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting parent:", error);
      res.status(500).json({ message: "Failed to delete parent" });
    }
  });

  // Student-Parent relationship endpoints
  app.post("/api/students/:studentId/parents/:parentId", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can link students to parents
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { studentId, parentId } = req.params;

      // Verify both student and parent exist
      const student = await storage.getStudent(studentId);
      const parent = await storage.getParent(parentId);

      if (!student || !parent) {
        return res.status(404).json({ message: "Student or parent not found" });
      }

      // Critical security check: Student and parent must belong to the same school
      if (student.schoolId !== parent.schoolId) {
        return res.status(400).json({ message: "Student and parent must belong to the same school" });
      }

      // School admins can only link students/parents from their school
      if (user.role === 'admin') {
        if (student.schoolId !== user.schoolId || parent.schoolId !== user.schoolId) {
          return res.status(403).json({ message: "Access denied - can only link students and parents from your school" });
        }
      }

      // For super admins, verify the school consistency
      if (user.role === 'super_admin') {
        // Additional verification that the school exists and is valid
        const school = await storage.getSchool(student.schoolId);
        if (!school) {
          return res.status(400).json({ message: "Invalid school for student and parent" });
        }
      }

      const relationship = await storage.linkStudentToParent(studentId, parentId);
      res.status(201).json(relationship);
    } catch (error) {
      console.error("Error linking student to parent:", error);
      res.status(500).json({ message: "Failed to link student to parent" });
    }
  });

  app.delete("/api/students/:studentId/parents/:parentId", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can unlink students from parents
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { studentId, parentId } = req.params;

      // Verify both student and parent exist
      const student = await storage.getStudent(studentId);
      const parent = await storage.getParent(parentId);

      if (!student || !parent) {
        return res.status(404).json({ message: "Student or parent not found" });
      }

      // Critical security check: Student and parent must belong to the same school
      if (student.schoolId !== parent.schoolId) {
        return res.status(400).json({ message: "Student and parent must belong to the same school" });
      }

      // School admins can only unlink students/parents from their school
      if (user.role === 'admin') {
        if (student.schoolId !== user.schoolId || parent.schoolId !== user.schoolId) {
          return res.status(403).json({ message: "Access denied - can only unlink students and parents from your school" });
        }
      }

      await storage.unlinkStudentFromParent(studentId, parentId);
      res.status(204).send();
    } catch (error) {
      console.error("Error unlinking student from parent:", error);
      res.status(500).json({ message: "Failed to unlink student from parent" });
    }
  });

  app.get("/api/parents/:parentId/children", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can access parent-children relationships
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const parent = await storage.getParent(req.params.parentId);
      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }

      // School admins can only access parents from their school
      if (user.role === 'admin' && parent.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const children = await storage.getParentChildren(req.params.parentId);
      res.json(children);
    } catch (error) {
      console.error("Error fetching parent children:", error);
      res.status(500).json({ message: "Failed to fetch parent children" });
    }
  });

  app.get("/api/students/:studentId/parents", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can access student-parents relationships
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const student = await storage.getStudent(req.params.studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // School admins can only access students from their school
      if (user.role === 'admin' && student.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const studentParents = await storage.getStudentParentsWithDetails(req.params.studentId);
      res.json(studentParents);
    } catch (error) {
      console.error("Error fetching student parents:", error);
      res.status(500).json({ message: "Failed to fetch student parents" });
    }
  });

  // Get student and parent login credentials
  app.get("/api/students/:studentId/credentials", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can access credentials
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const student = await storage.getStudent(req.params.studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // School admins can only access students from their school
      if (user.role === 'admin' && student.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const credentials = await storage.getStudentCredentials(req.params.studentId);
      res.json(credentials);
    } catch (error) {
      console.error("Error fetching student credentials:", error);
      res.status(500).json({ message: "Failed to fetch student credentials" });
    }
  });

  // Refresh student and parent login credentials
  app.post("/api/students/:studentId/credentials/refresh", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can refresh credentials
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const student = await storage.getStudent(req.params.studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // School admins can only refresh students from their school
      if (user.role === 'admin' && student.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const credentials = await storage.refreshStudentCredentials(req.params.studentId);
      res.json(credentials);
    } catch (error) {
      console.error("Error refreshing student credentials:", error);
      res.status(500).json({ message: "Failed to refresh student credentials" });
    }
  });

  // Subject endpoints
  app.get("/api/subjects", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const schoolId = req.query.schoolId as string;
      
      // Only school admins and super admins can access subjects
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      let targetSchoolId: string | undefined;

      // For school admins, only show subjects from their school
      if (user.role === 'admin') {
        if (!user.schoolId) {
          return res.status(400).json({ message: "User is not associated with a school" });
        }
        targetSchoolId = user.schoolId;
      } else if (user.role === 'super_admin') {
        // Super admin can specify schoolId or see all
        targetSchoolId = schoolId;
      }

      const subjects = await storage.getSubjects(targetSchoolId);
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.post("/api/subjects", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can create subjects
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const requestBody = { ...req.body };
      
      // For school admins, ensure the subject belongs to their school
      if (user.role === 'admin') {
        if (!user.schoolId) {
          return res.status(400).json({ message: "User is not associated with a school" });
        }
        requestBody.schoolId = user.schoolId;
      } else if (user.role === 'super_admin') {
        // Super admin must provide schoolId
        if (!requestBody.schoolId) {
          return res.status(400).json({ message: "School ID is required for super admin" });
        }
      }

      // Generate unique alphanumeric code
      let baseCode = requestBody.code || requestBody.name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8);
      let finalCode = baseCode;
      let counter = 1;
      
      // Check for existing codes and append number if needed
      while (await storage.checkSubjectCodeExists(finalCode, requestBody.schoolId)) {
        finalCode = baseCode + counter;
        if (finalCode.length > 10) {
          // If too long, truncate base and try again
          baseCode = baseCode.substring(0, 6);
          finalCode = baseCode + counter;
        }
        counter++;
      }
      
      requestBody.code = finalCode;
      // Generate unique color for this subject code
      requestBody.color = generateColorForSubjectCode(finalCode);
      const validatedData = insertSubjectSchema.parse(requestBody);
      const subject = await storage.createSubject(validatedData);
      res.status(201).json(subject);
    } catch (error) {
      console.error("Error creating subject:", error);
      res.status(400).json({ message: "Invalid subject data" });
    }
  });

  app.put("/api/subjects/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const subjectId = req.params.id;
      
      // Only school admins and super admins can update subjects
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check if subject exists and belongs to the user's school (for school admins)
      const existingSubject = await storage.getSubject(subjectId);
      if (!existingSubject) {
        return res.status(404).json({ message: "Subject not found" });
      }

      if (user.role === 'admin' && user.schoolId && existingSubject.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - subject not in your school" });
      }

      const requestBody = { ...req.body };
      
      // If code is provided or name changed, ensure uniqueness
      if (requestBody.code || requestBody.name) {
        let baseCode = requestBody.code || requestBody.name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8);
        let finalCode = baseCode;
        let counter = 1;
        
        // Check for existing codes (excluding current subject)
        while (await storage.checkSubjectCodeExists(finalCode, existingSubject.schoolId, subjectId)) {
          finalCode = baseCode + counter;
          if (finalCode.length > 10) {
            baseCode = baseCode.substring(0, 6);
            finalCode = baseCode + counter;
          }
          counter++;
        }
        
        requestBody.code = finalCode;
      }
      
      const validatedData = insertSubjectSchema.partial().parse(requestBody);
      
      // Ensure school ID cannot be changed by school admins
      if (user.role === 'admin') {
        delete validatedData.schoolId;
      }

      const updatedSubject = await storage.updateSubject(subjectId, validatedData);
      res.json(updatedSubject);
    } catch (error) {
      console.error("Error updating subject:", error);
      res.status(400).json({ message: "Failed to update subject" });
    }
  });

  app.delete("/api/subjects/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const subjectId = req.params.id;
      
      // Only school admins and super admins can delete subjects
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check if subject exists and belongs to the user's school (for school admins)
      const existingSubject = await storage.getSubject(subjectId);
      if (!existingSubject) {
        return res.status(404).json({ message: "Subject not found" });
      }

      if (user.role === 'admin' && user.schoolId && existingSubject.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - subject not in your school" });
      }

      await storage.deleteSubject(subjectId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting subject:", error);
      res.status(500).json({ message: "Failed to delete subject" });
    }
  });


  // Get other sections of the same grade
  app.get("/api/classes/:classId/other-sections", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const classId = req.params.classId;
      
      // Only school admins and super admins can access this
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get the current class to find its grade
      const currentClass = await storage.getClass(classId);
      if (!currentClass) {
        return res.status(404).json({ message: "Class not found" });
      }

      // Check school access for admins
      if (user.role === 'admin' && user.schoolId && currentClass.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }

      // Get all other classes with the same grade but different classId
      const otherSections = await storage.getOtherSectionsOfGrade(currentClass.grade, currentClass.schoolId, classId);
      res.json(otherSections);
    } catch (error) {
      console.error("Error fetching other sections:", error);
      res.status(500).json({ message: "Failed to fetch other sections" });
    }
  });

  // Copy subjects to other sections
  app.post("/api/classes/:classId/copy-subjects", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const classId = req.params.classId;
      const { targetClassIds } = req.body;
      
      // Only school admins and super admins can copy subjects
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!targetClassIds || !Array.isArray(targetClassIds) || targetClassIds.length === 0) {
        return res.status(400).json({ message: "Target class IDs are required" });
      }

      // Get the source class
      const sourceClass = await storage.getClass(classId);
      if (!sourceClass) {
        return res.status(404).json({ message: "Source class not found" });
      }

      // Check school access for admins
      if (user.role === 'admin' && user.schoolId && sourceClass.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }

      // Copy subjects to target classes
      const result = await storage.copySubjectsBetweenClasses(classId, targetClassIds, sourceClass.schoolId);
      
      res.json({
        success: true,
        message: `Successfully copied subjects to ${result.copiedCount} sections`,
        copiedCount: result.copiedCount,
        skippedCount: result.skippedCount
      });
    } catch (error) {
      console.error("Error copying subjects:", error);
      res.status(500).json({ message: "Failed to copy subjects" });
    }
  });

  // Create and assign subject to class in one operation
  app.post("/api/classes/:classId/create-assign-subject", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const classId = req.params.classId;
      
      // Only school admins and super admins can create and assign subjects
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Verify the class exists and belongs to the user's school
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (user.role === 'admin' && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }

      const requestBody = { ...req.body, classId };
      
      // Set school ID based on user role
      let schoolId: string;
      if (user.role === 'admin') {
        if (!user.schoolId) {
          return res.status(400).json({ message: "User is not associated with a school" });
        }
        schoolId = user.schoolId;
      } else if (user.role === 'super_admin') {
        schoolId = classData.schoolId;
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = createAndAssignSubjectSchema.parse(requestBody);

      // Pre-fetch all subjects once for efficiency
      const allSubjects = await storage.getSubjects(schoolId);

      // Check if this class already has a subject with this name to avoid duplicates
      const currentClassAssignments = await storage.getClassSubjectAssignments(classId);
      const existingSubjectForClass = currentClassAssignments.find(assignment => {
        const subject = allSubjects.find(s => s.id === assignment.subjectId);
        return subject && subject.name.toLowerCase() === validatedData.name.toLowerCase();
      });

      if (existingSubjectForClass) {
        return res.status(409).json({ message: `Subject "${validatedData.name}" is already assigned to this class` });
      }

      // Check if any other section of this grade already has this subject name
      const existingGradeClasses = (await storage.getClasses(schoolId)).filter(cls => cls.grade === classData.grade);
      let existingSubjectId = null;
      let existingSubject = null;
      
      for (const existingClass of existingGradeClasses) {
        if (existingClass.id === classId) continue; // Skip the current class
        const existingAssignments = await storage.getClassSubjectAssignments(existingClass.id);
        for (const assignment of existingAssignments) {
          const foundSubject = allSubjects.find(s => s.id === assignment.subjectId);
          if (foundSubject && foundSubject.name.toLowerCase() === validatedData.name.toLowerCase()) {
            existingSubjectId = foundSubject.id;
            existingSubject = foundSubject;
            break;
          }
        }
        if (existingSubjectId) break;
      }

      let subject;
      if (existingSubjectId && existingSubject) {
        // Reuse existing subject from same grade
        subject = existingSubject;
      } else {
        // Create new subject for this grade
        // Generate unique alphanumeric code from subject name
        let baseCode = validatedData.name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8);
        let finalCode = baseCode;
        let counter = 1;
        
        // Check for existing codes and append number if needed
        while (await storage.checkSubjectCodeExists(finalCode, schoolId)) {
          finalCode = baseCode + counter;
          if (finalCode.length > 10) {
            // If too long, truncate base and try again
            baseCode = baseCode.substring(0, 6);
            finalCode = baseCode + counter;
          }
          counter++;
        }

        // Create the subject with unique color based on code
        const subjectData = {
          name: validatedData.name,
          code: finalCode,
          color: generateColorForSubjectCode(finalCode), // Generate unique color based on code
          periodsPerWeek: validatedData.weeklyFrequency, // Use weekly frequency as default periods per week
          schoolId: schoolId,
        };

        subject = await storage.createSubject(subjectData);
      }

      // Assign the subject to the class
      const assignmentData = {
        classId: validatedData.classId,
        subjectId: subject.id,
        weeklyFrequency: validatedData.weeklyFrequency,
      };

      const assignment = await storage.createClassSubjectAssignment(assignmentData);

      res.status(201).json({
        success: true,
        subject,
        assignment,
        message: `Subject "${subject.name}" created and assigned to class successfully`,
      });
    } catch (error) {
      console.error("Error creating and assigning subject:", error);
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({ message: "Invalid data provided" });
      } else {
        res.status(500).json({ message: "Failed to create and assign subject" });
      }
    }
  });

  // Class endpoints
  app.get("/api/classes", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      let schoolId: string | undefined;

      // For school admins, only show classes from their school
      if (user.role === 'admin' && user.schoolId) {
        schoolId = user.schoolId;
      }

      const classes = await storage.getClasses(schoolId);
      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.get("/api/classes/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const classId = req.params.id;

      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }

      // Check if user has access to this class
      if (user.role === 'admin' && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }

      res.json(classData);
    } catch (error) {
      console.error("Error fetching class:", error);
      res.status(500).json({ message: "Failed to fetch class" });
    }
  });

  app.post("/api/classes", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can create classes
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Debug logging
      console.log("User creating class:", { 
        role: user.role, 
        schoolId: user.schoolId,
        userId: user.id 
      });
      console.log("Request body:", req.body);

      // For school admins, ensure the class belongs to their school
      const requestBody = { ...req.body };
      
      if (user.role === 'admin') {
        if (!user.schoolId) {
          return res.status(400).json({ message: "User is not associated with a school" });
        }
        requestBody.schoolId = user.schoolId;
      } else if (user.role === 'super_admin') {
        // Super admin must provide schoolId
        if (!requestBody.schoolId) {
          return res.status(400).json({ message: "School ID is required for super admin" });
        }
      }

      console.log("Final request body before validation:", requestBody);
      const validatedData = insertClassSchema.parse(requestBody);
      const classData = await storage.createClass(validatedData);
      res.status(201).json(classData);
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(400).json({ message: "Invalid class data" });
    }
  });

  // Bulk upload classes endpoint
  app.post("/api/classes/bulk-upload", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can bulk upload classes
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { classes } = req.body;
      
      if (!Array.isArray(classes) || classes.length === 0) {
        return res.status(400).json({ message: "No classes data provided" });
      }

      // Determine schoolId based on user role
      let schoolId: string;
      if (user.role === 'admin' && user.schoolId) {
        schoolId = user.schoolId;
      } else if (user.role === 'super_admin') {
        // Super admins should provide schoolId in request body
        schoolId = req.body.schoolId;
        if (!schoolId) {
          return res.status(400).json({ message: "schoolId is required for super admin" });
        }
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get existing classes for duplicate checking
      const existingClasses = await storage.getClasses(schoolId);

      // Get subjects for validation
      const subjects = await storage.getSubjects(schoolId);
      const subjectMap = new Map();
      subjects.forEach(subject => {
        subjectMap.set(subject.name.toLowerCase(), subject.id);
        subjectMap.set(subject.code.toLowerCase(), subject.id);
      });

      const results = [];
      const errors = [];
      
      for (let i = 0; i < classes.length; i++) {
        const classData = classes[i];
        
        try {
          // Use original row number from client if available, otherwise fall back to calculated
          const originalRowNumber = classData.originalRowNumber || (i + 2);
          
          // Validate required fields
          if (!classData.grade || !classData.requiredSubjects) {
            errors.push({
              row: originalRowNumber,
              error: "Grade and Required Subjects are required"
            });
            continue;
          }

          // Check if class with same grade-section already exists
          const duplicateClass = existingClasses.find(cls => 
            cls.grade === classData.grade.toString() && 
            (cls.section || '') === (classData.section || '')
          );
          if (duplicateClass) {
            const sectionText = classData.section ? ` ${classData.section}` : '';
            errors.push({
              row: originalRowNumber,
              error: `Class Grade ${classData.grade}${sectionText} already exists`
            });
            continue;
          }

          // Check for duplicate grade-section within current batch
          const currentBatchDuplicate = classes.slice(0, i).find(c => 
            c.grade === classData.grade && (c.section || '') === (classData.section || '')
          );
          if (currentBatchDuplicate) {
            const sectionText = classData.section ? ` ${classData.section}` : '';
            errors.push({
              row: originalRowNumber,
              error: `Duplicate class Grade ${classData.grade}${sectionText} found in current upload batch`
            });
            continue;
          }

          // Validate and process subjects - create missing subjects
          const subjectNames = classData.requiredSubjects.split(',').map(s => s.trim()).filter(Boolean);
          const subjectIds: string[] = [];

          for (const subjectName of subjectNames) {
            // Create grade-specific key for subject lookup (shared across sections in same grade)
            const gradeSpecificSubjectKey = `${classData.grade}-${subjectName.toLowerCase()}`;
            let subjectId = subjectMap.get(gradeSpecificSubjectKey);
            
            if (!subjectId) {
              // Check if any other section of this grade already has this subject
              // First check existing classes in database
              const existingGradeClasses = existingClasses.filter(cls => cls.grade === classData.grade.toString());
              let existingSubjectId = null;
              
              for (const existingClass of existingGradeClasses) {
                const existingAssignments = await storage.getClassSubjectAssignments(existingClass.id);
                for (const assignment of existingAssignments) {
                  const existingSubject = subjects.find(s => s.id === assignment.subjectId);
                  if (existingSubject && existingSubject.name.toLowerCase() === subjectName.toLowerCase()) {
                    existingSubjectId = existingSubject.id;
                    break;
                  }
                }
                if (existingSubjectId) break;
              }
              
              if (existingSubjectId) {
                // Reuse existing subject from same grade
                subjectId = existingSubjectId;
                subjectMap.set(gradeSpecificSubjectKey, subjectId);
              } else {
                // Create new subject for this grade
                try {
                  // Create meaningful subject code based on subject name
                  const baseCode = subjectName.substring(0, 4).replace(/[^a-zA-Z]/g, '').padEnd(4, 'X');
                  let uniqueCode = '';
                  let attempts = 0;
                  const maxAttempts = 100;
                  
                  // Keep generating codes until we find a unique one
                  do {
                    const randomSuffix = Math.floor(100 + Math.random() * 900); // 3-digit number
                    uniqueCode = `${baseCode}${randomSuffix}`.toUpperCase();
                    attempts++;
                  } while (
                    (subjectMap.has(`code:${uniqueCode.toLowerCase()}`) || 
                     subjects.some(s => s.code.toLowerCase() === uniqueCode.toLowerCase())) && 
                    attempts < maxAttempts
                  );
                  
                  if (attempts >= maxAttempts) {
                    // Fallback to timestamp-based code if we can't find unique code
                    uniqueCode = `${baseCode}${Date.now().toString().slice(-3)}`.toUpperCase();
                  }
                  
                  const newSubject = await storage.createSubject({
                    name: subjectName,
                    code: uniqueCode,
                    periodsPerWeek: 5, // Default 5 periods per week for auto-created subjects
                    schoolId: schoolId
                  });
                  subjectId = newSubject.id;
                  // Add to map with grade-specific key for this batch
                  subjectMap.set(gradeSpecificSubjectKey, subjectId);
                  subjectMap.set(`code:${uniqueCode.toLowerCase()}`, subjectId);
                } catch (subjectError) {
                  console.error(`Error creating subject ${subjectName}:`, subjectError);
                  errors.push({
                    row: originalRowNumber,
                    error: `Failed to create subject: ${subjectName}`
                  });
                  continue;
                }
              }
            }
            
            subjectIds.push(subjectId);
          }

          // Create class
          const newClassData = {
            grade: classData.grade.toString(),
            section: classData.section || '',
            requiredSubjects: subjectIds,
            schoolId: schoolId
          };

          const createdClass = await storage.createClass(newClassData);
          
          // Create class-subject assignments for each subject
          for (const subjectId of subjectIds) {
            try {
              await storage.createClassSubjectAssignment({
                classId: createdClass.id,
                subjectId: subjectId,
                weeklyFrequency: 5, // Default 5 periods per week to match subject's periodsPerWeek
                schoolId: schoolId
              });
            } catch (assignmentError) {
              console.error(`Error creating class-subject assignment for class ${createdClass.id} and subject ${subjectId}:`, assignmentError);
              // Continue with other assignments even if one fails
            }
          }
          
          results.push(createdClass);

        } catch (error) {
          console.error(`Error processing class ${i + 1}:`, error);
          errors.push({
            row: classData.originalRowNumber || (i + 2),
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      res.json({
        imported: results.length,
        total: classes.length,
        errors: errors,
        results: results
      });
      
    } catch (error) {
      console.error("Error in bulk class upload:", error);
      res.status(500).json({ message: "Failed to process bulk upload" });
    }
  });

  app.put("/api/classes/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const classId = req.params.id;
      
      // Only school admins and super admins can update classes
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check if class exists and belongs to the user's school (for school admins)
      const existingClass = await storage.getClass(classId);
      if (!existingClass) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (user.role === 'admin' && user.schoolId && existingClass.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }

      const validatedData = updateClassSchema.parse(req.body);
      
      // Ensure school ID cannot be changed by school admins
      if (user.role === 'admin') {
        delete validatedData.schoolId;
      }

      // Check if the new grade-section combination already exists in the same school
      const schoolId = existingClass.schoolId;
      const isDuplicate = await storage.checkClassExists(
        validatedData.grade || existingClass.grade,
        validatedData.section !== undefined ? validatedData.section : existingClass.section,
        schoolId,
        classId
      );

      if (isDuplicate) {
        const sectionText = validatedData.section !== undefined ? validatedData.section : existingClass.section;
        const displayName = sectionText 
          ? `Class ${validatedData.grade || existingClass.grade}${sectionText}` 
          : `Class ${validatedData.grade || existingClass.grade}`;
        return res.status(400).json({ message: `${displayName} already exists in this school` });
      }

      const updatedClass = await storage.updateClass(classId, validatedData);
      res.json(updatedClass);
    } catch (error) {
      console.error("Error updating class:", error);
      res.status(400).json({ message: "Invalid class data" });
    }
  });

  app.delete("/api/classes/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const classId = req.params.id;
      
      // Only school admins and super admins can delete classes
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check if class exists and belongs to the user's school (for school admins)
      const existingClass = await storage.getClass(classId);
      if (!existingClass) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (user.role === 'admin' && user.schoolId && existingClass.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }

      await storage.deleteClass(classId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting class:", error);
      res.status(500).json({ message: "Failed to delete class" });
    }
  });

  // Class Teacher Management Endpoints

  // Get class teacher assignments for a specific class
  app.get("/api/classes/:classId/teachers", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const classId = req.params.classId;

      // Verify class access
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (user.role === 'admin' && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }

      const classTeachers = await storage.getClassTeacherAssignments(classId);
      res.json(classTeachers);
    } catch (error) {
      console.error("Error fetching class teachers:", error);
      res.status(500).json({ message: "Failed to fetch class teachers" });
    }
  });

  // Assign a teacher to a class
  app.post("/api/classes/:classId/teachers", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const classId = req.params.classId;

      // Only school admins and super admins can assign class teachers
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Verify class access
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (user.role === 'admin' && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }

      // Prepare assignment data
      const assignmentData = {
        ...req.body,
        classId,
        assignedBy: user.id,
        schoolId: classData.schoolId
      };

      // Validate the data
      const validatedData = insertClassTeacherAssignmentSchema.parse(assignmentData);

      // Check if teacher is already assigned to this class
      const existingAssignment = await storage.getClassTeacherAssignment(classId, validatedData.teacherId);
      if (existingAssignment) {
        return res.status(400).json({ message: "Teacher is already assigned to this class" });
      }

      // If assigning as primary teacher, ensure no other primary teacher exists
      if (validatedData.role === 'primary' || validatedData.isPrimary) {
        const existingPrimary = await storage.getPrimaryClassTeacher(classId);
        if (existingPrimary) {
          return res.status(400).json({ message: "This class already has a primary class teacher. Please remove the existing primary teacher first or assign as co-class teacher." });
        }
      }

      const assignment = await storage.createClassTeacherAssignment(validatedData);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error assigning class teacher:", error);
      res.status(400).json({ message: "Invalid assignment data" });
    }
  });

  // Update class teacher assignment (role/privileges)
  app.put("/api/class-teachers/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const assignmentId = req.params.id;

      // Only school admins and super admins can update class teacher assignments
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get existing assignment
      const existingAssignment = await storage.getClassTeacherAssignmentById(assignmentId);
      if (!existingAssignment) {
        return res.status(404).json({ message: "Class teacher assignment not found" });
      }

      // Verify school access
      if (user.role === 'admin' && user.schoolId && existingAssignment.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - assignment not in your school" });
      }

      // If changing to primary teacher, ensure no other primary teacher exists
      if ((req.body.role === 'primary' || req.body.isPrimary) && !existingAssignment.isPrimary) {
        const existingPrimary = await storage.getPrimaryClassTeacher(existingAssignment.classId);
        if (existingPrimary && existingPrimary.id !== assignmentId) {
          return res.status(400).json({ message: "This class already has a primary class teacher. Please remove the existing primary teacher first." });
        }
      }

      const updatedAssignment = await storage.updateClassTeacherAssignment(assignmentId, req.body);
      res.json(updatedAssignment);
    } catch (error) {
      console.error("Error updating class teacher assignment:", error);
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  // Remove teacher from class
  app.delete("/api/class-teachers/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const assignmentId = req.params.id;

      // Only school admins and super admins can remove class teacher assignments
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get existing assignment
      const existingAssignment = await storage.getClassTeacherAssignmentById(assignmentId);
      if (!existingAssignment) {
        return res.status(404).json({ message: "Class teacher assignment not found" });
      }

      // Verify school access
      if (user.role === 'admin' && user.schoolId && existingAssignment.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - assignment not in your school" });
      }

      // Check if this is the last class teacher
      const classTeachers = await storage.getClassTeacherAssignments(existingAssignment.classId);
      if (classTeachers.length <= 1) {
        return res.status(400).json({ message: "Cannot remove the last class teacher. Each class must have at least one class teacher." });
      }

      await storage.deleteClassTeacherAssignment(assignmentId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing class teacher:", error);
      res.status(500).json({ message: "Failed to remove class teacher" });
    }
  });

  // Student class access endpoints (read-only for students)
  app.get("/api/classes/:classId/students", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const classId = req.params.classId;

      // Only students can access this endpoint (read-only)
      if (user.role !== 'student') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Verify the student belongs to this class
      const student = await storage.getStudent(user.studentId);
      if (!student || student.classId !== classId) {
        return res.status(403).json({ message: "Access denied - you are not a member of this class" });
      }

      // Get all students in the class (excluding passwords and sensitive data)
      const students = await storage.getStudents(user.schoolId, classId);
      
      // Return only basic student information for privacy
      const sanitizedStudents = students.map(s => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        rollNumber: s.rollNumber,
        admissionNumber: s.admissionNumber,
        status: s.status
      }));

      res.json(sanitizedStudents);
    } catch (error) {
      console.error("Error fetching class students:", error);
      res.status(500).json({ message: "Failed to fetch class students" });
    }
  });

  // Timetable endpoints
  app.get("/api/timetable", authMiddleware, async (req: any, res) => {
    try {
      const { classId, teacherId } = req.query;
      
      let timetable;
      if (classId) {
        timetable = await storage.getTimetableForClass(classId as string);
      } else if (teacherId) {
        timetable = await storage.getTimetableForTeacher(teacherId as string);
      } else {
        timetable = await storage.getTimetableEntries();
      }
      
      res.json(timetable);
    } catch (error) {
      console.error("Error fetching timetable:", error);
      res.status(500).json({ message: "Failed to fetch timetable" });
    }
  });

  app.get("/api/timetable/detailed", authMiddleware, async (req: any, res) => {
    try {
      const { classId, teacherId, versionId, date } = req.query;
      
      let timetable;
      if (versionId) {
        // Fetch specific version
        timetable = await storage.getTimetableEntriesForVersion(versionId as string);
      } else {
        // Use merged timetable data (global + weekly overrides)
        const user = req.user;
        let schoolId: string | undefined;
        if (user.role !== 'superadmin' && user.schoolId) {
          schoolId = user.schoolId;
        }
        timetable = await getMergedTimetableData(classId, teacherId, schoolId);
      }

      // Apply timetable changes for both daily and weekly views
      try {
        const user = req.user;
        const schoolId = user.role === 'admin' ? user.schoolId : undefined;
        
        if (schoolId) {
          // For daily view, use the provided date
          // For weekly view, use today's date to get current week changes
          const targetDate = date || new Date().toISOString().split('T')[0];
          const changes = await storage.getActiveTimetableChanges(schoolId, targetDate);
          
          // Apply approved changes to the timetable
          const approvedChanges = changes.filter(change => change.approvedBy && change.isActive);
          
          for (const change of approvedChanges) {
            if (change.changeType === 'substitution' && change.newTeacherId) {
              // Find and update the timetable entry for this substitution
              const entryIndex = timetable.findIndex(entry => entry.id === change.timetableEntryId);
              if (entryIndex !== -1) {
                // Create a modified entry for the substitution
                timetable[entryIndex] = {
                  ...timetable[entryIndex],
                  teacherId: change.newTeacherId,
                  // Add substitute info as additional properties
                  originalTeacherId: change.originalTeacherId
                } as any;
              }
            } else if (change.changeType === 'cancellation') {
              // Remove cancelled entries
              timetable = timetable.filter(entry => entry.id !== change.timetableEntryId);
            }
          }
        }
      } catch (changeError) {
        console.error("Error applying timetable changes:", changeError);
        // Continue without changes if there's an error
      }

      // Filter by date if provided (for daily view)
      if (date && typeof date === 'string') {
        const selectedDate = new Date(date);
        const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        
        // Filter timetable entries for the specific day
        timetable = timetable.filter(entry => entry.day.toLowerCase() === dayOfWeek);
      }

      // Get related data with proper school filtering
      const user = req.user;
      let schoolId: string | undefined;
      if (user.role === 'admin' && user.schoolId) {
        schoolId = user.schoolId;
      }

      const [teachers, subjects, classes] = await Promise.all([
        storage.getTeachers(schoolId),
        storage.getSubjects(schoolId),
        storage.getClasses(schoolId),
      ]);

      // Enrich timetable with related data
      const detailedTimetable = timetable.map(entry => {
        const teacher = teachers.find(t => t.id === entry.teacherId);
        const subject = subjects.find(s => s.id === entry.subjectId);
        const classData = classes.find(c => c.id === entry.classId);

        return {
          ...entry,
          teacher,
          subject,
          class: classData,
        };
      });

      res.json(detailedTimetable);
    } catch (error) {
      console.error("Error fetching detailed timetable:", error);
      res.status(500).json({ message: "Failed to fetch detailed timetable" });
    }
  });

  // Helper function to merge global timetable with weekly overrides
  async function getMergedTimetableData(classId?: string, teacherId?: string, schoolId?: string) {
    let globalTimetable;
    if (classId) {
      globalTimetable = await storage.getTimetableForClass(classId as string);
    } else if (teacherId) {
      globalTimetable = await storage.getTimetableForTeacher(teacherId as string);
    } else {
      globalTimetable = await storage.getTimetableEntries(schoolId);
    }

    // If requesting for a specific class, check for weekly timetable overrides
    if (classId) {
      // Get current week's weekly timetable
      const currentDate = new Date();
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday
      weekStart.setHours(0, 0, 0, 0);
      
      const weekStartStr = weekStart.toISOString().split('T')[0];
      
      try {
        const weeklyTimetable = await storage.getWeeklyTimetable(classId, weekStart);
        
        if (weeklyTimetable && weeklyTimetable.timetableData) {
          // Create a map of global entries
          const globalMap = new Map();
          globalTimetable.forEach(entry => {
            const key = `${entry.day.toLowerCase()}-${entry.period}`;
            globalMap.set(key, entry);
          });

          // Apply weekly overrides
          const weeklyData = Array.isArray(weeklyTimetable.timetableData) 
            ? weeklyTimetable.timetableData 
            : [];
          
          weeklyData.forEach(weeklyEntry => {
            const key = `${weeklyEntry.day.toLowerCase()}-${weeklyEntry.period}`;
            
            if (weeklyEntry.isModified) {
              if (weeklyEntry.teacherId === null && weeklyEntry.subjectId === null) {
                // This is a deletion - remove the entry
                console.log(`[TIMETABLE MERGE] Deleting entry: ${key}`);
                globalMap.delete(key);
              } else if (weeklyEntry.teacherId && weeklyEntry.subjectId) {
                // This is an assignment - update or add the entry
                console.log(`[TIMETABLE MERGE] Updating entry: ${key}`);
                globalMap.set(key, {
                  id: `weekly-${key}`,
                  classId: classId,
                  teacherId: weeklyEntry.teacherId,
                  subjectId: weeklyEntry.subjectId,
                  day: weeklyEntry.day,
                  period: weeklyEntry.period,
                  startTime: weeklyEntry.startTime,
                  endTime: weeklyEntry.endTime,
                  room: weeklyEntry.room,
                  versionId: null,
                  isActive: true,
                  createdAt: new Date(),
                  updatedAt: new Date()
                });
              }
            }
          });

          // Convert back to array
          return Array.from(globalMap.values());
        }
      } catch (error) {
        console.error('[TIMETABLE MERGE] Error getting weekly timetable:', error);
        // Continue with global data if weekly fetch fails
      }
    }

    return globalTimetable;
  }

  // Global Timetable API - returns merged timetable with weekly changes
  app.get("/api/timetable/global", authMiddleware, async (req: any, res) => {
    try {
      // Prevent caching of global timetable data
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const { classId, teacherId } = req.query;
      console.log('[GLOBAL API] Request params:', { classId, teacherId });

      // Get school filtering
      const user = req.user;
      let schoolId: string | undefined;
      if (user.role !== 'superadmin' && user.schoolId) {
        schoolId = user.schoolId;
      }
      
      // Get merged timetable data (global + weekly overrides)
      const timetable = await getMergedTimetableData(classId, teacherId, schoolId);
      
      console.log('[GLOBAL API] Raw timetable data:', timetable?.length || 0, 'entries');
      console.log('[GLOBAL API] First few entries:', timetable?.slice(0, 2) || 'No entries');

      const [teachers, subjects, classes] = await Promise.all([
        storage.getTeachers(schoolId),
        storage.getSubjects(schoolId),
        storage.getClasses(schoolId),
      ]);

      console.log('[GLOBAL API] Related data counts:', {
        teachers: teachers?.length || 0,
        subjects: subjects?.length || 0,
        classes: classes?.length || 0
      });

      // Enrich timetable with related data
      const detailedTimetable = timetable.map(entry => {
        const teacher = teachers.find(t => t.id === entry.teacherId);
        const subject = subjects.find(s => s.id === entry.subjectId);
        const classData = classes.find(c => c.id === entry.classId);

        return {
          ...entry,
          teacher,
          subject,
          class: classData,
        };
      });

      console.log('[GLOBAL API] Final detailed timetable length:', detailedTimetable?.length || 0);
      console.log('[GLOBAL API] Sample detailed entry:', detailedTimetable?.[0] || 'No entries');

      res.json(detailedTimetable);
    } catch (error) {
      console.error("Error fetching global timetable:", error);
      res.status(500).json({ message: "Failed to fetch global timetable" });
    }
  });

  // Timetable Versions API
  app.get("/api/timetable-versions", authMiddleware, async (req: any, res) => {
    try {
      const { classId, weekStart, weekEnd } = req.query;
      
      if (!classId || !weekStart || !weekEnd) {
        return res.status(400).json({ message: "classId, weekStart, and weekEnd are required" });
      }

      const versions = await storage.getTimetableVersionsForClass(
        classId as string, 
        weekStart as string, 
        weekEnd as string
      );
      
      res.json(versions);
    } catch (error) {
      console.error("Error fetching timetable versions:", error);
      res.status(500).json({ message: "Failed to fetch timetable versions" });
    }
  });

  app.post("/api/timetable-versions/:id/activate", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can activate versions
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { id } = req.params;
      const { classId } = req.body;
      
      if (!classId) {
        return res.status(400).json({ message: "classId is required" });
      }

      await storage.setActiveVersion(id, classId);
      res.json({ success: true, message: "Version activated successfully" });
    } catch (error) {
      console.error("Error activating version:", error);
      res.status(500).json({ message: "Failed to activate version" });
    }
  });


  app.get("/api/timetable/optimize", async (req, res) => {
    try {
      const suggestions = await scheduler.suggestOptimizations();
      res.json({ suggestions });
    } catch (error) {
      console.error("Error getting optimization suggestions:", error);
      res.status(500).json({ message: "Failed to get optimization suggestions" });
    }
  });

  // Manual assignment endpoints
  // Assign teacher to multiple subjects in a class
  app.post("/api/classes/:classId/assign-teacher-multiple", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can assign teachers
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { classId } = req.params;
      const { teacherId, subjectIds } = req.body;

      // Validate required fields
      if (!teacherId || !Array.isArray(subjectIds) || subjectIds.length === 0) {
        return res.status(400).json({ message: "teacherId and subjectIds (array) are required" });
      }

      // Check if class exists and user has permission
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (user.role === 'admin' && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }

      // Check if teacher exists
      const teacher = await storage.getTeacher(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      const results = [];
      const errors = [];

      // Process each subject assignment
      for (const subjectId of subjectIds) {
        try {
          // Check if subject exists
          const subject = await storage.getSubject(subjectId);
          if (!subject) {
            errors.push(`Subject ${subjectId} not found`);
            continue;
          }

          // Check if the subject is already assigned to this class
          const existingAssignment = await storage.getClassSubjectAssignmentByClassAndSubject(classId, subjectId);

          if (!existingAssignment) {
            errors.push(`Subject ${subject.name} must be assigned to class first before assigning a teacher`);
            continue;
          }

          if (existingAssignment.assignedTeacherId && existingAssignment.assignedTeacherId === teacherId) {
            errors.push(`Teacher is already assigned to teach ${subject.name} for this class`);
            continue;
          }

          // Update the class subject assignment with the teacher
          const updatedAssignment = await storage.updateClassSubjectAssignment(existingAssignment.id, {
            assignedTeacherId: teacherId
          });

          results.push({
            subjectId,
            subjectName: subject.name,
            assignment: updatedAssignment
          });
        } catch (error) {
          console.error(`Error assigning teacher to subject ${subjectId}:`, error);
          errors.push(`Failed to assign teacher to subject ${subjectId}`);
        }
      }

      res.status(200).json({ 
        message: `Successfully assigned teacher to ${results.length} subjects`,
        results,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error("Error assigning teacher to multiple subjects:", error);
      res.status(500).json({ message: "Failed to assign teacher to subjects" });
    }
  });

  app.post("/api/classes/:classId/assign-teacher", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can assign teachers
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { classId } = req.params;
      const { teacherId, subjectId } = req.body;

      // Validate required fields
      if (!teacherId || !subjectId) {
        return res.status(400).json({ message: "teacherId and subjectId are required" });
      }

      // Check if class exists and user has permission
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (user.role === 'admin' && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }

      // Check if teacher exists
      const teacher = await storage.getTeacher(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      // Check if subject exists
      const subject = await storage.getSubject(subjectId);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }

      // Check if the subject is already assigned to this class
      const existingAssignment = await storage.getClassSubjectAssignmentByClassAndSubject(classId, subjectId);

      if (!existingAssignment) {
        return res.status(404).json({ message: "Subject must be assigned to class first before assigning a teacher" });
      }

      if (existingAssignment.assignedTeacherId && existingAssignment.assignedTeacherId === teacherId) {
        return res.status(409).json({ message: "This teacher is already assigned to teach this subject for this class" });
      }

      // Update the class subject assignment with the teacher
      const updatedAssignment = await storage.updateClassSubjectAssignment(existingAssignment.id, {
        assignedTeacherId: teacherId
      });

      res.status(200).json(updatedAssignment);
    } catch (error) {
      console.error("Error assigning teacher to class:", error);
      res.status(500).json({ message: "Failed to assign teacher to class" });
    }
  });

  app.post("/api/classes/:classId/assign-subject", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can assign subjects
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { classId } = req.params;
      const { subjectId } = req.body;

      if (!subjectId) {
        return res.status(400).json({ message: "subjectId is required" });
      }

      // Check if class exists and user has permission
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (user.role === 'admin' && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }

      // Check if subject exists
      const subject = await storage.getSubject(subjectId);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }

      // Add subject to class's required subjects if not already present
      const requiredSubjects = classData.requiredSubjects || [];
      if (!requiredSubjects.includes(subjectId)) {
        requiredSubjects.push(subjectId);
        
        await storage.updateClass(classId, {
          requiredSubjects
        });
      }

      res.json({ message: "Subject assigned to class successfully" });
    } catch (error) {
      console.error("Error assigning subject to class:", error);
      res.status(500).json({ message: "Failed to assign subject to class" });
    }
  });

  app.delete("/api/classes/:classId/unassign-teacher/:assignmentId", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can unassign teachers
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { classId, assignmentId } = req.params;

      // Check if class exists and user has permission
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (user.role === 'admin' && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }

      // Update the class subject assignment to remove the teacher
      await storage.updateClassSubjectAssignment(assignmentId, {
        assignedTeacherId: null
      });

      res.status(200).json({ message: "Teacher unassigned successfully" });
    } catch (error) {
      console.error("Error unassigning teacher from class:", error);
      res.status(500).json({ message: "Failed to unassign teacher from class" });
    }
  });

  app.delete("/api/classes/:classId/unassign-subject/:subjectId", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can unassign subjects
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { classId, subjectId } = req.params;

      // Check if class exists and user has permission
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (user.role === 'admin' && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }

      // Remove subject from class's required subjects
      const requiredSubjects = (classData.requiredSubjects || []).filter(id => id !== subjectId);
      
      await storage.updateClass(classId, {
        requiredSubjects
      });

      res.status(204).send();
    } catch (error) {
      console.error("Error unassigning subject from class:", error);
      res.status(500).json({ message: "Failed to unassign subject from class" });
    }
  });

  // Substitution endpoints
  app.get("/api/substitutions", async (req, res) => {
    try {
      const { weekStart, weekEnd } = req.query;
      
      // If week range is provided, filter substitutions by that week
      if (weekStart && weekEnd) {
        const startDate = new Date(weekStart as string);
        const endDate = new Date(weekEnd as string);
        
        const substitutions = await storage.getSubstitutionsByWeek(startDate, endDate);
        res.json(substitutions);
      } else {
        // Fallback to all substitutions (for backward compatibility)
        const substitutions = await storage.getSubstitutions();
        res.json(substitutions);
      }
    } catch (error) {
      console.error("Error fetching substitutions:", error);
      res.status(500).json({ message: "Failed to fetch substitutions" });
    }
  });

  app.get("/api/substitutions/active", async (req, res) => {
    try {
      const substitutions = await storage.getActiveSubstitutions();
      res.json(substitutions);
    } catch (error) {
      console.error("Error fetching active substitutions:", error);
      res.status(500).json({ message: "Failed to fetch active substitutions" });
    }
  });

  app.post("/api/substitutions", async (req, res) => {
    try {
      const validatedData = insertSubstitutionSchema.parse(req.body);
      const substitution = await storage.createSubstitution(validatedData);
      res.status(201).json(substitution);
    } catch (error) {
      console.error("Error creating substitution:", error);
      res.status(400).json({ message: "Invalid substitution data" });
    }
  });

  app.put("/api/substitutions/:id", async (req, res) => {
    try {
      const validatedData = insertSubstitutionSchema.partial().parse(req.body);
      const substitution = await storage.updateSubstitution(req.params.id, validatedData);
      res.json(substitution);
    } catch (error) {
      console.error("Error updating substitution:", error);
      res.status(400).json({ message: "Invalid substitution data" });
    }
  });

  // New substitution approval endpoints
  app.get("/api/substitutions/pending", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const { date, weekStart, weekEnd } = req.query;
      
      // Only school admins and super admins can view pending substitutions
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      const schoolId = user.role === 'super_admin' ? req.query.schoolId : user.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: "School ID is required" });
      }

      // Get all pending substitutions for the school
      const allSubstitutions = await storage.getSubstitutions();
      let pendingSubstitutions = allSubstitutions.filter(sub => {
        return sub.status === "pending" && sub.isAutoGenerated;
      });

      // Filter by date or week range if provided
      if (date) {
        const targetDate = new Date(date as string).toISOString().split('T')[0];
        pendingSubstitutions = pendingSubstitutions.filter(sub => {
          const subDate = new Date(sub.date).toISOString().split('T')[0];
          return subDate === targetDate;
        });
      } else if (weekStart && weekEnd) {
        const startDate = new Date(weekStart as string);
        const endDate = new Date(weekEnd as string);
        pendingSubstitutions = pendingSubstitutions.filter(sub => {
          const subDate = new Date(sub.date);
          return subDate >= startDate && subDate <= endDate;
        });
      }

      // Enrich with additional data (teacher names, class info, subject info)
      const enrichedSubstitutions = [];
      
      for (const sub of pendingSubstitutions) {
        try {
          const originalTeacher = await storage.getTeacher(sub.originalTeacherId);
          const substituteTeacher = sub.substituteTeacherId ? await storage.getTeacher(sub.substituteTeacherId) : null;
          const timetableEntry = await storage.getTimetableEntry(sub.timetableEntryId);
          
          if (originalTeacher && timetableEntry && originalTeacher.schoolId === schoolId) {
            const classData = await storage.getClass(timetableEntry.classId);
            const subjectData = await storage.getSubject(timetableEntry.subjectId);
            
            enrichedSubstitutions.push({
              ...sub,
              originalTeacherName: originalTeacher.name,
              substituteTeacherName: substituteTeacher?.name || null,
              className: classData ? `${classData.grade}${classData.section ? `-${classData.section}` : ''}` : 'Unknown',
              subjectName: subjectData?.name || 'Unknown',
              day: timetableEntry.day,
              period: timetableEntry.period,
              startTime: timetableEntry.startTime,
              endTime: timetableEntry.endTime
            });
          }
        } catch (error) {
          console.error(`Error enriching substitution ${sub.id}:`, error);
        }
      }

      res.json(enrichedSubstitutions);
    } catch (error) {
      console.error("Error fetching pending substitutions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/substitutions/:id/approve", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can approve substitutions
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      const substitutionId = req.params.id;
      const substitution = await storage.getSubstitution(substitutionId);
      
      if (!substitution) {
        return res.status(404).json({ message: "Substitution not found" });
      }

      if (substitution.status !== "pending") {
        return res.status(400).json({ message: "Substitution is not pending approval" });
      }

      // Update substitution status to confirmed
      await storage.updateSubstitution(substitutionId, {
        status: "confirmed"
      });

      // Get timetable entry and apply the substitution to weekly timetable
      const timetableEntry = await storage.getTimetableEntry(substitution.timetableEntryId);
      if (timetableEntry && substitution.substituteTeacherId) {
        // Calculate week start from the substitution date
        const absenceDate = new Date(substitution.date);
        const weekStart = new Date(absenceDate);
        weekStart.setDate(absenceDate.getDate() - absenceDate.getDay() + 1); // Monday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // Sunday
        
        const weekStartStr = weekStart.toISOString().split('T')[0];
        const weekEndStr = weekEnd.toISOString().split('T')[0];

        // Get substitute teacher info for modification reason
        const substituteTeacher = await storage.getTeacher(substitution.substituteTeacherId);
        const substituteName = substituteTeacher?.name || 'Unknown';

        // Update the weekly timetable entry with the approved substitute
        await storage.updateWeeklyTimetableEntry(
          timetableEntry.classId,
          weekStartStr,
          weekEndStr,
          timetableEntry.day,
          timetableEntry.period,
          {
            teacherId: substitution.substituteTeacherId,
            subjectId: timetableEntry.subjectId,
            isModified: true,
            modificationReason: `Approved substitution: ${substitution.reason}. Substitute: ${substituteName}`
          },
          user.id
        );

        console.log(`[SUBSTITUTION APPROVED] Updated weekly timetable for ${timetableEntry.classId} ${timetableEntry.day} period ${timetableEntry.period} with substitute ${substituteName}`);
      }

      res.json({ message: "Substitution approved successfully", substitution });
    } catch (error) {
      console.error("Error approving substitution:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/substitutions/:id/reject", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can reject substitutions
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      const substitutionId = req.params.id;
      const substitution = await storage.getSubstitution(substitutionId);
      
      if (!substitution) {
        return res.status(404).json({ message: "Substitution not found" });
      }

      if (substitution.status !== "pending") {
        return res.status(400).json({ message: "Substitution is not pending approval" });
      }

      // Update substitution status to rejected
      await storage.updateSubstitution(substitutionId, {
        status: "rejected"
      });

      res.json({ message: "Substitution rejected successfully", substitution });
    } catch (error) {
      console.error("Error rejecting substitution:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // New endpoint for rejected substitutions
  app.get("/api/substitutions/rejected", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const { date, weekStart, weekEnd } = req.query;
      
      // Only school admins and super admins can view rejected substitutions
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      const schoolId = user.role === 'super_admin' ? req.query.schoolId : user.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: "School ID is required" });
      }

      // Get all rejected substitutions for the school
      const allSubstitutions = await storage.getSubstitutions();
      let rejectedSubstitutions = allSubstitutions.filter(sub => {
        return sub.status === "rejected" && sub.isAutoGenerated;
      });

      // Filter by date or week range if provided
      if (date) {
        const targetDate = new Date(date as string).toISOString().split('T')[0];
        rejectedSubstitutions = rejectedSubstitutions.filter(sub => {
          const subDate = new Date(sub.date).toISOString().split('T')[0];
          return subDate === targetDate;
        });
      } else if (weekStart && weekEnd) {
        const startDate = new Date(weekStart as string);
        const endDate = new Date(weekEnd as string);
        rejectedSubstitutions = rejectedSubstitutions.filter(sub => {
          const subDate = new Date(sub.date);
          return subDate >= startDate && subDate <= endDate;
        });
      }

      // Enrich with additional data (teacher names, class info, subject info)
      const enrichedSubstitutions = [];
      
      for (const sub of rejectedSubstitutions) {
        try {
          const originalTeacher = await storage.getTeacher(sub.originalTeacherId);
          const substituteTeacher = sub.substituteTeacherId ? await storage.getTeacher(sub.substituteTeacherId) : null;
          const timetableEntry = await storage.getTimetableEntry(sub.timetableEntryId);
          
          if (originalTeacher && timetableEntry && originalTeacher.schoolId === schoolId) {
            const classData = await storage.getClass(timetableEntry.classId);
            const subjectData = await storage.getSubject(timetableEntry.subjectId);
            
            enrichedSubstitutions.push({
              ...sub,
              originalTeacherName: originalTeacher.name,
              substituteTeacherName: substituteTeacher?.name || null,
              className: classData ? `${classData.grade}${classData.section ? `-${classData.section}` : ''}` : 'Unknown',
              subjectName: subjectData?.name || 'Unknown',
              day: timetableEntry.day,
              period: timetableEntry.period,
              startTime: timetableEntry.startTime,
              endTime: timetableEntry.endTime,
              classId: timetableEntry.classId
            });
          }
        } catch (error) {
          console.error(`Error enriching rejected substitution ${sub.id}:`, error);
        }
      }

      res.json(enrichedSubstitutions);
    } catch (error) {
      console.error("Error fetching rejected substitutions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Timetable changes endpoints
  app.get("/api/timetable-changes", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const { date } = req.query;
      
      // Only school admins and super admins can view timetable changes
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      const schoolId = user.role === 'super_admin' ? req.query.schoolId : user.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: "School ID is required" });
      }

      const changes = await storage.getTimetableChanges(schoolId, date);
      res.json(changes);
    } catch (error) {
      console.error("Error fetching timetable changes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/timetable-changes/active", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const { date } = req.query;
      
      // Only school admins and super admins can view active changes
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      const schoolId = user.role === 'super_admin' ? req.query.schoolId : user.schoolId;
      const changeDate = date || new Date().toISOString().split('T')[0];
      
      if (!schoolId) {
        return res.status(400).json({ message: "School ID is required" });
      }

      const changes = await storage.getActiveTimetableChanges(schoolId, changeDate);
      res.json(changes);
    } catch (error) {
      console.error("Error fetching active timetable changes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/timetable-changes/entry/:timetableEntryId", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can view changes by entry
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      const changes = await storage.getTimetableChangesByEntry(req.params.timetableEntryId);
      res.json(changes);
    } catch (error) {
      console.error("Error fetching timetable changes for entry:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/timetable-changes", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can create timetable changes
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      const validatedData = insertTimetableChangeSchema.parse(req.body);
      const change = await storage.createTimetableChange(validatedData);
      res.status(201).json(change);
    } catch (error) {
      console.error("Error creating timetable change:", error);
      res.status(400).json({ message: "Invalid timetable change data" });
    }
  });

  app.put("/api/timetable-changes/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can update timetable changes
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      const validatedData = insertTimetableChangeSchema.partial().parse(req.body);
      const change = await storage.updateTimetableChange(req.params.id, validatedData);
      res.json(change);
    } catch (error) {
      console.error("Error updating timetable change:", error);
      res.status(400).json({ message: "Invalid timetable change data" });
    }
  });

  app.delete("/api/timetable-changes/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can delete timetable changes
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      // Get the change details before deletion to check if it's approved
      const changes = await storage.getTimetableChanges(user.schoolId || "", undefined);
      const changeToDelete = changes.find(c => c.id === req.params.id);
      
      if (!changeToDelete) {
        return res.status(404).json({ message: "Timetable change not found" });
      }

      // If this is an approved change, just mark it as dismissed (hide from UI) but keep substitution active
      if (changeToDelete.approvedBy) {
        await storage.updateTimetableChange(req.params.id, {
          isActive: false  // Hide from UI but keep the substitution record intact
        });
        
        console.log(`Dismissed approved change notification ${req.params.id} - substitution remains active`);
      } else {
        // For unapproved changes, fully delete as before
        await storage.deleteTimetableChange(req.params.id);
        console.log(`Permanently deleted unapproved change ${req.params.id}`);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting timetable change:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Approve timetable change
  app.post("/api/timetable-changes/:id/approve", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can approve changes
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      const changeId = req.params.id;
      
      // Get the change details before deletion
      const changes = await storage.getTimetableChanges(user.schoolId || "", undefined);
      const changeToApprove = changes.find(c => c.id === changeId);
      
      if (!changeToApprove) {
        return res.status(404).json({ message: "Timetable change not found" });
      }

      // If this change has a substitute teacher, confirm the substitution (keep it active)
      if (changeToApprove.newTeacherId) {
        const substitutions = await storage.getSubstitutions();
        const relatedSubstitution = substitutions.find(sub => 
          sub.timetableEntryId === changeToApprove.timetableEntryId &&
          sub.originalTeacherId === changeToApprove.originalTeacherId &&
          sub.substituteTeacherId === changeToApprove.newTeacherId &&
          sub.status === "auto_assigned"
        );

        if (relatedSubstitution) {
          await storage.updateSubstitution(relatedSubstitution.id, {
            status: "confirmed"
          });
        }
      }

      // Log the approval before deletion
      await storage.createAuditLog({
        action: "approve_timetable_change",
        entityType: "timetable_changes",
        entityId: changeId,
        userId: user.id,
        description: `Approved and processed timetable change: ${changeToApprove.changeType} for ${changeToApprove.changeDate}`,
        schoolId: user.schoolId || ""
      });

      // Permanently delete the timetable change notification after approval
      await storage.deleteTimetableChange(changeId);

      res.json({ 
        message: "Timetable change approved and notification cleared"
      });
      
    } catch (error) {
      console.error("Error approving timetable change:", error);
      res.status(500).json({ message: "Failed to approve timetable change" });
    }
  });

  // Reject timetable change
  app.post("/api/timetable-changes/:id/reject", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can reject changes
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      const changeId = req.params.id;
      const { reason } = req.body;
      
      // Get the change details before deletion
      const changes = await storage.getTimetableChanges(user.schoolId || "", undefined);
      const changeToReject = changes.find(c => c.id === changeId);
      
      if (!changeToReject) {
        return res.status(404).json({ message: "Timetable change not found" });
      }

      // When rejecting, do NOT delete the substitution - this keeps the cell state unchanged
      // The timetable card disappears but the cell display remains the same

      // Permanently delete the timetable change
      await storage.deleteTimetableChange(changeId);

      // Log the rejection and deletion
      await storage.createAuditLog({
        action: "reject_timetable_change",
        entityType: "timetable_changes",
        entityId: changeId,
        userId: user.id,
        description: `Rejected and permanently deleted timetable change: ${changeToReject.changeType} for ${changeToReject.changeDate}. Reason: ${reason || 'No reason provided'}`,
        schoolId: user.schoolId || ""
      });

      res.json({ 
        message: "Timetable change rejected successfully"
      });
      
    } catch (error) {
      console.error("Error rejecting timetable change:", error);
      res.status(500).json({ message: "Failed to reject timetable change" });
    }
  });

  // Timetable validity period endpoints
  app.get("/api/timetable-validity", authMiddleware, async (req: any, res) => {
    try {
      const classId = req.query.classId as string;
      const periods = await storage.getTimetableValidityPeriods(classId);
      res.json(periods);
    } catch (error) {
      console.error("Error fetching timetable validity periods:", error);
      res.status(500).json({ message: "Failed to fetch validity periods" });
    }
  });

  app.get("/api/timetable-validity/:id", authMiddleware, async (req: any, res) => {
    try {
      const period = await storage.getTimetableValidityPeriod(req.params.id);
      if (!period) {
        return res.status(404).json({ message: "Validity period not found" });
      }
      res.json(period);
    } catch (error) {
      console.error("Error fetching validity period:", error);
      res.status(500).json({ message: "Failed to fetch validity period" });
    }
  });

  app.post("/api/timetable-validity", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can create validity periods
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { insertTimetableValidityPeriodSchema } = await import("@shared/schema");
      const validatedData = insertTimetableValidityPeriodSchema.parse(req.body);
      
      const period = await storage.createTimetableValidityPeriod(validatedData);
      res.status(201).json(period);
    } catch (error) {
      console.error("Error creating validity period:", error);
      res.status(400).json({ message: "Invalid validity period data" });
    }
  });

  app.put("/api/timetable-validity/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can update validity periods
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { insertTimetableValidityPeriodSchema } = await import("@shared/schema");
      const validatedData = insertTimetableValidityPeriodSchema.partial().parse(req.body);
      
      const period = await storage.updateTimetableValidityPeriod(req.params.id, validatedData);
      res.json(period);
    } catch (error) {
      console.error("Error updating validity period:", error);
      res.status(400).json({ message: "Failed to update validity period" });
    }
  });

  app.delete("/api/timetable-validity/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can delete validity periods
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteTimetableValidityPeriod(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting validity period:", error);
      res.status(500).json({ message: "Failed to delete validity period" });
    }
  });

  // CSV upload endpoints
  app.post("/api/upload/teachers", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const result = CSVProcessor.processTeachersCSV(csvContent);

      if (!result.success) {
        return res.status(400).json({ 
          message: "Failed to process CSV",
          errors: result.errors 
        });
      }

      // Save teachers to database
      const createdTeachers = [];
      const creationErrors = [];
      for (const teacherData of result.data) {
        try {
          const teacher = await storage.createTeacher(teacherData);
          createdTeachers.push(teacher);
        } catch (error) {
          console.error("Error creating teacher:", error);
          if (error && typeof error === 'object' && 'code' in error && 'constraint' in error) {
            if (error.code === '23505' && error.constraint === 'teachers_email_unique') {
              creationErrors.push(`Teacher with email ${teacherData.email} already exists`);
            } else {
              creationErrors.push(`Failed to create teacher: ${teacherData.name}`);
            }
          } else {
            creationErrors.push(`Failed to create teacher: ${teacherData.name}`);
          }
        }
      }

      const allErrors = [...result.errors, ...creationErrors];
      res.json({
        message: `Successfully processed ${createdTeachers.length} teachers${creationErrors.length > 0 ? ` with ${creationErrors.length} errors` : ''}`,
        teachers: createdTeachers,
        errors: allErrors
      });

    } catch (error) {
      console.error("Error uploading teachers:", error);
      res.status(500).json({ message: "Failed to upload teachers" });
    }
  });

  app.post("/api/upload/subjects", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const result = CSVProcessor.processSubjectsCSV(csvContent);

      if (!result.success) {
        return res.status(400).json({ 
          message: "Failed to process CSV",
          errors: result.errors 
        });
      }

      // Save subjects to database
      const createdSubjects = [];
      for (const subjectData of result.data) {
        try {
          // Ensure unique color for each subject code
          if (subjectData.code && !subjectData.color) {
            subjectData.color = generateColorForSubjectCode(subjectData.code);
          }
          const subject = await storage.createSubject(subjectData);
          createdSubjects.push(subject);
        } catch (error) {
          console.error("Error creating subject:", error);
        }
      }

      res.json({
        message: `Successfully processed ${createdSubjects.length} subjects`,
        subjects: createdSubjects,
        errors: result.errors
      });

    } catch (error) {
      console.error("Error uploading subjects:", error);
      res.status(500).json({ message: "Failed to upload subjects" });
    }
  });

  app.post("/api/upload/classes", authMiddleware, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const result = CSVProcessor.processClassesCSV(csvContent);

      if (!result.success) {
        return res.status(400).json({ 
          message: "Failed to process CSV",
          errors: result.errors 
        });
      }

      // Get user and schoolId for authentication
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Determine schoolId based on user role
      let schoolId: string;
      if (user.role === 'admin' && user.schoolId) {
        schoolId = user.schoolId;
      } else if (user.role === 'super_admin') {
        // Super admins should provide schoolId in request body or query
        schoolId = req.body.schoolId || req.query.schoolId;
        if (!schoolId) {
          return res.status(400).json({ message: "schoolId is required for super admin" });
        }
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      // Save classes to database
      const createdClasses = [];
      const errors: string[] = [];
      for (let i = 0; i < result.data.length; i++) {
        const classData = result.data[i];
        try {
          // Add schoolId to each class before saving
          const classWithSchool = {
            ...classData,
            schoolId
          };
          const classEntity = await storage.createClass(classWithSchool);
          createdClasses.push(classEntity);
        } catch (error) {
          console.error(`Error processing row ${i + 2}:`, error);
          errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      res.json({
        message: `Successfully processed ${createdClasses.length} classes`,
        classes: createdClasses,
        errors: result.errors
      });

    } catch (error) {
      console.error("Error uploading classes:", error);
      res.status(500).json({ message: "Failed to upload classes" });
    }
  });

  // Suggest substitute teachers
  app.get("/api/substitutions/suggest/:timetableEntryId", async (req, res) => {
    try {
      const { timetableEntryId } = req.params;
      
      // Get the timetable entry
      const timetableEntries = await storage.getTimetableEntries();
      const entry = timetableEntries.find(e => e.id === timetableEntryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Timetable entry not found" });
      }

      // Find available substitute teachers - need to get school from class
      const classes = await storage.getClasses();
      const classData = classes.find(c => c.id === entry.classId);
      const schoolId = classData?.schoolId || "";
      
      const availableTeachers = await storage.getAvailableTeachers(
        entry.day,
        entry.period,
        entry.subjectId,
        schoolId
      );

      res.json(availableTeachers);
    } catch (error) {
      console.error("Error suggesting substitute teachers:", error);
      res.status(500).json({ message: "Failed to suggest substitute teachers" });
    }
  });

  // Class Subject Assignments endpoints
  app.get("/api/class-subject-assignments", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const { classId } = req.query;
      
      // Ensure school-based filtering for admins
      let schoolId: string | undefined;
      if (user.role === 'admin' && user.schoolId) {
        schoolId = user.schoolId;
      }
      
      const assignments = await storage.getClassSubjectAssignments(classId, schoolId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching class subject assignments:", error);
      res.status(500).json({ message: "Failed to fetch class subject assignments" });
    }
  });

  app.post("/api/class-subject-assignments", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can create assignments
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertClassSubjectAssignmentSchema.parse(req.body);
      
      // Check if assignment already exists
      const existing = await storage.getClassSubjectAssignmentByClassAndSubject(
        validatedData.classId, 
        validatedData.subjectId
      );
      if (existing) {
        return res.status(400).json({ message: "Assignment already exists for this class and subject" });
      }

      const assignment = await storage.createClassSubjectAssignment(validatedData);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error creating class subject assignment:", error);
      res.status(400).json({ message: "Invalid assignment data" });
    }
  });

  app.put("/api/class-subject-assignments/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can update assignments
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const assignmentId = req.params.id;
      const updateData = req.body;
      
      const assignment = await storage.updateClassSubjectAssignment(assignmentId, updateData);
      res.json(assignment);
    } catch (error) {
      console.error("Error updating class subject assignment:", error);
      res.status(400).json({ message: "Invalid assignment data" });
    }
  });

  app.delete("/api/class-subject-assignments/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can delete assignments
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const assignmentId = req.params.id;
      await storage.deleteClassSubjectAssignment(assignmentId);
      res.json({ message: "Assignment deleted successfully" });
    } catch (error) {
      console.error("Error deleting class subject assignment:", error);
      res.status(500).json({ message: "Failed to delete assignment" });
    }
  });

  // Timetable Structure endpoints
  app.get("/api/timetable-structure", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Get timetable structure for the school
      let structure;
      if (user.role === 'super_admin') {
        const { schoolId } = req.query;
        structure = schoolId 
          ? await storage.getTimetableStructureBySchool(schoolId as string)
          : await storage.getTimetableStructures();
      } else if (user.schoolId) {
        structure = await storage.getTimetableStructureBySchool(user.schoolId);
      }
      
      res.json(structure);
    } catch (error) {
      console.error("Error fetching timetable structure:", error);
      res.status(500).json({ message: "Failed to fetch timetable structure" });
    }
  });

  app.post("/api/timetable-structure", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can create/update timetable structure
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertTimetableStructureSchema.parse(req.body);
      
      // Set schoolId if not provided (for school admins)
      if (user.role === 'admin' && user.schoolId) {
        validatedData.schoolId = user.schoolId;
      }

      // Check if structure already exists for this school
      const existingStructure = await storage.getTimetableStructureBySchool(validatedData.schoolId);
      
      let structure;
      if (existingStructure) {
        // Update existing structure
        structure = await storage.updateTimetableStructure(existingStructure.id, validatedData);
      } else {
        // Create new structure
        structure = await storage.createTimetableStructure(validatedData);
      }
      
      res.status(201).json(structure);
    } catch (error) {
      console.error("Error creating/updating timetable structure:", error);
      res.status(400).json({ message: "Invalid structure data" });
    }
  });

  app.put("/api/timetable-structure/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can update timetable structure
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const structureId = req.params.id;
      const updateData = req.body;
      
      // Check if structure exists and user has permission
      const existingStructure = await storage.getTimetableStructure(structureId);
      if (!existingStructure) {
        return res.status(404).json({ message: "Timetable structure not found" });
      }

      if (user.role === 'admin' && user.schoolId && existingStructure.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - structure not in your school" });
      }
      
      const structure = await storage.updateTimetableStructure(structureId, updateData);
      res.json(structure);
    } catch (error) {
      console.error("Error updating timetable structure:", error);
      res.status(400).json({ message: "Invalid structure data" });
    }
  });

  app.delete("/api/timetable-structure/:id", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can delete timetable structure
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const structureId = req.params.id;
      
      // Check if structure exists and user has permission
      const existingStructure = await storage.getTimetableStructure(structureId);
      if (!existingStructure) {
        return res.status(404).json({ message: "Timetable structure not found" });
      }

      if (user.role === 'admin' && user.schoolId && existingStructure.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - structure not in your school" });
      }
      
      await storage.deleteTimetableStructure(structureId);
      res.json({ message: "Timetable structure deleted successfully" });
    } catch (error) {
      console.error("Error deleting timetable structure:", error);
      res.status(500).json({ message: "Failed to delete timetable structure" });
    }
  });

  // Timetable generation endpoints
  app.post("/api/timetable/generate", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can generate timetables
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Optional class ID parameter for generating timetable for specific class
      const { classId } = req.body;

      // Prevent caching to ensure fresh data
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');

      const result = await scheduler.generateTimetable(classId, user.schoolId);
      res.json(result);
    } catch (error) {
      console.error("Error generating timetable:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to generate timetable" 
      });
    }
  });

  // Set as Global Timetable - Promote weekly timetable to global timetable
  app.post("/api/timetable/set-as-global", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can update global timetable
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { classId, date } = req.body;
      
      if (!classId || !date) {
        return res.status(400).json({ message: "classId and date are required" });
      }

      // Validate date format and range
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({ 
          message: "Invalid date format. Expected YYYY-MM-DD format" 
        });
      }

      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date provided" });
      }

      // Verify class access
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (user.role === 'admin' && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Calculate week start from provided date (Monday as start of week)
      // Use fully UTC-consistent approach to avoid timezone bugs
      const d = new Date(date + 'T00:00:00Z'); // Parse as UTC
      const dow = d.getUTCDay(); // Use UTC day of week
      const offset = (dow + 6) % 7; // Monday=0, Sunday=6
      const weekStart = new Date(Date.UTC(
        d.getUTCFullYear(), 
        d.getUTCMonth(), 
        d.getUTCDate() - offset
      ));
      
      // Normalize to midnight UTC to ensure consistent date handling
      weekStart.setUTCHours(0, 0, 0, 0);

      // Get the weekly timetable for this class and week with comprehensive error handling
      let weeklyTimetable;
      try {
        weeklyTimetable = await storage.getWeeklyTimetable(classId, weekStart);
      } catch (error) {
        console.error("Error retrieving weekly timetable:", error);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to retrieve weekly timetable from database"
        });
      }
      
      if (!weeklyTimetable) {
        console.log(`No weekly timetable found for class ${classId} and week starting ${weekStart.toISOString().split('T')[0]}`);
        return res.status(400).json({ 
          success: false, 
          message: "No weekly timetable found for this class and week. There are no modifications to promote to global schedule." 
        });
      }

      // Validate that the weekly timetable has actual data
      if (!weeklyTimetable.timetableData || !Array.isArray(weeklyTimetable.timetableData) || 
          weeklyTimetable.timetableData.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Weekly timetable exists but contains no timetable data to promote"
        });
      }

      // Count valid entries before promotion
      const validEntries = weeklyTimetable.timetableData.filter(entry => 
        entry.teacherId && entry.subjectId
      );
      
      if (validEntries.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Weekly timetable contains no valid entries to promote to global schedule"
        });
      }

      console.log(`Promoting weekly timetable ${weeklyTimetable.id} with ${validEntries.length} valid entries to global`);

      // Promote the weekly timetable to global with comprehensive error handling
      try {
        await storage.promoteWeeklyTimetableToGlobal(weeklyTimetable.id);
        console.log(`Successfully promoted weekly timetable ${weeklyTimetable.id} to global`);
      } catch (error) {
        console.error("Error promoting weekly timetable to global:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to promote weekly timetable to global schedule: " + 
                   (error instanceof Error ? error.message : "Unknown error")
        });
      }
      
      // Deactivate the weekly timetable since it's now part of the global schedule
      try {
        await storage.updateWeeklyTimetable(weeklyTimetable.id, { isActive: false });
        console.log(`Successfully deactivated weekly timetable ${weeklyTimetable.id}`);
      } catch (error) {
        console.error("Error deactivating weekly timetable:", error);
        // Log the error but don't fail the request since the promotion succeeded
        console.warn("Weekly timetable promotion succeeded but failed to deactivate the weekly record");
      }
      
      // Use the previously calculated valid entries count for response
      const entriesCount = validEntries.length;
      
      console.log(`Set as Global operation completed successfully for class ${classId}, promoted ${entriesCount} entries`);
      
      res.json({ 
        success: true, 
        message: "Weekly timetable has been promoted to Global Timetable successfully",
        entriesUpdated: entriesCount,
        weekStartDate: weekStart.toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Error setting as global timetable:", error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to update global timetable"
      });
    }
  });

  // Copy from Global Timetable - Copy global timetable to weekly timetable
  app.post("/api/timetable/copy-from-global", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can copy global to weekly
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { classId, date } = req.body;
      
      if (!classId || !date) {
        return res.status(400).json({ message: "classId and date are required" });
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ message: "Invalid date format. Expected YYYY-MM-DD" });
      }

      // Validate that the date can be parsed
      try {
        new Date(date + 'T00:00:00Z');
      } catch (error) {
        return res.status(400).json({ message: "Invalid date provided" });
      }

      // Verify class exists and user has access
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (user.role === 'admin' && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Calculate week start from provided date (Monday as start of week)
      // Use fully UTC-consistent approach to avoid timezone bugs
      const d = new Date(date + 'T00:00:00Z'); // Parse as UTC
      const dow = d.getUTCDay(); // Use UTC day of week
      const offset = (dow + 6) % 7; // Monday=0, Sunday=6
      const weekStart = new Date(Date.UTC(
        d.getUTCFullYear(), 
        d.getUTCMonth(), 
        d.getUTCDate() - offset
      ));
      
      // Normalize to midnight UTC to ensure consistent date handling
      weekStart.setUTCHours(0, 0, 0, 0);

      // Get the global timetable for this class
      let globalTimetable;
      try {
        globalTimetable = await storage.getTimetableForClass(classId);
      } catch (error) {
        console.error("Error retrieving global timetable:", error);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to retrieve global timetable from database"
        });
      }
      
      if (!globalTimetable || globalTimetable.length === 0) {
        console.log(`No global timetable found for class ${classId}`);
        return res.status(400).json({ 
          success: false, 
          message: "No global timetable found for this class. Generate a timetable first." 
        });
      }

      // Count valid entries in global timetable
      const validEntries = globalTimetable.filter(entry => 
        entry.teacherId && entry.subjectId
      );
      
      if (validEntries.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Global timetable contains no valid entries to copy"
        });
      }

      console.log(`Copying global timetable for class ${classId} (${validEntries.length} entries) to week starting ${weekStart.toISOString().split('T')[0]}`);

      // Copy global timetable to weekly timetable (this will overwrite existing weekly data)
      try {
        // Check if a weekly timetable already exists for this class and week
        const existingWeeklyTimetable = await storage.getWeeklyTimetable(classId, weekStart);
        
        // Prepare timetable data from global entries (convert to weekly format)
        const weeklyTimetableData = globalTimetable.map(entry => ({
          day: entry.day,
          period: entry.period,
          startTime: entry.startTime,
          endTime: entry.endTime,
          teacherId: entry.teacherId,
          subjectId: entry.subjectId,
          room: entry.room,
          isModified: false // These are fresh copies from global
        }));
        
        if (existingWeeklyTimetable) {
          // Update existing weekly timetable with global data
          await storage.updateWeeklyTimetable(existingWeeklyTimetable.id, {
            timetableData: weeklyTimetableData,
            basedOnGlobalVersion: '1', // Mark as fresh copy from global
            modificationCount: 0,
            isActive: true
          });
          console.log(`Successfully updated existing weekly timetable ${existingWeeklyTimetable.id} with global data for class ${classId}, week ${weekStart.toISOString().split('T')[0]}`);
        } else {
          // Create new weekly timetable from global data
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6); // Sunday
          
          await storage.createWeeklyTimetable({
            classId: classId,
            weekStart: weekStart.toISOString().split('T')[0],
            weekEnd: weekEnd.toISOString().split('T')[0],
            timetableData: weeklyTimetableData,
            modifiedBy: user.id,
            modificationCount: 0,
            basedOnGlobalVersion: '1',
            schoolId: user.schoolId || classData.schoolId,
            isActive: true
          });
          console.log(`Successfully created new weekly timetable from global data for class ${classId}, week ${weekStart.toISOString().split('T')[0]}`);
        }
      } catch (error) {
        console.error("Error copying global timetable to weekly:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to copy global timetable to weekly schedule: " + 
                   (error instanceof Error ? error.message : "Unknown error")
        });
      }
      
      // Use the previously calculated valid entries count for response
      const entriesCount = validEntries.length;
      
      console.log(`Copy from Global operation completed successfully for class ${classId}, copied ${entriesCount} entries`);
      
      res.json({ 
        success: true, 
        message: "Global timetable has been copied to weekly schedule successfully",
        entriesCopied: entriesCount,
        weekStartDate: weekStart.toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Error copying from global timetable:", error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to copy from global timetable"
      });
    }
  });

  // Validate Timetable
  app.get("/api/timetable/validate", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can validate timetables
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const validation = await scheduler.validateTimetable();
      res.json(validation);
    } catch (error) {
      console.error("Error validating timetable:", error);
      res.status(500).json({ 
        isValid: false, 
        conflicts: ["Unable to validate timetable due to system error"]
      });
    }
  });

  app.get("/api/timetable/suggestions", authMiddleware, async (req: any, res) => {
    try {
      const suggestions = await scheduler.suggestOptimizations();
      res.json({ suggestions });
    } catch (error) {
      console.error("Error getting timetable suggestions:", error);
      res.status(500).json({ message: "Failed to get suggestions" });
    }
  });

  // Advanced Teacher Management Routes

  // Get teacher schedule
  app.get("/api/teachers/:teacherId/schedule", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const { teacherId } = req.params;
      const { date } = req.query;

      // Verify teacher belongs to user's school
      const teacher = await storage.getTeacher(teacherId);
      if (!teacher || (user.role !== 'super_admin' && teacher.schoolId !== user.schoolId)) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      const schedule = await storage.getTeacherSchedule(teacherId, date);
      
      // Get related data with proper school filtering
      let schoolId: string | undefined;
      if (user.role === 'admin' && user.schoolId) {
        schoolId = user.schoolId;
      }

      // For teacher schedule, we should use the teacher's school to get subjects
      const teacherSchoolId = teacher.schoolId;

      const [subjects, classes] = await Promise.all([
        storage.getSubjects(teacherSchoolId),
        storage.getClasses(teacherSchoolId),
      ]);

      // Enrich schedule with related data
      const detailedSchedule = schedule.map(entry => {
        const subject = subjects.find(s => s.id === entry.subjectId);
        const classData = classes.find(c => c.id === entry.classId);

        return {
          ...entry,
          subject: subject ? {
            id: subject.id,
            name: subject.name,
            code: subject.code,
            color: subject.color
          } : null,
          class: classData ? {
            id: classData.id,
            grade: classData.grade,
            section: classData.section
          } : null,
        };
      });

      res.json(detailedSchedule);
    } catch (error) {
      console.error("Error getting teacher schedule:", error);
      res.status(500).json({ message: "Failed to get teacher schedule" });
    }
  });

  // Teacher workload analytics
  app.get("/api/analytics/teacher-workload", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can view analytics
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const analytics = await storage.getTeacherWorkloadAnalytics(user.schoolId);
      res.json(analytics);
    } catch (error) {
      console.error("Error getting teacher workload analytics:", error);
      res.status(500).json({ message: "Failed to get teacher workload analytics" });
    }
  });

  // Optimize teacher workload
  app.post("/api/analytics/optimize-workload", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can optimize workload
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const result = await scheduler.optimizeTeacherWorkload(user.schoolId);
      res.json(result);
    } catch (error) {
      console.error("Error optimizing teacher workload:", error);
      res.status(500).json({ message: "Failed to optimize teacher workload" });
    }
  });

  // Enhanced Substitution Routes

  // Get absent teacher alerts
  app.get("/api/substitutions/alerts", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const { date } = req.query;
      
      // Only school admins and super admins can view alerts
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const currentDate = date || new Date().toISOString().split('T')[0];
      const alerts = await storage.getAbsentTeacherAlerts(user.schoolId, currentDate);
      res.json(alerts);
    } catch (error) {
      console.error("Error getting absent teacher alerts:", error);
      res.status(500).json({ message: "Failed to get absent teacher alerts" });
    }
  });

  // Find substitute teachers
  app.get("/api/substitutions/find-substitutes", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const { originalTeacherId, timetableEntryId, date } = req.query;
      
      // Only school admins and super admins can find substitutes
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!originalTeacherId || !timetableEntryId || !date) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const substitutes = await storage.findSubstituteTeachers(
        originalTeacherId as string,
        timetableEntryId as string,
        date as string
      );
      res.json(substitutes);
    } catch (error) {
      console.error("Error finding substitute teachers:", error);
      res.status(500).json({ message: "Failed to find substitute teachers" });
    }
  });

  // Auto-assign substitute
  app.post("/api/substitutions/auto-assign", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can auto-assign substitutes
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { timetableEntryId, date, reason } = req.body;

      if (!timetableEntryId || !date || !reason) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const result = await storage.autoAssignSubstitute(
        timetableEntryId,
        date,
        reason,
        user.id
      );
      res.json(result);
    } catch (error) {
      console.error("Error auto-assigning substitute:", error);
      res.status(500).json({ message: "Failed to auto-assign substitute" });
    }
  });

  // Manual Assignment Endpoints

  // Get available teachers for manual assignment to a timetable slot
  app.get("/api/timetable/available-teachers", authMiddleware, async (req: any, res) => {
    // Disable ALL caching for this endpoint
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('ETag', `debug-${Date.now()}`); // Force unique response
    
    try {
      const user = req.user;
      const { classId, day, period, date, subjectId } = req.query;

      console.log(`[TEACHER API] Request: classId=${classId}, day=${day}, period=${period}, date=${date}, subjectId=${subjectId}`);

      // Only school admins and super admins can view available teachers
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!classId || !day || !period) {
        return res.status(400).json({ message: "classId, day, and period are required" });
      }

      // Verify class belongs to user's school
      const classData = await storage.getClass(classId as string);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }

      console.log(`[TEACHER API] Class found: ${classData.grade}, schoolId: ${classData.schoolId}`);

      if (user.role === 'admin' && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }

      // Get teachers who can teach the selected subject
      console.log(`[TEACHER API] Getting teachers for schoolId: ${classData.schoolId}, subjectId: ${subjectId}`);
      
      // Step 1: Get all teachers who can teach this subject
      let availableTeachers: any[] = [];
      
      if (subjectId) {
        // Get all teachers in the school
        const allTeachers = await storage.getTeachers(classData.schoolId);
        console.log(`[TEACHER API DEBUG] Found ${allTeachers.length} total teachers in school`);
        
        // Filter teachers who have this subject in their subjects array
        const qualifiedTeachers = allTeachers.filter(teacher => {
          console.log(`[TEACHER API DEBUG] Checking teacher ${teacher.name} (ID: ${teacher.id})`);
          console.log(`[TEACHER API DEBUG] Raw subjects data:`, teacher.subjects, `(type: ${typeof teacher.subjects})`);
          
          // Handle different possible formats of subjects data
          let teacherSubjects: string[] = [];
          
          if (Array.isArray(teacher.subjects)) {
            teacherSubjects = teacher.subjects;
            console.log(`[TEACHER API DEBUG] Parsed as array:`, teacherSubjects);
          } else if (typeof teacher.subjects === 'string') {
            try {
              // First attempt: direct JSON parse
              teacherSubjects = JSON.parse(teacher.subjects);
              console.log(`[TEACHER API DEBUG] Parsed from JSON string:`, teacherSubjects);
            } catch (e) {
              console.log(`[TEACHER API DEBUG] First JSON parse failed, trying to fix double-escaped quotes`);
              try {
                // Second attempt: fix double-escaped quotes and parse again
                const fixedJsonString = teacher.subjects.replace(/""/g, '"');
                teacherSubjects = JSON.parse(fixedJsonString);
                console.log(`[TEACHER API DEBUG] Fixed double-escaped quotes and parsed:`, teacherSubjects);
              } catch (e2) {
                console.log(`[TEACHER API DEBUG] Both JSON parse attempts failed:`, e2.message);
                teacherSubjects = [];
              }
            }
          } else if (teacher.subjects && typeof teacher.subjects === 'object') {
            teacherSubjects = Object.values(teacher.subjects) as string[];
            console.log(`[TEACHER API DEBUG] Extracted from object:`, teacherSubjects);
          } else {
            console.log(`[TEACHER API DEBUG] No subjects data or unknown format`);
          }
          
          console.log(`[TEACHER API DEBUG] Teacher ${teacher.name} final subjects:`, teacherSubjects, `Looking for: ${subjectId}`);
          const isQualified = teacherSubjects.includes(subjectId as string);
          console.log(`[TEACHER API DEBUG] Teacher ${teacher.name} qualified: ${isQualified}`);
          return isQualified;
        });
        
        console.log(`[TEACHER API] Found ${qualifiedTeachers.length} teachers qualified for subject:`, qualifiedTeachers.map(t => t.name));
        
        // Step 2: Filter out teachers who are busy during this time slot
        const busyTeachers = await storage.getTimetableEntries();
        const conflictingEntries = busyTeachers.filter((entry: any) => {
          const dayMatch = entry.day.toLowerCase() === day.toLowerCase();
          const periodMatch = entry.period === parseInt(period as string);
          const differentClass = entry.classId !== classId;
          return dayMatch && periodMatch && differentClass;
        });
        
        const busyTeacherIds = new Set(conflictingEntries.map((entry: any) => entry.teacherId));
        console.log(`[TEACHER API] Found ${conflictingEntries.length} busy teachers during ${day} period ${period}`);
        
        // Return only qualified AND free teachers
        availableTeachers = qualifiedTeachers.filter(teacher => !busyTeacherIds.has(teacher.id));
        
      } else {
        // If no subject selected, return all free teachers in the school
        const allTeachers = await storage.getTeachers(classData.schoolId);
        const busyTeachers = await storage.getTimetableEntries();
        const busyTeacherIds = new Set(
          busyTeachers
            .filter((entry: any) => 
              entry.day === day && 
              entry.period === parseInt(period as string) && 
              entry.classId !== classId
            )
            .map((entry: any) => entry.teacherId)
        );
        
        availableTeachers = allTeachers.filter(teacher => !busyTeacherIds.has(teacher.id));
      }

      // Step 2.5: Filter out absent teachers if date is provided
      if (date && typeof date === 'string') {
        console.log(`[TEACHER API] Filtering out absent teachers for date: ${date}`);
        const presentTeachers = [];
        
        for (const teacher of availableTeachers) {
          const isAbsent = await storage.isTeacherAbsent(teacher.id, date);
          if (!isAbsent) {
            presentTeachers.push(teacher);
          } else {
            console.log(`[TEACHER API] Filtering out absent teacher: ${teacher.name} (ID: ${teacher.id}) for date: ${date}`);
          }
        }
        
        availableTeachers = presentTeachers;
        console.log(`[TEACHER API] After filtering absent teachers: ${availableTeachers.length} teachers remain`);
      }

      // Step 3: Prioritize teachers already teaching this class
      const classTeachers = await storage.getTeachersForClass(classId as string);
      const classTeacherIds = new Set(classTeachers.map((t: any) => t.id));

      const result = availableTeachers.map(teacher => ({
        ...teacher,
        priority: classTeacherIds.has(teacher.id) ? 1 : 2,
        teachingThisClass: classTeacherIds.has(teacher.id)
      })).sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));

      console.log(`[TEACHER API] SUCCESS - Returning ${result.length} available teachers:`, result.map(t => t.name));
      res.json(result);
    } catch (error) {
      console.error("[TEACHER API] ERROR:", error);
      res.status(500).json({ message: "Failed to get available teachers" });
    }
  });

  // Manually assign teacher to a weekly timetable slot
  app.post("/api/timetable/manual-assign", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;

      // Only school admins and super admins can manually assign teachers
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { 
        newTeacherId, 
        classId, 
        subjectId, 
        day, 
        period, 
        startTime, 
        endTime, 
        room, 
        reason,
        weekStart // Required for weekly timetable operations
      } = req.body;

      // Validate required fields for weekly timetable operations
      if (!newTeacherId || !classId || !day || period === undefined || !weekStart) {
        return res.status(400).json({ message: "newTeacherId, classId, day, period, and weekStart are required" });
      }

      // Verify class belongs to user's school
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (user.role === 'admin' && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }

      // Date validation: only allow edits for current/future dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dayMap: Record<string, number> = {
        'monday': 0, 'tuesday': 1, 'wednesday': 2,
        'thursday': 3, 'friday': 4, 'saturday': 5, 'sunday': 6
      };
      
      const editWeekStart = new Date(weekStart);
      const dayOffset = dayMap[day.toLowerCase()] || 0;
      const editDate = new Date(editWeekStart);
      editDate.setDate(editWeekStart.getDate() + dayOffset);
      editDate.setHours(0, 0, 0, 0);

      if (editDate < today) {
        return res.status(400).json({ 
          message: "Cannot assign teachers for past dates. You can only assign teachers for today or future dates." 
        });
      }

      // Verify teacher exists and belongs to same school
      const teacher = await storage.getTeacher(newTeacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      if (teacher.schoolId !== classData.schoolId) {
        return res.status(403).json({ message: "Teacher does not belong to the same school as the class" });
      }

      // Check teacher availability for this weekly time slot by looking at global timetable
      console.log(`[WEEKLY ASSIGNMENT] Checking availability for teacher ${newTeacherId} on ${day} period ${period}`);
      const allTimetableEntries = await storage.getTimetableEntries();
      const conflictingEntry = allTimetableEntries.find((entry: any) => {
        const dayMatch = entry.day.toLowerCase() === day.toLowerCase();
        const periodMatch = entry.period === period;
        const sameTeacher = entry.teacherId === newTeacherId;
        const differentClass = entry.classId !== classId;
        
        return dayMatch && periodMatch && sameTeacher && differentClass;
      });
      
      if (conflictingEntry) {
        const conflictClass = await storage.getClass(conflictingEntry.classId);
        console.log(`[WEEKLY ASSIGNMENT] CONFLICT: Teacher ${newTeacherId} is teaching class ${conflictingEntry.classId} during ${day} period ${period}`);
        return res.status(409).json({ 
          message: `Teacher ${teacher.name} is already assigned to ${conflictClass?.grade}-${conflictClass?.section} at this time slot`,
          hasConflicts: true
        });
      }
      
      console.log(`[WEEKLY ASSIGNMENT] Teacher ${newTeacherId} is available for ${day} period ${period}`);

      // Calculate week end date
      const weekEnd = new Date(editWeekStart);
      weekEnd.setDate(editWeekStart.getDate() + 6);

      // Update the weekly timetable entry directly
      const result = await storage.updateWeeklyTimetableEntry(
        classId,
        weekStart,
        weekEnd.toISOString().split('T')[0],
        day,
        period,
        {
          teacherId: newTeacherId,
          subjectId: subjectId || null,
          startTime: startTime || null,
          endTime: endTime || null,
          room: room || null,
          isModified: true,
          modificationReason: reason || "Manual teacher assignment"
        },
        user.id
      );

      // Create audit log entry for weekly assignment
      await storage.createAuditLog({
        action: "weekly_teacher_assignment",
        entityType: "weekly_timetables",
        entityId: result.id || `${classId}-${weekStart}-${day}-${period}`,
        userId: user.id,
        description: `Assigned teacher ${teacher.name} to ${classData.grade}-${classData.section} for ${day} period ${period}, week ${weekStart}`,
        schoolId: classData.schoolId
      });

      res.json({ 
        success: true, 
        message: "Teacher assigned to weekly timetable successfully", 
        weeklyEntry: result 
      });
    } catch (error) {
      console.error("Error manually assigning teacher to weekly timetable:", error);
      res.status(500).json({ message: "Failed to assign teacher to weekly timetable" });
    }
  });

  // Weekly-only manual edit endpoint (bypasses approval workflow)
  app.post("/api/timetable/weekly-edit", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;

      // Only school admins and super admins can make weekly edits
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { 
        classId, 
        weekStart,
        day, 
        period, 
        teacherId, // null to delete assignment
        subjectId, // null to delete assignment
        startTime,
        endTime,
        room,
        reason = "Manual admin edit"
      } = req.body;

      // Validate required fields
      if (!classId || !weekStart || !day || period === undefined) {
        return res.status(400).json({ message: "classId, weekStart, day, and period are required" });
      }

      // Verify class belongs to user's school
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (user.role === 'admin' && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }

      // Simple date validation: allow edits for today or future dates only
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of today for comparison
      
      // Calculate the actual date being edited (weekStart + day offset)
      const dayMap: Record<string, number> = {
        'monday': 0,
        'tuesday': 1, 
        'wednesday': 2,
        'thursday': 3,
        'friday': 4,
        'saturday': 5,
        'sunday': 6
      };
      
      const editWeekStart = new Date(weekStart);
      const dayOffset = dayMap[day.toLowerCase()] || 0;
      const editDate = new Date(editWeekStart);
      editDate.setDate(editWeekStart.getDate() + dayOffset);
      editDate.setHours(0, 0, 0, 0); // Set to start of day for comparison

      console.log(`[DATE VALIDATION] Today: ${today.toISOString()}`);
      console.log(`[DATE VALIDATION] Edit date (${day}): ${editDate.toISOString()}`);

      if (editDate < today) {
        return res.status(400).json({ 
          message: "Cannot edit timetable entries for past dates. You can only edit entries for today or future dates." 
        });
      }

      // Calculate week end date (Sunday)
      const weekEnd = new Date(editWeekStart);
      weekEnd.setDate(editWeekStart.getDate() + 6);

      // If teacher is provided, verify they exist and belong to same school
      if (teacherId) {
        const teacher = await storage.getTeacher(teacherId);
        if (!teacher) {
          return res.status(404).json({ message: "Teacher not found" });
        }

        if (teacher.schoolId !== classData.schoolId) {
          return res.status(403).json({ message: "Teacher does not belong to the same school as the class" });
        }

        // Check for conflicts with other classes at the same time
        const globalTimetableEntries = await storage.getTimetableEntries();
        const conflictingEntry = globalTimetableEntries.find((entry: any) => {
          const dayMatch = entry.day.toLowerCase() === day.toLowerCase();
          const periodMatch = entry.period === period;
          const sameTeacher = entry.teacherId === teacherId;
          const differentClass = entry.classId !== classId;
          
          return dayMatch && periodMatch && sameTeacher && differentClass;
        });

        if (conflictingEntry) {
          const conflictClass = await storage.getClass(conflictingEntry.classId);
          return res.status(409).json({ 
            message: `Teacher ${teacher.name} is already assigned to ${conflictClass?.grade}-${conflictClass?.section} at this time slot`,
            hasConflicts: true
          });
        }
      }

      // Update or create the weekly timetable entry
      const result = await storage.updateWeeklyTimetableEntry(
        classId,
        weekStart,
        weekEnd.toISOString().split('T')[0],
        day,
        period,
        {
          teacherId,
          subjectId,
          startTime,
          endTime,
          room,
          isModified: true,
          modificationReason: reason
        },
        user.id
      );

      // Log the weekly edit (not as a timetable change)
      await storage.createAuditLog({
        action: "weekly_timetable_edit",
        entityType: "weekly_timetables",
        entityId: result.id,
        userId: user.id,
        description: `Manual weekly edit: ${teacherId ? 'Assigned' : 'Removed'} teacher for ${day} period ${period} in week ${weekStart}. Reason: ${reason}`,
        schoolId: user.schoolId || classData.schoolId
      });

      res.json({ 
        success: true, 
        message: "Weekly timetable updated successfully (no approval required)", 
        weeklyTimetableId: result.id,
        modificationCount: result.modificationCount
      });
    } catch (error) {
      console.error("Error updating weekly timetable:", error);
      res.status(500).json({ message: "Failed to update weekly timetable" });
    }
  });

  // Copy global timetable to weekly timetable endpoint
  app.post("/api/timetable/copy-global-to-weekly", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;

      // Only school admins and super admins can copy global to weekly
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { classId, weekStart, weekEnd } = req.body;

      // Validate required fields
      if (!classId || !weekStart || !weekEnd) {
        return res.status(400).json({ message: "classId, weekStart, and weekEnd are required" });
      }

      // Verify class belongs to user's school
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (user.role === 'admin' && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - class not in your school" });
      }

      // Get global timetable entries for this class
      const globalEntries = await storage.getTimetableEntries();
      const classGlobalEntries = globalEntries.filter((entry: any) => 
        entry.classId === classId && entry.isActive
      );

      if (classGlobalEntries.length === 0) {
        return res.status(404).json({ 
          message: "No global timetable found for this class. Please generate a global timetable first." 
        });
      }

      // Convert global entries to weekly timetable format
      const weeklyTimetableData = classGlobalEntries.map((entry: any) => ({
        day: entry.day,
        period: entry.period,
        teacherId: entry.teacherId,
        subjectId: entry.subjectId,
        startTime: entry.startTime,
        endTime: entry.endTime,
        room: entry.room,
        isModified: false // Initially not modified since it's copied from global
      }));

      // Create or update the weekly timetable
      const result = await storage.createOrUpdateWeeklyTimetable(
        classId,
        new Date(weekStart),
        weeklyTimetableData,
        user.id,
        classData.schoolId
      );

      // Log the action
      await storage.createAuditLog({
        action: "copy_global_to_weekly",
        entityType: "weekly_timetables",
        entityId: result.id,
        userId: user.id,
        description: `Copied global timetable to weekly timetable for class ${classData.grade}-${classData.section} for week ${weekStart}`,
        schoolId: user.schoolId || classData.schoolId
      });

      console.log(`[COPY GLOBAL TO WEEKLY] Successfully copied global timetable to weekly for class ${classId}, week ${weekStart}`);

      res.json({ 
        success: true, 
        message: "Global timetable copied to weekly successfully", 
        weeklyTimetableId: result.id,
        entriesCopied: weeklyTimetableData.length
      });
    } catch (error) {
      console.error("Error copying global timetable to weekly:", error);
      res.status(500).json({ message: "Failed to copy global timetable to weekly" });
    }
  });

  // Delete timetable entry endpoint
  app.delete("/api/timetable/entry/:entryId", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;

      // Only school admins and super admins can delete timetable entries
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { entryId } = req.params;
      const { date, permanent } = req.query;

      // Verify the timetable entry exists
      const entry = await storage.getTimetableEntry(entryId);
      if (!entry) {
        return res.status(404).json({ message: "Timetable entry not found" });
      }

      // Verify the entry's class belongs to user's school
      const classData = await storage.getClass(entry.classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (user.role === 'admin' && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied - entry not in your school" });
      }

      // If permanent=true, delete from global timetable permanently 
      if (permanent === 'true') {
        // Permanently delete the entry from global timetable
        await storage.deleteTimetableEntry(entryId);

        // Create audit log for permanent deletion
        await storage.createAuditLog({
          action: "delete_global_entry",
          entityType: "timetable_entries", 
          entityId: entryId,
          userId: user.id,
          description: `Permanently deleted global timetable entry: ${entry.day} period ${entry.period} for class ${entry.classId}`,
          schoolId: user.schoolId || classData.schoolId
        });

        return res.json({ 
          success: true, 
          message: "Timetable entry permanently deleted from global schedule",
          type: "permanent_deletion"
        });
      }

      // Otherwise, create a cancellation for specific week (original behavior)
      const cancellationDate = date ? new Date(date as string) : new Date();

      // Create a cancellation timetable change instead of deleting the entry
      // Don't set approvedBy/approvedAt to prevent auto-dismissal logic from treating it as a notification
      const cancellationChange = await storage.createTimetableChange({
        timetableEntryId: entryId,
        changeType: "cancellation",
        changeDate: cancellationDate.toISOString().split('T')[0],
        originalTeacherId: entry.teacherId,
        newTeacherId: null,
        reason: "Period cancelled by admin",
        changeSource: "manual",
        approvedBy: null, // Don't auto-approve to prevent dismissal
        approvedAt: null,
        isActive: true
      });

      // Create audit log entry for the cancellation
      await storage.createManualAssignmentAudit({
        timetableEntryId: entryId,
        classId: entry.classId,
        day: entry.day,
        period: entry.period,
        oldTeacherId: entry.teacherId,
        newTeacherId: null, // null indicates cancellation
        subjectId: entry.subjectId || null,
        changeReason: "Period cancelled by admin for specific week",
        assignedBy: user.id,
      });

      // Create or update weekly timetable snapshot after cancellation
      try {
        const currentWeek = new Date(cancellationDate);
        const weekStart = new Date(currentWeek);
        weekStart.setDate(currentWeek.getDate() - currentWeek.getDay() + 1); // Monday
        
        // Get current global timetable for this class
        const globalTimetable = await storage.getTimetableEntriesForClass(entry.classId);
        
        // Convert to weekly timetable format, marking cancelled period as null
        const weeklyTimetableData = globalTimetable.map((globalEntry: any) => {
          if (globalEntry.id === entryId) {
            // Mark this entry as cancelled (free period) for this week
            return {
              day: globalEntry.day,
              period: globalEntry.period,
              teacherId: null, // Cancelled - no teacher assigned
              subjectId: null, // Cancelled - no subject
              startTime: globalEntry.startTime,
              endTime: globalEntry.endTime,
              room: null,
              isModified: true,
              modificationReason: 'Period cancelled by admin',
            };
          } else {
            return {
              day: globalEntry.day,
              period: globalEntry.period,
              teacherId: globalEntry.teacherId,
              subjectId: globalEntry.subjectId,
              startTime: globalEntry.startTime,
              endTime: globalEntry.endTime,
              room: globalEntry.room,
              isModified: false,
            };
          }
        });
        
        await storage.createOrUpdateWeeklyTimetable(
          entry.classId,
          weekStart,
          weeklyTimetableData,
          user.id,
          classData.schoolId
        );
        
        console.log(`[WEEKLY TIMETABLE] Created/updated weekly timetable for class ${entry.classId}, week ${weekStart.toISOString().split('T')[0]} with cancellation`);
      } catch (weeklyError) {
        console.error('[WEEKLY TIMETABLE] Error creating weekly timetable:', weeklyError);
        // Don't fail the request if weekly timetable creation fails
      }

      res.json({ 
        success: true, 
        message: "Period cancelled for this week successfully",
        changeId: cancellationChange.id
      });
    } catch (error) {
      console.error("Error deleting timetable entry:", error);
      res.status(500).json({ message: "Failed to delete timetable entry" });
    }
  });

  // Audit Logs Routes

  // Get audit logs
  app.get("/api/audit-logs", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can view audit logs
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { limit } = req.query;
      const logs = await storage.getAuditLogs(user.schoolId, limit ? parseInt(limit as string) : 50);
      res.json(logs);
    } catch (error) {
      console.error("Error getting audit logs:", error);
      res.status(500).json({ message: "Failed to get audit logs" });
    }
  });

  // Create audit log (mainly for manual tracking)
  app.post("/api/audit-logs", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only school admins and super admins can create audit logs
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const auditData = {
        ...req.body,
        schoolId: user.schoolId,
        userId: user.id
      };

      const validatedData = insertAuditLogSchema.parse(auditData);
      const log = await storage.createAuditLog(validatedData);
      res.json(log);
    } catch (error) {
      console.error("Error creating audit log:", error);
      res.status(500).json({ message: "Failed to create audit log" });
    }
  });

  // Enhanced Timetable Management

  // Check teacher availability for substitution
  app.get("/api/teachers/:teacherId/availability", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const { teacherId } = req.params;
      const { day, period, date } = req.query;

      // Verify teacher belongs to user's school
      const teacher = await storage.getTeacher(teacherId);
      if (!teacher || (user.role !== 'super_admin' && teacher.schoolId !== user.schoolId)) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      if (!day || !period || !date) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const isAvailable = await scheduler.isTeacherAvailableForSubstitute(
        teacherId,
        day as string,
        parseInt(period as string),
        date as string
      );

      res.json({ available: isAvailable });
    } catch (error) {
      console.error("Error checking teacher availability:", error);
      res.status(500).json({ message: "Failed to check teacher availability" });
    }
  });

  // Bulk Import Routes
  
  // Download sample Excel template
  app.get("/api/bulk-import/template", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only allow admin users
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Create sample data structure showing both cases: with sections and without sections
      const sampleData = [
        {
          "Grade": "10",
          "Section": "A", 
          "Subject Names": "Mathematics,English,Science,History,Geography"
        },
        {
          "Grade": "10",
          "Section": "B",
          "Subject Names": "Mathematics,English,Science,History,Geography"
        },
        {
          "Grade": "11",
          "Section": "NA",
          "Subject Names": "Mathematics,English,Physics,Chemistry,Biology"
        },
        {
          "Grade": "12",
          "Section": "NA",
          "Subject Names": "Mathematics,English,Physics,Chemistry,Biology"
        }
      ];

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      
      // Add the worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Classes");

      // Generate buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // Set headers for file download with cache busting
      res.setHeader('Content-Disposition', 'attachment; filename="class_subjects_template.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      res.send(buffer);
    } catch (error) {
      console.error("Error generating template:", error);
      res.status(500).json({ message: "Failed to generate template" });
    }
  });

  // Upload and process Excel file
  app.post("/api/bulk-import/excel", authMiddleware, upload.single('file'), async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only allow admin users
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Check file type
      if (!req.file.originalname.match(/\.(xlsx|xls)$/i)) {
        return res.status(400).json({ error: "Please upload a valid Excel file (.xlsx or .xls)" });
      }

      // Parse Excel file
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (!data || data.length === 0) {
        return res.status(400).json({ error: "Excel file is empty or invalid" });
      }

      let classesCreated = 0;
      let subjectsCreated = 0;
      let assignmentsCreated = 0;
      const errors: string[] = [];

      // Get existing subjects for this school
      const existingSubjects = await storage.getSubjects(user.schoolId);
      
      // Track subjects per grade to ensure consistent codes across sections of same grade
      // But different codes across different grades
      const gradeSubjectMap = new Map<string, Map<string, { id: string; code: string }>>();

      for (let i = 0; i < data.length; i++) {
        try {
          const row = data[i];
          const rowNum = i + 2; // Excel row number (1-indexed + header)

          // Validate required fields - only Grade is required
          if (!row.Grade) {
            errors.push(`Row ${rowNum}: Grade is required`);
            continue;
          }

          const grade = row.Grade.toString();
          // Handle sections: "NA" means no section, otherwise use the provided value
          const section = (row.Section && row.Section.toString().toUpperCase() === "NA") ? "" : (row.Section || "").toString();

          // Check if class already exists
          const existingClass = await storage.checkClassExists(grade, section, user.schoolId);

          if (existingClass) {
            errors.push(`Row ${rowNum}: Class ${grade}${section ? `-${section}` : ''} already exists`);
            continue;
          }

          // Create class with minimal data
          const classData = {
            grade: grade,
            section: section,
            studentCount: 0, // Default value, not imported
            room: null, // Not imported
            schoolId: user.schoolId,
            requiredSubjects: []
          };

          const newClass = await storage.createClass(classData);
          classesCreated++;

          // Process subject names if provided
          if (row["Subject Names"]) {
            const subjectNames = row["Subject Names"].toString().split(',').map((name: string) => name.trim());
            
            // Initialize grade subject tracking if not exists
            if (!gradeSubjectMap.has(grade)) {
              gradeSubjectMap.set(grade, new Map());
            }
            const gradeSubjects = gradeSubjectMap.get(grade)!;

            for (const subjectName of subjectNames) {
              if (!subjectName) continue;

              const normalizedName = subjectName.toLowerCase();
              let subjectId: string;
              let subjectCode: string;

              // Check if this subject already exists for this specific grade
              if (gradeSubjects.has(normalizedName)) {
                // Use existing subject from this grade
                const gradeSubject = gradeSubjects.get(normalizedName)!;
                subjectId = gradeSubject.id;
                subjectCode = gradeSubject.code;
              } else {
                // Check if we can find an existing subject for this grade and name combination
                const existingSubjectForGrade = existingSubjects.find(s => 
                  s.name.toLowerCase() === normalizedName && s.code.includes(grade)
                );

                if (existingSubjectForGrade) {
                  // Found existing subject for this grade
                  subjectId = existingSubjectForGrade.id;
                  subjectCode = existingSubjectForGrade.code;
                  gradeSubjects.set(normalizedName, { id: subjectId, code: subjectCode });
                } else {
                  // Create new grade-specific subject with auto-generated code and unique color
                  subjectCode = await generateGradeSpecificSubjectCode(subjectName, grade, user.schoolId);
                  const uniqueColor = generateColorForSubjectCode(subjectCode);
                  
                  const newSubject = await storage.createSubject({
                    name: subjectName,
                    code: subjectCode,
                    schoolId: user.schoolId,
                    periodsPerWeek: 5, // Default value
                    color: uniqueColor
                  });
                  
                  subjectId = newSubject.id;
                  subjectsCreated++;
                  
                  // Add to grade tracking
                  gradeSubjects.set(normalizedName, { id: subjectId, code: subjectCode });
                }
              }

              // Create subject assignment
              await storage.createClassSubjectAssignment({
                classId: newClass.id,
                subjectId: subjectId,
                weeklyFrequency: 5, // Default value
                assignedTeacherId: null
              });
              assignmentsCreated++;
            }
          }

        } catch (error: any) {
          errors.push(`Row ${i + 2}: ${error.message}`);
        }
      }


      // Return results
      res.json({
        classesCreated,
        subjectsCreated,
        assignmentsCreated,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully imported ${classesCreated} classes, ${subjectsCreated} subjects, and ${assignmentsCreated} subject assignments`
      });

    } catch (error) {
      console.error("Error processing Excel file:", error);
      res.status(500).json({ error: "Failed to process Excel file" });
    }
  });

  // Default Periods Management Routes
  
  // Get subjects with default periods for school admin settings
  app.get("/api/subjects/default-periods", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only allow admin users
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get all subjects for the school with their default periods
      const subjects = await storage.getSubjects(user.schoolId);
      
      const subjectsWithDefaults = subjects.map(subject => ({
        id: subject.id,
        name: subject.name,
        code: subject.code,
        periodsPerWeek: subject.periodsPerWeek,
        color: subject.color
      }));

      res.json(subjectsWithDefaults);
    } catch (error) {
      console.error("Error fetching subjects with default periods:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  // Update default periods for subjects
  app.put("/api/subjects/default-periods", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only allow admin users
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const updates = req.body.updates; // Array of {id, periodsPerWeek}
      
      if (!Array.isArray(updates)) {
        return res.status(400).json({ message: "Updates must be an array" });
      }

      // Validate each update
      for (const update of updates) {
        if (!update.id || typeof update.periodsPerWeek !== 'number' || update.periodsPerWeek < 1 || update.periodsPerWeek > 20) {
          return res.status(400).json({ message: "Invalid update data. Periods per week must be between 1 and 20." });
        }
      }

      // Update each subject
      const results = [];
      for (const update of updates) {
        try {
          const updatedSubject = await storage.updateSubject(update.id, {
            periodsPerWeek: update.periodsPerWeek
          });
          results.push(updatedSubject);
        } catch (error) {
          console.error(`Error updating subject ${update.id}:`, error);
          throw error;
        }
      }

      res.json({ 
        message: `Successfully updated ${results.length} subjects`,
        updatedSubjects: results
      });
    } catch (error) {
      console.error("Error updating default periods:", error);
      res.status(500).json({ message: "Failed to update default periods" });
    }
  });

  // Update global default periods for all subjects
  app.put("/api/settings/global-default-periods", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only allow admin users
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { defaultPeriods, updateExisting } = req.body;
      
      if (typeof defaultPeriods !== 'number' || defaultPeriods < 1 || defaultPeriods > 20) {
        return res.status(400).json({ message: "Default periods must be between 1 and 20" });
      }

      // Get all subjects for the school
      const subjects = await storage.getSubjects(user.schoolId);
      
      if (subjects.length === 0) {
        return res.status(404).json({ message: "No subjects found for this school" });
      }

      // Update all subjects' default periods
      const subjectUpdatePromises = subjects.map(subject =>
        storage.updateSubject(subject.id, { periodsPerWeek: defaultPeriods })
      );
      
      await Promise.all(subjectUpdatePromises);

      // If requested, also update existing class-subject assignments
      let assignmentsUpdated = 0;
      if (updateExisting) {
        try {
          // Get all class-subject assignments for the school
          const allAssignments = await storage.getClassSubjectAssignments();
          const subjectIds = new Set(subjects.map(s => s.id));
          
          // Filter assignments that belong to this school's subjects
          const schoolAssignments = allAssignments.filter(assignment => 
            subjectIds.has(assignment.subjectId)
          );
          
          // Update each assignment
          const assignmentUpdatePromises = schoolAssignments.map(assignment =>
            storage.updateClassSubjectAssignment(assignment.id, { weeklyFrequency: defaultPeriods })
          );
          
          await Promise.all(assignmentUpdatePromises);
          assignmentsUpdated = schoolAssignments.length;
        } catch (error) {
          console.error("Error updating existing assignments:", error);
          // Don't fail the whole operation if assignment updates fail
        }
      }

      res.json({ 
        message: `Successfully updated ${subjects.length} subjects to ${defaultPeriods} periods per week` +
                 (updateExisting ? ` and ${assignmentsUpdated} existing class assignments` : ''),
        subjectsUpdated: subjects.length,
        assignmentsUpdated: updateExisting ? assignmentsUpdated : 0,
        newDefaultPeriods: defaultPeriods
      });
      
    } catch (error) {
      console.error("Error updating global default periods:", error);
      res.status(500).json({ message: "Failed to update global default periods" });
    }
  });

  // Get timetable freeze status for school
  app.get("/api/settings/timetable-freeze-status", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only allow admin users
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const school = await storage.getSchool(user.schoolId);
      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }

      res.json({ 
        timetableFrozen: school.timetableFrozen || false
      });
      
    } catch (error) {
      console.error("Error getting timetable freeze status:", error);
      res.status(500).json({ message: "Failed to get timetable freeze status" });
    }
  });

  // Freeze timetable changes for school
  app.put("/api/settings/freeze-timetable", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only allow admin users
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.updateSchool(user.schoolId, { timetableFrozen: true });

      res.json({ 
        message: "Timetable changes have been frozen successfully",
        timetableFrozen: true
      });
      
    } catch (error) {
      console.error("Error freezing timetable:", error);
      res.status(500).json({ message: "Failed to freeze timetable changes" });
    }
  });

  // Unfreeze timetable changes for school
  app.put("/api/settings/unfreeze-timetable", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only allow admin users
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.updateSchool(user.schoolId, { timetableFrozen: false });

      res.json({ 
        message: "Timetable changes have been unfrozen successfully",
        timetableFrozen: false
      });
      
    } catch (error) {
      console.error("Error unfreezing timetable:", error);
      res.status(500).json({ message: "Failed to unfreeze timetable changes" });
    }
  });

  // Get free teachers for today organized by periods
  app.get("/api/availability/free-teachers", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const { date } = req.query;
      
      // Use today if no date provided
      const selectedDate = date || new Date().toISOString().split('T')[0];
      const dateObj = new Date(selectedDate);
      const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      // Get all teachers for the school
      const teachers = await storage.getTeachers(user.schoolId);
      
      // Get timetable structure to know periods
      const timetableStructure = await storage.getTimetableStructure(user.schoolId);
      if (!timetableStructure || !timetableStructure.timeSlots) {
        return res.status(404).json({ message: "Timetable structure not found" });
      }
      
      // Filter out break periods
      const regularPeriods = timetableStructure.timeSlots.filter(slot => !slot.isBreak);
      
      // For each period, find which teachers are free
      const freeTeachersByPeriod = [];
      
      for (const timeSlot of regularPeriods) {
        const freeTeachers = [];
        
        for (const teacher of teachers) {
          if (!teacher.isActive) continue;
          
          const isAvailable = await storage.isTeacherAvailable(
            teacher.id, 
            dayOfWeek, 
            timeSlot.period, 
            selectedDate
          );
          
          if (isAvailable) {
            freeTeachers.push({
              id: teacher.id,
              name: teacher.name,
              email: teacher.email,
              subjects: teacher.subjects || []
            });
          }
        }
        
        freeTeachersByPeriod.push({
          period: timeSlot.period,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          freeTeachers: freeTeachers.sort((a, b) => a.name.localeCompare(b.name))
        });
      }
      
      res.json({
        date: selectedDate,
        dayOfWeek: dayOfWeek,
        periods: freeTeachersByPeriod
      });
      
    } catch (error) {
      console.error("Error fetching free teachers:", error);
      res.status(500).json({ message: "Failed to fetch free teachers for today" });
    }
  });

  // Weekly Timetable Routes

  // Get weekly timetable for a class and specific week
  app.get("/api/timetable/weekly/:classId", authMiddleware, async (req: any, res) => {
    // Disable caching for this endpoint to ensure auto-creation logic runs
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    try {
      const user = req.user;
      const { classId } = req.params;
      const { date } = req.query; // Date within the week
      
      console.log(`[WEEKLY API] Request for classId: ${classId}, date: ${date}`);

      // Verify class access
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (user.role === 'admin' && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Calculate week start from provided date or current date
      const targetDate = date ? new Date(date as string) : new Date();
      const weekStart = new Date(targetDate);
      weekStart.setDate(targetDate.getDate() - targetDate.getDay() + 1); // Monday

      // Try to get weekly timetable first
      let weeklyTimetable = await storage.getWeeklyTimetable(classId, weekStart);
      
      if (weeklyTimetable) {
        res.json({
          type: 'weekly',
          classId,
          weekStart: weekStart.toISOString().split('T')[0],
          data: weeklyTimetable,
          hasWeeklyOverrides: true
        });
      } else {
        // No weekly timetable exists - automatically create one from global schedule
        console.log(`[AUTO-CREATE WEEKLY] Creating weekly timetable for class ${classId}, week ${weekStart.toISOString().split('T')[0]} from global schedule`);
        
        // Get global timetable entries for this class
        const globalTimetable = await storage.getTimetableEntriesForClass(classId);
        
        if (globalTimetable && globalTimetable.length > 0) {
          // Convert global timetable entries to weekly timetable format
          const weeklyTimetableData = globalTimetable.map(entry => ({
            day: entry.day,
            period: entry.period,
            startTime: entry.startTime,
            endTime: entry.endTime,
            teacherId: entry.teacherId,
            subjectId: entry.subjectId,
            room: entry.room,
            isModified: false // Mark as unmodified since it's copied from global
          }));

          // Create the weekly timetable
          weeklyTimetable = await storage.createOrUpdateWeeklyTimetable(
            classId,
            weekStart,
            weeklyTimetableData,
            user.id,
            classData.schoolId
          );

          console.log(`[AUTO-CREATE WEEKLY] Successfully created weekly timetable with ${weeklyTimetableData.length} entries`);

          // Return the newly created weekly timetable
          res.json({
            type: 'weekly',
            classId,
            weekStart: weekStart.toISOString().split('T')[0],
            data: weeklyTimetable,
            hasWeeklyOverrides: true,
            autoCreated: true // Flag to indicate it was auto-created
          });
        } else {
          // No global timetable exists either - return empty weekly structure
          console.log(`[AUTO-CREATE WEEKLY] No global timetable found for class ${classId}, returning empty weekly structure`);
          
          res.json({
            type: 'weekly',
            classId,
            weekStart: weekStart.toISOString().split('T')[0],
            data: null,
            hasWeeklyOverrides: false,
            isEmpty: true
          });
        }
      }
    } catch (error) {
      console.error("Error fetching/creating weekly timetable:", error);
      res.status(500).json({ message: "Failed to fetch or create weekly timetable" });
    }
  });

  // Promote weekly timetable to global timetable
  app.post("/api/timetable/weekly/:weeklyTimetableId/promote", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const { weeklyTimetableId } = req.params;

      // Only school admins and super admins can promote timetables
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get the weekly timetable to verify access
      const weeklyTimetable = await storage.getWeeklyTimetable("", new Date()); // This won't work, need to fix the storage method
      // For now, let's implement a simpler approach by getting the weekly timetable by ID
      
      await storage.promoteWeeklyTimetableToGlobal(weeklyTimetableId);
      
      res.json({ 
        success: true, 
        message: "Weekly timetable promoted to global timetable successfully" 
      });
    } catch (error) {
      console.error("Error promoting weekly timetable:", error);
      res.status(500).json({ message: "Failed to promote weekly timetable" });
    }
  });

  // Enhanced timetable loader that prioritizes weekly timetables
  app.get("/api/timetable/enhanced/:classId", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const { classId } = req.params;
      const { date } = req.query; // Date within the week

      // Verify class access
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (user.role === 'admin' && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Calculate week start from provided date or current date
      const targetDate = date ? new Date(date as string) : new Date();
      const weekStart = new Date(targetDate);
      weekStart.setDate(targetDate.getDate() - targetDate.getDay() + 1); // Monday

      // Try to get weekly timetable first
      const weeklyTimetable = await storage.getWeeklyTimetable(classId, weekStart);
      
      if (weeklyTimetable) {
        // Return weekly timetable data formatted for frontend
        const formattedEntries = weeklyTimetable.timetableData.map((entry: any) => ({
          id: `weekly-${entry.day}-${entry.period}`, // Generate temporary ID
          classId,
          teacherId: entry.teacherId,
          subjectId: entry.subjectId,
          day: entry.day,
          period: entry.period,
          startTime: entry.startTime,
          endTime: entry.endTime,
          room: entry.room,
          isActive: true,
          isWeeklyOverride: true,
          isModified: entry.isModified || false,
          modificationReason: entry.modificationReason,
          createdAt: weeklyTimetable.createdAt,
          updatedAt: weeklyTimetable.updatedAt
        }));

        res.json({
          entries: formattedEntries,
          source: 'weekly',
          weekStart: weekStart.toISOString().split('T')[0],
          modifiedBy: weeklyTimetable.modifiedBy,
          modificationCount: weeklyTimetable.modificationCount
        });
      } else {
        // Fall back to global timetable with detailed info
        const globalEntries = await storage.getTimetableEntriesWithDetails();
        const classEntries = globalEntries.filter((entry: any) => entry.classId === classId);
        
        res.json({
          entries: classEntries.map((entry: any) => ({
            ...entry,
            isWeeklyOverride: false,
            isModified: false
          })),
          source: 'global',
          weekStart: weekStart.toISOString().split('T')[0],
          modifiedBy: null,
          modificationCount: 0
        });
      }
    } catch (error) {
      console.error("Error fetching enhanced timetable:", error);
      res.status(500).json({ message: "Failed to fetch enhanced timetable" });
    }
  });

  // Refresh Global Timetable Action
  app.post("/api/timetable/refresh-global/:classId", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const { classId } = req.params;

      // Only school admins and super admins can refresh global timetables
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Verify class access
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (user.role === 'admin' && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }

      console.log(`[REFRESH GLOBAL] Starting global timetable refresh for class ${classId}`);

      // Step 1: Delete global timetable and current/future weekly timetables (preserve past weeks for history)
      const deletionResult = await storage.deleteGlobalAndFutureWeeklyTimetables(classId);
      console.log(`[REFRESH GLOBAL] Deleted ${deletionResult.globalDeleted} global entries and ${deletionResult.weeklyDeleted} current/future weekly timetables`);

      // Step 2: Generate new global timetable using existing logic
      // Get class assignments and generate timetable
      const classAssignments = await storage.getClassSubjectAssignments(classId);
      const timetableStructure = await storage.getTimetableStructure(classData.schoolId);
      
      if (!timetableStructure) {
        return res.status(400).json({ message: "No timetable structure found for school" });
      }

      // Simple timetable generation logic (you can enhance this with AI later)
      const newTimetableEntries = [];
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      
      for (const assignment of classAssignments) {
        if (!assignment.assignedTeacherId) continue;
        
        const subject = assignment.subject;
        const periodsNeeded = assignment.weeklyFrequency;
        let periodsAssigned = 0;
        
        // Distribute periods across the week
        for (let dayIndex = 0; dayIndex < days.length && periodsAssigned < periodsNeeded; dayIndex++) {
          const day = days[dayIndex];
          const dailyPeriods = periodsNeeded <= 5 ? 1 : Math.ceil(periodsNeeded / 5);
          
          for (let p = 0; p < dailyPeriods && periodsAssigned < periodsNeeded; p++) {
            const period = (dayIndex * dailyPeriods + p + 1) % timetableStructure.periodsPerDay + 1;
            const timeSlot = timetableStructure.timeSlots.find((slot: any) => slot.period === period);
            
            if (timeSlot) {
              newTimetableEntries.push({
                classId,
                teacherId: assignment.assignedTeacherId,
                subjectId: subject.id,
                day: day as "monday" | "tuesday" | "wednesday" | "thursday" | "friday",
                period,
                startTime: timeSlot.startTime,
                endTime: timeSlot.endTime,
                room: null,
                isActive: true
              });
              periodsAssigned++;
            }
          }
        }
      }

      // Step 3: Save new global timetable entries
      if (newTimetableEntries.length > 0) {
        await storage.createMultipleTimetableEntries(newTimetableEntries);
      }

      console.log(`[REFRESH GLOBAL] Created ${newTimetableEntries.length} new global timetable entries`);

      // Step 4: Copy the same timetable into weekly timetable table for current week
      const currentWeek = new Date();
      const weekStart = new Date(currentWeek);
      weekStart.setDate(currentWeek.getDate() - currentWeek.getDay() + 1); // Monday
      
      const weeklyTimetableData = newTimetableEntries.map(entry => ({
        day: entry.day,
        period: entry.period,
        teacherId: entry.teacherId,
        subjectId: entry.subjectId,
        startTime: entry.startTime,
        endTime: entry.endTime,
        room: entry.room,
        isModified: false,
        modificationReason: 'Global timetable refresh'
      }));

      // Remove any existing weekly timetable for this class and week, then create new one
      const existingWeekly = await storage.getWeeklyTimetable(classId, weekStart);
      if (existingWeekly) {
        await storage.updateWeeklyTimetable(existingWeekly.id, {
          timetableData: weeklyTimetableData,
          modifiedBy: user.id,
          modificationCount: 1,
          basedOnGlobalVersion: 'latest-refresh'
        });
      } else {
        await storage.createWeeklyTimetable({
          classId,
          weekStart: weekStart.toISOString().split('T')[0],
          weekEnd: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          timetableData: weeklyTimetableData,
          modifiedBy: user.id,
          modificationCount: 1,
          basedOnGlobalVersion: 'latest-refresh',
          schoolId: classData.schoolId,
          isActive: true
        });
      }

      console.log(`[REFRESH GLOBAL] Copied global timetable to weekly for week ${weekStart.toISOString().split('T')[0]}`);

      res.json({
        success: true,
        message: "Global timetable refreshed and current/future weekly timetables updated successfully (past weeks preserved for history)",
        entriesCreated: newTimetableEntries.length,
        globalDeleted: deletionResult.globalDeleted,
        weeklyDeleted: deletionResult.weeklyDeleted,
        weekStart: weekStart.toISOString().split('T')[0]
      });

    } catch (error) {
      console.error("Error refreshing global timetable:", error);
      res.status(500).json({ message: "Failed to refresh global timetable" });
    }
  });

  // Set Weekly as Global Timetable
  app.post("/api/timetable/set-weekly-as-global/:classId", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const { classId } = req.params;
      const { date } = req.body; // Date within the week to promote

      // Only school admins and super admins can set weekly as global
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Verify class access
      const classData = await storage.getClass(classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }

      if (user.role === 'admin' && user.schoolId && classData.schoolId !== user.schoolId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Calculate week start from provided date or current date
      const targetDate = date ? new Date(date) : new Date();
      const weekStart = new Date(targetDate);
      weekStart.setDate(targetDate.getDate() - targetDate.getDay() + 1); // Monday

      // Get the weekly timetable to promote
      const weeklyTimetable = await storage.getWeeklyTimetable(classId, weekStart);
      if (!weeklyTimetable) {
        return res.status(404).json({ message: "No weekly timetable found for this week to promote" });
      }

      console.log(`[SET WEEKLY AS GLOBAL] Promoting weekly timetable for class ${classId}, week ${weekStart.toISOString().split('T')[0]} to global`);

      // Step 1: Deactivate current global timetable entries for this class
      await storage.deactivateTimetableEntriesForClass(classId);

      // Step 2: Create new global timetable entries from weekly timetable data
      if (weeklyTimetable.timetableData && Array.isArray(weeklyTimetable.timetableData)) {
        const newGlobalEntries = weeklyTimetable.timetableData
          .filter((entry: any) => entry.teacherId && entry.subjectId) // Only non-cancelled entries
          .map((entry: any) => ({
            classId,
            teacherId: entry.teacherId,
            subjectId: entry.subjectId,
            day: entry.day as "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday",
            period: entry.period,
            startTime: entry.startTime,
            endTime: entry.endTime,
            room: entry.room || null,
            isActive: true
          }));

        if (newGlobalEntries.length > 0) {
          await storage.createMultipleTimetableEntries(newGlobalEntries);
        }

        console.log(`[SET WEEKLY AS GLOBAL] Created ${newGlobalEntries.length} new global entries from weekly timetable`);

        // Step 3: Update the weekly timetable to mark it as the new baseline
        await storage.updateWeeklyTimetable(weeklyTimetable.id, {
          basedOnGlobalVersion: 'promoted-to-global',
          modificationCount: weeklyTimetable.modificationCount + 1
        });

        res.json({
          success: true,
          message: "Weekly timetable successfully promoted to global timetable",
          entriesPromoted: newGlobalEntries.length,
          weekStart: weekStart.toISOString().split('T')[0]
        });
      } else {
        res.status(400).json({ message: "Weekly timetable has no valid data to promote" });
      }

    } catch (error) {
      console.error("Error setting weekly as global:", error);
      res.status(500).json({ message: "Failed to set weekly timetable as global" });
    }
  });

  // Sample data generation endpoint for testing Student & Parent functionality
  app.post("/api/generate-sample-data", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only allow super_admin or admin to generate sample data
      if (!user || (user.role !== "super_admin" && user.role !== "admin")) {
        return res.status(403).json({ error: "Insufficient permissions. Only admins can generate sample data." });
      }

      console.log(`🌱 Sample data generation requested by: ${user.firstName} ${user.lastName} (${user.role})`);

      // Import and execute the sample data generator
      const { generateSampleStudentsAndParents } = await import("./seedSampleData");
      const result = await generateSampleStudentsAndParents();
      
      res.json({
        success: true,
        message: "Sample data generated successfully! Check console for login credentials.",
        data: {
          studentsCreated: result.students.length,
          parentsCreated: result.parents.length,
          school: result.school.name,
          classes: [
            `Grade ${result.classes.class5A.grade} Section ${result.classes.class5A.section}`,
            `Grade ${result.classes.class6B.grade} Section ${result.classes.class6B.section}`
          ]
        }
      });
    } catch (error) {
      console.error("❌ Error generating sample data:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to generate sample data",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Chat API endpoint
  app.post("/api/chat/process", authMiddleware, processChatMessage);
  
  // Excel download routes
  app.use("/api", authMiddleware, downloadExcelRouter);

  // Direct Intent Processing API endpoint for Chroney-Chrona middleware
  app.post("/api/process-intent", authMiddleware, async (req: any, res) => {
    try {
      // Validate request body
      const intentRequestSchema = z.object({
        intent: z.string().min(1, "Intent cannot be empty"),
        entities: z.record(z.any()).default({})
      });

      const { intent, entities } = intentRequestSchema.parse(req.body);
      
      // Get user info from authenticated request
      const user = req.user;
      if (!user || !user.schoolId) {
        return res.status(401).json({ 
          success: false,
          message: "You must be logged in to a school to use this service.",
          error: "UNAUTHORIZED" 
        });
      }
      
      const userRole = user.role;
      const schoolId = user.schoolId;

      console.log(`[PROCESS-INTENT] Processing intent: ${intent} for user role: ${userRole}`);
      console.log(`[PROCESS-INTENT] Entities:`, entities);
      
      // Execute intent using the mapping service
      const result = await intentMappingService.executeIntent(
        intent,
        entities,
        schoolId,
        userRole
      );
      
      // Return standardized response format
      return res.json({
        success: result.success,
        message: result.message,
        data: result.data,
        action: result.action,
        actionData: result.actionData
      });
      
    } catch (error: any) {
      console.error('[PROCESS-INTENT] Error processing intent:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid request format. Please provide 'intent' as string and 'entities' as object.",
          error: "VALIDATION_ERROR",
          details: error.issues
        });
      }
      
      return res.status(500).json({ 
        success: false,
        message: "Internal server error while processing intent",
        error: "SERVER_ERROR"
      });
    }
  });

  // ===== DATABASE EXPORT API =====
  
  // Start a new export job
  app.post("/api/exports", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Validate request body
      const exportRequestSchema = z.object({
        format: z.enum(['json', 'csv', 'both']).default('json'),
        privacyLevel: z.enum(['safe', 'full']).default('safe'),
        tables: z.array(z.string()).optional(),
        schoolId: z.string().optional()
      });

      const { format, privacyLevel, tables, schoolId } = exportRequestSchema.parse(req.body);
      
      // Permission checks
      if (user.role === 'super_admin') {
        // Super admin can export any school or all schools
        if (privacyLevel === 'full' && !schoolId) {
          // Full export of all schools requires explicit confirmation
          const confirmed = req.body.confirmed;
          if (!confirmed) {
            return res.status(400).json({
              message: "Full export of all schools requires confirmation. Add 'confirmed: true' to proceed.",
              warning: "This will include sensitive data from all schools."
            });
          }
        }
      } else if (['admin', 'teacher'].includes(user.role)) {
        // Regular users can only export their own school with safe privacy level
        if (!user.schoolId) {
          return res.status(403).json({ message: "No school associated with your account" });
        }
        if (schoolId && schoolId !== user.schoolId) {
          return res.status(403).json({ message: "Access denied: Can only export your own school data" });
        }
        if (privacyLevel === 'full') {
          return res.status(403).json({ message: "Full privacy level requires super admin access" });
        }
      } else {
        return res.status(403).json({ message: "Export access denied for your role" });
      }

      const options = {
        schoolId: schoolId || user.schoolId,
        format,
        privacyLevel,
        tables,
        requestedBy: user.id,
        userRole: user.role
      };

      const jobId = await exportService.startExport(options);
      
      res.json({
        success: true,
        message: "Export job started successfully",
        jobId,
        status: "pending"
      });
      
    } catch (error: any) {
      console.error('Export start error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid export parameters",
          errors: error.issues
        });
      }
      
      res.status(500).json({ 
        message: "Failed to start export",
        error: error.message
      });
    }
  });
  
  // Get export job status
  app.get("/api/exports/:jobId", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const jobId = req.params.jobId;
      
      const job = exportService.getJobStatus(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Export job not found" });
      }
      
      // Check if user has access to this job
      if (job.metadata.requestedBy !== user.id && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied to this export job" });
      }
      
      res.json({
        success: true,
        job: {
          id: job.id,
          status: job.status,
          progress: job.progress,
          createdAt: job.createdAt,
          completedAt: job.completedAt,
          error: job.error,
          metadata: {
            format: job.metadata.format,
            privacyLevel: job.metadata.privacyLevel,
            totalTables: job.metadata.totalTables,
            processedTables: job.metadata.processedTables,
            schoolId: job.metadata.schoolId
          }
        }
      });
      
    } catch (error: any) {
      console.error('Export status error:', error);
      res.status(500).json({ 
        message: "Failed to get export status",
        error: error.message
      });
    }
  });
  
  // Download completed export
  app.get("/api/exports/:jobId/download", authMiddleware, async (req: any, res) => {
    try {
      const user = req.user;
      const jobId = req.params.jobId;
      
      const job = exportService.getJobStatus(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Export job not found" });
      }
      
      if (job.status !== 'completed') {
        return res.status(400).json({ 
          message: `Export not ready for download. Status: ${job.status}`,
          progress: job.progress
        });
      }
      
      // Check if user has access to this job
      if (job.metadata.requestedBy !== user.id && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied to this export job" });
      }
      
      const filePath = exportService.getExportFile(jobId);
      
      if (!filePath) {
        return res.status(404).json({ message: "Export file not found or expired" });
      }
      
      // Set download headers
      const schoolName = job.metadata.schoolId || 'all_schools';
      const timestamp = job.createdAt.toISOString().split('T')[0];
      const filename = `chrona_export_${schoolName}_${timestamp}.zip`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/zip');
      
      // Stream the file
      const fs = await import('fs');
      const fileStream = fs.default.createReadStream(filePath);
      
      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error reading export file" });
        }
      });
      
      fileStream.pipe(res);
      
    } catch (error: any) {
      console.error('Export download error:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          message: "Failed to download export",
          error: error.message
        });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
