describe('Client Management', () => {
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

  describe('Clients List', () => {
    beforeEach(() => {
      cy.visit('/en/clients')
    })

    it('should display clients page', () => {
      cy.contains('Clients').should('be.visible')
      cy.get('[data-testid="add-client-btn"]').should('be.visible')
    })

    it('should search for clients', () => {
      cy.get('input[placeholder*="Search"]').type('john')
      cy.wait(500) // Debounce
      cy.get('[data-testid="client-card"]').each(($el) => {
        cy.wrap($el).invoke('text').should('match', /john/i)
      })
    })

    it('should filter clients by status', () => {
      cy.get('[data-testid="status-filter"]').click()
      cy.contains('Active').click()
      cy.get('[data-testid="client-status"]').each(($el) => {
        cy.wrap($el).should('contain', 'Active')
      })
    })

    it('should sort clients', () => {
      cy.get('[data-testid="sort-dropdown"]').click()
      cy.contains('Name (A-Z)').click()
      // Verify alphabetical sorting
    })
  })

  describe('Add Client', () => {
    beforeEach(() => {
      cy.visit('/en/clients')
      cy.get('[data-testid="add-client-btn"]').click()
    })

    it('should display add client form', () => {
      cy.contains('Add New Client').should('be.visible')
      cy.get('input[name="name"]').should('be.visible')
      cy.get('input[name="email"]').should('be.visible')
    })

    it('should validate required fields', () => {
      cy.contains('button', 'Save Client').click()
      cy.contains('Name is required').should('be.visible')
      cy.contains('Email is required').should('be.visible')
    })

    it('should validate email format', () => {
      cy.get('input[name="name"]').type('Test Client')
      cy.get('input[name="email"]').type('invalid-email')
      cy.contains('button', 'Save Client').click()
      cy.contains('Invalid email').should('be.visible')
    })

    it('should add a new client', () => {
      const clientName = `Client ${Date.now()}`
      const clientEmail = `client${Date.now()}@example.com`

      cy.get('input[name="name"]').type(clientName)
      cy.get('input[name="email"]').type(clientEmail)
      cy.get('input[name="phone"]').type('+1234567890')
      cy.get('input[name="company"]').type('Test Company')
      cy.get('textarea[name="address"]').type('123 Test Street')
      cy.get('textarea[name="notes"]').type('Important client notes')

      cy.contains('button', 'Save Client').click()

      cy.contains('Client added successfully').should('be.visible')
      cy.contains(clientName).should('be.visible')
    })

    it('should handle duplicate email', () => {
      cy.get('input[name="name"]').type('Duplicate Client')
      cy.get('input[name="email"]').type('existing@example.com')
      cy.contains('button', 'Save Client').click()

      cy.contains('Email already exists').should('be.visible')
    })
  })

  describe('Edit Client', () => {
    it('should edit client details', () => {
      cy.visit('/en/clients')
      cy.get('[data-testid="client-card"]').first().click()
      cy.contains('button', 'Edit').click()

      cy.get('input[name="name"]').clear().type('Updated Client Name')
      cy.get('input[name="phone"]').clear().type('+9876543210')
      cy.get('textarea[name="notes"]').clear().type('Updated notes')

      cy.contains('button', 'Save Changes').click()

      cy.contains('Client updated successfully').should('be.visible')
      cy.contains('Updated Client Name').should('be.visible')
    })

    it('should update client status', () => {
      cy.visit('/en/clients')
      cy.get('[data-testid="client-card"]').first().click()

      cy.get('[data-testid="status-toggle"]').click()
      cy.contains('Status updated').should('be.visible')
    })
  })

  describe('Client Details', () => {
    beforeEach(() => {
      cy.visit('/en/clients')
      cy.get('[data-testid="client-card"]').first().click()
    })

    it('should display client information', () => {
      cy.contains('Client Details').should('be.visible')
      cy.contains('Contact Information').should('be.visible')
      cy.contains('Projects').should('be.visible')
      cy.contains('Invoices').should('be.visible')
    })

    it('should display client projects', () => {
      cy.contains('tab', 'Projects').click()
      cy.get('[data-testid="client-project"]').should('exist')
    })

    it('should display client invoices', () => {
      cy.contains('tab', 'Invoices').click()
      cy.get('[data-testid="client-invoice"]').should('exist')
    })

    it('should calculate total revenue', () => {
      cy.contains('Total Revenue').should('be.visible')
      cy.get('[data-testid="total-revenue"]').should('exist')
    })

    it('should add note to client', () => {
      cy.contains('tab', 'Notes').click()
      cy.get('textarea[placeholder*="Add note"]').type('New client note')
      cy.contains('button', 'Add Note').click()

      cy.contains('New client note').should('be.visible')
    })

    it('should send email to client', () => {
      cy.contains('button', 'Send Email').click()
      cy.get('input[name="subject"]').type('Test Email')
      cy.get('textarea[name="message"]').type('This is a test email')
      cy.contains('button', 'Send').click()

      cy.contains('Email sent successfully').should('be.visible')
    })
  })

  describe('Client Projects', () => {
    it('should create project for client', () => {
      cy.visit('/en/clients')
      cy.get('[data-testid="client-card"]').first().click()

      cy.contains('button', 'New Project').click()
      cy.url().should('include', '/create-project')
      // Client should be pre-selected
      cy.get('[data-testid="client-select"]').should('contain', cy.get('[data-testid="client-name"]').text())
    })

    it('should view client project', () => {
      cy.visit('/en/clients')
      cy.get('[data-testid="client-card"]').first().click()
      cy.contains('tab', 'Projects').click()

      cy.get('[data-testid="client-project"]').first().click()
      cy.url().should('include', '/project/')
    })
  })

  describe('Client Communication', () => {
    it('should track communication history', () => {
      cy.visit('/en/clients')
      cy.get('[data-testid="client-card"]').first().click()
      cy.contains('tab', 'Communication').click()

      cy.contains('Communication History').should('be.visible')
      cy.get('[data-testid="communication-entry"]').should('exist')
    })

    it('should add communication log', () => {
      cy.visit('/en/clients')
      cy.get('[data-testid="client-card"]').first().click()
      cy.contains('tab', 'Communication').click()

      cy.contains('button', 'Add Entry').click()
      cy.get('[data-testid="comm-type"]').select('Email')
      cy.get('textarea[name="notes"]').type('Discussed project requirements')
      cy.contains('button', 'Save').click()

      cy.contains('Discussed project requirements').should('be.visible')
    })
  })

  describe('Client Deletion', () => {
    it('should delete client without projects', () => {
      // Create a client first
      cy.visit('/en/clients')
      cy.get('[data-testid="add-client-btn"]').click()

      const clientName = `Delete Test ${Date.now()}`
      cy.get('input[name="name"]').type(clientName)
      cy.get('input[name="email"]').type(`delete${Date.now()}@example.com`)
      cy.contains('button', 'Save Client').click()

      // Find and delete the client
      cy.contains(clientName).click()
      cy.contains('button', 'Delete Client').click()

      cy.contains('Are you sure?').should('be.visible')
      cy.contains('button', 'Yes, Delete').click()

      cy.url().should('include', '/clients')
      cy.contains('Client deleted successfully').should('be.visible')
      cy.contains(clientName).should('not.exist')
    })

    it('should prevent deletion of client with active projects', () => {
      cy.visit('/en/clients')
      // Find a client with projects
      cy.get('[data-testid="client-card"]').each(($el) => {
        if ($el.find('[data-testid="project-count"]').text() !== '0') {
          cy.wrap($el).click()
          return false
        }
      })

      cy.contains('button', 'Delete Client').click()
      cy.contains('Cannot delete client with active projects').should('be.visible')
    })
  })

  describe('Bulk Actions', () => {
    it('should select multiple clients', () => {
      cy.visit('/en/clients')

      cy.get('[data-testid="select-all"]').click()
      cy.get('[data-testid="client-checkbox"]').should('be.checked')

      cy.contains('selected').should('be.visible')
    })

    it('should export clients', () => {
      cy.visit('/en/clients')

      cy.get('[data-testid="select-all"]').click()
      cy.contains('button', 'Export').click()

      cy.contains('Export as CSV').click()
      // Download should start
    })

    it('should bulk update status', () => {
      cy.visit('/en/clients')

      cy.get('[data-testid="client-checkbox"]').first().click()
      cy.get('[data-testid="client-checkbox"]').eq(1).click()

      cy.contains('button', 'Bulk Actions').click()
      cy.contains('Set as Inactive').click()

      cy.contains('2 clients updated').should('be.visible')
    })
  })
})