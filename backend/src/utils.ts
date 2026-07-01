import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { config } from './config';

export type Role =
  | 'super_admin'
  | 'extension_officer'
  | 'digital_champion'
  | 'farmer'
  | 'buyer'
  | 'transporter'
  | 'agro_dealer'
  | 'financial_institution'
  | 'government_officer'
  | 'research_institution'
  | 'cooperative_manager'
  | 'vsla_leader';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface AuthedRequest extends Request {
  user?: AuthUser;
}

export function signToken(user: AuthUser): string {
  const options = { expiresIn: config.jwtExpiresIn } as jwt.SignOptions;
  return jwt.sign(user as object, config.jwtSecret as jwt.Secret, options);
}

export const asyncHandler =
  (fn: (req: AuthedRequest, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req as AuthedRequest, res, next)).catch(next);
  };

export const authenticate: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, config.jwtSecret) as AuthUser;
    (req as AuthedRequest).user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorize =
  (...roles: Role[]): RequestHandler =>
  (req, res, next) => {
    const user = (req as AuthedRequest).user;
    if (!user) return res.status(401).json({ message: 'Authentication required' });
    if (roles.length && !roles.includes(user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    next();
  };
