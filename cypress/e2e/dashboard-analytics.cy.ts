describe('Dashboard & Analytics', () => {
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

  describe('Dashboard', () => {
    beforeEach(() => {
      cy.visit('/en/dashboard')
    })

    it('should display dashboard widgets', () => {
      cy.contains('Dashboard').should('be.visible')

      // Key metrics
      cy.get('[data-testid="total-revenue"]').should('be.visible')
      cy.get('[data-testid="active-projects"]').should('be.visible')
      cy.get('[data-testid="pending-invoices"]').should('be.visible')
      cy.get('[data-testid="total-clients"]').should('be.visible')
    })

    it('should display recent projects', () => {
      cy.get('[data-testid="recent-projects"]').should('be.visible')
      cy.get('[data-testid="project-item"]').should('have.length.lessThan', 6)
    })

    it('should display upcoming milestones', () => {
      cy.get('[data-testid="upcoming-milestones"]').should('be.visible')
      cy.get('[data-testid="milestone-item"]').should('exist')
    })

    it('should display recent activities', () => {
      cy.get('[data-testid="recent-activities"]').should('be.visible')
      cy.get('[data-testid="activity-item"]').should('exist')
    })

    it('should navigate to projects from dashboard', () => {
      cy.get('[data-testid="view-all-projects"]').click()
      cy.url().should('include', '/projects')
    })

    it('should navigate to invoices from dashboard', () => {
      cy.get('[data-testid="view-all-invoices"]').click()
      cy.url().should('include', '/invoices')
    })

    it('should display revenue chart', () => {
      cy.get('[data-testid="revenue-chart"]').should('be.visible')
      cy.get('.recharts-wrapper').should('exist')
    })

    it('should filter dashboard by date range', () => {
      cy.get('[data-testid="date-range-picker"]').click()
      cy.contains('Last 30 days').click()

      // Verify data updates
      cy.get('[data-testid="loading-indicator"]').should('not.exist')
      cy.get('[data-testid="total-revenue"]').should('be.visible')
    })

    it('should display quick actions', () => {
      cy.get('[data-testid="quick-actions"]').should('be.visible')
      cy.contains('New Project').should('be.visible')
      cy.contains('New Invoice').should('be.visible')
      cy.contains('New Client').should('be.visible')
    })

    it('should show notifications', () => {
      cy.get('[data-testid="notifications-bell"]').click()
      cy.get('[data-testid="notification-dropdown"]').should('be.visible')
    })
  })

  describe('Analytics', () => {
    beforeEach(() => {
      cy.visit('/en/analytics')
    })

    it('should display analytics page', () => {
      cy.contains('Analytics').should('be.visible')
      cy.contains('Revenue Overview').should('be.visible')
      cy.contains('Project Analytics').should('be.visible')
    })

    it('should display revenue metrics', () => {
      cy.get('[data-testid="total-revenue"]').should('be.visible')
      cy.get('[data-testid="avg-project-value"]').should('be.visible')
      cy.get('[data-testid="revenue-growth"]').should('be.visible')
      cy.get('[data-testid="payment-success-rate"]').should('be.visible')
    })

    it('should display revenue chart', () => {
      cy.get('[data-testid="revenue-chart"]').should('be.visible')
      cy.get('.recharts-line').should('exist')
    })

    it('should switch chart views', () => {
      cy.get('[data-testid="chart-type-selector"]').click()
      cy.contains('Bar Chart').click()
      cy.get('.recharts-bar').should('exist')
    })

    it('should filter by time period', () => {
      cy.get('[data-testid="time-period-selector"]').click()
      cy.contains('This Year').click()

      // Verify chart updates
      cy.get('[data-testid="chart-period"]').should('contain', 'Year')
    })

    it('should display project analytics', () => {
      cy.contains('tab', 'Projects').click()

      cy.get('[data-testid="total-projects"]').should('be.visible')
      cy.get('[data-testid="completed-projects"]').should('be.visible')
      cy.get('[data-testid="avg-completion-time"]').should('be.visible')
      cy.get('[data-testid="project-success-rate"]').should('be.visible')
    })

    it('should display client analytics', () => {
      cy.contains('tab', 'Clients').click()

      cy.get('[data-testid="total-clients"]').should('be.visible')
      cy.get('[data-testid="active-clients"]').should('be.visible')
      cy.get('[data-testid="client-retention-rate"]').should('be.visible')
      cy.get('[data-testid="avg-client-value"]').should('be.visible')
    })

    it('should display top clients', () => {
      cy.contains('tab', 'Clients').click()

      cy.get('[data-testid="top-clients-table"]').should('be.visible')
      cy.get('[data-testid="top-client-row"]').should('have.length.lessThan', 11)
    })

    it('should display invoice analytics', () => {
      cy.contains('tab', 'Invoices').click()

      cy.get('[data-testid="total-invoices"]').should('be.visible')
      cy.get('[data-testid="paid-invoices"]').should('be.visible')
      cy.get('[data-testid="overdue-invoices"]').should('be.visible')
      cy.get('[data-testid="avg-payment-time"]').should('be.visible')
    })

    it('should export analytics data', () => {
      cy.contains('button', 'Export').click()
      cy.contains('Export as CSV').click()
      // Verify download
    })

    it('should display currency breakdown', () => {
      cy.get('[data-testid="currency-breakdown"]').should('be.visible')
      cy.get('[data-testid="currency-chart"]').should('exist')
    })

    it('should compare periods', () => {
      cy.contains('button', 'Compare').click()
      cy.get('[data-testid="compare-period-1"]').select('Last Month')
      cy.get('[data-testid="compare-period-2"]').select('This Month')
      cy.contains('button', 'Apply').click()

      cy.get('[data-testid="comparison-chart"]').should('be.visible')
    })

    it('should display productivity metrics', () => {
      cy.contains('tab', 'Productivity').click()

      cy.get('[data-testid="tasks-completed"]').should('be.visible')
      cy.get('[data-testid="avg-task-time"]').should('be.visible')
      cy.get('[data-testid="milestone-achievement"]').should('be.visible')
    })

    it('should generate custom reports', () => {
      cy.contains('button', 'Custom Report').click()

      cy.get('[data-testid="metric-selector"]').click()
      cy.contains('Revenue').click()
      cy.contains('Projects').click()

      cy.get('[data-testid="date-range"]').select('Last Quarter')
      cy.contains('button', 'Generate Report').click()

      cy.get('[data-testid="custom-report"]').should('be.visible')
    })
  })

  describe('Performance Monitoring', () => {
    it('should display app performance metrics', () => {
      cy.visit('/en/dashboard')

      cy.get('[data-testid="settings-menu"]').click()
      cy.contains('Performance').click()

      cy.contains('Page Load Time').should('be.visible')
      cy.contains('API Response Time').should('be.visible')
      cy.contains('Cache Hit Rate').should('be.visible')
    })
  })

  describe('Dashboard Customization', () => {
    it('should customize dashboard widgets', () => {
      cy.visit('/en/dashboard')

      cy.contains('button', 'Customize').click()

      // Hide a widget
      cy.get('[data-testid="widget-toggle-activities"]').click()
      cy.contains('button', 'Save Layout').click()

      cy.get('[data-testid="recent-activities"]').should('not.exist')
    })

    it('should rearrange dashboard widgets', () => {
      cy.visit('/en/dashboard')
      cy.contains('button', 'Customize').click()

      // Drag and drop simulation
      cy.get('[data-testid="widget-handle-revenue"]')
        .trigger('mousedown', { button: 0 })

      cy.get('[data-testid="widget-handle-projects"]')
        .trigger('mousemove')
        .trigger('mouseup', { force: true })

      cy.contains('button', 'Save Layout').click()
    })
  })

  describe('Data Insights', () => {
    it('should display AI insights', () => {
      cy.visit('/en/analytics')
      cy.contains('tab', 'Insights').click()

      cy.contains('AI Insights').should('be.visible')
      cy.get('[data-testid="insight-card"]').should('have.length.greaterThan', 0)
    })

    it('should show revenue predictions', () => {
      cy.visit('/en/analytics')
      cy.contains('tab', 'Predictions').click()

      cy.contains('Revenue Forecast').should('be.visible')
      cy.get('[data-testid="forecast-chart"]').should('be.visible')
    })

    it('should display trends', () => {
      cy.visit('/en/analytics')

      cy.get('[data-testid="trend-indicator"]').each(($el) => {
        cy.wrap($el).should('have.class').match(/trend-(up|down|stable)/)
      })
    })
  })

  describe('Export and Sharing', () => {
    it('should export dashboard as PDF', () => {
      cy.visit('/en/dashboard')

      cy.contains('button', 'Export').click()
      cy.contains('Export as PDF').click()
      // Verify download
    })

    it('should share analytics report', () => {
      cy.visit('/en/analytics')

      cy.contains('button', 'Share').click()
      cy.get('input[name="email"]').type('client@example.com')
      cy.contains('button', 'Send Report').click()

      cy.contains('Report sent successfully').should('be.visible')
    })

    it('should schedule reports', () => {
      cy.visit('/en/analytics')

      cy.contains('button', 'Schedule').click()
      cy.get('[data-testid="frequency-selector"]').select('Weekly')
      cy.get('[data-testid="recipients"]').type('manager@example.com')
      cy.contains('button', 'Save Schedule').click()

      cy.contains('Report scheduled').should('be.visible')
    })
  })
})