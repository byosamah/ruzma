describe('Subscription & Billing', () => {
  beforeEach(() => {
    // Login with test account
    cy.fixture('testUser.json').then((user) => {
      cy.visit('/en/login')
      cy.get('form').within(() => {
        cy.get('input[type="email"]').clear().type(user.email)
        cy.get('input[type="password"]').clear().type(user.password)
        cy.get('button[type="submit"]').click()
      })
      cy.url({ timeout: 10000 }).should('include', '/dashboard')
    })
  })

  describe('Plans Page', () => {
    beforeEach(() => {
      cy.visit('/en/plans')
    })

    it('should display subscription plans', () => {
      cy.contains('Choose Your Plan').should('be.visible')

      // Free plan
      cy.contains('Free').should('be.visible')
      cy.contains('$0').should('be.visible')
      cy.contains('1 project').should('be.visible')

      // Plus plan
      cy.contains('Plus').should('be.visible')
      cy.contains('$19').should('be.visible')
      cy.contains('50 projects').should('be.visible')

      // Pro plan (Lifetime)
      cy.contains('Pro').should('be.visible')
      cy.contains('$349').should('be.visible')
      cy.contains('Unlimited projects').should('be.visible')
      cy.contains('One-time payment').should('be.visible')
    })

    it('should display current plan', () => {
      cy.get('[data-testid="current-plan"]').should('be.visible')
      cy.get('[data-testid="current-plan"]').should('contain', 'Current Plan')
    })

    it('should show plan features', () => {
      cy.get('[data-testid="plan-features"]').should('be.visible')
      cy.get('[data-testid="feature-item"]').should('have.length.greaterThan', 3)
    })

    it('should compare plans', () => {
      cy.contains('Compare Plans').click()
      cy.get('[data-testid="comparison-table"]').should('be.visible')
      cy.contains('Feature').should('be.visible')
      cy.contains('Free').should('be.visible')
      cy.contains('Plus').should('be.visible')
      cy.contains('Pro').should('be.visible')
    })

    it('should handle upgrade to Plus', () => {
      cy.get('[data-testid="upgrade-plus"]').click()

      // Payment form
      cy.contains('Upgrade to Plus').should('be.visible')
      cy.get('[data-testid="card-element"]').should('be.visible')
      cy.contains('$19/month').should('be.visible')
    })

    it('should handle upgrade to Pro (Lifetime)', () => {
      cy.get('[data-testid="upgrade-pro"]').click()

      // Payment form
      cy.contains('Upgrade to Pro').should('be.visible')
      cy.get('[data-testid="card-element"]').should('be.visible')
      cy.contains('$349 one-time').should('be.visible')
    })
  })

  describe('Payment Processing', () => {
    it('should validate payment form', () => {
      cy.visit('/en/plans')
      cy.get('[data-testid="upgrade-plus"]').click()

      cy.contains('button', 'Subscribe').click()

      cy.contains('Card details are required').should('be.visible')
    })

    it('should handle payment errors', () => {
      cy.visit('/en/plans')
      cy.get('[data-testid="upgrade-plus"]').click()

      // Use test card that triggers error
      cy.get('[data-testid="card-number"]').type('4000000000000002')
      cy.get('[data-testid="card-expiry"]').type('12/30')
      cy.get('[data-testid="card-cvc"]').type('123')

      cy.contains('button', 'Subscribe').click()

      cy.contains('Payment failed').should('be.visible')
    })

    it('should apply promo code', () => {
      cy.visit('/en/plans')
      cy.get('[data-testid="upgrade-plus"]').click()

      cy.contains('Have a promo code?').click()
      cy.get('input[name="promo_code"]').type('DISCOUNT20')
      cy.contains('button', 'Apply').click()

      cy.contains('20% off').should('be.visible')
      cy.contains('$15.20/month').should('be.visible')
    })

    it('should show trial period for Plus', () => {
      cy.visit('/en/plans')
      cy.get('[data-testid="upgrade-plus"]').click()

      cy.contains('3-day free trial').should('be.visible')
      cy.contains('Then $19/month').should('be.visible')
    })
  })

  describe('Subscription Management', () => {
    it('should display subscription details', () => {
      cy.visit('/en/profile')
      cy.contains('tab', 'Subscription').click()

      cy.contains('Subscription Details').should('be.visible')
      cy.get('[data-testid="plan-name"]').should('be.visible')
      cy.get('[data-testid="billing-cycle"]').should('be.visible')
      cy.get('[data-testid="next-billing"]').should('be.visible')
    })

    it('should cancel subscription', () => {
      cy.visit('/en/profile')
      cy.contains('tab', 'Subscription').click()

      cy.contains('button', 'Cancel Subscription').click()

      cy.contains('Are you sure?').should('be.visible')
      cy.contains('Your projects will be archived').should('be.visible')

      cy.get('textarea[name="reason"]').type('Too expensive')
      cy.contains('button', 'Confirm Cancellation').click()

      cy.contains('Subscription cancelled').should('be.visible')
    })

    it('should downgrade subscription', () => {
      cy.visit('/en/profile')
      cy.contains('tab', 'Subscription').click()

      cy.contains('button', 'Change Plan').click()
      cy.get('[data-testid="select-free"]').click()

      cy.contains('Downgrade to Free').should('be.visible')
      cy.contains('Excess projects will be archived').should('be.visible')

      cy.contains('button', 'Confirm Downgrade').click()
      cy.contains('Plan downgraded').should('be.visible')
    })

    it('should update payment method', () => {
      cy.visit('/en/profile')
      cy.contains('tab', 'Subscription').click()

      cy.contains('button', 'Update Payment Method').click()

      cy.get('[data-testid="card-number"]').type('4242424242424242')
      cy.get('[data-testid="card-expiry"]').type('12/30')
      cy.get('[data-testid="card-cvc"]').type('123')

      cy.contains('button', 'Update').click()
      cy.contains('Payment method updated').should('be.visible')
    })
  })

  describe('Billing History', () => {
    beforeEach(() => {
      cy.visit('/en/profile')
      cy.contains('tab', 'Billing').click()
    })

    it('should display billing history', () => {
      cy.contains('Billing History').should('be.visible')
      cy.get('[data-testid="invoice-row"]').should('exist')
    })

    it('should download invoice', () => {
      cy.get('[data-testid="download-invoice"]').first().click()
      // Verify download
    })

    it('should filter billing history', () => {
      cy.get('[data-testid="year-filter"]').select('2024')
      cy.get('[data-testid="invoice-date"]').each(($el) => {
        cy.wrap($el).should('contain', '2024')
      })
    })

    it('should display payment methods', () => {
      cy.contains('Payment Methods').should('be.visible')
      cy.get('[data-testid="payment-method"]').should('exist')
    })
  })

  describe('Project Limits', () => {
    it('should enforce free plan limits', () => {
      // Assuming user is on free plan
      cy.visit('/en/projects')

      // Try to create second project
      cy.get('[data-testid="create-project-btn"]').click()
      cy.get('input[name="name"]').type('Second Project')
      cy.contains('button', 'Create Project').click()

      cy.contains('Project limit reached').should('be.visible')
      cy.contains('Upgrade to Plus').should('be.visible')
    })

    it('should show project count', () => {
      cy.visit('/en/dashboard')
      cy.get('[data-testid="project-limit"]').should('be.visible')
      cy.get('[data-testid="project-limit"]').should('contain', '1 / 1')
    })

    it('should archive excess projects on downgrade', () => {
      // This would need specific test data setup
      cy.visit('/en/projects')
      cy.get('[data-testid="archived-banner"]').should('be.visible')
      cy.contains('projects have been archived').should('be.visible')
    })
  })

  describe('Grace Period', () => {
    it('should display trial countdown', () => {
      // For users in trial
      cy.visit('/en/dashboard')
      cy.get('[data-testid="trial-banner"]').should('be.visible')
      cy.contains('days left in trial').should('be.visible')
    })

    it('should show grace period for payment failures', () => {
      // For users with payment failure
      cy.visit('/en/dashboard')
      cy.get('[data-testid="payment-grace-banner"]').should('be.visible')
      cy.contains('Payment failed - 7 days to update').should('be.visible')
    })
  })

  describe('Usage Analytics', () => {
    beforeEach(() => {
      cy.visit('/en/profile')
      cy.contains('tab', 'Usage').click()
    })

    it('should display usage statistics', () => {
      cy.contains('Usage Statistics').should('be.visible')
      cy.get('[data-testid="projects-used"]').should('be.visible')
      cy.get('[data-testid="storage-used"]').should('be.visible')
      cy.get('[data-testid="api-calls"]').should('be.visible')
    })

    it('should show usage trends', () => {
      cy.get('[data-testid="usage-chart"]').should('be.visible')
      cy.get('.recharts-line').should('exist')
    })

    it('should display quota warnings', () => {
      cy.get('[data-testid="quota-warning"]').should('be.visible')
      cy.contains('80% of project limit').should('be.visible')
    })
  })

  describe('Team Billing (Future)', () => {
    it.skip('should add team members', () => {
      cy.visit('/en/team')
      cy.contains('button', 'Add Member').click()

      cy.get('input[name="email"]').type('teammate@example.com')
      cy.get('[data-testid="role-select"]').select('Editor')
      cy.contains('button', 'Send Invitation').click()

      cy.contains('Invitation sent').should('be.visible')
    })

    it.skip('should manage team billing', () => {
      cy.visit('/en/team/billing')

      cy.contains('Team Billing').should('be.visible')
      cy.get('[data-testid="seats-used"]').should('be.visible')
      cy.get('[data-testid="price-per-seat"]').should('be.visible')
    })
  })

  describe('Refunds and Credits', () => {
    it('should request refund', () => {
      cy.visit('/en/profile')
      cy.contains('tab', 'Billing').click()

      cy.get('[data-testid="invoice-row"]').first().within(() => {
        cy.contains('button', 'Request Refund').click()
      })

      cy.get('textarea[name="reason"]').type('Duplicate charge')
      cy.contains('button', 'Submit Request').click()

      cy.contains('Refund request submitted').should('be.visible')
    })

    it('should display account credits', () => {
      cy.visit('/en/profile')
      cy.contains('tab', 'Billing').click()

      cy.get('[data-testid="account-credits"]').should('be.visible')
      cy.contains('Available Credits').should('be.visible')
    })
  })

  describe('Subscription Notifications', () => {
    it('should show renewal reminder', () => {
      cy.visit('/en/dashboard')

      // Check for renewal notification
      cy.get('[data-testid="notifications-bell"]').click()
      cy.contains('Subscription renews in').should('be.visible')
    })

    it('should show payment failure notification', () => {
      cy.visit('/en/dashboard')

      cy.get('[data-testid="notifications-bell"]').click()
      cy.contains('Payment failed').should('be.visible')
    })

    it('should show plan upgrade suggestions', () => {
      cy.visit('/en/dashboard')

      // After reaching limits
      cy.get('[data-testid="upgrade-suggestion"]').should('be.visible')
      cy.contains('You\'re close to your limit').should('be.visible')
    })
  })
})