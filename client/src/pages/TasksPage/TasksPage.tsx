import type { SelectChangeEvent } from '@mui/material';
import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoards, useUpdateTask, useUsers } from '../../api/hooks';
import type { Board, Task, User } from '../../api/types';
import { TaskDrawer } from '../../components/TaskFormDrawer';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTasks, updateTaskLocally } from '../../store/slices/tasksSlice';
import styles from './styles.module.scss'

// Тип для ответа API
type ApiResponse<T> = {
  data: T;
};

// Цвета статусов задач
const statusColors = {
  Backlog: 'default',
  InProgress: 'primary',
  Done: 'success',
} as const;

// Цвета приоритетов задач
const priorityColors = {
  Low: 'success',
  Medium: 'warning',
  High: 'error',
} as const;

// Компонент страницы задач
export function TasksPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: tasks, status, error } = useAppSelector(state => state.tasks);
  const { data: boardsResponse } = useBoards();
  const { data: usersResponse } = useUsers();
  const boards = (boardsResponse as ApiResponse<Board[]> | undefined)?.data || [];
  const users = (usersResponse as ApiResponse<User[]> | undefined)?.data || [];

  const updateTaskMutation = useUpdateTask();

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTasks());
    }
  }, [dispatch, status]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [boardFilter, setBoardFilter] = useState<number | 'All'>('All');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Обработчик изменения статуса
  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  // Обработчик изменения доски
  const handleBoardChange = (event: SelectChangeEvent<number | 'All'>) => {
    setBoardFilter(event.target.value as number | 'All');
  };

  // Обработчик клика по задаче
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  // Обработчик закрытия формы
  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedTask(null);
  };

  // Обработчик перехода на доску
  const handleGoToBoard = (boardId: number) => {
    setIsDrawerOpen(false);
    navigate(`/board/${boardId}`);
  };

  // Обработчик отправки формы задачи
  const handleTaskFormSubmit = (data: any) => {
    if (selectedTask) {
      dispatch(updateTaskLocally({
        ...selectedTask,
        ...data,
        assignee: users.find(u => u.id === data.assigneeId) || selectedTask.assignee,
      }));
      updateTaskMutation.mutate(
        { taskId: selectedTask.id, data, boardId: selectedTask.boardId },
        {
          onSuccess: () => {
            setIsDrawerOpen(false);
          },
        }
      );
    }
  };

  // Фильтрация задач
  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) {
      return [];
    }
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAssignee = task.assignee.fullName.toLowerCase().includes(assigneeFilter.toLowerCase());
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesBoard = boardFilter === 'All' || task.boardId === boardFilter;
      return matchesSearch && matchesAssignee && matchesStatus && matchesBoard;
    });
  }, [tasks, searchQuery, statusFilter, boardFilter, assigneeFilter]);

  // Опции для выбора доски
  const boardOptions = useMemo(() => {
    if (!Array.isArray(boards)) {
      return [];
    }
    return boards;
  }, [boards]);

  if (status === 'loading') {
    return <Typography>Загрузка...</Typography>;
  }

  if (error) {
    return <Typography color="error">Ошибка загрузки задач: {error}</Typography>;
  }

  return (
    <Box className={styles.container}>
      <Stack spacing={2} direction="row" className={styles.filters}>
        <TextField
          label="Поиск"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
        />
        <FormControl size="small" className={styles.filterField}>
          <InputLabel>Статус</InputLabel>
          <Select value={statusFilter} label="Статус" onChange={handleStatusChange}>
            <MenuItem value="All">Все</MenuItem>
            <MenuItem value="Backlog">Backlog</MenuItem>
            <MenuItem value="InProgress">In Progress</MenuItem>
            <MenuItem value="Done">Done</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" className={styles.filterField}>
          <InputLabel>Проект</InputLabel>
          <Select value={boardFilter} label="Проект" onChange={handleBoardChange}>
            <MenuItem value="All">Все</MenuItem>
            {boardOptions.map((board) => (
              <MenuItem key={board.id} value={board.id}>
                {board.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Исполнитель"
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          size="small"
        />
      </Stack>

      <Stack spacing={2} className={styles.taskList}>
        {filteredTasks.map((task) => (
          <Card key={task.id} onClick={() => handleTaskClick(task)} className={styles.taskCard}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" className={styles.taskHeader}>
                <Typography variant="h6">{task.title}</Typography>
                <Stack direction="row" spacing={1} className={styles.taskTags}>
                  <Chip
                    label={task.status}
                    color={statusColors[task.status]}
                    size="small"
                  />
                  <Chip
                    label={task.priority}
                    color={priorityColors[task.priority]}
                    size="small"
                  />
                </Stack>
              </Stack>
              <Typography color="text.secondary" className={styles.taskDescription}>
                {task.description}
              </Typography>
              <Stack direction="row" spacing={1} className={styles.taskInfo}>
                <Typography variant="body2" color="text.secondary">
                  Проект: {task.boardName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Исполнитель: {task.assignee.fullName}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <TaskDrawer
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        mode="edit"
        task={selectedTask}
        boards={boardOptions}
        users={users}
        onSubmit={handleTaskFormSubmit}
        onGoToBoard={handleGoToBoard}
      />
    </Box>
  );
}
