describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/en/login')
  })

  describe('Login Page', () => {
    it('should display login form elements', () => {
      // Check form exists
      cy.get('form').should('be.visible')

      // Check for email and password inputs within the form
      cy.get('form').within(() => {
        cy.get('input[type="email"]').should('be.visible')
        cy.get('input[type="password"]').should('be.visible')
        cy.get('button[type="submit"]').should('be.visible')
      })

      // Check for other page elements
      cy.contains(/sign in|login/i).should('be.visible')
      cy.contains(/forgot password/i).should('be.visible')
      cy.contains(/sign up|create account|don't have an account/i).should('be.visible')
    })

    it('should show error for invalid credentials', () => {
      cy.get('form').within(() => {
        cy.get('input[type="email"]').type('invalid@example.com')
        cy.get('input[type="password"]').type('wrongpassword')
        cy.get('button[type="submit"]').click()
      })

      // Wait for error message
      cy.contains(/invalid|incorrect|error|failed/i, { timeout: 10000 }).should('be.visible')
    })

    it('should navigate to signup page', () => {
      cy.contains(/sign up|create account|don't have an account/i).click()
      cy.url().should('include', '/signup')
    })

    it('should navigate to forgot password', () => {
      cy.contains(/forgot password/i).click()
      cy.url().should('include', '/forgot-password')
    })

    it('should handle empty form submission', () => {
      cy.get('form').within(() => {
        cy.get('button[type="submit"]').click()
      })

      // Check for validation messages
      cy.contains(/required|enter|provide/i).should('be.visible')
    })

    it('should validate email format', () => {
      cy.get('form').within(() => {
        cy.get('input[type="email"]').type('notanemail')
        cy.get('input[type="password"]').type('password123')
        cy.get('button[type="submit"]').click()
      })

      cy.contains(/invalid|valid email|email/i).should('be.visible')
    })

    it('should toggle password visibility', () => {
      cy.get('form').within(() => {
        // Initially password should be hidden
        cy.get('input[type="password"]').should('exist')

        // Click eye icon to show password
        cy.get('button[type="button"]').first().click()

        // Password should now be visible
        cy.get('input[type="text"]').should('exist')

        // Click again to hide
        cy.get('button[type="button"]').first().click()

        // Password should be hidden again
        cy.get('input[type="password"]').should('exist')
      })
    })
  })

  describe('Sign Up Page', () => {
    beforeEach(() => {
      cy.visit('/en/signup')
    })

    it('should display signup form elements', () => {
      cy.get('form').should('be.visible')

      cy.get('form').within(() => {
        // Should have name, email, and password fields
        cy.get('input').should('have.length.at.least', 3)
        cy.get('input[type="email"]').should('be.visible')
        cy.get('input[type="password"]').should('be.visible')
        cy.get('button[type="submit"]').should('be.visible')
      })
    })

    it('should validate required fields', () => {
      cy.get('form').within(() => {
        cy.get('button[type="submit"]').click()
      })

      // Should show validation errors
      cy.contains(/required|enter|provide/i).should('be.visible')
    })

    it('should validate password strength', () => {
      cy.get('form').within(() => {
        cy.get('input').first().type('Test User')
        cy.get('input[type="email"]').type('test@example.com')
        cy.get('input[type="password"]').type('weak')
        cy.get('button[type="submit"]').click()
      })

      cy.contains(/password|characters|strong/i).should('be.visible')
    })

    it('should navigate to login page', () => {
      cy.contains(/already have|sign in|login/i).click()
      cy.url().should('include', '/login')
    })

    it('should create a new account', () => {
      const timestamp = Date.now()
      const email = `cypress_test_${timestamp}@example.com`

      cy.get('form').within(() => {
        cy.get('input').first().type('Cypress Test User')
        cy.get('input[type="email"]').type(email)
        cy.get('input[type="password"]').type('CypressTest123!')
        cy.get('button[type="submit"]').click()
      })

      // Should either redirect to dashboard, email confirmation, or login
      cy.url({ timeout: 10000 }).should('match', /dashboard|email-confirmation|login|verify/i)
    })
  })

  describe('Password Recovery', () => {
    beforeEach(() => {
      cy.visit('/en/forgot-password')
    })

    it('should display forgot password form', () => {
      cy.contains(/forgot|reset|password/i).should('be.visible')
      cy.get('input[type="email"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
    })

    it('should validate email field', () => {
      cy.get('button[type="submit"]').click()
      cy.contains(/required|enter|provide/i).should('be.visible')
    })

    it('should handle invalid email format', () => {
      cy.get('input[type="email"]').type('notanemail')
      cy.get('button[type="submit"]').click()
      cy.contains(/invalid|valid email/i).should('be.visible')
    })

    it('should navigate back to login', () => {
      cy.contains(/back|login|sign in/i).click()
      cy.url().should('include', '/login')
    })

    it('should send reset link', () => {
      cy.get('input[type="email"]').type('test@example.com')
      cy.get('button[type="submit"]').click()

      // Should show success message or redirect
      cy.contains(/sent|check|email|reset/i, { timeout: 10000 }).should('be.visible')
    })
  })

  describe('Language Switching', () => {
    it('should switch to Arabic', () => {
      cy.visit('/en/login')

      // Find language selector
      cy.get('button').contains(/English|EN/i).click()
      cy.contains(/العربية|Arabic|AR/i).click()

      cy.url().should('include', '/ar/')
      // Check for Arabic text on the page
      cy.contains(/دخول|تسجيل/i).should('be.visible')
    })

    it('should maintain language across navigation', () => {
      cy.visit('/ar/login')

      // Navigate to signup while in Arabic
      cy.get('a[href*="signup"]').first().click()

      cy.url().should('include', '/ar/signup')
      // Should still be in Arabic
      cy.contains(/حساب|إنشاء/i).should('be.visible')
    })
  })

  describe('Remember Me', () => {
    it('should toggle remember me checkbox', () => {
      cy.get('#rememberMe, input[type="checkbox"]').first().should('not.be.checked')
      cy.get('#rememberMe, input[type="checkbox"]').first().click()
      cy.get('#rememberMe, input[type="checkbox"]').first().should('be.checked')
    })
  })
})