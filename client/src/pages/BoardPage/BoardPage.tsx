import {
  Box,
  Card,
  CardContent,
  Chip,
  Paper,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useBoards, useUpdateTaskStatus } from '../../api/hooks';
import type { Board, Task, UpdateTaskStatusRequest } from '../../api/types';
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

// Порядок приоритетов (от высшего к низшему)
const priorityOrder = {
  High: 0,
  Medium: 1,
  Low: 2,
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
  const boards = (boardsResponse as { data: Board[] } | undefined)?.data || [];
  const board = boards.find((b) => b.id === boardId);

  // Получаем задачи из Redux и фильтруем по boardId
  const dispatch = useAppDispatch();
  const { items: allTasks, status, error } = useAppSelector(state => state.tasks);
  const updateTaskStatus = useUpdateTaskStatus();

  // Локальное состояние для оптимистичных обновлений
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTasks());
    }
  }, [dispatch, status]);

  // Обновляем локальное состояние при изменении задач
  useEffect(() => {
    setLocalTasks(allTasks.filter(task => task.boardId === boardId));
  }, [allTasks, boardId]);

  // Группируем задачи по статусу
  const tasksByStatus: Record<string, Task[]> = {
    Backlog: [],
    InProgress: [],
    Done: [],
  };
  
  localTasks.forEach((task) => {
    if (tasksByStatus[task.status]) {
      tasksByStatus[task.status].push(task);
    }
  });

  // Сортируем задачи в каждой колонке по приоритету
  Object.keys(tasksByStatus).forEach(status => {
    tasksByStatus[status].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  });

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    // Если задача не была перетащена в другую колонку
    if (!destination) {
      return;
    }

    // Если задача осталась в той же колонке
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Обновляем статус задачи
    const taskId = Number(draggableId);
    const newStatus = destination.droppableId as 'Backlog' | 'InProgress' | 'Done';
    
    // Оптимистично обновляем UI
    setLocalTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus }
          : task
      )
    );

    const updateData: UpdateTaskStatusRequest = {
      status: newStatus
    };

    // Отправляем запрос на сервер
    updateTaskStatus.mutate(
      { taskId, data: updateData },
      {
        onError: () => {
          // В случае ошибки возвращаем предыдущее состояние
          setLocalTasks(allTasks.filter(task => task.boardId === boardId));
        }
      }
    );
  };

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
      <DragDropContext onDragEnd={handleDragEnd}>
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
              <Droppable droppableId={status}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={styles.tasksContainer}
                  >
                    {tasksByStatus[status].length === 0 && (
                      <Typography color="text.secondary" className={styles.emptyState}>
                        Нет задач
                      </Typography>
                    )}
                    {tasksByStatus[status].map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={String(task.id)}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${styles.taskCard} ${snapshot.isDragging ? styles.dragging : ''}`}
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
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Paper>
          ))}
        </Box>
      </DragDropContext>
    </Box>
  );
} 