/**
 * Модуль информационного блока
 */
import { el, setChildren, mount, unmount } from 'redom';

let infoBlock;

// Функция создания информационного блока
export function createInfo() {
  const infoContainer = el('div.info');
  infoBlock = el('div.info__block');
  setChildren(infoContainer, infoBlock);
  return { infoContainer, infoBlock };
}

// Функция создания информационного блока
export function showInfoMessage({ message, goodMessage = false }) {
  const classGoodMessage = goodMessage ? '.good' : '.error';
  const newInfo = el(`p.info__message${classGoodMessage}`, message);
  mount(infoBlock, newInfo);
  setTimeout(() => unmount(infoBlock, newInfo), 5000);
}
