// Импортируем необходимые компоненты и модули
import { Provider } from 'react-redux'; // Provider для Redux
import { BrowserRouter as Router } from 'react-router-dom'; // Роутер для навигации
import { AppContent } from '../components/AppContent/AppContent'; // Основной контент приложения
import { store } from '../store'; // Redux store
import '../styles/index.css'; // Глобальные стили

// Основной компонент приложения
function App() {
  return (
    // Оборачиваем приложение в Provider для доступа к Redux store
    <Provider store={store}>
      {/* Оборачиваем в Router для работы с маршрутизацией */}
      <Router>
        {/* Основной контент приложения */}
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
