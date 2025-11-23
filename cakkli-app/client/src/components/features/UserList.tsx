import { useApi } from '@hooks/useApi';
import { userService } from '@services/user.service';
import { User } from '@types/index';

export function UserList() {
  const { data: users, loading, error } = useApi<User[]>(
    () => userService.getUsers(),
    []
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!users || users.length === 0) return <div>No users found</div>;

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
