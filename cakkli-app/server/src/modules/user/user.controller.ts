import { Request, Response } from 'express';
import { UserService } from './user.service';
import { asyncHandler } from '@shared/utils/error-handler';
import { ApiResponse } from '@shared/types';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const users = await this.userService.findAll();
    
    const response: ApiResponse = {
      success: true,
      data: users,
      message: 'Users retrieved successfully',
    };
    
    res.json(response);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await this.userService.findById(id);
    
    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User retrieved successfully',
    };
    
    res.json(response);
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await this.userService.createUser(req.body);
    
    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User created successfully',
    };
    
    res.status(201).json(response);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await this.userService.update(id, req.body);
    
    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User updated successfully',
    };
    
    res.json(response);
  });

  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this.userService.delete(id);
    
    const response: ApiResponse = {
      success: true,
      message: 'User deleted successfully',
    };
    
    res.json(response);
  });
}
