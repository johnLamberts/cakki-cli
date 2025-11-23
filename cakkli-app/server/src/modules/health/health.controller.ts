import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/error-handler';

export class HealthController {
  check = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
      },
    });
  });
}
