// Интерфейс для пользователя-исполнителя задачи (используется в задаче)
export interface AssigneeUser {
  id: number;           // ID пользователя
  fullName: string;     // Полное имя
  email: string;        // Email
  avatarUrl: string;    // Ссылка на аватар
}

// Интерфейс для доски (Board)
export interface Board {
  id: number;           // ID доски
  name: string;         // Название доски
  description: string;  // Описание доски
  taskCount: number;    // Количество задач на доске
}

// Интерфейс для задачи (Task)
export interface Task {
  id: number;           // ID задачи
  title: string;        // Название задачи
  description: string;  // Описание задачи
  priority: 'Low' | 'Medium' | 'High'; // Приоритет задачи
  status: 'Backlog' | 'InProgress' | 'Done'; // Статус задачи
  assignee: AssigneeUser; // Исполнитель задачи
  boardId: number;      // ID доски
  boardName: string;    // Название доски
}

// Интерфейс для команды (Team)
export interface Team {
  id: number;           // ID команды
  name: string;         // Название команды
  description: string;  // Описание команды
  usersCount: number;   // Количество пользователей в команде
  boardsCount: number;  // Количество досок в команде
}

// Интерфейс для пользователя (User)
export interface User {
  id: number;           // ID пользователя
  fullName: string;     // Полное имя
  email: string;        // Email
  description: string;  // Описание пользователя
  avatarUrl: string;    // Ссылка на аватар
  teamId: number;       // ID команды
  teamName: string;     // Название команды
  tasksCount: number;   // Количество задач пользователя
}

// Запрос на создание задачи
export interface CreateTaskRequest {
  title: string;        // Название задачи
  description: string;  // Описание задачи
  priority: 'Low' | 'Medium' | 'High'; // Приоритет
  assigneeId: number;   // ID исполнителя
  boardId: number;      // ID доски
}

// Запрос на обновление задачи
export interface UpdateTaskRequest {
  title: string;        // Название задачи
  description: string;  // Описание задачи
  priority: 'Low' | 'Medium' | 'High'; // Приоритет
  status: 'Backlog' | 'InProgress' | 'Done'; // Статус
  assigneeId: number;   // ID исполнителя
}

// Запрос на обновление только статуса задачи
export interface UpdateTaskStatusRequest {
  status: 'Backlog' | 'InProgress' | 'Done'; // Новый статус
}

// Детальная информация о команде
export interface TeamDetails {
  id: number;           // ID команды
  name: string;         // Название команды
  description: string;  // Описание команды
  users: {
    id: number;         // ID пользователя
    fullName: string;   // Полное имя
    email: string;      // Email
    description: string;// Описание
    avatarUrl: string;  // Ссылка на аватар
  }[];
  boards: {
    id: number;         // ID доски
    name: string;       // Название доски
    description: string;// Описание доски
  }[];
}

// Запрос на обновление задачи с указанием ID доски
export interface UpdateTaskWithBoardId {
  taskId: number;           // ID задачи
  data: UpdateTaskRequest;  // Данные для обновления
  boardId: number;          // ID доски
}