/**
 * Модуль-библиотека вспомогательных функций
 */

/*------------------------------------------------------------------------------------------*/
// Раздел - проверка вводимых значений
/*------------------------------------------------------------------------------------------*/
/**
 * Функция проверки поля ввода на наличие недопустимых символов в ФИО
 * @param inStr - строка
 * @returns {boolean}
 */
export function checkOnBadChar(inStr) {
  const SPACE = 32;
  const engCharA = { min: 65, max: 90 };
  const engChara = { min: 97, max: 122 };
  const ruCharA = { min: 1040, max: 1130 };
  const ruCharYo = { big: 1025, small: 1105 };
  let isBadChar = false;
  // для каждого символа строки
  for (let i = 0; i < inStr.length; i++) {
    const cod = inStr.charCodeAt(i);
    isBadChar = !(
      cod === SPACE ||
      (engCharA.min <= cod && cod <= engCharA.max) ||
      (engChara.min <= cod && cod <= engChara.max) ||
      (ruCharA.min <= cod && cod <= ruCharA.max) ||
      cod === ruCharYo.big ||
      cod === ruCharYo.small
    );
    if (isBadChar) break;
  }
  return isBadChar;
}

/**
 * Функция проверки введённого символа на отсутствие пробела
 * @param inCod - число, код символа
 * @returns {boolean}
 */
export function checkCharOnNotSpace(inCod) {
  const SPACE = 32;
  // проверка кода введённого символа
  const isNotSpace = inCod !== SPACE;
  return isNotSpace;
}

/**
 * Функция проверки введённого символа на допустимость для логина
 * @param inCod - число, код символа
 * @returns {boolean}
 */
export function checkCharOnLogin(inCod) {
  const MINUS = 45;
  const DOT = 46;
  const UNDERLINE = 95;
  const DIGIT = { min: 48, max: 57 };
  const engCharA = { min: 65, max: 90 };
  const engChara = { min: 97, max: 122 };
  const ruCharA = { min: 1040, max: 1130 };
  const ruCharYo = { big: 1025, small: 1105 };
  // проверка кода введённого символа
  const isGoodChar =
    inCod === MINUS ||
    inCod === DOT ||
    inCod === UNDERLINE ||
    (DIGIT.min <= inCod && inCod <= DIGIT.max) ||
    (engCharA.min <= inCod && inCod <= engCharA.max) ||
    (engChara.min <= inCod && inCod <= engChara.max) ||
    (ruCharA.min <= inCod && inCod <= ruCharA.max) ||
    inCod === ruCharYo.big ||
    inCod === ruCharYo.small;
  return isGoodChar;
}

/**
 * Функция проверки введённого символа на допустимость для цифровых полей
 * @param inCod - число, код символа
 * @returns {boolean}
 */
export function checkCharOnDigit(inCod) {
  const DIGIT = { min: 48, max: 57 };
  // проверка кода введённого символа
  const isGoodChar = DIGIT.min <= inCod && inCod <= DIGIT.max;
  return isGoodChar;
}
/**
 * Функция проверки введённого символа на допустимость для числовых полей с точкой
 * @param inCod - число, код символа
 * @returns {boolean}
 */
export function checkCharOnFloat(inCod) {
  const DOT = 46;
  const DIGIT = { min: 48, max: 57 };
  // проверка кода введённого символа
  const isGoodChar = inCod === DOT || (DIGIT.min <= inCod && inCod <= DIGIT.max);
  return isGoodChar;
}

/*------------------------------------------------------------------------------------------*/
// Раздел - преобразования и форматирование значений
/*------------------------------------------------------------------------------------------*/
/**
 * Функция преобразования полученного числа с px в просто число
 * @param nPX - строка типа "5px"
 * @returns {number || null}
 */
export function pxToNum(nPX) {
  let i = nPX.indexOf('px', 0);
  // Если 'px' найдено и находится находится не ранее второго символа от начала строки
  if (i > 0) return nPX.slice(0, i);
  else return null;
}

/**
 * Функция преобразования полученного числа в название месяца
 * @param num - число
 * @returns {string}
 */
export function monthNumToName(num) {
  let nameMonth = '';
  switch (num) {
    case 1:
      nameMonth = 'января';
      break;
    case 2:
      nameMonth = 'февраля';
      break;
    case 3:
      nameMonth = 'марта';
      break;
    case 4:
      nameMonth = 'апреля';
      break;
    case 5:
      nameMonth = 'мая';
      break;
    case 6:
      nameMonth = 'июня';
      break;
    case 7:
      nameMonth = 'июля';
      break;
    case 8:
      nameMonth = 'августа';
      break;
    case 9:
      nameMonth = 'сентября';
      break;
    case 10:
      nameMonth = 'октября';
      break;
    case 11:
      nameMonth = 'ноября';
      break;
    case 12:
      nameMonth = 'декабря';
      break;
  }
  return nameMonth;
}

/**
 * Функция преобразования полученного числа в строку с дописыванием слова 'лет', 'год', 'года'
 * @param age - число
 * @returns {string}
 */
export function wordAgeYear(age) {
  let strAge = String(age);
  const numY = parseInt(strAge.substr(-1));
  switch (numY) {
    case 0:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
      strAge += ' лет';
      break;
    case 1:
      strAge += ' год';
      break;
    case 2:
    case 3:
    case 4:
      strAge += ' года';
      break;
  }
  return strAge;
}

/**
 * Функция преобразования полученного номера текущего месяца в массив объетов,
 * состоящий из имён последних num месяцев и строк посика транзакций к этим месяцам
 * @param num - число
 * @returns {array}
 */
export function numMonthToArrayLastMonths(num) {
  const arrayNameMonth = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const currDate = new Date();
  let indexMonth = currDate.getMonth();
  let calcYear = currDate.getFullYear();
  let arrayLastMonth = [];
  for (let i = 0; i < num; i++) {
    arrayLastMonth.unshift({
      nameMonth: arrayNameMonth[indexMonth],
      strSeek: `${calcYear}-${String(indexMonth + 1).padStart(2, '0')}`,
    });
    if (indexMonth === 0) {
      indexMonth = 11;
      calcYear--;
    } else indexMonth--;
  }
  return arrayLastMonth;
}

/**
 * Функция преобразования даты-строки формата ISO ('YYYY-MM-DDTHH:mm:ss.sssZ'),
 * в строку формата "ДД месяц ГГГГ"
 * @param dateISOString - строка
 * @returns {string}
 */
export function dateISOStringToDDMonthYYYY(dateISOString) {
  return (
    dateISOString.substr(8, 2) +
    ' ' +
    monthNumToName(parseInt(dateISOString.substr(5, 2))) +
    ' ' +
    dateISOString.substr(0, 4)
  );
}

/**
 * Функция преобразования даты-строки формата ISO ('YYYY-MM-DDTHH:mm:ss.sssZ'),
 * в строку формата "ДД.ММ.ГГГГ"
 * @param dateISOString - строка
 * @returns {string}
 */
export function dateISOStringToDDMMYYYY(dateISOString) {
  return dateISOString.substr(8, 2) + '.' + dateISOString.substr(5, 2) + '.' + dateISOString.substr(0, 4);
}

/**
 * Функция форматирования полученного числа на разряды с указанным разделителем
 * @param num - число
 * @param delimiter - разделитель
 * @returns {string}
 */
export function formatNumberByGroups(num, delimiter = ' ') {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
}

/*------------------------------------------------------------------------------------------*/
// Раздел - вычесления и гненерация значений
/*------------------------------------------------------------------------------------------*/
/**
 * Функция генерации случайного числа в диапазоне
 * @param n - число, 1-я граница диапазона
 * @param m - число, 2-я граница диапазона
 * @returns {number}
 */
export function rangeRandom(n, m) {
  // кол-во цифр, которые могу быть сгенерированы
  const range = Math.abs(m - n);
  // округлённое число от 0 до range
  const numberInRange = Math.round(Math.random() * range);
  // левая граница возможного числа
  let min = Math.min(n, m);

  return min + numberInRange;
}

/**
 * Функция вычисления полных лет между указанными начальной и конечной датами
 * @param startDate - начальная дата
 * @param endDate - конечная дата (или текущая, есди не указана)
 * @returns {number}
 */
export function diffYearOfDateNow(startDate, endDate = new Date()) {
  let difY = endDate.getFullYear() - startDate.getFullYear();
  const difM = endDate.getMonth() - startDate.getMonth();
  if (difM >= 0) {
    const difD = endDate.getDate() - startDate.getDate();
    if (difD < 0) difY--;
  } else {
    difY--;
  }
  return difY;
}

/*------------------------------------------------------------------------------------------*/
// Раздел - вычесления и гненерация значений
/*------------------------------------------------------------------------------------------*/
/**
 * Функция сортировки массива объектов по дате
 * @param array - массив объектов со свойством 'date' формата ISO ('YYYY-MM-DDTHH:mm:ss.sssZ')
 * @returns {array}
 */
export function sortArrayObjectsByDateISOString(array) {
  array.sort((prev, next) => {
    const datePrev = new Date(prev.date);
    const dateNext = new Date(next.date);
    return datePrev > dateNext ? -1 : datePrev < dateNext ? 1 : 0;
  });

  return array;
}
