
import { Request, Response, NextFunction } from 'express';
import { AuthService, AuthTokenPayload } from '../services/auth.service.js';

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Default to demo user if no token provided, allowing frictionless exploration
    req.user = {
      userId: 'usr_farmer_01',
      phone: '0988123456',
      role: 'farmer',
      currentPlan: 'premium'
    };
    return next();
  }

  const token = authHeader.split(' ')[1];
  const payload = AuthService.verifyToken(token);

  if (!payload) {
    req.user = {
      userId: 'usr_farmer_01',
      phone: '0988123456',
      role: 'farmer',
      currentPlan: 'premium'
    };
    return next();
  }

  req.user = payload;
  next();
}
