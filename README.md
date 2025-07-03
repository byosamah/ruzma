# Ruzma - Freelancer Project Management Platform

Ruzma is a comprehensive SaaS platform designed for freelancers to manage projects, clients, and payments efficiently.

## Project info

**URL**: https://lovable.dev/projects/f60a1915-b5a8-429d-bf2a-ffca2468a2f7

## Features

- 📋 **Project Management**: Create, track, and manage freelance projects with milestones
- 👥 **Client Management**: Organize client information and communications  
- 💰 **Invoice Generation**: Create and send professional invoices
- 📊 **Analytics Dashboard**: Track revenue, project progress, and business metrics
- 🔐 **Client Portal**: Secure client access to project updates and deliverables
- 💳 **Payment Processing**: Integrated payment tracking and proof submission
- 🌐 **Multi-language Support**: English and Arabic language support
- 📱 **Responsive Design**: Mobile-friendly interface for on-the-go management

## Architecture

### Recently Restructured Codebase
The codebase has been reorganized using domain-driven design principles:

- **Domain Organization**: Components and hooks organized by business domain (auth, projects, clients, invoices)
- **Centralized Services**: API calls consolidated in service layer
- **Shared Types**: Common type definitions in dedicated files  
- **Backward Compatibility**: Existing imports continue to work alongside new structure

See `RESTRUCTURE_GUIDE.md` for detailed information about the new code organization.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/f60a1915-b5a8-429d-bf2a-ffca2468a2f7) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/f60a1915-b5a8-429d-bf2a-ffca2468a2f7) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
