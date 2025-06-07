import { useState } from "react";
import { Route, Routes, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useBoards, useCreateTask, useUpdateTask, useUsers } from "../../api/hooks";
import type { Board, Task, User } from "../../api/types";
import { BoardPage } from "../../pages/BoardPage";
import { BoardsPage } from "../../pages/BoardsPage";
import { TasksPage } from "../../pages/TasksPage";
import { useAppDispatch } from "../../store/hooks";
import { addTaskLocally, updateTaskLocally } from "../../store/slices/tasksSlice";
import { Header } from "../Header";
import { TaskDrawer, type TaskFormMode } from "../TaskFormDrawer";
import { transformTaskData } from "../../utils/taskUtils";
import type { TaskFormData } from "../../utils/taskUtils";

// Основной компонент контента приложения
export function AppContent() {
    // Состояние для управления drawer (выдвижной панелью)
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);
    // Состояние для выбранной задачи
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    // Режим drawer (создание или редактирование)
    const [drawerMode, setDrawerMode] = useState<TaskFormMode>('create');
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
  
    // Получаем проекты и пользователей
    const { data: boardsResponse } = useBoards();
    const { data: usersResponse } = useUsers();
    const boards = (boardsResponse as { data: Board[] } | undefined)?.data || [];
    const users = (usersResponse as { data: User[] } | undefined)?.data || [];
  
    // Мутации для создания и обновления задач
    const createTaskMutation = useCreateTask();
    const updateTaskMutation = useUpdateTask();
  
    // Открытие drawer для создания задачи
    const handleCreateClick = () => {
      setSelectedTask(null);
      setDrawerMode('create');
      setIsOpenDrawer(true);
    };
  
    // Открытие drawer для редактирования задачи
    const handleTaskClick = (task: Task) => {
      setSelectedTask(task);
      setDrawerMode('edit');
      setIsOpenDrawer(true);
    };
  
    // Закрытие drawer
    const handleDrawerClose = () => {
      setIsOpenDrawer(false);
      setSelectedTask(null);
    };
  
    // Создание или обновление задачи
    const handleTaskFormSubmit = (data: TaskFormData) => {
      if (drawerMode === 'create') {
        createTaskMutation.mutate(data, {
          onSuccess: (dataSucc: any) => {
              // Если сервер возвращает созданную задачу, добавляем её локально
              const newTask = transformTaskData(data, users, dataSucc.data.id);
              dispatch(addTaskLocally(newTask));
            setIsOpenDrawer(false);
          },
        });
      } else if (drawerMode === 'edit' && selectedTask) {
        // Мгновенно обновляем задачу локально
        const updatedTask = transformTaskData(data, users, selectedTask.id);
        dispatch(updateTaskLocally(updatedTask));
        // Затем отправляем на сервер
        updateTaskMutation.mutate(
          { taskId: selectedTask.id, data, boardId: selectedTask.boardId },
          {
            onSuccess: () => {
              setIsOpenDrawer(false);
            },
          }
        );
      }
    };
  
    // Переход на доску
    const handleGoToBoard = (boardId: number) => {
      setIsOpenDrawer(false);
      navigate(`/board/${boardId}`);
    };
  
    // Определяем, нужно ли показывать кнопку "Перейти на доску"
    const showGoToBoard = location.pathname.startsWith('/issues');
  
    return (
      <>
        <Header onCreate={handleCreateClick} />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/issues" replace />} />
            <Route path="/issues" element={<TasksPage />} />
            <Route path="/boards" element={<BoardsPage />} />
            <Route path="/board/:id" element={<BoardPage onTaskClick={handleTaskClick} />} />
          </Routes>
        </main>
        <TaskDrawer
          open={isOpenDrawer}
          onClose={handleDrawerClose}
          mode={drawerMode}
          task={selectedTask}
          boards={boards}
          users={users}
          onSubmit={handleTaskFormSubmit}
          onGoToBoard={showGoToBoard ? handleGoToBoard : undefined}
        />
      </>
    );
  }