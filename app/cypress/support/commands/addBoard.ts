declare global {
  namespace Cypress {
    interface Chainable {
      addBoard: typeof addBoard;
    }
  }
}

export const addBoard = (input: string) => {
  cy.get('body').contains(`${input}`);
};
