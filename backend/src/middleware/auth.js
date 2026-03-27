import { verifyToken } from '../config/auth.js';
import prisma from '../config/database.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { 
        organization: {
          include: {
            settings: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    req.organizationId = user.organizationId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

export const validateOrganization = (req, res, next) => {
  if (req.query && !req.query.organizationId) {
    req.query.organizationId = req.organizationId;
  }
  next();
};