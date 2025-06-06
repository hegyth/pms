import type { Task, User, AssigneeUser } from '../api/types';

// Возможные приоритеты задачи
export const TASK_PRIORITIES = [
  { value: 'Low', label: 'Low' },      // Низкий приоритет
  { value: 'Medium', label: 'Medium' },// Средний приоритет
  { value: 'High', label: 'High' },    // Высокий приоритет
] as const;

// Возможные статусы задачи
export const TASK_STATUSES = [
  { value: 'Backlog', label: 'Backlog' },      // Задача в бэклоге
  { value: 'InProgress', label: 'In progress' },// Задача в работе
  { value: 'Done', label: 'Done' },            // Задача выполнена
] as const;

// Тип для значения приоритета задачи
export type TaskPriority = typeof TASK_PRIORITIES[number]['value'];
// Тип для значения статуса задачи
export type TaskStatus = typeof TASK_STATUSES[number]['value'];

// Интерфейс для формы создания/редактирования задачи
export interface TaskFormData {
  title: string;         // Название задачи
  description: string;   // Описание задачи
  boardId: number;       // ID доски, к которой относится задача
  priority: TaskPriority;// Приоритет задачи
  status: TaskStatus;    // Статус задачи
  assigneeId: number;    // ID исполнителя
}

// Валидация данных формы задачи
// Если isEdit=true, boardId не обязателен (например, при редактировании)
export const validateTaskForm = (data: Partial<TaskFormData>, isEdit: boolean): boolean => {
  const { title, priority, status, assigneeId, boardId } = data;
  // Проверяем, что все обязательные поля заполнены
  return Boolean(title && priority && status && assigneeId && (isEdit || boardId));
};

// Преобразование данных формы задачи в объект Task
// users - список всех пользователей, taskId - опциональный ID задачи
export const transformTaskData = (data: TaskFormData, users: User[], taskId?: number): Task => {
  // Находим пользователя по ID исполнителя
  const foundUser = users.find(user => user.id === data.assigneeId);
  // Преобразуем пользователя к типу AssigneeUser (только нужные поля)
  const assignee: AssigneeUser = foundUser ? {
    id: foundUser.id,
    fullName: foundUser.fullName,
    email: foundUser.email,
    avatarUrl: foundUser.avatarUrl
  } : {
    id: 0,
    fullName: '',
    email: '',
    avatarUrl: ''
  };

  // Возвращаем объект задачи с нужными полями
  return {
    ...data,
    id: taskId ?? 0,      // Если taskId не передан, используем 0
    assignee,            // Исполнитель задачи
    boardName: '',       // Название доски (заполняется на бэкенде)
  };
}; 