//
// Нужно выполнить команду 'npm run build' и в подпапке ./dist
// запустить веб-сервер командой: serve --listen 5000
//
describe('Приложение Coin.', () => {
  let newAccount;
  let prevArrayAccounts = [];
  let currArrayAccounts = [];

  before('Загрузка страницы', () => {
    cy.visit('http://localhost:5000/');
  });

  it('Проверка успешной загрузки страницы', () => {
    cy.url().should('include', 'http://localhost:');
  });

  it('Авторизация в приложении', () => {
    cy.get('#inputLogin').type('developer');
    cy.get('#inputPassword').type('skillbox');
    cy.get('#buttonLogin').click();
    cy.get('#exit').should('exist');
  });

  it('Просмотра списка счетов', () => {
    cy.get('.accounts__cards').should('not.empty');
  });

  it('Создания нового счёта', () => {
    // - сохранение списка счетов до добавление счёта
    cy.get('.accounts__cards-card')
      .each((elemCard) => {
        const account = elemCard.find('.accounts__cards-card-account').text();
        prevArrayAccounts.push(account);
      })
      .then(() => {
        // - добавление счёта
        cy.get('#accountAdd').click();
        cy.wait(2000);
      });
  });

  it('Проверка создания нового счёта', () => {
    // - получение нового списка счетов
    cy.get('.accounts__cards-card')
      .each((elemCard) => {
        const account = elemCard.find('.accounts__cards-card-account').text();
        currArrayAccounts.push(account);
      })
      .then(() => {
        // - получение номера нового счёта
        newAccount = currArrayAccounts.filter((num) => !prevArrayAccounts.includes(num))[0];
        cy.log(`Создан новый счёт №${newAccount}`);
        expect(newAccount).to.not.empty;
      });
  });

  it('Перевод суммы с основного счёта на новый счёт', () => {
    // - сохранение остатка на счёте-получателе
    cy.get(`#card-${newAccount}`)
      .find('.accounts__cards-card-balance')
      .then(($balans) => {
        const prevSum = parseInt($balans.text().replace(/ /g, ''));
        cy.log(`Остаток на счёте получателе №${newAccount} до перевода = ${prevSum}`);
        // - выполнение перевода
        cy.get('#74213041477477406320783754').click();
        cy.get('#inputAccount').type(newAccount);
        cy.get('#inputAmount').type('1000');
        cy.get('#buttonSend').click();
        cy.wait(4000);
        cy.get('#buttonBack').click();
        // - проверка увеличения остатка на счёте-получателе
        cy.get(`#card-${newAccount}`)
          .find('.accounts__cards-card-balance')
          .then(($balans) => {
            const sum = parseInt($balans.text().replace(/ /g, ''));
            cy.log(`Остаток на счёте получателе №${newAccount} после перевода = ${sum}`);
            expect(sum).to.be.greaterThan(prevSum);
          });
      });
  });

  // тест перевода суммы с нового счёта на другой счёт
  it('Перевода суммы с нового счёта на другой счёт', () => {
    // - сохранение остатка на счёте-получателе
    cy.get(`#card-73884482023804416026045788`)
      .find('.accounts__cards-card-balance')
      .then(($balans) => {
        const prevSum = parseInt($balans.text().replace(/ /g, ''));
        cy.log(`Остаток на счёте получателе №73884482023804416026045788 до перевода = ${prevSum}`);
        // - выполнение перевода
        cy.get(`#${newAccount}`).click();
        cy.get('#inputAccount').type('73884482023804416026045788');
        cy.get('#inputAmount').type('10');
        cy.get('#buttonSend').click();
        cy.wait(4000);
        cy.get('#buttonBack').click();
        // - проверка увеличения остатка на счёте-получателе
        cy.get(`#card-73884482023804416026045788`)
          .find('.accounts__cards-card-balance')
          .then(($balans) => {
            const sum = parseInt($balans.text().replace(/ /g, ''));
            cy.log(`Остаток на счёте получателе №73884482023804416026045788 после перевода = ${sum}`);
            expect(sum).to.be.greaterThan(prevSum);
          });
      });
  });

  // тест выхода из приложения
  it('Выход из приложения', () => {
    cy.get('#exit').click();
    cy.get('#exit').should('not.exist');
  });
});
