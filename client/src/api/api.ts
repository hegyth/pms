// Импортируем объект api для выполнения HTTP-запросов и необходимые типы данных
import { api } from './config';
import type {
  Board,
  Task,
  Team,
  User,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  TeamDetails,
} from './types';

// API для работы с досками (Boards)
export const boardsApi = {
  getAll: () => api.get<Board[]>('/boards'), // Получить все доски
  getTasks: (boardId: number) => api.get<Task[]>(`/boards/${boardId}`), // Получить задачи по ID доски
};

// API для работы с командами (Teams)
export const teamsApi = {
  getAll: () => api.get<Team[]>('/teams'), // Получить все команды
  getById: (teamId: number) => api.get<TeamDetails>(`/teams/${teamId}`), // Получить детали команды по ID
};

// API для работы с пользователями (Users)
export const usersApi = {
  getAll: () => api.get<User[]>('/users'), // Получить всех пользователей
  getTasks: (userId: number) => api.get<Task[]>(`/users/${userId}/tasks`), // Получить задачи пользователя по ID
};

// API для работы с задачами (Tasks)
export const tasksApi = {
  getAll: () => api.get<{data: Task[]}>('/tasks'), // Получить все задачи
  getById: (taskId: number) => api.get<Task>(`/tasks/${taskId}`), // Получить задачу по ID
  create: (data: CreateTaskRequest) => api.post<{ id: number }>('/tasks/create', data), // Создать задачу
  update: (taskId: number, data: UpdateTaskRequest) =>
    api.put<{ message: string }>(`/tasks/update/${taskId}`, data), // Обновить задачу
  updateStatus: (taskId: number, data: UpdateTaskStatusRequest) =>
    api.put<{ message: string }>(`/tasks/updateStatus/${taskId}`, data), // Обновить статус задачи
};
