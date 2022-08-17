/**
 * Модуль раздела счетов
 */
import { el, setChildren } from 'redom';
import { getToken, setPropertyUI, getPropertyUI, eventOnError, appContainer } from './index.js';
import { showInfoMessage } from './info.js';
import { getAccounts, createAccount } from './api.js';
import { dateISOStringToDDMonthYYYY, formatNumberByGroups } from './lib.js';
import { renderAccountDetailContent } from './account-detail.js';
import { CustomSelect } from './custom-select.js';
import './css/custom-select.scss';

let accountsElements;
let arrayAccounts = [];
let arrayAccountsShow = [];

// Функция преобразования данных сервера - список счетов
function preparationAccounts(data) {
  arrayAccounts = [];
  for (const currAccount of data) {
    const newAccount = {
      account: currAccount.account,
      balance: currAccount.balance,
      date: currAccount.transactions.length > 0 ? currAccount.transactions[0].date : '1970-01-01T00:00:00.000Z',
    };
    arrayAccounts.push(newAccount);
  }
  arrayAccountsShow = arrayAccounts.slice();
}

// Функция сортировки списка счетов
function sortArrayAccounts() {
  switch (getPropertyUI('accountsSelectSortValue')) {
    case 'по номеру':
      arrayAccountsShow.sort((ac1, ac2) => parseInt(ac1.account) - parseInt(ac2.account));
      break;
    case 'по балансу':
      arrayAccountsShow.sort((ac1, ac2) => ac1.balance - ac2.balance);
      break;
    case 'по последней транзакции':
      arrayAccountsShow.sort((ac1, ac2) => Date.parse(ac1.date) - Date.parse(ac2.date));
      break;
    default:
      arrayAccountsShow = arrayAccounts.slice();
      break;
  }
}

// Функция обработки результата запроса списка счетов
function eventOnGetAccounts(data) {
  if (data.error) {
    showInfoMessage({ message: `Ошибка получения данных: "${data.error}"` });
  } else {
    preparationAccounts(data.payload);
    sortArrayAccounts();
    createAccountsContentBody();
  }
}

// Функция обработки результата запроса на создание нового счёта
function onCreateAccount(data) {
  if (data.error) {
    showInfoMessage({ message: `Ошибка получения данных: "${data.error}"` });
  } else {
    showInfoMessage({
      message: `Создание нового счёта №${data.payload.account} выполнено успешно`,
      goodMessage: true,
    });
    callGetAccounts();
  }
}

// Функция вызова запроса на  получения списка счетов
function callGetAccounts() {
  getAccounts({
    token: getToken(),
    onDone: eventOnGetAccounts,
    onError: eventOnError,
  });
}

// Функция создания структурных DOM-элементов раздела счетов
function createAccountsElements() {
  const container = el('div.accounts');
  const top = el(
    'div.accounts__top',
    [
      el('div.accounts__top-left', [
        el('h1.title.title__section', 'Ваши счета'),
        el('div.accounts__top-left-select#selectSort'),
      ]),
    ],
    el(
      'button.button.button__blue.button__blue-icon#accountAdd',
      [el('span.button__blue-icon_allprop.button__blue-icon_add'), el('span', 'Создать новый счёт')],
      {
        onclick() {
          showAccountsWaitingScreen();
          createAccount({
            token: getToken(),
            onDone: onCreateAccount,
            onError: eventOnError,
          });
        },
      }
    )
  );
  const cards = el('div.accounts__cards');
  setChildren(container, [top, cards]);
  return { container, top, cards };
}

// Функция создания селекта сортировки счетов
function createAccountsSelectSort() {
  // создание объекта селекта
  const selectSort = new CustomSelect('#selectSort', {
    name: 'sorting', // значение атрибута name у кнопки
    targetValue: '', // значение по умолчанию
    placeHolder: 'Сортировка', // значение плайсхолдера селекта
    options: [
      ['по номеру', 'По номеру'],
      ['по балансу', 'По балансу'],
      ['по последней транзакции', 'По последней транзакции'],
    ], // опции
  });
  // создание обработчика выбора в селекте
  document.getElementById('selectSort').addEventListener('select.change', (e) => {
    const btn = e.target.querySelector('.select__toggle');
    setPropertyUI({ propName: 'accountsSelectSortValue', propValue: btn.value });
    sortArrayAccounts();
    createAccountsContentBody();
  });
  // первоначальная установка выбора селекта
  const propSelectSortValue = getPropertyUI('accountsSelectSortValue');
  selectSort.value = propSelectSortValue ? propSelectSortValue : '';
}

// Функция построения тела контента раздела счетов
function createAccountsContentBody() {
  const cards = [];
  arrayAccountsShow.forEach((card) => {
    const strDate =
      card.date === '1970-01-01T00:00:00.000Z' ? '- нет транзакций' : dateISOStringToDDMonthYYYY(card.date);
    cards.push(
      el(`div.accounts__cards-card#card-${card.account}`, [
        el('p.accounts__cards-card-account', card.account),
        el('p.accounts__cards-card-balance', `${formatNumberByGroups(Math.round(card.balance))} ₽`),
        el('div.accounts__cards-card-bottom', [
          el('div.accounts__cards-card-bottom-left', [
            el('p.accounts__cards-card-bottom-left-desc', 'Последняя транзакция:'),
            el('p.accounts__cards-card-bottom-left-date', strDate),
          ]),
          el(`button.button.button__blue.button__blue-open#${card.account}`, 'Открыть', {
            title: 'Открыть детальную информацию по счёту',
            onclick(event) {
              setPropertyUI({ propName: 'accountViewNum', propValue: card.account });
              renderAccountDetailContent();
            },
          }),
        ]),
      ])
    );
  });
  setChildren(accountsElements.cards, cards);
}

// Функция построения тела контента раздела счетов - экран ожидания
function showAccountsWaitingScreen() {
  const cards = [];
  for (let i = 0; i < 9; i++) {
    cards.push(
      el('div.accounts__cards-card', [
        el('p.accounts__cards-card-account.skeleton.skeleton__text.skeleton__text-80'),
        el('p.accounts__cards-card-balance.skeleton.skeleton__text.skeleton__text-30'),
        el('div.accounts__cards-card-bottom', [
          el('div.accounts__cards-card-bottom-left.skeleton__account-card-left', [
            el('p.accounts__cards-card-bottom-left-desc.skeleton.skeleton__text.skeleton__text-80.skeleton__mb'),
            el('p.accounts__cards-card-bottom-left-desc.skeleton.skeleton__text.skeleton__text-50'),
          ]),
          el('div.skeleton.skeleton__button.skeleton__button-account'),
        ]),
      ])
    );
  }
  setChildren(accountsElements.cards, cards);
}

// Функция вызова построения контента раздела счетов
export function renderAccountsContent() {
  accountsElements = createAccountsElements();
  setChildren(appContainer, accountsElements.container);
  createAccountsSelectSort();
  // если есть уже просматриваемый счёт - открываем детальную информацию по этому счёту
  if (getPropertyUI('accountViewNum')) {
    renderAccountDetailContent();
  } else {
    // иначе - запрашиваем данные по всем имеющимся счетам
    showAccountsWaitingScreen();
    callGetAccounts();
  }
}
