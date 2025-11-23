import { Request, Response, NextFunction } from 'express';
import { AppError } from '@shared/utils/error-handler';

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // TODO: Implement validation with Zod or similar
    next();
  };
};
