/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      dragAccordion: typeof dragAccordion;
    }
  }
}

export const dragAccordion = (dragSelector: string, dropSelector: string) => {
  const dataTransfer = new DataTransfer();
  cy.get(`${dragSelector}`).trigger('mousedown', { dataTransfer });
  cy.get(`${dropSelector}`).trigger('mousemove', { dataTransfer });
  cy.get(`${dropSelector}`).trigger('mouseup');
};
