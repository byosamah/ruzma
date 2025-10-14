# Manual Testing Guide

**Last Updated**: 2025-10-14

## Overview

This manual testing checklist ensures all critical user flows work correctly before deployment. Use this guide until E2E automation (Playwright) is implemented.

---

## 🚀 Pre-Deployment Checklist

Before deploying to production, complete **all sections** below.

---

## 🔐 Authentication Flow

### Sign Up
- [ ] Can navigate to `/en/signup`
- [ ] Form validation works (email format, password strength)
- [ ] Can submit signup form with valid credentials
- [ ] Receives verification email (check spam folder)
- [ ] Email verification link works
- [ ] Redirected to dashboard after verification
- [ ] User profile created in database

### Login
- [ ] Can navigate to `/en/login`
- [ ] Can login with correct credentials
- [ ] Cannot login with incorrect password
- [ ] Cannot login with non-existent email
- [ ] "Remember me" checkbox persists session
- [ ] Redirected to dashboard after successful login

### Password Reset
- [ ] Can request password reset from login page
- [ ] Receives password reset email
- [ ] Reset link navigates to reset password page
- [ ] Can set new password
- [ ] Can login with new password
- [ ] Old password no longer works

### Session Management
- [ ] Session persists on page refresh
- [ ] Session persists in new browser tab
- [ ] Logout button works correctly
- [ ] Redirected to login after logout
- [ ] Session expires after inactivity (if configured)
- [ ] Cannot access protected routes when logged out

---

## 👥 Client Management

### Create Client
- [ ] Can navigate to Clients page
- [ ] "Add Client" button visible
- [ ] Client creation form opens
- [ ] All required fields validated
- [ ] Can save client with valid data
- [ ] Client appears in clients list
- [ ] Client count updates in dashboard

### View Clients
- [ ] Clients list displays all user's clients
- [ ] Client cards show correct information
- [ ] Search functionality works
- [ ] Filter by status works (if implemented)
- [ ] Pagination works (if applicable)
- [ ] Can sort clients (if implemented)

### Edit Client
- [ ] Can click on client to view details
- [ ] Edit button visible
- [ ] Can modify client information
- [ ] Changes save correctly
- [ ] Updated information appears immediately
- [ ] No data loss during edit

### Delete Client
- [ ] Delete button visible
- [ ] Confirmation dialog appears
- [ ] Can cancel deletion
- [ ] Client deleted from database when confirmed
- [ ] Client removed from list immediately
- [ ] Associated projects handled correctly

---

## 📊 Project Management

### Create Project
- [ ] Can navigate to Create Project page
- [ ] Project wizard loads correctly
- [ ] Can select existing client
- [ ] Can create new client inline (if applicable)
- [ ] All form fields validate correctly
- [ ] Can add multiple milestones
- [ ] Can set project currency
- [ ] Can upload project files (if implemented)
- [ ] Project saves successfully
- [ ] Redirected to project details after creation
- [ ] Project appears in projects list

### View Projects
- [ ] Projects page displays all user's projects
- [ ] Project cards show correct status
- [ ] Can filter by status (Active, Completed, On Hold)
- [ ] Can search projects by name
- [ ] Project statistics correct (count, revenue)
- [ ] Can navigate to project details

### Edit Project
- [ ] Can access edit mode from project details
- [ ] All project fields editable
- [ ] Can add new milestones
- [ ] Can edit existing milestones
- [ ] Can delete milestones
- [ ] Can change project status
- [ ] Changes save correctly
- [ ] No data corruption during edit

### Milestones
- [ ] Can add milestones to project
- [ ] Milestone status updates work
- [ ] Can mark milestone as complete
- [ ] Completion date recorded correctly
- [ ] Progress bar updates correctly
- [ ] Can add notes to milestones
- [ ] Can attach files to milestones (if implemented)

### Project Templates
- [ ] Can navigate to templates page
- [ ] Can create project from template
- [ ] Template data populates correctly
- [ ] Can save project as template
- [ ] Templates list displays correctly

### Project Deletion
- [ ] Delete confirmation dialog appears
- [ ] Project deleted from database
- [ ] Associated data handled correctly (milestones, invoices)
- [ ] Project count updates

---

## 💰 Invoice Management

### Create Invoice
- [ ] Can navigate to Create Invoice page
- [ ] Can select project
- [ ] Client information populates automatically
- [ ] Can add line items
- [ ] Subtotal calculates correctly
- [ ] Tax calculation works (if applicable)
- [ ] Total calculation correct
- [ ] Can set payment terms
- [ ] Can set due date
- [ ] Invoice saves successfully

### View Invoices
- [ ] Invoices page displays all user's invoices
- [ ] Can filter by status (Paid, Unpaid, Overdue)
- [ ] Can search invoices
- [ ] Invoice statistics correct
- [ ] Can view invoice details

### Generate PDF
- [ ] PDF generation button works
- [ ] PDF contains all invoice information
- [ ] Branding appears correctly (logo, colors)
- [ ] Arabic text renders correctly (if applicable)
- [ ] PDF downloads successfully
- [ ] PDF opens correctly in viewer

### Invoice Actions
- [ ] Can mark invoice as paid
- [ ] Can send invoice to client (if implemented)
- [ ] Can duplicate invoice
- [ ] Can delete invoice
- [ ] Status updates reflect immediately

---

## 🎨 Custom Branding

### Logo Upload
- [ ] Can navigate to Profile/Branding settings
- [ ] Can upload logo image
- [ ] Logo preview works
- [ ] Logo appears on invoices
- [ ] Logo appears on client portal
- [ ] Can change logo
- [ ] Can remove logo

### Brand Colors
- [ ] Can select primary color
- [ ] Can select secondary color
- [ ] Color picker works
- [ ] Colors apply to client portal
- [ ] Colors apply to generated PDFs

---

## 🌐 Client Portal

### Access
- [ ] Can generate client share link from project
- [ ] Share link copied to clipboard
- [ ] Share link opens client portal
- [ ] Client can view without login
- [ ] Token validation works
- [ ] Expired tokens show error message

### Portal Features
- [ ] Project details display correctly
- [ ] Milestones visible with status
- [ ] Custom branding appears (logo, colors)
- [ ] Can view contract (if uploaded)
- [ ] Can approve contract
- [ ] Can download invoice
- [ ] Progress bar accurate

### Portal Security
- [ ] Cannot access other projects with token
- [ ] Invalid tokens show error
- [ ] Token expiry works correctly

---

## 🌍 Internationalization (i18n)

### Language Switching
- [ ] Language selector visible in UI
- [ ] Can switch from English to Arabic
- [ ] Can switch from Arabic to English
- [ ] Language preference persists
- [ ] All UI text translates correctly
- [ ] No untranslated text visible

### RTL (Arabic) Layout
- [ ] Layout direction changes to RTL
- [ ] Text alignment correct (right-aligned)
- [ ] Navigation menu flips correctly
- [ ] Form inputs align correctly
- [ ] Icons and buttons positioned correctly
- [ ] No layout breaking or overlapping

### Routes
- [ ] Routes update with language prefix (/en, /ar)
- [ ] Language-prefixed routes work correctly
- [ ] Navigation maintains language context
- [ ] Direct URL access works for both languages

---

## 📈 Dashboard & Analytics

### Dashboard Stats
- [ ] Total projects count correct
- [ ] Active projects count correct
- [ ] Total revenue accurate
- [ ] Pending invoices count correct
- [ ] Charts load correctly
- [ ] Recent activity displays

### Analytics Page
- [ ] Revenue chart displays
- [ ] Project status breakdown correct
- [ ] Client engagement metrics visible
- [ ] Date range filter works
- [ ] Export functionality works (if implemented)

---

## 📱 Responsive Design

### Mobile (375px - 767px)
- [ ] Login page renders correctly
- [ ] Dashboard mobile layout works
- [ ] Navigation menu collapsible
- [ ] Project cards stack correctly
- [ ] Forms usable on mobile
- [ ] Touch targets ≥ 44px
- [ ] No horizontal scrolling

### Tablet (768px - 1023px)
- [ ] Layout adapts correctly
- [ ] All features accessible
- [ ] Navigation works
- [ ] Forms properly sized

### Desktop (1024px+)
- [ ] Full layout displays
- [ ] Sidebar navigation visible
- [ ] Multi-column layouts work
- [ ] No wasted space

---

## 🔔 Notifications (if implemented)

- [ ] Notifications bell shows count
- [ ] Can view notifications list
- [ ] Notifications mark as read
- [ ] Can clear all notifications
- [ ] Real-time updates work (if implemented)

---

## ⚡ Performance

### Load Times
- [ ] Initial page load < 3 seconds
- [ ] Navigation between pages < 1 second
- [ ] Forms submit < 2 seconds
- [ ] PDF generation < 5 seconds

### Browser Compatibility
- [ ] Works in Chrome (latest)
- [ ] Works in Firefox (latest)
- [ ] Works in Safari (latest)
- [ ] Works in Edge (latest)

---

## 🐛 Error Handling

### Network Errors
- [ ] Offline state handled gracefully
- [ ] Network error messages user-friendly
- [ ] Retry mechanisms work
- [ ] No data loss on connection failure

### Validation Errors
- [ ] Form validation errors clear
- [ ] Error messages helpful
- [ ] Can correct errors and resubmit

### 404 / Not Found
- [ ] Invalid routes show 404 page
- [ ] 404 page has navigation back
- [ ] No console errors on 404

---

## 🔒 Security

### Authorization
- [ ] Cannot access other users' data
- [ ] Cannot modify other users' projects
- [ ] API requests include auth token
- [ ] Expired tokens handled correctly

### Input Sanitization
- [ ] SQL injection attempts fail
- [ ] XSS attempts blocked
- [ ] File uploads validated

---

## 📝 Test Report Template

After completing tests, document results:

```
Test Date: ____________________
Tested By: ____________________
Branch/Commit: ________________

PASS [ ] / FAIL [ ]

Failed Tests:
1. ___________________________ (Section: _____)
2. ___________________________ (Section: _____)
3. ___________________________ (Section: _____)

Critical Issues:
- _____________________________________________
- _____________________________________________

Notes:
______________________________________________
______________________________________________
```

---

## 🚨 Critical Flows (Priority Testing)

If time is limited, test these **must-work** flows first:

1. **Auth Flow**: Login → Dashboard
2. **Create Project**: New Project → Add Client → Save
3. **Create Invoice**: New Invoice → Generate PDF
4. **Client Portal**: Share Link → Client View
5. **Language Switch**: EN ↔ AR

---

## 📞 Reporting Issues

Found a bug? Report it:
1. Note the section where it failed
2. Document steps to reproduce
3. Include screenshots if applicable
4. Note browser/device information
5. Create issue: [GitHub Issues](https://github.com/yourusername/ruzma/issues)

---

**Testing complete?** ✅ Ready for deployment!

**Testing failed?** ❌ Fix issues before deploying.
