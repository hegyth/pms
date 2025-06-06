import {
  Box,
  Card,
  CardContent,
  Chip,
  Paper,
  Typography
} from '@mui/material';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBoards } from '../../api/hooks';
import type { Task } from '../../api/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTasks } from '../../store/slices/tasksSlice';
import styles from './styles.module.scss'

// Метки статусов задач
const statusLabels = {
  Backlog: 'Backlog',
  InProgress: 'In progress',
  Done: 'Done',
} as const;

// Порядок статусов
const statusOrder = ['Backlog', 'InProgress', 'Done'] as const;

// Цвета приоритетов
const priorityColors = {
  Low: 'success',
  Medium: 'warning',
  High: 'error',
} as const;

// Интерфейс для пропсов компонента BoardPage
interface BoardViewProps {
  onTaskClick?: (task: Task) => void; // Обработчик клика по задаче
}

// Компонент страницы доски
export function BoardPage({ onTaskClick }: BoardViewProps) {
  const { id } = useParams<{ id: string }>();
  const boardId = Number(id);

  const { data: boardsResponse } = useBoards();
  const boards = (boardsResponse as { data: any[] } | undefined)?.data || [];
  const board = boards.find((b) => b.id === boardId);

  // Получаем задачи из Redux и фильтруем по boardId
  const dispatch = useAppDispatch();
  const { items: allTasks, status, error } = useAppSelector(state => state.tasks);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTasks());
    }
  }, [dispatch, status]);

  const tasks = allTasks.filter(task => task.boardId === boardId);

  // Группируем задачи по статусу
  const tasksByStatus: Record<string, Task[]> = {
    Backlog: [],
    InProgress: [],
    Done: [],
  };
  
  tasks.forEach((task) => {
    if (tasksByStatus[task.status]) {
      tasksByStatus[task.status].push(task);
    }
  });

  if (status === 'loading') {
    return <Typography>Загрузка...</Typography>;
  }

  if (error) {
    return <Typography color="error">Ошибка загрузки задач: {error}</Typography>;
  }

  if (!board) {
    return <Typography color="error">Доска не найдена</Typography>;
  }

  return (
    <Box className={styles.container}>
      <Typography variant="h4" gutterBottom>
        {board.name}
      </Typography>
      <Box className={styles.boardGrid}>
        {statusOrder.map((status) => (
          <Paper
            key={status}
            className={styles.column}
          >
            <Typography
              variant="h6"
              className={styles.columnTitle}
            >
              {statusLabels[status]}
            </Typography>
            <Box className={styles.tasksContainer}>
              {tasksByStatus[status].length === 0 && (
                <Typography color="text.secondary" className={styles.emptyState}>
                  Нет задач
                </Typography>
              )}
              {tasksByStatus[status].map((task) => (
                <Card
                  key={task.id}
                  className={styles.taskCard}
                  onClick={onTaskClick ? () => onTaskClick(task) : undefined}
                >
                  <CardContent className={styles.taskContent}>
                    <Typography variant="h6" className={styles.taskTitle}>
                      {task.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" className={styles.taskDescription}>
                      {task.description}
                    </Typography>
                    <Box className={styles.taskTags}>
                      <Chip
                        label={task.priority}
                        color={priorityColors[task.priority]}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" className={styles.taskAssignee}>
                      Исполнитель: {task.assignee.fullName}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
} 