/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      clickChildCheckbox: typeof clickChildCheckbox;
      dragAccordion: typeof dragAccordion;
      toggleParentAccordion: typeof toggleParentAccordion;
    }
  }
}

export const clickChildCheckbox = (parentId: string, childId: string) => {
  cy.get(parentId + ' > #parent-accordion > #accordion-grid > #accordion-summary').click('center');
  cy.get(childId + ' > :nth-child(1)').click();
  cy.wait(2000);
};

export const dragAccordion = (dragSelector: string, dropSelector: string) => {
  const dataTransfer = new DataTransfer();
  dragSelector = dragSelector + ' > #parent-accordion > #accordion-grid > #draghandle';
  dropSelector = dropSelector + ' > #parent-accordion > #accordion-grid > #draghandle';
  cy.get(dragSelector).trigger('mousedown', { dataTransfer });
  cy.get(dropSelector).trigger('mousemove', {
    dataTransfer
  });
  cy.get(dropSelector).trigger('mouseup');
};

export const toggleParentAccordion = (parentId: string) => {
  cy.get(parentId + ' > #parent-accordion > #accordion-grid > #accordion-summary').click('center');
};
