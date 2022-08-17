/**
 * Модуль контроля подключения к локальной сети
 */
import { showInfoMessage } from './info.js';

// Функция обработки статуса подключения к локальной сети
function updateOnlineStatus() {
  const strMessage = navigator.onLine
    ? 'Подключение к локальной сети восстановлено'
    : 'Произошла ошибка, проверьте подключение к локальной сети';
  showInfoMessage({ message: strMessage, goodMessage: navigator.onLine });
}

// Установка обработчика статуса подключения к локальной сети
export function setEventersOnLine() {
  window.addEventListener('online', () => updateOnlineStatus());
  window.addEventListener('offline', () => updateOnlineStatus());
}
