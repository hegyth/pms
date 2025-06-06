// Импортируем необходимые компоненты и модули
import { StrictMode } from 'react'; // Строгий режим React для выявления проблем
import { createRoot } from 'react-dom/client'; // Функция для создания корневого элемента
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Настройка React Query
import App from './App.tsx'; // Основной компонент приложения

// Создаем экземпляр QueryClient с настройками по умолчанию
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Время, в течение которого данные считаются актуальными (5 минут)
      retry: 1, // Количество попыток повторного запроса при ошибке
    },
  },
});

// Создаем корневой элемент и монтируем приложение
createRoot(document.getElementById('root')!).render(
  <StrictMode> {/* Включаем строгий режим для отладки */}
    <QueryClientProvider client={queryClient}> {/* Оборачиваем приложение в провайдер React Query */}
      <App /> {/* Основной компонент приложения */}
    </QueryClientProvider>
  </StrictMode>
);
