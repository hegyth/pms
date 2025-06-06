import {
  Box,
  Button,
  Drawer,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import type { Board, Task, User } from '../../api/types';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../utils/taskUtils';
import type { TaskFormData, TaskPriority, TaskStatus } from '../../utils/taskUtils';
import { validateTaskForm } from '../../utils/taskUtils';
import styles from './styles.module.scss'

// Определение режима формы задачи
export type TaskFormMode = 'create' | 'edit';

// Интерфейс для пропсов компонента TaskDrawer
interface TaskDrawerProps {
  open: boolean; // Флаг открытия/закрытия формы
  onClose: () => void; // Функция для закрытия формы
  mode: TaskFormMode; // Режим формы (создание/редактирование)
  task?: Task | null; // Задача для редактирования
  boards: Board[]; // Список досок
  users: User[]; // Список пользователей
  onSubmit: (data: TaskFormData) => void; // Функция для отправки формы
  onGoToBoard?: (boardId: number) => void; // Функция для перехода на доску
}

// Компонент формы задачи
export function TaskDrawer(props: TaskDrawerProps) {
  const { open, onClose, mode, task, boards, users, onSubmit, onGoToBoard } = props;
  const isEdit = mode === 'edit'; // Флаг режима редактирования

  // Состояния для полей формы
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [boardId, setBoardId] = useState<number | ''>('');
  const [priority, setPriority] = useState<TaskPriority>(TASK_PRIORITIES[1].value);
  const [status, setStatus] = useState<TaskStatus>(TASK_STATUSES[0].value);
  const [assigneeId, setAssigneeId] = useState<number | ''>('');

  // Эффект для заполнения формы данными задачи при редактировании
  useEffect(() => {
    if (isEdit && task) {
      setTitle(task.title);
      setDescription(task.description);
      setBoardId(task.boardId);
      setPriority(task.priority as TaskPriority);
      setStatus(task.status as TaskStatus);
      setAssigneeId(task.assignee?.id ?? '');
    } else {
      setTitle('');
      setDescription('');
      setBoardId('');
      setPriority(TASK_PRIORITIES[1].value);
      setStatus(TASK_STATUSES[0].value);
      setAssigneeId('');
    }
  }, [isEdit, task, open]);

  // Обработчик отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      title,
      description,
      boardId: isEdit ? task?.boardId : (boardId || undefined),
      priority,
      status,
      assigneeId: assigneeId || undefined,
    };
    
    if (!validateTaskForm(formData, isEdit)) return;
    onSubmit(formData as TaskFormData);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box className={styles.drawer}>
        <Typography variant="h5" className={styles.title}>
          {isEdit ? 'Редактирование задачи' : 'Создание задачи'}
        </Typography>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Stack spacing={2}>
            <TextField
              label="Название"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Описание"
              value={description}
              onChange={e => setDescription(e.target.value)}
              multiline
              minRows={2}
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel>Проект</InputLabel>
              <Select
                value={isEdit ? task?.boardId ?? '' : boardId}
                label="Проект"
                onChange={e => setBoardId(Number(e.target.value))}
                disabled={isEdit}
              >
                {boards.map(board => (
                  <MenuItem key={board.id} value={board.id}>{board.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Приоритет</InputLabel>
              <Select
                value={priority}
                label="Приоритет"
                onChange={e => setPriority(e.target.value as TaskPriority)}
              >
                {TASK_PRIORITIES.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Статус</InputLabel>
              <Select
                value={status}
                label="Статус"
                onChange={e => setStatus(e.target.value as TaskStatus)}
              >
                {TASK_STATUSES.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Исполнитель</InputLabel>
              <Select
                value={assigneeId}
                label="Исполнитель"
                onChange={e => setAssigneeId(Number(e.target.value))}
              >
                {users.map(user => (
                  <MenuItem key={user.id} value={user.id}>{user.fullName}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box className={styles.buttonContainer}>
              <Button type="submit" variant="contained" color="primary" className={styles.button}>
                {isEdit ? 'Обновить' : 'Создать'}
              </Button>
              {onGoToBoard && isEdit && (
                <Button
                  variant="outlined"
                  color="secondary"
                  className={styles.button}
                  onClick={() => onGoToBoard(task?.boardId!)}
                >
                  Перейти на доску
                </Button>
              )}
            </Box>
          </Stack>
        </form>
      </Box>
    </Drawer>
  );
} 