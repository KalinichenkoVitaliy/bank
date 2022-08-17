/**
 * Модуль аутентификация пользователя
 */
import { el, setChildren } from 'redom';
import { setToken, eventOnError, renderApp, appContainer } from './index.js';
import { checkCharOnNotSpace, checkCharOnLogin } from './lib.js';
import { showInfoMessage } from './info.js';
import { logInSite } from './api.js';
import glassHide from './assets/images/glass-hide.png';
import glassOpen from './assets/images/glass-open.png';

// Функция проверки введённого символа в поле логина
function checkInputCharToLogin(event) {
  if (!checkCharOnLogin(event.keyCode)) event.preventDefault();
}

// Функция проверки введённого символа и недопущения пробела
function checkInputCharOnNotSpace(event) {
  if (!checkCharOnNotSpace(event.keyCode)) event.preventDefault();
}

// Функция предварительной валидации логина
function preValidateLogin(event) {
  if (event.target.value.length > 5) {
    event.target.classList.remove('is-error');
    document.getElementById('inputLoginError').textContent = '';
  }
}

// Функция предварительной валидации логина
function preValidatePassword(event) {
  if (event.target.value.length > 5) {
    event.target.classList.remove('is-error');
    document.getElementById('inputPasswordError').textContent = '';
  }
}

// Функция валидации полей формы входа
function validateLoginFields() {
  let valid = false;
  const inputLogin = document.getElementById('inputLogin');
  const inputLoginError = document.getElementById('inputLoginError');
  const inputPassword = document.getElementById('inputPassword');
  const inputPasswordError = document.getElementById('inputPasswordError');
  if (inputLogin.value.length < 6) {
    inputLogin.classList.add('is-error');
    inputLoginError.textContent = 'Логин меньше 6 символов';
    inputLogin.focus();
  } else if (inputPassword.value.length < 6) {
    inputPassword.classList.add('is-error');
    inputPasswordError.textContent = 'Пароль меньше 6 символов';
    inputPassword.focus();
  } else valid = true;
  return { valid, inputLogin, inputPassword };
}

// Функция показа-скрытия пароля
function showPassword(event) {
  const inputPassword = document.getElementById('inputPassword');
  if (event.target.dataset.type === 'password') {
    event.target.dataset.type = 'text';
    event.target.src = glassHide;
    event.target.title = 'Скрыть пароль';
    inputPassword.type = 'text';
  } else {
    event.target.dataset.type = 'password';
    event.target.src = glassOpen;
    event.target.title = 'Показать пароль';
    inputPassword.type = 'password';
  }
}

// Функция обработки результата запроса токена аутентификации
function eventOnLogin({ data, login }) {
  if (data.error) {
    let message;
    if (data.error === 'No such user') message = 'Ошибка: неверное имя пользователя';
    else if (data.error === 'Invalid password') message = 'Ошибка: неверный пароль';
    else message = data.error;
    showInfoMessage({ message: `Ошибка: "${message}"` });
  } else {
    setToken({ value: data.payload.token, login });
    renderApp();
  }
}

// Функция создания формы аутентификации
function createLoginForm() {
  const container = el('div.login');
  const form = el(
    'form.login-form',
    {
      onsubmit(event) {
        event.preventDefault();
        const formLogin = validateLoginFields();
        if (formLogin.valid) {
          logInSite({
            login: formLogin.inputLogin.value,
            password: formLogin.inputPassword.value,
            onDone: eventOnLogin,
            onError: eventOnError,
          });
        }
      },
    },
    [
      el('h1.title.title__login', 'Вход в аккаунт'),
      el('div.login-form__group-input', [
        el('label.login-form__label', 'Логин', { for: 'inputLogin' }),
        el('input.login-form__input.input-anime#inputLogin', {
          type: 'text',
          placeholder: 'Введите логин*',
          onkeypress(event) {
            checkInputCharToLogin(event);
          },
          oninput(event) {
            preValidateLogin(event);
          },
        }),
        el('span.login-form__error#inputLoginError', ''),
      ]),
      el('div.login-form__group-input', [
        el('label.login-form__label', 'Пароль', { for: 'inputPassword' }),
        el('input.login-form__input.input-anime#inputPassword', {
          type: 'password',
          placeholder: 'Введите пароль*',
          onkeypress(event) {
            checkInputCharOnNotSpace(event);
          },
          oninput(event) {
            preValidatePassword(event);
          },
        }),
        el('span.login-form__error#inputPasswordError', ''),
        el('img.login-form__img', {
          'data-type': 'password',
          src: glassOpen,
          onclick(event) {
            showPassword(event);
          },
          title: 'Показать пароль',
        }),
      ]),
      el('button.button.button__blue.button__blue-login#buttonLogin', 'Войти', {
        type: 'submit',
        title: 'Авторизоваться',
      }),
    ]
  );
  setChildren(container, form);
  return { container, form };
}

// Функция вызова формы аутентификации
export function callLoginForm() {
  const login = createLoginForm();
  setChildren(appContainer, login.container);
}
