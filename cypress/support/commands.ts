// ***********************************************
// Custom Commands for Ruzma E2E Tests
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login via UI
       * @example cy.login('test@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>

      /**
       * Custom command to signup via UI
       * @example cy.signup('Test User', 'test@example.com', 'password123')
       */
      signup(name: string, email: string, password: string): Chainable<void>

      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>
    }
  }
}

// Login command - uses regular email/password form, not Google OAuth
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/en/login')

  // Wait for the form to be visible
  cy.get('form').should('be.visible')

  // Fill in email - look for email input field
  cy.get('input[type="email"]').clear().type(email)

  // Fill in password - look for password input field
  cy.get('input[type="password"]').clear().type(password)

  // Submit the form - find the submit button (not Google button)
  cy.get('button[type="submit"]').contains(/sign in|login/i).click()
})

// Signup command
Cypress.Commands.add('signup', (name: string, email: string, password: string) => {
  cy.visit('/en/signup')

  // Wait for the form to be visible
  cy.get('form').should('be.visible')

  // Fill in name
  cy.get('input[placeholder*="Full Name"], input[placeholder*="name"], input[name="name"]').first().clear().type(name)

  // Fill in email
  cy.get('input[type="email"]').clear().type(email)

  // Fill in password
  cy.get('input[type="password"]').clear().type(password)

  // Submit the form
  cy.get('button[type="submit"]').contains(/sign up|register|create/i).click()
})

// Logout command
Cypress.Commands.add('logout', () => {
  // Click on user menu
  cy.get('[data-testid="user-menu"], button[aria-label*="user"], button[aria-label*="account"]').first().click()

  // Click logout option
  cy.contains(/sign out|logout/i).click()
})

export {}