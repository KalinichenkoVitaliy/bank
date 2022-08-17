/**
 * Основной модуль приложения
 */
import 'babel-polyfill';
import './css/style.scss';
import { el, setChildren } from 'redom';
import { renderHeaderContent, markHeaderButton } from './header.js';
import { createInfo, showInfoMessage } from './info.js';
import { callLoginForm } from './login.js';
import { setEventersOnLine } from './net.js';
import { connectApiYandexMap } from './map.js';

connectApiYandexMap(); // подключение API Яндекс-карты

// Группа работы с именем текущего пользователя
function getCurrentLogin() {
  return window.sessionStorage.getItem('currentLogin');
}
function setCurrentLogin(value) {
  window.sessionStorage.setItem('currentLogin', value);
}
function removeCurrentLogin() {
  window.sessionStorage.removeItem('currentLogin');
}

// Группа работы с токеном доступа
export function getToken() {
  return window.sessionStorage.getItem('token');
}
export function setToken({ value, login }) {
  window.sessionStorage.setItem('token', value);
  setCurrentLogin(login);
}
export function removeToken() {
  window.sessionStorage.removeItem('token');
  removeCurrentLogin();
}
export function isToken() {
  return window.sessionStorage.getItem('token') !== null;
}

// Группа работы с настройками интерфейса пользователя
let settingsUI = {
  accountViewNum: '',
  accountsSelectSortValue: '',
  headerSelectedButton: 'accounts',
  listGoodAccounts: [],
};
export function getSettingsUI() {
  const nameUser = getCurrentLogin();
  const settings = JSON.parse(window.localStorage.getItem(`settingsUI${nameUser}`));
  if (settings === null) saveSettingsUI();
  else settingsUI = settings;
}
export function saveSettingsUI() {
  const nameUser = getCurrentLogin();
  window.localStorage.setItem(`settingsUI${nameUser}`, JSON.stringify(settingsUI));
}
export function getPropertyUI(propName, otherValue = null) {
  if (settingsUI[propName]) return settingsUI[propName];
  else return otherValue;
}
export function setPropertyUI({ propName, propValue, mode = '' }) {
  if (mode === 'addToArray') {
    const curArr = getPropertyUI(propName, []);
    if (!curArr.includes(propValue)) curArr.push(propValue);
    settingsUI[propName] = curArr;
  } else {
    settingsUI[propName] = propValue;
  }
  saveSettingsUI();
}

// Функция обработки ошибки запроса к серверу
export function eventOnError(error) {
  showInfoMessage({ message: `Ошибка взаимодействия с сервером: "${error.message}"` });
}

// Функция перестроения содержимого appContainer
export function renderAppContainer() {
  setChildren(appContainer, []);
  const currentButton = document.getElementById(settingsUI.headerSelectedButton);
  markHeaderButton(currentButton);
  currentButton.click();
}

// Функция перестроения содержимого приложения
export function renderApp() {
  // если пользователь уже авторизован - отрисовка заголовка и тела контента,
  if (isToken()) {
    getSettingsUI();
    renderHeaderContent();
    renderAppContainer();
  }
  // иначе вызов авторизации
  else {
    renderHeaderContent();
    callLoginForm();
  }
}

// определение глобальных DOM-элементов
const appBody = window.document.body;
export const appHeader = el('header.header');
export const appContainer = el('div.container');
const appInfoContainer = createInfo().infoContainer;

// формирование основных блоков приложения
setChildren(appBody, [appHeader, appContainer, appInfoContainer]);
// установка обработки событий наличия подключения к ЛВС
setEventersOnLine();
// вызов функции перестроения содержимого приложения
renderApp();
