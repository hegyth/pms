// Импортируем axios для выполнения HTTP-запросов
import axios from 'axios';

// Базовый URL для API-запросов
const API_BASE_URL = 'http://localhost:8080/api/v1';

// Создаем экземпляр axios с базовыми настройками
export const api = axios.create({
  baseURL: API_BASE_URL, // Устанавливаем базовый URL
  headers: {
    'Content-Type': 'application/json', // Устанавливаем заголовок для JSON
  },
});

// Добавляем перехватчик ответов для обработки ошибок
api.interceptors.response.use(
  response => response, // Если ответ успешный, просто возвращаем его
  error => {
    console.error('API Error:', error); // Логируем ошибку в консоль
    return Promise.reject(error); // Отклоняем промис с ошибкой
  }
);
