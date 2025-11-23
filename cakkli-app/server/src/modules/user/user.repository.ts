import { IRepository } from '@shared/interfaces';
import { User } from './user.model';
import { Logger } from '@shared/utils/logger';

export class UserRepository implements IRepository<User> {
  private logger = new Logger('UserRepository');

  async findAll(): Promise<User[]> {
    this.logger.info('Finding all users');
    // TODO: Implement with @cakki/orm
    return [];
  }

  async findById(id: string): Promise<User | null> {
    this.logger.info(`Finding user by id: ${id}`);
    // TODO: Implement with @cakki/orm
    return null;
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.info(`Finding user by email: ${email}`);
    // TODO: Implement with @cakki/orm
    return null;
  }

  async create(data: Partial<User>): Promise<User> {
    this.logger.info('Creating user');
    // TODO: Implement with @cakki/orm
    throw new Error('Not implemented');
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    this.logger.info(`Updating user: ${id}`);
    // TODO: Implement with @cakki/orm
    return null;
  }

  async delete(id: string): Promise<boolean> {
    this.logger.info(`Deleting user: ${id}`);
    // TODO: Implement with @cakki/orm
    return false;
  }
}
