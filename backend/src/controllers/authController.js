import prisma from '../config/database.js';
import { hashPassword, comparePassword, generateToken } from '../config/auth.js';

export const signup = async (req, res) => {
  try {
    const { email, password, organizationName } = req.body;
    
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const existingOrg = await prisma.organization.findUnique({
      where: { name: organizationName }
    });
    
    if (existingOrg) {
      return res.status(400).json({ error: 'Organization name already taken' });
    }
    
    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: organizationName }
      });
      
      const hashedPassword = await hashPassword(password);
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          organizationId: organization.id
        }
      });
      
      // Create default settings for organization
      await tx.setting.create({
        data: {
          organizationId: organization.id,
          defaultLowStockThreshold: parseInt(process.env.DEFAULT_LOW_STOCK_THRESHOLD) || 5
        }
      });
      
      return { organization, user };
    });
    
    const token = generateToken(result.user.id, result.organization.id);
    
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        organizationId: result.organization.id,
        organizationName: result.organization.name
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        organization: {
          include: {
            settings: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user.id, user.organizationId);
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
        organizationName: user.organization.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { 
        organization: {
          include: {
            settings: true
          }
        }
      }
    });
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
        organizationName: user.organization.name
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
};