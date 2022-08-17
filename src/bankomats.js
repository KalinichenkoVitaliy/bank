/**
 * Модуль раздела банкоматов
 */
import { el, setChildren } from 'redom';
import { eventOnError, appContainer } from './index.js';
import { showInfoMessage } from './info.js';
import { getBankomats } from './api.js';
import { renderMap } from './map.js';

// Функция обработки результата запроса списка счетов
function eventOnGetBankomats(data) {
  if (data.error) {
    showInfoMessage({ message: `Ошибка получения данных: "${data.error}"` });
  } else {
    renderMap({
      elementDomID: 'map',
      mapCenter: [55.76010445375011, 37.61861365856933],
      mapPoints: data.payload,
    });
  }
}

// Функция вызова запроса на  получения списка счетов
function callGetBankomats() {
  getBankomats({
    onDone: eventOnGetBankomats,
    onError: eventOnError,
  });
}

// Функция построения контента раздела счетов
function createBankomatsContent() {
  const container = el('div.bankomats', [
    el('h1.title.title__section', 'Карта банкоматов'),
    el('div.bankomats__map#map'),
  ]);
  return { container };
}

// Функция построения тела контента раздела счетов - экран ожидания
function showBankomatsWaitingScreen() {
  const map = document.getElementById('map');
  setChildren(map, [
    el('div.skeleton.skeleton__map#mapWaitingScreen', [el('div.skeleton__map-text', 'Идёт загрузка карты ...')]),
  ]);
}

// Функция вызова построения контента раздела банкоматов
export function renderBankomatsContent() {
  const bankomats = createBankomatsContent();
  setChildren(appContainer, bankomats.container);
  showBankomatsWaitingScreen();
  callGetBankomats();
}
