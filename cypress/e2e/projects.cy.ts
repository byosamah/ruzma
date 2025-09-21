describe('Project Management', () => {
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

  describe('Projects List', () => {
    beforeEach(() => {
      cy.visit('/en/projects')
    })

    it('should display projects page', () => {
      cy.contains('Projects').should('be.visible')
      cy.get('[data-testid="create-project-btn"]').should('be.visible')
    })

    it('should filter projects by status', () => {
      cy.get('[data-testid="status-filter"]').click()
      cy.contains('In Progress').click()
      cy.get('[data-testid="project-card"]').each(($el) => {
        cy.wrap($el).contains(/In Progress|قيد التنفيذ/)
      })
    })

    it('should search for projects', () => {
      cy.get('input[placeholder*="Search"]').type('test project')
      cy.wait(500) // Debounce delay
      cy.get('[data-testid="project-card"]').should('have.length.lessThan', 10)
    })

    it('should sort projects', () => {
      cy.get('[data-testid="sort-dropdown"]').click()
      cy.contains('Newest First').click()
      // Verify sorting (implementation depends on your actual UI)
    })

    it('should navigate to create project', () => {
      cy.get('[data-testid="create-project-btn"]').click()
      cy.url().should('include', '/create-project')
    })
  })

  describe('Create Project', () => {
    beforeEach(() => {
      cy.visit('/en/create-project')
    })

    it('should display create project form', () => {
      cy.contains('Create New Project').should('be.visible')
      cy.get('input[name="name"]').should('be.visible')
      cy.get('textarea[name="description"]').should('be.visible')
    })

    it('should validate required fields', () => {
      cy.contains('button', 'Create Project').click()
      cy.contains('Project name is required').should('be.visible')
    })

    it('should create a basic project', () => {
      const projectName = `Test Project ${Date.now()}`

      // Fill in project details
      cy.get('input[name="name"]').type(projectName)
      cy.get('textarea[name="description"]').type('This is a test project description')
      cy.get('input[name="budget"]').type('5000')

      // Select currency
      cy.get('[data-testid="currency-select"]').click()
      cy.contains('USD').click()

      // Set dates
      cy.get('input[name="start_date"]').type('2025-01-01')
      cy.get('input[name="end_date"]').type('2025-03-01')

      // Set status
      cy.get('[data-testid="status-select"]').click()
      cy.contains('Planning').click()

      // Submit
      cy.contains('button', 'Create Project').click()

      // Verify redirect
      cy.url({ timeout: 10000 }).should('include', '/project/')
      cy.contains(projectName).should('be.visible')
    })

    it('should add milestones', () => {
      cy.get('input[name="name"]').type('Project with Milestones')

      // Add milestone
      cy.contains('button', 'Add Milestone').click()
      cy.get('[data-testid="milestone-0-name"]').type('Phase 1')
      cy.get('[data-testid="milestone-0-amount"]').type('2000')
      cy.get('[data-testid="milestone-0-deadline"]').type('2025-02-01')

      // Add another milestone
      cy.contains('button', 'Add Milestone').click()
      cy.get('[data-testid="milestone-1-name"]').type('Phase 2')
      cy.get('[data-testid="milestone-1-amount"]').type('3000')
      cy.get('[data-testid="milestone-1-deadline"]').type('2025-03-01')

      // Verify total
      cy.contains('Total: $5,000').should('be.visible')
    })

    it('should handle client selection', () => {
      cy.get('input[name="name"]').type('Client Project')

      // Select existing client
      cy.get('[data-testid="client-select"]').click()
      cy.get('[data-testid="client-option"]').first().click()

      // Or add new client
      cy.contains('button', 'Add New Client').click()
      cy.get('input[name="client_name"]').type('New Client')
      cy.get('input[name="client_email"]').type('client@example.com')
      cy.contains('button', 'Save Client').click()
    })
  })

  describe('Edit Project', () => {
    it('should edit project details', () => {
      cy.visit('/en/projects')
      cy.get('[data-testid="project-card"]').first().click()
      cy.contains('button', 'Edit').click()

      // Update name
      cy.get('input[name="name"]').clear().type('Updated Project Name')

      // Update description
      cy.get('textarea[name="description"]').clear().type('Updated description')

      // Save changes
      cy.contains('button', 'Save Changes').click()

      // Verify update
      cy.contains('Project updated successfully').should('be.visible')
      cy.contains('Updated Project Name').should('be.visible')
    })

    it('should update project status', () => {
      cy.visit('/en/projects')
      cy.get('[data-testid="project-card"]').first().click()

      cy.get('[data-testid="status-select"]').click()
      cy.contains('Completed').click()

      cy.contains('Status updated').should('be.visible')
    })
  })

  describe('Project Templates', () => {
    beforeEach(() => {
      cy.visit('/en/project-templates')
    })

    it('should display templates', () => {
      cy.contains('Project Templates').should('be.visible')
      cy.get('[data-testid="template-card"]').should('exist')
    })

    it('should create project from template', () => {
      cy.get('[data-testid="template-card"]').first().click()
      cy.contains('Use This Template').click()

      // Customize template
      cy.get('input[name="name"]').clear().type('Project from Template')
      cy.contains('button', 'Create Project').click()

      cy.url({ timeout: 10000 }).should('include', '/project/')
    })

    it('should save project as template', () => {
      cy.visit('/en/projects')
      cy.get('[data-testid="project-card"]').first().click()

      cy.contains('button', 'Save as Template').click()
      cy.get('input[name="template_name"]').type('My Custom Template')
      cy.contains('button', 'Save Template').click()

      cy.contains('Template saved').should('be.visible')
    })
  })

  describe('Project Management Page', () => {
    it('should display project details', () => {
      cy.visit('/en/projects')
      cy.get('[data-testid="project-card"]').first().click()

      // Verify sections
      cy.contains('Project Overview').should('be.visible')
      cy.contains('Milestones').should('be.visible')
      cy.contains('Files').should('be.visible')
      cy.contains('Activity').should('be.visible')
    })

    it('should update milestone status', () => {
      cy.visit('/en/projects')
      cy.get('[data-testid="project-card"]').first().click()

      cy.get('[data-testid="milestone-status"]').first().click()
      cy.contains('Mark as Completed').click()

      cy.contains('Milestone updated').should('be.visible')
    })

    it('should add project files', () => {
      cy.visit('/en/projects')
      cy.get('[data-testid="project-card"]').first().click()

      cy.contains('tab', 'Files').click()

      // Upload file
      const fileName = 'test-file.pdf'
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('file contents'),
        fileName: fileName,
        mimeType: 'application/pdf',
      })

      cy.contains(fileName).should('be.visible')
    })

    it('should add project notes', () => {
      cy.visit('/en/projects')
      cy.get('[data-testid="project-card"]').first().click()

      cy.contains('tab', 'Notes').click()
      cy.get('textarea[placeholder*="Add a note"]').type('This is a project note')
      cy.contains('button', 'Add Note').click()

      cy.contains('This is a project note').should('be.visible')
    })

    it('should generate share link', () => {
      cy.visit('/en/projects')
      cy.get('[data-testid="project-card"]').first().click()

      cy.contains('button', 'Share').click()
      cy.contains('Copy Link').click()

      cy.contains('Link copied').should('be.visible')
    })
  })

  describe('Project Deletion', () => {
    it('should delete a project', () => {
      cy.visit('/en/projects')
      cy.get('[data-testid="project-card"]').first().click()

      cy.contains('button', 'Delete Project').click()

      // Confirm deletion
      cy.contains('Are you sure?').should('be.visible')
      cy.contains('button', 'Yes, Delete').click()

      cy.url({ timeout: 10000 }).should('include', '/projects')
      cy.contains('Project deleted').should('be.visible')
    })
  })
})