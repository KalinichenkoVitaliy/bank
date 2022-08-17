/**
 * Модуль заголовка приложения
 */
import { el, setChildren, mount } from 'redom';
import { isToken, removeToken, setPropertyUI, renderApp, appHeader } from './index.js';
import { renderBankomatsContent } from './bankomats.js';
import { renderAccountsContent } from './accounts.js';
import { renderCurrencyContent } from './currency.js';
import { closeSocketRates } from './websocket.js';

// Функция выделения выбранной кнопки заголовка приложения
export function markHeaderButton(currentButton) {
  appHeader.querySelectorAll('.button').forEach((element) => {
    element.classList.remove('is-selected');
  });
  currentButton.classList.add('is-selected');
}

// Функция построения контента заголовка приложения
export function renderHeaderContent() {
  setChildren(appHeader, [el('span', { class: 'header__title' }, 'Coin.')]);
  if (isToken())
    mount(
      appHeader,
      el('div.header__btn-group', [
        el('button.button.button__white#bankomats', 'Банкоматы', {
          onclick(event) {
            closeSocketRates();
            markHeaderButton(event.target);
            setPropertyUI({ propName: 'headerSelectedButton', propValue: event.target.id });
            renderBankomatsContent();
          },
        }),
        el('button.button.button__white#accounts', 'Счета', {
          onclick(event) {
            closeSocketRates();
            markHeaderButton(event.target);
            setPropertyUI({ propName: 'headerSelectedButton', propValue: event.target.id });
            renderAccountsContent();
          },
        }),
        el('button.button.button__white#currency', 'Валюта', {
          onclick(event) {
            closeSocketRates();
            markHeaderButton(event.target);
            setPropertyUI({ propName: 'headerSelectedButton', propValue: event.target.id });
            renderCurrencyContent();
          },
        }),
        el('button.button.button__white#exit', 'Выйти', {
          onclick() {
            closeSocketRates();
            setPropertyUI({ propName: 'accountViewNum', propValue: '' });
            setPropertyUI({ propName: 'headerSelectedButton', propValue: 'accounts' });
            removeToken();
            renderApp();
          },
        }),
      ])
    );
}
