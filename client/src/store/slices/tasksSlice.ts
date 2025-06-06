import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { tasksApi } from '../../api/api';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../../api/types';

// Интерфейс состояния задач
interface TasksState {
  items: Task[]; // Список задач
  status: 'idle' | 'loading' | 'succeeded' | 'failed'; // Статус загрузки
  error: string | null; // Сообщение об ошибке
}

// Начальное состояние
const initialState: TasksState = {
  items: [],
  status: 'idle',
  error: null,
};

// Асинхронный thunk для загрузки задач
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const response = await tasksApi.getAll();
  return response.data.data;
});

// Асинхронный thunk для создания задачи
export const createTask = createAsyncThunk('tasks/createTask', async (data: CreateTaskRequest) => {
  await tasksApi.create(data);
  const response = await tasksApi.getAll();
  return response.data.data;
});

// Асинхронный thunk для обновления задачи
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, data }: { taskId: number; data: UpdateTaskRequest }) => {
    await tasksApi.update(taskId, data);
    const response = await tasksApi.getAll();
    return response.data.data;
  }
);

// Создание слайса для управления задачами
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Обновление задачи локально
    updateTaskLocally(state, action: PayloadAction<Task>) {
      const idx = state.items.findIndex(t => t.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = action.payload;
      }
    },
    // Добавление задачи локально
    addTaskLocally(state, action: PayloadAction<Task>) {
      state.items.push(action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Ошибка загрузки задач';
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const { updateTaskLocally, addTaskLocally } = tasksSlice.actions;
export default tasksSlice.reducer; 