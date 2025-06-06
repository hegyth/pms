import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoards } from '../../api/hooks';
import type { Board } from '../../api/types';
import styles from './styles.module.scss'

type ApiResponse<T> = {
  data: T;
};

export function BoardsPage() {
  const navigate = useNavigate();
  const { data: boardsResponse, isLoading, error } = useBoards();
  const boards = (boardsResponse as ApiResponse<Board[]> | undefined)?.data || [];

  const sortedBoards = useMemo(() => {
    if (!Array.isArray(boards)) {
      return [];
    }
    return [...boards].sort((a, b) => a.name.localeCompare(b.name));
  }, [boards]);

  const handleBoardClick = (boardId: number) => {
    navigate(`/board/${boardId}`);
  };

  if (isLoading) {
    return <Typography>Загрузка...</Typography>;
  }

  if (error) {
    return <Typography color="error">Ошибка загрузки досок: {error.message}</Typography>;
  }

  return (
    <Box className={styles.container}>
      <Stack spacing={2} className={styles.boardList}>
        {sortedBoards.map((board) => (
          <Card 
            key={board.id}
            onClick={() => handleBoardClick(board.id)}
            className={styles.boardCard}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {board.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" className={styles.boardDescription}>
                {board.description}
              </Typography>
              <Box className={styles.boardTags}>
                <Chip
                  label={`Задач: ${board.taskCount}`}
                  color="primary"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
