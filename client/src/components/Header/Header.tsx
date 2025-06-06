// Импортируем необходимые компоненты и стили
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import styles from './styles.module.scss'

// Компонент заголовка приложения
export function Header({ onCreate }: { onCreate: () => void }) {
    return (
      <header className={styles.headerContainer}>
        <nav className={styles.navigationContainer}>
          <Link to="/issues">Все задачи</Link> {/* Ссылка на страницу всех задач */}
          <Link to="/boards">Проекты</Link> {/* Ссылка на страницу проектов */}
        </nav>
        <Button
          variant="outlined"
          onClick={onCreate} // Обработчик для создания задачи
        >
          Создать задачу
        </Button>
      </header>
    );  
  }