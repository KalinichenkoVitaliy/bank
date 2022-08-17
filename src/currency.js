/**
 * Модуль раздела банкоматов
 */
import { el, setChildren, mount, unmount } from 'redom';
import { getToken, eventOnError, appContainer } from './index.js';
import { showInfoMessage } from './info.js';
import { getCurrencies, getAllCurrencies, doCurrencyBuy } from './api.js';
import { checkCharOnFloat } from './lib.js';
import { openSocketRates } from './websocket.js';
import { CustomSelect } from './custom-select.js';
import './css/custom-select.scss';

let currencyElements;
let exchangeForm = {};

// Функция обработки результата запроса списка транзакций к счёту
function onGetSocketMessage(data) {
  const defaultCountRowCurrenciesTable = 6;
  const countRowCurrenciesTable = currencyElements.currenciesTable.childNodes.length;
  const maxCountRowRatesTable = countRowCurrenciesTable + defaultCountRowCurrenciesTable;
  while (currencyElements.ratesTable.childNodes.length >= maxCountRowRatesTable) {
    unmount(currencyElements.ratesTable, currencyElements.ratesTable.lastChild);
  }
  const nameClassChangeCurrency =
    data.change === 1 ? '.change-currency_up' : data.change === -1 ? '.change-currency_down' : '';
  const rowTable = el('div.currency__table-row', [
    el('span.currency__table-row-code', `${data.from}/${data.to}`),
    el(`span.currency__table-row-interval${nameClassChangeCurrency}`),
    el('div.currency__table-row-right', [
      el('span.currency__table-row-amount', data.rate),
      el(`span.currency__table-row-icon${nameClassChangeCurrency}`),
    ]),
  ]);
  mount(currencyElements.ratesTable, rowTable, currencyElements.ratesTable.firstChild);
}

// Функция обработки результата запроса списка транзакций к счёту
function onGetCurrencies(data) {
  if (data.error) {
    showInfoMessage({ message: `Ошибка получения данных: "${data.error}"` });
  } else {
    createCurrenciesTable(data.payload);
  }
}

// Функция вызова запроса на получения списка валютных счетов текущего пользователя
function callGetCurrencies() {
  getCurrencies({
    token: getToken(),
    onDone: onGetCurrencies,
    onError: eventOnError,
  });
}

// Функция обработки результата запроса списка транзакций к счёту
function onGetAllCurrencies(data) {
  if (data.error) {
    showInfoMessage({ message: `Ошибка получения данных: "${data.error}"` });
  } else {
    createExchangeForm(data.payload);
  }
}

// Функция вызова запроса на получения списка валютных счетов текущего пользователя
function callGetAllCurrencies() {
  getAllCurrencies({
    onDone: onGetAllCurrencies,
    onError: eventOnError,
  });
}

// Функция проверки введённого символа в поле суммы обмена валюты
function checkInputCharToSum(event) {
  if (!checkCharOnFloat(event.keyCode)) event.preventDefault();
}

// Функция предварительной валидации суммы обмена валюты
function preValidateAmount(event) {
  let strValue = event.target.value;
  while (strValue.startsWith('.') || strValue.startsWith(' ')) {
    strValue = strValue.slice(1);
  }
  if (Number(strValue) >= 0) {
    if (Number(strValue) > 0) {
      event.target.classList.remove('is-error');
      document.getElementById('inputAmountError').textContent = '';
    }
  } else strValue = '';
  event.target.value = strValue;
}

// Функция предварительной валидации валюты обмена
function preValidateSelect(event) {
  const btn = event.target.querySelector('.select__toggle');
  if (btn.value) {
    btn.classList.remove('is-error');
    exchangeForm.selectError.textContent = '';
  }
}

// Функция валидации полей формы обмена валюты
function validateExchangeFormFields() {
  exchangeForm.valid = false;
  if (!exchangeForm.selectFrom.value) {
    exchangeForm.selectFrom.classList.add('is-error');
    exchangeForm.selectError.textContent = 'Не выбрана валюта продажи';
    exchangeForm.selectFrom.click();
  } else if (!exchangeForm.selectTo.value) {
    exchangeForm.selectTo.classList.add('is-error');
    exchangeForm.selectError.textContent = 'Не выбрана валюта покупки';
    exchangeForm.selectTo.click();
  } else if (exchangeForm.selectFrom.value === exchangeForm.selectTo.value) {
    exchangeForm.selectError.textContent = 'Выбраны одинаковые валюты';
    exchangeForm.selectTo.click();
  } else if (!(Number(exchangeForm.inputAmount.value) > 0)) {
    exchangeForm.inputAmount.classList.add('is-error');
    exchangeForm.inputAmountError.textContent = 'Введите сумму > 0';
    exchangeForm.inputAmount.focus();
  } else exchangeForm.valid = true;
}

// Функция обработки результата запроса обмена валюты
function eventOnCurrencyBuy({ currencyFrom, currencyTo, amount, data }) {
  if (data.error) {
    let message;
    switch (data.error) {
      case 'Unknown currency code':
        message =
          'передан неверный валютный код, код не поддерживается системой (валютный код списания или валютный код зачисления';
        break;
      case 'Invalid amount':
        document.getElementById('inputAccount').focus();
        message = 'не указана сумма перевода, или она отрицательная';
        break;
      case 'Not enough currency':
        document.getElementById('inputAmount').focus();
        message = 'на валютном счёте списания нет средств';
        break;
      case 'Overdraft prevented':
        document.getElementById('inputAmount').focus();
        message = 'попытка перевести больше, чем доступно на счёте списания';
        break;
      default:
        message = data.error;
        break;
    }
    showInfoMessage({ message: `Ошибка: "${message}"` });
  } else {
    exchangeForm.form.reset();
    showInfoMessage({
      message: `Обмен валюты из "${currencyFrom}" в "${currencyFrom}" на сумму ${amount} выполнен успешно`,
      goodMessage: true,
    });
    onGetCurrencies(data);
  }
}

// Функция создания таблицы списка валютных счетов текущего пользователя
function createCurrenciesTable(data) {
  setChildren(currencyElements.currenciesTable, []);
  for (const key in data) {
    if (data[key].amount > 0) {
      const rowTable = el('div.currency__table-row', [
        el('span.currency__table-row-code', data[key].code),
        el('span.currency__table-row-interval'),
        el('span.currency__table-row-amount', data[key].amount),
      ]);
      mount(currencyElements.currenciesTable, rowTable);
    }
  }
}

// Функция создания формы обмена валюты
function createExchangeForm(data) {
  data.sort();
  const form = el(
    'form.currency__form',
    {
      onsubmit(event) {
        event.preventDefault();
        validateExchangeFormFields();
        if (exchangeForm.valid) {
          showCurrenciesWaitingScreen();
          doCurrencyBuy({
            token: getToken(),
            currencyFrom: exchangeForm.selectFrom.value,
            currencyTo: exchangeForm.selectTo.value,
            amount: exchangeForm.inputAmount.value,
            onDone: eventOnCurrencyBuy,
            onError: eventOnError,
          });
        }
      },
    },
    [
      el('div.currency__form-left', [
        el('div.currency__form-left-top', [
          el('span.currency__form-currency-label', 'Из'),
          el('div.currency__form-currency-select#selectFrom'),
          el('span.currency__form-currency-label', 'в'),
          el('div.currency__form-currency-select#selectTo'),
          el('span.currency__form-currency-error#selectError', ''),
        ]),
        el('div.currency__form-left-bottom', [
          el('label.currency__form-amount-label', 'Сумма', {
            for: 'inputAmount',
          }),
          el('div.currency__form-amount-wrapper', [
            el('input.currency__form-amount-input.input-anime#inputAmount', {
              type: 'text',
              placeholder: 'Введите сумму*',
              onkeypress(event) {
                checkInputCharToSum(event);
              },
              oninput(event) {
                preValidateAmount(event);
              },
            }),
            el('span.currency__form-amount-error#inputAmountError', ''),
          ]),
        ]),
      ]),
      el('button.button.button__blue.currency__form-button', 'Обменять', {
        type: 'submit',
        title: 'Выполнить обмен',
      }),
    ]
  );
  // exchangeForm.form = form;
  // mount(currencyElements.exchange, form);
  if (exchangeForm.form === undefined) mount(currencyElements.exchange, form);
  else currencyElements.exchange.replaceChild(form, exchangeForm.form);
  exchangeForm.form = form;
  // создание объекта селекта для #selectFrom
  const selectFrom = new CustomSelect('#selectFrom', {
    name: 'selectFrom', // значение атрибута name у кнопки
    targetValue: 'BTC', // значение по умолчанию
    placeHolder: '? ? ?', // значение плайсхолдера селекта
    options: data.map((option) => {
      return [option, option];
    }), // опции
  });
  // создание обработчика выбора в селекте
  document.getElementById('selectFrom').addEventListener('select.change', (event) => {
    preValidateSelect(event);
  });
  // создание объекта селекта для #selectTo
  const selectTo = new CustomSelect('#selectTo', {
    name: 'selectTo', // значение атрибута name у кнопки
    targetValue: 'ETH', // значение по умолчанию
    placeHolder: '? ? ?', // значение плайсхолдера селекта
    options: data.map((option) => {
      return [option, option];
    }), // опции
  });
  // создание обработчика выбора в селекте
  document.getElementById('selectTo').addEventListener('select.change', (event) => {
    preValidateSelect(event);
  });
  // создание объектов описания формы
  exchangeForm.selectFrom = document.getElementById('selectFrom').querySelector('.select__toggle');
  exchangeForm.selectTo = document.getElementById('selectTo').querySelector('.select__toggle');
  exchangeForm.selectError = document.getElementById('selectError');
  exchangeForm.inputAmount = document.getElementById('inputAmount');
  exchangeForm.inputAmountError = document.getElementById('inputAmountError');
}

// Функция создания таблицы списка валютных счетов текущего пользователя - экран ожидания
function showCurrenciesWaitingScreen() {
  setChildren(currencyElements.currenciesTable, []);
  for (let i = 0; i < 6; i++) {
    const rowTable = el('div.currency__table-row', [
      el('span.currency__table-row-code.skeleton.skeleton__text.skeleton__text-20'),
      el('span.currency__table-row-interval'),
      el('span.currency__table-row-amount.skeleton.skeleton__text.skeleton__text-40'),
    ]);
    mount(currencyElements.currenciesTable, rowTable);
  }
}

// Функция создания формы обмена валюты - экран ожидания
function showAllCurrenciesWaitingScreen() {
  const form = el('form.currency__form', [
    el('div.currency__form-left', [
      el('div.currency__form-left-top', [
        el('div.currency__form-currency-label', 'Из'),
        el('div.currency__form-currency-select.skeleton.skeleton__button.skeleton__currency-form-select'),
        el('div.currency__form-currency-label', 'в'),
        el('div.currency__form-currency-select.skeleton.skeleton__button.skeleton__currency-form-select'),
      ]),
      el('div.currency__form-left-bottom', [
        el('div.currency__form-amount-label', 'Сумма'),
        el('div.currency__form-amount-input.skeleton'),
      ]),
    ]),
    el('div.skeleton.skeleton__button.skeleton__button-change'),
  ]);
  if (exchangeForm.form === undefined) mount(currencyElements.exchange, form);
  else currencyElements.exchange.replaceChild(form, exchangeForm.form);
  exchangeForm.form = form;
}

// Функция создания структурных DOM-элементов раздела счетов
function createCurrencyElements() {
  const currenciesTable = el('div.currency__table');
  const currencies = el('div.currency__currencies', [el('h3.title.title__subsection', 'Ваши валюты'), currenciesTable]);

  const exchange = el('div.currency__exchange', [el('h3.title.title__subsection', 'Обмен валюты')]);

  const ratesTable = el('div.currency__table');
  const rates = el('div.currency__rates', [
    el('h3.title.title__subsection', 'Изменение курсов в реальном времени'),
    ratesTable,
  ]);

  const body = el('div.currency__body', [el('div.currency__body-left', [currencies, exchange]), rates]);
  const container = el('div.currency', [el('h1.title.title__section', 'Валютный обмен'), body]);
  return { container, body, currencies, currenciesTable, exchange, rates, ratesTable };
}

// Функция вызова построения контента раздела банкоматов
export function renderCurrencyContent() {
  currencyElements = createCurrencyElements();
  setChildren(appContainer, currencyElements.container);
  showCurrenciesWaitingScreen();
  showAllCurrenciesWaitingScreen();
  callGetCurrencies();
  callGetAllCurrencies();
  openSocketRates({ onMessage: onGetSocketMessage });
}
