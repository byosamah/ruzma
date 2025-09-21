describe('Invoice Management', () => {
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

  describe('Invoices List', () => {
    beforeEach(() => {
      cy.visit('/en/invoices')
    })

    it('should display invoices page', () => {
      cy.contains('Invoices').should('be.visible')
      cy.get('[data-testid="create-invoice-btn"]').should('be.visible')
    })

    it('should filter invoices by status', () => {
      cy.get('[data-testid="status-filter"]').click()
      cy.contains('Paid').click()
      cy.get('[data-testid="invoice-status"]').each(($el) => {
        cy.wrap($el).should('contain', 'Paid')
      })
    })

    it('should search for invoices', () => {
      cy.get('input[placeholder*="Search"]').type('INV-')
      cy.wait(500)
      cy.get('[data-testid="invoice-row"]').should('have.length.greaterThan', 0)
    })

    it('should filter by date range', () => {
      cy.get('[data-testid="date-filter"]').click()
      cy.contains('This Month').click()
      cy.get('[data-testid="invoice-date"]').each(($el) => {
        const date = new Date($el.text())
        const now = new Date()
        expect(date.getMonth()).to.equal(now.getMonth())
      })
    })

    it('should display invoice totals', () => {
      cy.get('[data-testid="total-invoiced"]').should('be.visible')
      cy.get('[data-testid="total-paid"]').should('be.visible')
      cy.get('[data-testid="total-pending"]').should('be.visible')
      cy.get('[data-testid="total-overdue"]').should('be.visible')
    })
  })

  describe('Create Invoice', () => {
    beforeEach(() => {
      cy.visit('/en/create-invoice')
    })

    it('should display invoice form', () => {
      cy.contains('Create Invoice').should('be.visible')
      cy.get('[data-testid="invoice-number"]').should('be.visible')
      cy.get('[data-testid="client-select"]').should('be.visible')
    })

    it('should validate required fields', () => {
      cy.contains('button', 'Create Invoice').click()
      cy.contains('Client is required').should('be.visible')
      cy.contains('At least one item is required').should('be.visible')
    })

    it('should create a basic invoice', () => {
      const invoiceNumber = `INV-${Date.now()}`

      // Set invoice number
      cy.get('[data-testid="invoice-number"]').clear().type(invoiceNumber)

      // Select client
      cy.get('[data-testid="client-select"]').click()
      cy.get('[data-testid="client-option"]').first().click()

      // Select project (if applicable)
      cy.get('[data-testid="project-select"]').click()
      cy.get('[data-testid="project-option"]').first().click()

      // Add invoice item
      cy.contains('button', 'Add Item').click()
      cy.get('[data-testid="item-0-description"]').type('Web Development Services')
      cy.get('[data-testid="item-0-quantity"]').clear().type('1')
      cy.get('[data-testid="item-0-rate"]').clear().type('5000')

      // Set dates
      cy.get('[data-testid="issue-date"]').type('2025-01-01')
      cy.get('[data-testid="due-date"]').type('2025-01-31')

      // Set payment terms
      cy.get('[data-testid="payment-terms"]').select('Net 30')

      // Add notes
      cy.get('textarea[name="notes"]').type('Thank you for your business!')

      // Submit
      cy.contains('button', 'Create Invoice').click()

      cy.contains('Invoice created successfully').should('be.visible')
      cy.url().should('include', '/invoices')
      cy.contains(invoiceNumber).should('be.visible')
    })

    it('should add multiple items', () => {
      cy.get('[data-testid="client-select"]').click()
      cy.get('[data-testid="client-option"]').first().click()

      // Add first item
      cy.contains('button', 'Add Item').click()
      cy.get('[data-testid="item-0-description"]').type('Design Services')
      cy.get('[data-testid="item-0-quantity"]').clear().type('20')
      cy.get('[data-testid="item-0-rate"]').clear().type('100')

      // Add second item
      cy.contains('button', 'Add Item').click()
      cy.get('[data-testid="item-1-description"]').type('Development Services')
      cy.get('[data-testid="item-1-quantity"]').clear().type('40')
      cy.get('[data-testid="item-1-rate"]').clear().type('150')

      // Verify subtotal
      cy.get('[data-testid="subtotal"]').should('contain', '8,000')
    })

    it('should calculate taxes', () => {
      cy.get('[data-testid="client-select"]').click()
      cy.get('[data-testid="client-option"]').first().click()

      cy.contains('button', 'Add Item').click()
      cy.get('[data-testid="item-0-description"]').type('Services')
      cy.get('[data-testid="item-0-quantity"]').clear().type('1')
      cy.get('[data-testid="item-0-rate"]').clear().type('1000')

      // Add tax
      cy.get('[data-testid="tax-rate"]').clear().type('10')
      cy.get('[data-testid="total"]').should('contain', '1,100')
    })

    it('should apply discount', () => {
      cy.get('[data-testid="client-select"]').click()
      cy.get('[data-testid="client-option"]').first().click()

      cy.contains('button', 'Add Item').click()
      cy.get('[data-testid="item-0-description"]').type('Services')
      cy.get('[data-testid="item-0-quantity"]').clear().type('1')
      cy.get('[data-testid="item-0-rate"]').clear().type('1000')

      // Add discount
      cy.get('[data-testid="discount-toggle"]').click()
      cy.get('[data-testid="discount-type"]').select('Percentage')
      cy.get('[data-testid="discount-value"]').type('20')

      cy.get('[data-testid="total"]').should('contain', '800')
    })

    it('should create invoice from milestone', () => {
      cy.visit('/en/projects')
      cy.get('[data-testid="project-card"]').first().click()

      cy.contains('tab', 'Milestones').click()
      cy.get('[data-testid="milestone-invoice-btn"]').first().click()

      // Should pre-fill invoice with milestone data
      cy.url().should('include', '/create-invoice')
      cy.get('[data-testid="item-0-description"]').should('have.value')
      cy.get('[data-testid="item-0-rate"]').should('have.value')
    })
  })

  describe('Invoice Actions', () => {
    beforeEach(() => {
      cy.visit('/en/invoices')
      cy.get('[data-testid="invoice-row"]').first().click()
    })

    it('should view invoice details', () => {
      cy.contains('Invoice Details').should('be.visible')
      cy.contains('Bill To').should('be.visible')
      cy.contains('Invoice Items').should('be.visible')
      cy.contains('Payment Information').should('be.visible')
    })

    it('should mark as paid', () => {
      cy.contains('button', 'Mark as Paid').click()

      cy.get('[data-testid="payment-date"]').type('2025-01-15')
      cy.get('[data-testid="payment-method"]').select('Bank Transfer')
      cy.get('[data-testid="transaction-id"]').type('TXN123456')

      cy.contains('button', 'Confirm Payment').click()
      cy.contains('Invoice marked as paid').should('be.visible')
      cy.get('[data-testid="invoice-status"]').should('contain', 'Paid')
    })

    it('should send invoice to client', () => {
      cy.contains('button', 'Send to Client').click()

      cy.get('[data-testid="email-message"]').should('be.visible')
      cy.contains('button', 'Send Email').click()

      cy.contains('Invoice sent successfully').should('be.visible')
    })

    it('should download invoice PDF', () => {
      cy.contains('button', 'Download PDF').click()
      // Verify download started
    })

    it('should duplicate invoice', () => {
      cy.contains('button', 'Duplicate').click()

      cy.url().should('include', '/create-invoice')
      // Fields should be pre-filled
      cy.get('[data-testid="item-0-description"]').should('have.value')
    })

    it('should edit invoice', () => {
      cy.contains('button', 'Edit').click()

      cy.get('[data-testid="item-0-description"]').clear().type('Updated Service')
      cy.contains('button', 'Save Changes').click()

      cy.contains('Invoice updated successfully').should('be.visible')
      cy.contains('Updated Service').should('be.visible')
    })

    it('should void invoice', () => {
      cy.contains('button', 'Void Invoice').click()

      cy.contains('Are you sure?').should('be.visible')
      cy.get('textarea[name="reason"]').type('Cancelled by client')
      cy.contains('button', 'Void Invoice').click()

      cy.contains('Invoice voided').should('be.visible')
      cy.get('[data-testid="invoice-status"]').should('contain', 'Void')
    })
  })

  describe('Milestone Management', () => {
    beforeEach(() => {
      cy.visit('/en/projects')
      cy.get('[data-testid="project-card"]').first().click()
      cy.contains('tab', 'Milestones').click()
    })

    it('should display milestones', () => {
      cy.contains('Milestones').should('be.visible')
      cy.get('[data-testid="milestone-card"]').should('exist')
    })

    it('should add new milestone', () => {
      cy.contains('button', 'Add Milestone').click()

      cy.get('input[name="name"]').type('New Milestone')
      cy.get('textarea[name="description"]').type('Milestone description')
      cy.get('input[name="amount"]').type('2500')
      cy.get('input[name="due_date"]').type('2025-02-15')

      cy.contains('button', 'Save Milestone').click()
      cy.contains('Milestone added successfully').should('be.visible')
      cy.contains('New Milestone').should('be.visible')
    })

    it('should update milestone status', () => {
      cy.get('[data-testid="milestone-card"]').first().within(() => {
        cy.get('[data-testid="status-select"]').click()
      })
      cy.contains('Completed').click()

      cy.contains('Milestone updated').should('be.visible')
    })

    it('should edit milestone', () => {
      cy.get('[data-testid="milestone-edit-btn"]').first().click()

      cy.get('input[name="name"]').clear().type('Updated Milestone')
      cy.get('input[name="amount"]').clear().type('3000')

      cy.contains('button', 'Save Changes').click()
      cy.contains('Milestone updated successfully').should('be.visible')
      cy.contains('Updated Milestone').should('be.visible')
    })

    it('should delete milestone', () => {
      cy.get('[data-testid="milestone-delete-btn"]').first().click()

      cy.contains('Are you sure?').should('be.visible')
      cy.contains('button', 'Delete').click()

      cy.contains('Milestone deleted').should('be.visible')
    })

    it('should create invoice from milestone', () => {
      cy.get('[data-testid="milestone-invoice-btn"]').first().click()

      cy.url().should('include', '/create-invoice')
      cy.get('[data-testid="item-0-description"]').should('contain', 'Milestone')
    })

    it('should track milestone progress', () => {
      cy.get('[data-testid="milestone-progress"]').should('be.visible')
      cy.get('[data-testid="milestone-percentage"]').should('be.visible')
    })
  })

  describe('Recurring Invoices', () => {
    it('should create recurring invoice', () => {
      cy.visit('/en/create-invoice')

      cy.get('[data-testid="client-select"]').click()
      cy.get('[data-testid="client-option"]').first().click()

      cy.get('[data-testid="recurring-toggle"]').click()
      cy.get('[data-testid="recurring-frequency"]').select('Monthly')
      cy.get('[data-testid="recurring-start"]').type('2025-01-01')
      cy.get('[data-testid="recurring-end"]').type('2025-12-31')

      cy.contains('button', 'Add Item').click()
      cy.get('[data-testid="item-0-description"]').type('Monthly Retainer')
      cy.get('[data-testid="item-0-rate"]').type('2000')

      cy.contains('button', 'Create Invoice').click()
      cy.contains('Recurring invoice created').should('be.visible')
    })

    it('should manage recurring invoices', () => {
      cy.visit('/en/invoices')
      cy.contains('tab', 'Recurring').click()

      cy.get('[data-testid="recurring-invoice"]').should('exist')
    })

    it('should pause recurring invoice', () => {
      cy.visit('/en/invoices')
      cy.contains('tab', 'Recurring').click()
      cy.get('[data-testid="recurring-invoice"]').first().click()

      cy.contains('button', 'Pause').click()
      cy.contains('Recurring invoice paused').should('be.visible')
    })
  })
})