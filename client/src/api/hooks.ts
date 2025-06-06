import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { boardsApi, tasksApi, teamsApi, usersApi } from './api';
import type { CreateTaskRequest, UpdateTaskStatusRequest, UpdateTaskWithBoardId } from './types';

// Хук для получения всех досок
export const useBoards = () => {
  return useQuery({
    queryKey: ['boards'], // Ключ для кэширования
    queryFn: () => boardsApi.getAll().then(res => res.data), // Функция запроса
  });
};

// Хук для получения задач по ID доски
export const useBoardTasks = (boardId: number) => {
  return useQuery({
    queryKey: ['boards', boardId, 'tasks'],
    queryFn: () => boardsApi.getTasks(boardId).then(res => res.data),
  });
};

// Хук для получения всех команд
export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.getAll().then(res => res.data),
  });
};

// Хук для получения информации о команде по ID
export const useTeam = (teamId: number) => {
  return useQuery({
    queryKey: ['teams', teamId],
    queryFn: () => teamsApi.getById(teamId).then(res => res.data),
  });
};

// Хук для получения всех пользователей
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll().then(res => res.data),
  });
};

// Хук для получения задач пользователя по его ID
export const useUserTasks = (userId: number) => {
  return useQuery({
    queryKey: ['users', userId, 'tasks'],
    queryFn: () => usersApi.getTasks(userId).then(res => res.data),
  });
};

// Хук для получения всех задач
export const useTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.getAll().then(res => res.data),
  });
};

// Хук для получения задачи по ID
export const useTask = (taskId: number) => {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => tasksApi.getById(taskId).then(res => res.data),
  });
};

// Хук для создания задачи
export const useCreateTask = () => {
  const queryClient = useQueryClient(); // Для сброса кэша
  return useMutation({
    mutationFn: (data: CreateTaskRequest) => tasksApi.create(data).then(res => res.data), // Функция мутации
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Сброс кэша задач после создания
    },
  });
};

// Хук для обновления задачи
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }: UpdateTaskWithBoardId) =>
      tasksApi.update(taskId, data).then(res => res.data),
    onSuccess: (_, { taskId, boardId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Сброс кэша всех задач
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] }); // Сброс кэша конкретной задачи
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'tasks'] }); // Сброс кэша задач доски
      }
    },
  });
};

// Хук для обновления только статуса задачи
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: UpdateTaskStatusRequest }) =>
      tasksApi.updateStatus(taskId, data).then(res => res.data),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Сброс кэша всех задач
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] }); // Сброс кэша конкретной задачи
    },
  });
};
