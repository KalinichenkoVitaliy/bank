/**
 * Модуль Яндекс-карты
 */
// Функция подключение API Яндекс-карты
export function connectApiYandexMap() {
  if (typeof ymaps === 'undefined') {
    const scriptYandexMap = document.createElement('script');
    scriptYandexMap.src = 'https://api-maps.yandex.ru/2.1/?apikey=ваш API-ключ&lang=ru_RU';
    scriptYandexMap.type = 'text/javascript';
    document.head.append(scriptYandexMap);
  }
}

// Функция создания Яндекс-карты с параметрами
function init({ elementDomID, mapCenter, mapPoints }) {
  // создание карты
  const myMap = new ymaps.Map(
    elementDomID, // 'map'
    {
      // Координаты центра карты.
      center: mapCenter, // [55.76010445375011, 37.61861365856933],
      // Уровень масштабирования. Допустимые значения: от 0 (весь мир) до 19.
      zoom: 10,
    }
  );
  // создание точек размещения банкоматов
  mapPoints.forEach((point) => {
    // mapPoints: [{ lat: 55.76010445375011, lon: 37.61861365856933 }, ...],
    myMap.geoObjects.add(
      new ymaps.GeoObject({
        geometry: {
          type: 'Point',
          coordinates: [point.lat, point.lon],
        },
      })
    );
  });
}

// Функция вызова построения карты
export function renderMap({ elementDomID, mapCenter, mapPoints }) {
  // ожидание загрузки API Яндекс-карты (connectApiYandexMap())
  const timeoutId1 = setInterval(() => {
    if (typeof ymaps !== 'undefined') {
      clearTimeout(timeoutId1);
      // ожидание загрузки конструктора ymaps.Map
      const timeoutId2 = setInterval(() => {
        if (typeof ymaps.Map !== 'undefined') {
          clearTimeout(timeoutId2);
          ymaps.ready(init({ elementDomID, mapCenter, mapPoints })).then(() => {
            // удаление окна ожидания карты
            const mapWaitingScreen = document.getElementById('mapWaitingScreen');
            mapWaitingScreen.remove();
          });
        }
      }, 100);
    }
  }, 100);
}
