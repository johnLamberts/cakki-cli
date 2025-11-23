import { apiService } from './api.service';
import { User } from '@types/index';

class UserService {
  async getUsers() {
    return apiService.get<User[]>('/users');
  }

  async getUserById(id: string) {
    return apiService.get<User>(`/users/${id}`);
  }

  async createUser(data: Partial<User>) {
    return apiService.post<User>('/users', data);
  }

  async updateUser(id: string, data: Partial<User>) {
    return apiService.put<User>(`/users/${id}`, data);
  }

  async deleteUser(id: string) {
    return apiService.delete(`/users/${id}`);
  }
}

export const userService = new UserService();
