import { Router } from 'express';
import { HealthController } from './health.controller';

export class HealthRoutes {
  public router: Router;
  private controller: HealthController;

  constructor() {
    this.router = Router();
    this.controller = new HealthController();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/', this.controller.check);
  }
}
