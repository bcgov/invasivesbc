declare global {
  namespace Cypress {
    interface Chainable {
      themeTextCheck: typeof themeTextCheck;
      changeTheme: typeof changeTheme;
    }
  }
}

export const themeTextCheck = () => {
  // Check dark mode text
  cy.get('.MuiList-root > [tabindex="0"]').find('.MuiSwitch-root').click();
  cy.get('.MuiTypography-root').should('have.css', 'color', 'rgb(255, 255, 255)');
  // Check Light mode text
  cy.get('.MuiList-root > [tabindex="0"]').find('.MuiSwitch-root').click();
  cy.get('.MuiTypography-root').should('have.css', 'color', 'rgba(0, 0, 0, 0.87)');
};

export const changeTheme = () => {
  cy.get('.MuiAvatar-root').click();
  cy.get('.MuiList-root > [tabindex="0"]').find('.MuiSwitch-root').click();
  cy.get('.MuiTypography-root').should('have.css', 'color', 'rgb(255, 255, 255)');
};
