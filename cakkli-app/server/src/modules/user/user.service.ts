import { IService } from '@shared/interfaces';
import { User, CreateUserDto, UpdateUserDto } from './user.model';
import { UserRepository } from './user.repository';
import { AppError } from '@shared/utils/error-handler';
import { Logger } from '@shared/utils/logger';

export class UserService implements IService<User> {
  private logger = new Logger('UserService');
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async findAll(): Promise<User[]> {
    this.logger.info('Fetching all users');
    return this.userRepository.findAll();
  }

  async findById(id: string): Promise<User | null> {
    this.logger.info(`Fetching user by id: ${id}`);
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    
    return user;
  }

  async createUser(data: CreateUserDto): Promise<User> {
    this.logger.info(`Creating user with email: ${data.email}`);
    
    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError(400, 'User with this email already exists');
    }

    // TODO: Hash password before saving
    const user = await this.userRepository.create({
      email: data.email,
      name: data.name,
    });

    this.logger.success(`User created: ${user.id}`);
    return user;
  }

  async create(data: Partial<User>): Promise<User> {
    return this.userRepository.create(data);
  }

  async update(id: string, data: UpdateUserDto): Promise<User | null> {
    this.logger.info(`Updating user: ${id}`);
    
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const updatedUser = await this.userRepository.update(id, data);
    this.logger.success(`User updated: ${id}`);
    
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    this.logger.info(`Deleting user: ${id}`);
    
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const deleted = await this.userRepository.delete(id);
    this.logger.success(`User deleted: ${id}`);
    
    return deleted;
  }
}
