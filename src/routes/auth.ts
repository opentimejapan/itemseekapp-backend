import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db/connection.js';
import { organizations, users } from '../../packages/db/src/schema.js';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

// Signup route
authRouter.post('/signup', async (req, res, next) => {
  try {
    const data = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string(),
      organizationName: z.string(),
      industry: z.string()
    }).parse(req.body);
    
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, data.email)
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Create organization
    const [org] = await db.insert(organizations).values({
      name: data.organizationName,
      industry: data.industry,
      settings: {
        itemCategories: ['General', 'Supplies', 'Equipment', 'Materials'],
        locationTypes: ['Room', 'Area', 'Storage'],
        taskTypes: ['General', 'Maintenance', 'Inspection'],
        statuses: ['available', 'low', 'out of stock'],
        units: ['pieces', 'kg', 'boxes', 'units']
      }
    }).returning();
    
    // Hash password and create user
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const [user] = await db.insert(users).values({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      organizationId: org.id,
      role: 'admin' // First user is admin
    }).returning();
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, organizationId: org.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    next(error);
  }
});

// Login route
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = z.object({
      email: z.string().email(),
      password: z.string().min(6)
    }).parse(req.body);
    
    // Find user in database
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email)
    });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, organizationId: user.organizationId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    next(error);
  }
});

// Verify token
authRouter.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ valid: false });
  }
});