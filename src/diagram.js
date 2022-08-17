import { el } from 'redom';
import Chart from 'chart.js/auto';
import { getPropertyUI } from './index.js';
import { createAccountHistoryBalance } from './account-detail.js';
import { formatNumberByGroups, numMonthToArrayLastMonths } from './lib.js';

// // Определение элемента CSS-переменных и его стилей
// const elemRoot = document.querySelector(':root');
// const stylesRoot = getComputedStyle(elemRoot);

// // Функция определения необходимости изменения шрифта диаграммы в зависимости от ширины экрана
// function changeStylesDiagram(mQ) {
//   // Проверяем, верен ли медиа-запрос
//   if (mQ.matches && chartBalanceDynamics) {
//     // если верен и ширина Desktop
//     if (window.innerWidth >= stylesRoot.getPropertyValue('--brpo-min-width-1200')) {
//       chartBalanceDynamics.options.scales.y.ticks.padding = 20;
//     }
//     // если верен и ширина Tablet
//     if (
//       window.innerWidth >= stylesRoot.getPropertyValue('--brpo-min-width-768') &&
//       window.innerWidth <= stylesRoot.getPropertyValue('--brpo-max-width-768')
//     ) {
//       chartBalanceDynamics.options.scales.y.ticks.padding = 10;
//     }
//     // если верен и ширина Mobile
//     if (window.innerWidth <= stylesRoot.getPropertyValue('--brpo-max-width-320')) {
//       chartBalanceDynamics.options.scales.y.ticks.padding = 3;
//     }
//   }
// }

// Функция вычисления динамики баланса
function calculateBalanceDynamics({ data, arraySeek }) {
  const numViewAccount = getPropertyUI('accountViewNum');
  let arrayResultData = [];
  arraySeek.forEach((strSeek) => {
    const finedTransaction = data.filter((transaction) => transaction.date.startsWith(strSeek));
    let amountInComing = 0;
    let amountOutComing = 0;
    finedTransaction.forEach((transaction) => {
      if (transaction.to === numViewAccount) amountInComing += transaction.amount;
      else amountOutComing += transaction.amount;
    });
    amountInComing = Math.round(amountInComing);
    amountOutComing = Math.round(amountOutComing);
    arrayResultData.push({ amountInComing, amountOutComing });
  });
  return arrayResultData;
}

// Функция подготовки данных для диаграммы в зависимости от её типа
export function prepareDataForDiagram({ data, typeBalance }) {
  let balanceData1 = { kit: [], backgroundColor: '#76ca66' };
  let balanceData2 = { kit: [], backgroundColor: '#fd4e5d' };
  let mediumSumY;
  const balanceSum = data.map((m) => {
    return m.amountInComing + m.amountOutComing;
  });
  const maxSumY = Math.max.apply(null, balanceSum);
  if (typeBalance === 'common') {
    balanceData1.backgroundColor = '#116acc';
    balanceData1.kit = balanceSum;
    balanceData2.kit = data.map((m) => {
      return 0;
    });
    mediumSumY = maxSumY;
  } else if (typeBalance === 'ratio') {
    balanceData1.kit = data.map((m) => {
      return m.amountInComing;
    });
    balanceData2.kit = data.map((m) => {
      return m.amountOutComing;
    });
    // mediumSumY = Math.min(Math.max.apply(null, balanceData1.kit), Math.max.apply(null, balanceData2.kit));
    mediumSumY = Math.round(maxSumY / 2);
  }
  return { balanceData1, balanceData2, maxSumY, mediumSumY };
}

// Функция создания динамики баланса
export function createBalanceDynamics({
  classCanvas,
  classAnime = '.block-anime', // '.block-anime', ''
  ariaNameDiagram = 'Диаграмма динамики баланса',
  altNameDiagram = 'Динамика баланса',
  data,
  countMonth,
  typeShowContent = 'accountsDetail', // 'accountsDetail', 'historyBalance'
  typeBalance = 'common', // 'common', 'ratio'
  showCurrency = false,
}) {
  // подготовка настроек для DOM-элемента диаграммы
  let titleOnClick = '';
  let funOnClick;
  if (typeShowContent === 'accountsDetail') {
    titleOnClick = 'Кликни для получения истории баланса';
    funOnClick = function () {
      createAccountHistoryBalance(data);
    };
  }
  // создание DOM-элемента для диаграммы
  const canvas = el(`canvas${classCanvas}${classAnime}`, altNameDiagram, {
    role: 'img',
    ariaLabel: ariaNameDiagram,
    title: titleOnClick,
    onclick() {
      if (funOnClick) funOnClick();
    },
  });
  // вычисление массива последних месяцев
  const arrayLastMonths = numMonthToArrayLastMonths(countMonth);
  // подготовка необходимых данных для диаграммы
  const labelsLastMonths = arrayLastMonths.map((m) => {
    return m.nameMonth;
  });
  const strSeekLastMonths = arrayLastMonths.map((m) => {
    return m.strSeek;
  });
  const arrayData = calculateBalanceDynamics({ data: data.transactions, arraySeek: strSeekLastMonths });
  const dataForDiagram = prepareDataForDiagram({ data: arrayData, typeBalance });
  // создание диаграммы
  const chartData = {
    labels: labelsLastMonths,
    datasets: [
      {
        data: dataForDiagram.balanceData2.kit,
        backgroundColor: dataForDiagram.balanceData2.backgroundColor,
      },
      {
        data: dataForDiagram.balanceData1.kit,
        backgroundColor: dataForDiagram.balanceData1.backgroundColor,
      },
    ],
  };
  const graph = new Chart(canvas, {
    type: 'bar',
    data: chartData,
    options: {
      scales: {
        x: {
          position: 'bottom',
          stacked: true,
          grid: { display: false, borderColor: '#000000' },
          ticks: {
            font: {
              family: "'WorkSans', sans-serif",
              weight: '700',
              letterSpacing: '-0.02em',
            },
            color: '#000000',
          },
        },
        y: {
          position: 'right',
          stacked: true,
          beginAtZero: true,
          grid: { display: false, borderColor: '#000000' },
          ticks: {
            callback: (value) => {
              const strCur = showCurrency ? '₽' : '';
              return `${formatNumberByGroups(value)} ${strCur}`;
            },
            font: {
              family: "'WorkSans', sans-serif",
              weight: '500',
              letterSpacing: '-0.02em',
            },
            color: '#000000',
            stepSize: dataForDiagram.mediumSumY,
          },
          min: 0,
          max: dataForDiagram.maxSumY,
        },
        myScaleX: {
          axis: 'x',
          position: 'top',
          grid: { display: false, borderColor: '#000000' },
          ticks: { display: false },
          gridLines: { display: false, drawTicks: false },
        },
        myScaleY: {
          axis: 'y',
          position: 'left',
          grid: { display: false, borderColor: '#000000' },
          ticks: { display: false },
          gridLines: { display: false, drawTicks: false },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
  // changeStylesDiagram(mQueryDiagram1200);
  // changeStylesDiagram(mQueryDiagram768);
  // changeStylesDiagram(mQueryDiagram320);
  return { canvas, graph };
}

// // Медиа-запросы на смену ширины экрана
// const mQueryDiagram1200 = window.matchMedia(`(min-width:${stylesRoot.getPropertyValue('--brpo-min-width-1200')}px)`);
// const mQueryDiagram768 = window.matchMedia(
//   `(min-width:${stylesRoot.getPropertyValue('--brpo-min-width-768')}px) and (max-width:${stylesRoot.getPropertyValue(
//     '--brpo-max-width-768'
//   )}px)`
// );
// const mQueryDiagram320 = window.matchMedia(`
//       (max-width:${stylesRoot.getPropertyValue('--brpo-max-width-320')}px)`);

// // Настраиваем слушателя событий для отслеживания измений по медиазапросу
// mQueryDiagram320.addListener(changeStylesDiagram);
// mQueryDiagram768.addListener(changeStylesDiagram);
// mQueryDiagram1200.addListener(changeStylesDiagram);
// // Первое выполнение-инициализация функций слушателя отслеживания измений по медиазапросу
// changeStylesDiagram(mQueryDiagram320);
// changeStylesDiagram(mQueryDiagram768);
// changeStylesDiagram(mQueryDiagram1200);
