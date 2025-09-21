describe('Simple Login Test', () => {
  it('should login with the test account', () => {
    // Use the test credentials
    const email = 'cypress@test.com'
    const password = 'TestPassword123!'

    // Visit login page
    cy.visit('/en/login')

    // Wait for form to load
    cy.get('form').should('be.visible')

    // Fill in login form
    cy.get('form').within(() => {
      cy.get('input[type="email"]').clear().type(email)
      cy.get('input[type="password"]').clear().type(password)
      cy.get('button[type="submit"]').click()
    })

    // Should be redirected to dashboard
    cy.url({ timeout: 15000 }).should('include', '/dashboard')

    // Verify we're logged in
    cy.contains(/dashboard|welcome|projects/i).should('be.visible')
  })

  it('should access projects page after login', () => {
    // Login using fixture
    cy.fixture('testUser.json').then((user) => {
      cy.visit('/en/login')
      cy.get('form').within(() => {
        cy.get('input[type="email"]').clear().type(user.email)
        cy.get('input[type="password"]').clear().type(user.password)
        cy.get('button[type="submit"]').click()
      })
    })

    // Wait for dashboard
    cy.url({ timeout: 15000 }).should('include', '/dashboard')

    // Navigate to projects
    cy.visit('/en/projects')

    // Should see projects page
    cy.contains(/projects/i).should('be.visible')
  })
})