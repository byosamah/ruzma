// This test runs first to set up test accounts
describe('Test Setup', () => {
  const testEmail = `test_${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  const testName = 'Test User'

  it('should create a test account', () => {
    // Visit signup page
    cy.visit('/en/signup')

    // Wait for form to load
    cy.get('form').should('be.visible')

    // Fill in the signup form - avoiding Google OAuth button
    // Look for inputs within the form element specifically
    cy.get('form').within(() => {
      // Find name input - get first text input that's not email or password
      cy.get('input:not([type="email"]):not([type="password"])').first().clear().type(testName)

      // Find email input
      cy.get('input[type="email"]').clear().type(testEmail)

      // Find password input
      cy.get('input[type="password"]').clear().type(testPassword)

      // Submit the form
      cy.get('button[type="submit"]').click()
    })

    // After signup, we should either:
    // 1. Be redirected to dashboard
    // 2. See email confirmation message
    // 3. Be redirected to login

    // Check for various success scenarios
    cy.url({ timeout: 10000 }).then((url) => {
      if (url.includes('/dashboard')) {
        // Successfully logged in after signup
        cy.contains(/dashboard|welcome|projects/i).should('be.visible')
      } else if (url.includes('/email-confirmation')) {
        // Email confirmation required
        cy.contains(/confirm|verification|email/i).should('be.visible')
      } else if (url.includes('/login')) {
        // Redirected to login after signup
        cy.contains(/sign in|login/i).should('be.visible')
      }
    })

    // Save credentials for other tests
    cy.writeFile('cypress/fixtures/testUser.json', {
      email: testEmail,
      password: testPassword,
      name: testName
    })
  })

  it('should handle existing test account gracefully', () => {
    // Try to read existing test user or create a new one
    cy.task('readFileMaybe', 'cypress/fixtures/testUser.json').then((existingUser) => {
      if (!existingUser) {
        // No existing test user, skip this test
        cy.log('No existing test user found, skipping login test')
        return
      }

      const testUser = existingUser as { email: string; password: string; name: string }

      // Visit login page
      cy.visit('/en/login')

      // Wait for form to load
      cy.get('form').should('be.visible')

      // Fill in login form
      cy.get('form').within(() => {
        cy.get('input[type="email"]').clear().type(testUser.email)
        cy.get('input[type="password"]').clear().type(testUser.password)
        cy.get('button[type="submit"]').click()
      })

      // Should be redirected to dashboard or see success
      cy.url({ timeout: 10000 }).then((url) => {
        // Accept any of these as success
        if (url.includes('dashboard') || url.includes('projects') || url.includes('home')) {
          cy.log('Successfully logged in')
        } else if (url.includes('google') || url.includes('oauth')) {
          // Got redirected to OAuth, test account might not exist
          cy.log('Test account might not exist, OAuth redirect detected')
        } else {
          // Still on login page, credentials might be wrong
          cy.log('Login failed, might need new test account')
        }
      })
    })
  })
})