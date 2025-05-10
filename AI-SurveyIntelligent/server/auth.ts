import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { createHash } from "crypto";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";


function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// Extend session with userId property
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

// Add user data to the request object
declare global {
  namespace Express {
    interface Request {
      user?: SelectUser;
      isAuthenticated(): boolean;
      login(user: SelectUser, callback: (err?: any) => void): void;
      logout(callback: (err?: any) => void): void;
    }
  }
}

// Simple middleware to check authentication
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export function setupAuth(app: Express) {
  // Set up simple session
  app.use(session({
    secret: process.env.SESSION_SECRET || "survey-ai-app-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
  }));

  // Add authentication helpers to request
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.isAuthenticated = function() {
      return !!req.session.userId;
    };
    
    req.login = function(user: SelectUser, callback: (err?: any) => void) {
      req.session.userId = user.id;
      callback();
    };
    
    req.logout = function(callback: (err?: any) => void) {
      req.session.userId = undefined;
      callback();
    };
    
    next();
  });

  // Add user data to request if authenticated
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.session.userId) {
      try {
        const user = await storage.getUser(req.session.userId);
        if (user) {
          req.user = user;
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }
    next();
  });

  // Registration endpoint
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      // Basic validation
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create user with simple hashed password
      const user = await storage.createUser({
        username,
        password: hashPassword(password)
      });

      // Log in the user
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Error during login" });
        
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Error registering user" });
    }
  });

  // Login endpoint
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      // Basic validation
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || hashPassword(password) !== user.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Log in the user
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Error during login" });
        
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error logging in" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Error during logout" });
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = req.user!;
    res.json(userWithoutPassword);
  });
  
  // Export middleware for use in routes
  return { isAuthenticated };
}
