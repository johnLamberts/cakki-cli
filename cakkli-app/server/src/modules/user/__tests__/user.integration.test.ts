import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../app';

const app = createApp();

describe('User API Integration Tests', () => {
  it('should get all users', async () => {
    const response = await request(app).get('/api/users');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  // TODO: Add more integration tests
});
