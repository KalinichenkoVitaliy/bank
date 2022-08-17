/**
 * Модуль работы с WebSocket
 */
import { showInfoMessage } from './info.js';

let socketRates;

// Функция открытия сокета получения сообщений об изменении курса обмена валют
export function openSocketRates({ onMessage }) {
  socketRates = new WebSocket('ws://localhost:3000/currency-feed');
  // socketRates.onopen = function (event) {
  //   showInfoMessage({
  //     message: 'Соединение websocket для получения изменении курса обмена валют открыто',
  //     goodMessage: true,
  //   });
  // };
  socketRates.onmessage = function (event) {
    onMessage(JSON.parse(event.data));
  };
  socketRates.onerror = function (error) {
    showInfoMessage({ message: `[Error] socketRates.onerror: ${error.message}` });
  };
  // socketRates.onclose = function (event) {
  //   showInfoMessage({
  //     message: 'Соединение websocket для получения изменении курса обмена валют закрыто',
  //     goodMessage: true,
  //   });
  // };
}

// Функция закрытия сокета получения сообщений об изменении курса обмена валют
export function closeSocketRates() {
  if (typeof socketRates !== 'undefined') {
    socketRates.close();
    socketRates = undefined;
  }
}
