/**
 * Модуль раздела детальной информации по счёту
 */
import { el, setChildren } from 'redom';
import { CardInfo } from 'card-info';
import { getToken, setPropertyUI, getPropertyUI, eventOnError, appContainer } from './index.js';
import { showInfoMessage } from './info.js';
import { renderAccountsContent } from './accounts.js';
import { createBalanceDynamics } from './diagram.js';
import { getAccountTransactions, doTransfer } from './api.js';
import {
  formatNumberByGroups,
  checkCharOnDigit,
  dateISOStringToDDMMYYYY,
  sortArrayObjectsByDateISOString,
} from './lib.js';

let typeShowContent;
let detailElements;
let formSend = {};

// Функция выбора логотипа платежной системы по имени платежной системы

function setLogoPayment({ elementDOM, namePayment = '' }) {
  const paymentClass = [
    'american-express',
    'diners-club',
    'discover',
    'jcb',
    'maestro',
    'master-card',
    'mir',
    'unionpay',
    'visa',
  ];
  paymentClass.forEach((pm) => {
    if (elementDOM.classList.contains(pm)) elementDOM.classList.remove(pm);
  });
  if (namePayment) elementDOM.classList.add(namePayment);
}

// Функция обработки результата запроса списка транзакций к счёту
function onGetAccountTransactions(data) {
  if (data.error) {
    showInfoMessage({ message: `Ошибка получения данных: "${data.error}"` });
  } else {
    createAccountsDetailBody(data.payload);
  }
}

// Функция вызова запроса на получения списка транзакций по счёту
function callGetAccountTransactions() {
  getAccountTransactions({
    id: getPropertyUI('accountViewNum'),
    token: getToken(),
    onDone: onGetAccountTransactions,
    onError: eventOnError,
  });
}

// Функция проверки введённого символа в поле счёта получателя
function checkInputCharToAccount(event) {
  if (!checkCharOnDigit(event.keyCode)) event.preventDefault();
}

// Функция проверки введённого символа в поле суммы перевода
function checkInputCharToSum(event) {
  if (!checkCharOnDigit(event.keyCode)) event.preventDefault();
}

// Функция предварительной валидации счёта получателя
function preValidateAccount(event) {
  let strValue = event.target.value.replace(/ /g, '');
  if (strValue === '0') event.target.value = '';
  else {
    // проверка введённого счёта на соответствие банковской карте
    const accountLogo = document.getElementById('inputAccountLogo');
    const cardInfo = new CardInfo(strValue);
    if (cardInfo && cardInfo.brandAlias) {
      if (strValue.length <= cardInfo.numberLengths[0]) {
        setLogoPayment({ elementDOM: accountLogo, namePayment: cardInfo.brandAlias });
        event.target.value = cardInfo.numberNice;
      } else {
        setLogoPayment({ elementDOM: accountLogo });
        event.target.value = strValue;
      }
    } else {
      setLogoPayment({ elementDOM: accountLogo });
      event.target.value = strValue;
    }
    // проверка на снятие ошибки ввода
    if (strValue.length > 11) {
      if (strValue !== getPropertyUI('accountViewNum')) {
        event.target.classList.remove('is-error');
        document.getElementById('inputAccountError').textContent = '';
      }
    }
  }
}

// Функция предварительной валидации суммы перевода
function preValidateAmount(event) {
  let strValue = event.target.value.replace(/ /g, '');
  while (strValue.startsWith('0') || strValue.startsWith(' ')) {
    strValue = strValue.slice(1);
  }
  if (Number(strValue) > 0) {
    event.target.classList.remove('is-error');
    document.getElementById('inputAmountError').textContent = '';
  }
  event.target.value = strValue === '' ? '' : formatNumberByGroups(Number(strValue));
}

// Функция валидации полей формы отправки перевода
function validateFormSendFields() {
  formSend.valid = false;
  formSend.inputAccount = document.getElementById('inputAccount');
  formSend.inputAccountError = document.getElementById('inputAccountError');
  formSend.inputAmount = document.getElementById('inputAmount');
  formSend.inputAmountError = document.getElementById('inputAmountError');
  if (formSend.inputAccount.value.length < 12) {
    formSend.inputAccount.classList.add('is-error');
    formSend.inputAccountError.textContent =
      formSend.inputAccount.value.length === 0 ? 'Не указан номер счёта' : 'Номер счёта содержит менее 12 цифр';
    formSend.inputAccount.focus();
  } else if (formSend.inputAccount.value === getPropertyUI('accountViewNum')) {
    formSend.inputAccount.classList.add('is-error');
    formSend.inputAccountError.textContent = 'Номер счёта совпадает с текущим';
    formSend.inputAccount.focus();
  } else if (formSend.inputAmount.value === '') {
    formSend.inputAmount.classList.add('is-error');
    formSend.inputAmountError.textContent = 'Введите сумму больше 0';
    formSend.inputAmount.focus();
  } else formSend.valid = true;
}

// Функция обработки результата запроса отправки перевода
function eventOnTransfer({ accountTo, amount, data }) {
  if (data.error) {
    let message;
    switch (data.error) {
      case 'Invalid account from':
        message = 'неверный номер счёта отправителя';
        break;
      case 'Invalid account to':
        document.getElementById('inputAccount').focus();
        message = 'неверный номер счёта получателя';
        break;
      case 'Invalid amount':
        document.getElementById('inputAmount').focus();
        message = 'сумма перевода не указана или она отрицательная';
        break;
      case 'Overdraft prevented':
        document.getElementById('inputAmount').focus();
        message = 'недостаточно средств на счёте отправителя';
        break;
      default:
        message = data.error;
        break;
    }
    showInfoMessage({ message: `Ошибка: "${message}"` });
  } else {
    setPropertyUI({ propName: 'listGoodAccounts', propValue: accountTo, mode: 'addToArray' });
    showInfoMessage({
      message: `Перевод суммы ${formatNumberByGroups(amount)}₽ на счёт №${accountTo} выполнен успешно`,
      goodMessage: true,
    });
    onGetAccountTransactions(data);
  }
}

// Функция создания формы отправки перевода
function createSendForm() {
  // подготовка списка успешно получивших переводы счетов
  let arrayDOMGoodAccounts = [];
  getPropertyUI('listGoodAccounts', []).forEach((goodAccount) => {
    arrayDOMGoodAccounts.push(el('option', { value: goodAccount }));
  });
  // создание формы
  const form = el(
    'form.detail__form',
    {
      onsubmit(event) {
        event.preventDefault();
        validateFormSendFields();
        if (formSend.valid) {
          showAccountTransactionsWaitingScreen();
          doTransfer({
            token: getToken(),
            accountFrom: getPropertyUI('accountViewNum'),
            accountTo: formSend.inputAccount.value.replace(/ /g, ''),
            amount: formSend.inputAmount.value.replace(/ /g, ''),
            onDone: eventOnTransfer,
            onError: eventOnError,
          });
        }
      },
    },
    [
      el('div.detail__form-group-input', [
        el('label.detail__form-label', 'Номер счёта получателя', {
          for: 'inputAccount',
        }),
        el('datalist#listGoodAccounts', arrayDOMGoodAccounts),
        el('input.detail__form-input.input-anime#inputAccount', {
          type: 'text',
          list: 'listGoodAccounts',
          placeholder: 'Введите номер счёта*',
          onkeypress(event) {
            checkInputCharToAccount(event);
          },
          oninput(event) {
            preValidateAccount(event);
          },
        }),
        el('span.detail__form-error#inputAccountError', ''),
        el('span.detail__form-logo#inputAccountLogo'),
      ]),
      el('div.detail__form-group-input', [
        el('label.detail__form-label', 'Сумма перевода', {
          for: 'inputAmount',
        }),
        el('input.detail__form-input.input-anime#inputAmount', {
          type: 'text',
          placeholder: 'Введите сумму*',
          onkeypress(event) {
            checkInputCharToSum(event);
          },
          oninput(event) {
            preValidateAmount(event);
          },
        }),
        el('span.detail__form-error#inputAmountError', ''),
      ]),
      el(
        'button.button.button__blue.button__blue-icon.button__blue-icon-send#buttonSend',
        [el('span.button__blue-icon_allprop.button__blue-icon_send'), el('span', 'Отправить')],
        {
          type: 'submit',
          title: 'Отправить перевод',
        }
      ),
    ]
  );
  formSend.form = form;
  return { form };
}

// Функция создания истории переводов
export function createHistoryTransfers({ data, countRow }) {
  // подготовка настроек для DOM-элемента диаграммы
  let titleOnClick = '';
  let funOnClick;
  if (typeShowContent === 'accountsDetail') {
    titleOnClick = 'Кликни для получения истории баланса';
    funOnClick = function () {
      createAccountHistoryBalance(data);
    };
  }
  // создание заголовков таблицы
  const table = el('div.history.block-anime', {
    title: titleOnClick,
    onclick() {
      if (funOnClick) funOnClick();
    },
  });
  const tableTitles = [
    el('div.history__title.history__title-column1', 'Счёт отправителя'),
    el('div.history__title.history__title-column2', 'Счёт получателя'),
    el('div.history__title.history__title-column3', 'Сумма'),
    el('div.history__title.history__title-column4', 'Дата'),
  ];
  // создание строк таблицы
  const arrTransactions = sortArrayObjectsByDateISOString(data.transactions.slice(-countRow));
  const tableCells = [];
  for (const transaction of arrTransactions) {
    let signAmount = '';
    let classColorAmount = '';
    if (transaction.amount > 0) {
      if (transaction.to === getPropertyUI('accountViewNum')) {
        signAmount = '+ ';
        classColorAmount = '.history__cell_income';
      } else {
        signAmount = '- ';
        classColorAmount = '.history__cell_outcome';
      }
    }
    tableCells.push([
      el('div.history__cell.history__cell-column1', transaction.from),
      el('div.history__cell.history__cell-column2', transaction.to),
      el(
        `div.history__cell.history__cell-column3${classColorAmount}`,
        `${signAmount}${formatNumberByGroups(transaction.amount)} ₽`
      ),
      el('div.history__cell.history__cell-column4', dateISOStringToDDMMYYYY(transaction.date)),
    ]);
  }
  setChildren(table, [tableTitles, tableCells]);
  return { table };
}

// Функция создания формы отправки перевода для режима ожидания данных
function createSendFormForWaiting() {
  const form = el('div.detail__form', [
    el('div.detail__form-group-input', [
      el('div.detail__form-label', 'Номер счёта получателя'),
      el('div.detail__form-input.skeleton.skeleton__account-form-input'),
    ]),
    el('div.detail__form-group-input', [
      el('div.detail__form-label', 'Сумма перевода'),
      el('div.detail__form-input.skeleton.skeleton__account-form-input'),
    ]),
    el('div.skeleton.skeleton__button.skeleton__button-send'),
  ]);
  formSend.form = form;
  return { form };
}

// Функция создания динамики баланса
function createBalanceDynamicsForWaiting({ classCanvas, countMonth }) {
  countMonth = countMonth === 6 ? 6 : countMonth === 12 ? 12 : 6;
  // создание графика
  const graph = [];
  const fluctuations = [2, 5, 6, 3, 7, 1, 4, 7, 5, 8, 3, 6];
  // перебор строк
  for (let i = 0; i < 10; i++) {
    graph.push(el('div'));
    // перебор колонок
    for (let j = 0; j < countMonth; j++) {
      const classSkeleton = i < fluctuations[j] ? '' : '.skeleton';
      graph.push(el(`div${classSkeleton}.skeleton__diagram-graph-column`));
    }
    graph.push(el('div'));
  }
  // создание шкалы Х
  const scaleX = [el('div')];
  for (let i = 0; i < countMonth; i++) {
    scaleX.push(el('div.skeleton.skeleton__text'));
  }
  scaleX.push(el('div'));
  // создание DOM-элемента для диаграммы
  const diagram = el(`div${classCanvas}.skeleton__diagram`, [
    el('div.skeleton__diagram-body', [
      el(`div.skeleton__diagram-graph.skeleton__diagram-scale-${countMonth}`, graph),
      el('div.skeleton__diagram-scale-y', [
        el('div.skeleton.skeleton__text.skeleton__diagram-scale-y-top'),
        el('div'),
        el('div.skeleton__diagram-scale-y-null', '0'),
      ]),
      el(`div.skeleton__diagram-scale-x.skeleton__diagram-scale-${countMonth}`, scaleX),
      el('div.skeleton__diagram-empty'),
    ]),
  ]);
  return { diagram };
}

// Функция создания истории переводов для режима ожидания данных
function createHistoryTransfersForWaiting() {
  // создание заголовков таблицы
  const table = el('div.history');
  const tableTitles = [
    el('div.history__title.history__title-column1', 'Счёт отправителя'),
    el('div.history__title.history__title-column2', 'Счёт получателя'),
    el('div.history__title.history__title-column3', 'Сумма'),
    el('div.history__title.history__title-column4', 'Дата'),
  ];
  // создание строк таблицы
  const tableCells = [];
  for (let i = 0; i < 10; i++) {
    tableCells.push([
      el('div.history__cell.history__cell-column1', [el('div.skeleton.skeleton__text.skeleton__dinamic-from')]),
      el('div.history__cell.history__cell-column2', [el('div.skeleton.skeleton__text.skeleton__dinamic-to')]),
      el('div.history__cell.history__cell-column3', [el('div.skeleton.skeleton__text.skeleton__dinamic-amount')]),
      el('div.history__cell.history__cell-column4', [el('div.skeleton.skeleton__text.skeleton__dinamic-date')]),
    ]);
  }
  setChildren(table, [tableTitles, tableCells]);
  return { table };
}

// Функция построения тела раздела детальной информации по счёту
function createAccountsDetailBody(data) {
  const top = el('div.detail__body-top', [
    el('h2.title.title__account', `№ ${data.account}`),
    el('h3.title.title__balance', [
      el('span.title__balance-desc', 'Баланс'),
      el('span.title__balance-sum', formatNumberByGroups(Math.round(data.balance))),
      el('span.title__balance-currency', '₽'),
    ]),
  ]);
  const middle = el('div.detail__body-middle', [
    el('div.detail__body-middle-left', [el('h3.title.title__subsection', 'Новый перевод'), createSendForm().form]),
    el('div.detail__body-middle-right', [
      el('h3.title.title__subsection.title__padLR', 'Динамика баланса'),
      createBalanceDynamics({ classCanvas: '.detail__canvas', data, countMonth: 6 }).canvas,
    ]),
  ]);
  const bottom = el('div.detail__body-bottom', [
    el('h3.title.title__subsection', 'История переводов'),
    createHistoryTransfers({ data: data, countRow: 10 }).table,
  ]);
  detailElements.content = { top, middle, bottom };
  setChildren(detailElements.body, [top, middle, bottom]);
}

//Функция построения тела раздела детальной информации по счёту - экран ожидания
function showAccountTransactionsWaitingScreen() {
  const top = el('div.detail__body-top', [
    el('h2.title.title__account.skeleton.skeleton__text.skeleton__account-num'),
    el('h3.title.title__balance', [
      el('span.title__balance-desc', 'Баланс'),
      el('span.title__balance-sum.skeleton.skeleton__text.skeleton__account-balance'),
      el('span.title__balance-currency', '₽'),
    ]),
  ]);
  const middle = el('div.detail__body-middle', [
    el('div.detail__body-middle-left', [
      el('h3.title.title__subsection', 'Новый перевод'),
      createSendFormForWaiting().form,
    ]),
    el('div.detail__body-middle-right', [
      el('h3.title.title__subsection.title__padLR', 'Динамика баланса'),
      createBalanceDynamicsForWaiting({ classCanvas: '.detail__canvas', countMonth: 6 }).diagram,
    ]),
  ]);
  const bottom = el('div.detail__body-bottom', [
    el('h3.title.title__subsection', 'История переводов'),
    createHistoryTransfersForWaiting().table,
  ]);
  detailElements.content = { top, middle, bottom };
  setChildren(detailElements.body, [top, middle, bottom]);
}

// Функция построения истории баланса раздела детальной информации по счёту
export function createAccountHistoryBalance(data) {
  typeShowContent = 'historyBalance';
  detailElements.title.textContent = 'История баланса';
  detailElements.content.middle.classList.add('history__middle', 'overpower');
  setChildren(detailElements.content.middle, [
    el('div.detail__body-middle-right.history__middle-right.overpower', [
      el('h3.title.title__subsection.title__padLR', 'Динамика баланса'),
      createBalanceDynamics({
        classCanvas: '.detail__canvas',
        ariaNameDiagram: 'Диаграмма динамики баланса',
        altNameDiagram: 'Динамика баланса',
        data,
        countMonth: 12,
        typeShowContent: 'historyBalance',
        typeBalance: 'common',
        showCurrency: true,
      }).canvas,
    ]),
    el('div.detail__body-middle-right.history__middle-right.overpower', [
      el('h3.title.title__subsection.title__padLR', 'Соотношение входящих исходящих транзакций'),
      createBalanceDynamics({
        classCanvas: '.detail__canvas',
        data,
        ariaNameDiagram: 'Диаграмма соотношения входящих исходящих транзакций',
        altNameDiagram: 'Динамика соотношения транзакций',
        data,
        countMonth: 12,
        typeShowContent: 'historyBalance',
        typeBalance: 'ratio',
        showCurrency: true,
      }).canvas,
    ]),
  ]);

  setChildren(detailElements.content.bottom, [
    el('h3.title.title__subsection', 'История переводов'),
    createHistoryTransfers({ data: data, countRow: 25 }).table,
  ]);
}

// Функция построения заголовка раздела детальной информации по счёту
function createDetailElements() {
  const container = el('div.detail');
  const title = el('h1.title.title__section', 'Просмотр счёта');
  const top = el('div.detail__top', [
    title,
    el(
      'button.button.button__blue.button__blue-icon#buttonBack',
      [el('span.button__blue-icon_allprop.button__blue-icon_back'), el('span', 'Вернуться назад')],
      {
        onclick() {
          if (typeShowContent === 'accountsDetail') {
            setPropertyUI({ propName: 'accountViewNum', propValue: '' });
            detailElements.content = undefined;
            setChildren(container, []);
            renderAccountsContent();
          } else renderAccountDetailContent();
        },
      }
    ),
  ]);
  const body = el('div.detail__body');
  setChildren(container, [top, body]);
  return { container, title, top, body };
}

// Функция вызова построения контента раздела детальной информации по счёту
export function renderAccountDetailContent() {
  typeShowContent = 'accountsDetail';
  detailElements = createDetailElements();
  setChildren(appContainer, detailElements.container);
  showAccountTransactionsWaitingScreen();
  callGetAccountTransactions();
}
