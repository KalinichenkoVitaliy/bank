/**
 * Модуль API-функций доступа к данным
 */

// Функция получения токена для авторизации
export function logInSite({ login, password, onDone, onError }) {
  fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      login,
      password,
    }),
  })
    .then((response) => {
      response.json().then((data) => onDone({ data, login }));
    })
    .catch((err) => onError(err));
}

// Функция получения списка счетов пользователя
export function getAccounts({ token, onDone, onError }) {
  fetch('http://localhost:3000/accounts', {
    method: 'GET',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      response.json().then((data) => onDone(data));
    })
    .catch((err) => onError(err));
}

// Функция получения подробной информации о счёте пользователя
export function getAccountTransactions({ id, token, onDone, onError }) {
  fetch(`http://localhost:3000/account/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      response.json().then((data) => onDone(data));
    })
    .catch((err) => onError(err));
}

// Функция создания для пользователя нового счёта
export function createAccount({ token, onDone, onError }) {
  fetch('http://localhost:3000/create-account', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      response.json().then((data) => onDone(data));
    })
    .catch((err) => onError(err));
}

// Функция перевода средств со счёта на счёт
export function doTransfer({ token, accountFrom, accountTo, amount, onDone, onError }) {
  fetch('http://localhost:3000/transfer-funds', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: accountFrom,
      to: accountTo,
      amount,
    }),
  })
    .then((response) => {
      response.json().then((data) => onDone({ accountTo, amount, data }));
    })
    .catch((err) => onError(err));
}

// Функция получения списка валютных счетов текущего пользователя
export function getCurrencies({ token, onDone, onError }) {
  fetch('http://localhost:3000/currencies', {
    method: 'GET',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      response.json().then((data) => onDone(data));
    })
    .catch((err) => onError(err));
}

// Функция получения списка валютных счетов текущего пользователя
export function getAllCurrencies({ onDone, onError }) {
  fetch('http://localhost:3000/all-currencies', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      response.json().then((data) => onDone(data));
    })
    .catch((err) => onError(err));
}

// Функция получения списка точек, отмечающих места банкоматов
export function getBankomats({ onDone, onError }) {
  fetch('http://localhost:3000/banks', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      response.json().then((data) => onDone(data));
    })
    .catch((err) => onError(err));
}

// Функция перевода средств со счёта на счёт
export function doCurrencyBuy({ token, currencyFrom, currencyTo, amount, onDone, onError }) {
  fetch('http://localhost:3000/currency-buy', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: currencyFrom,
      to: currencyTo,
      amount,
    }),
  })
    .then((response) => {
      response.json().then((data) => onDone({ currencyFrom, currencyTo, amount, data }));
    })
    .catch((err) => onError(err));
}
