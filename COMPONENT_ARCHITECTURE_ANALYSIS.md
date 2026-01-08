# Ruzma Component Architecture Deep Dive

**Status**: Complete Analysis (Read-Only Exploration)
**Date**: 2025-11-25
**Scope**: Full inventory of UI components, domain components, shared patterns, and layout system

---

## Executive Summary

Ruzma has a **well-organized, production-grade component architecture** built on ShadcN UI (Radix UI primitives) with Tailwind CSS. The codebase demonstrates excellent separation of concerns:

- **40+ ShadcN base UI components** providing core primitives
- **Feature-organized domain components** (Projects, Invoices, Clients, Auth, etc.)
- **Reusable shared components** with dialog patterns
- **Sidebar-based navigation** with modern responsive design
- **Mobile-first responsive approach** with touch targets
- **Comprehensive form patterns** using React Hook Form + Zod
- **RTL/LTR bilingual support** throughout

---

## 1. UI COMPONENTS (ShadcN Base Library)

### Complete Inventory (40 Components)

**Location**: `/src/components/ui/`

#### Form & Input Components
- `form.tsx` - React Hook Form integration wrapper
- `input.tsx` - Text input field
- `textarea.tsx` - Multi-line text input
- `label.tsx` - Form label primitive
- `select.tsx` - Native select dropdown
- `checkbox.tsx` - Checkbox input
- `switch.tsx` - Toggle switch
- `toggle.tsx` - Toggle button (single)
- `toggle-group.tsx` - Toggle button group
- `slider.tsx` - Range slider
- `popover.tsx` - Popover trigger/content
- `command.tsx` - Command palette / combobox

**Custom Enhancements**:
- `enhanced-currency-select.tsx` - Custom currency selector with flags
- `currency-display.tsx` - Currency formatting display
- `country-select.tsx` - Country selector

#### Layout & Container Components
- `card.tsx` - Card container (CardHeader, CardContent, CardFooter, CardTitle, CardDescription)
- `separator.tsx` - Visual divider
- `scroll-area.tsx` - Scrollable container
- `sidebar.tsx` - Modern sidebar with Radix UI (complex, includes context, menu system)
- `sheet.tsx` - Mobile drawer/sheet

#### Dialog & Modal Components
- `dialog.tsx` - Modal dialog
- `alert-dialog.tsx` - Alert dialog (confirmation)
- `popover.tsx` - Floating popover

#### Display & Status Components
- `badge.tsx` - Status/tag badge
- `avatar.tsx` - User avatar with fallback
- `alert.tsx` - Alert/notification box
- `skeleton.tsx` - Loading placeholder skeleton
- `progress.tsx` - Progress bar

#### Data Display Components
- `table.tsx` - Data table (TableHeader, TableBody, TableRow, TableCell)
- `chart.tsx` - Chart component wrapper
- `chartLazy.tsx` - Lazy-loaded chart

#### Navigation & Actions
- `button.tsx` - Primary action button (multiple variants/sizes)
- `dropdown-menu.tsx` - Dropdown menu
- `tabs.tsx` - Tab navigation
- `accordion.tsx` - Expandable accordion
- `calendar.tsx` - Date picker calendar

#### Notifications & Messages
- `toast.tsx` - Toast notification (structure)
- `toaster.tsx` - Toast container/provider
- `use-toast.ts` - Toast hook

#### Utility & Accessibility
- `visually-hidden.tsx` - Screen reader only text
- `sonner.tsx` - Sonner toast library integration

#### Sidebar Subsystem
`sidebar/` directory contains sophisticated sidebar implementation:
- `core.tsx` - Core sidebar primitives
- `components.tsx` - Sidebar components
- `context.tsx` - Sidebar state management
- `layout.tsx` - Sidebar layout helpers
- `menu.tsx` - Sidebar menu
- `menu-buttons.tsx` - Menu button variants
- `menu-items.tsx` - Menu items
- `menu-group.tsx` - Menu item groups
- `menu-sub.tsx` - Submenu support

---

## 2. DOMAIN COMPONENTS (Feature-Specific) - 170+ Components

### Directory Structure

```
src/components/
├── Clients/                 # Client management (9 components)
├── Invoices/                # Invoice management (7 components)
├── CreateInvoice/           # Invoice creation flow (9 components + hooks)
├── CreateProject/           # Project creation wizard (10 components)
├── ProjectCard/             # Project card variants (8 components)
├── MilestoneCard/           # Milestone display/management (14 components)
├── ProjectClient/           # Client portal views (16 components)
├── ProjectManagement/       # Project dashboard view (7 components)
├── Profile/                 # User profile management (11 components)
├── dashboard/               # Dashboard widgets (9 components)
├── Subscription/            # Subscription management (11 components)
├── auth/                    # Authentication forms (10 components)
└── domain/                  # Domain exports (re-export pattern)
```

### Clients Components (9)

**Files**: `AddClientDialog`, `EditClientDialog`, `ClientDetailsDialog`, `DeleteClientDialog`, `ClientTable`, `ClientFilters`, `ClientsHeader`, `ClientsSection`, `ClientsStats`

**Pattern**: CRUD operations via dialogs with React Hook Form + Zod validation

### Invoices Components (7)

**Files**: `InvoiceTable`, `InvoiceFilters`, `InvoiceStatusBadge`, `InvoiceActionsMenu`, `InvoicesHeader`, `InvoicesSection`, `InvoicesStats`

**Key Feature**: Responsive table that converts to card layout on mobile

### CreateInvoice Components (9)

**Files**: `InvoiceForm`, `InvoiceHeader`, `BillingInformation`, `CurrencySelection`, `ProjectSelection`, `LineItemsSection`, `InvoicePreview`, `InvoiceActions`
**Hooks**: `useInvoiceCalculations`, `useInvoiceValidation`

**Key Feature**: Auto-populates from project milestones, calculates totals, currency inheritance

### CreateProject Components (10)

**Files**: `ProjectDetailsForm`, `ClientDropdown`, `ContractTermsSection`, `ContractStatusCard`, `EditContractDialog`, `EditContractDialogLazy`, `MilestonesList`, `PaymentProofSettings`, `SaveAsTemplateCheckbox`, `FormActions`

**Key Pattern**: Multi-step form with lazy-loaded dialogs for heavy components

### MilestoneCard Components (14)

**Files**: `index`, `MilestoneHeader`, `FreelancerView`, `ClientView`, `StatusPill`, `StatusDropdown`, `DeliverableManager`, `MultiLinkManager`, `RevisionRequestDialog`, `RevisionRequestDialogLazy`, `RevisionDetailsModal`, `RevisionSettingsDropdown`, `PaymentProofModal`, `PaymentProofDebugInfo`

**Key Pattern**: Branching view logic (`isClient` prop determines FreelancerView vs ClientView)

### ProjectCard Components (8)

**Files**: `ProjectCard`, `StandardProjectCard`, `VerticalProjectCard`, `ProjectCardContent`, `ProjectCardActions`, `ProjectCardActionsHeader`, `ProjectCardActionsFooter`
**Utilities**: `useProjectCardActions.ts`, `types.ts`, `utils.ts`

### ProjectClient Components (16+)

**Files**: `ProjectClientHeader`, `BrandedClientHeader`, `ClientProjectHeader`, `ProjectOverviewCard`, `ProjectInstructionsCard`, `ProjectMilestonesList`, `ModernMilestoneCard`, `ModernMilestonesList`, `ModernProjectOverview`, `ModernClientHeader`, `ModernInstructionsCard`, `ClientContractStatus`, `ContractApprovalModal`, `ContractApprovalModalLazy`, `PendingContractNotice`, `PaymentUploadDialog`, `ProjectPaymentDeliveryCard`, `MilestoneDeliverablePreview`, `StickyNextStepBar`, `ProjectFooter`, `ClientProjectLoading`, `ClientProjectError`

### ProjectManagement Components (7)

**Files**: `ProjectHeader`, `ProjectHeaderInfo`, `ProjectHeaderActions`, `ContractStatusCard`, `MilestoneList`, `ProjectProgressBar`, `ProjectStats`

### Profile Components (11)

**Files**: `PersonalInformationForm`, `PersonalInfoSection`, `BrandingSection`, `AccountSettingsCard`, `BrandingCard`, `ProfilePictureCard`, `ProfilePictureUpload`, `ProfileAvatar`, `ChangePasswordDialog`, `DeleteAccountDialog`, `EmailNotificationsDialog`

### Dashboard Components (9)

**Files**: `DashboardHeader`, `DashboardHeaderButtons`, `DashboardStats`, `DashboardAnalytics`, `DashboardAnalyticsCharts`, `DashboardAnalyticsMetrics`, `DashboardProjectList`, `UpcomingDeadlines`, `UsageIndicators`

### Subscription Components (11)

**Files**: `SubscriptionPlans`, `SubscriptionCard`, `SubscriptionCardHeader`, `SubscriptionCardFeatures`, `SubscriptionCardButton`, `SubscriptionCardBadge`, `SubscriptionStatusBanner`, `GracePeriodWarning`, `GracePeriodIndicator`, `ProjectAccessGuard`, `ProtectedFeature`

### Authentication Components (10)

**Files**: `LoginForm`, `LoginHeader`, `LoginFooter`, `SignUpContainer`, `FormField`, `PasswordField`, `GoogleAuthButton`, `AuthToggle`, `CurrencySelect`, `EmailConfirmationContainer`

---

## 3. SHARED COMPONENTS

### Base Shared Components (10)

1. **LoadingSpinner.tsx** - Loading indicator
2. **EmptyState.tsx** - Empty state placeholder
3. **StatCard.tsx** - Statistic card wrapper
4. **IconContainer.tsx** - Icon styling wrapper
5. **ErrorBoundary.tsx** - Error handling wrapper
6. **ErrorBoundaryText.tsx** - Error message text
7. **FormDialog.tsx** - Generic form dialog wrapper
8. **SkipNavigation.tsx** - A11y skip link
9. **LiveRegion.tsx** - A11y live region announcements
10. **ShadcnFormDialog.tsx** - Enhanced form dialog

### Dialog Pattern Library

**File**: `/src/components/shared/dialogs/`

**4 Base Dialog Classes**:

1. **BaseFormDialog.tsx** - Form submission dialog
2. **BaseConfirmDialog.tsx** - Confirmation/destructive action
3. **BaseViewDialog.tsx** - Read-only display dialog
4. **BaseUploadDialog.tsx** - File upload dialog
5. **ShadcnFormDialog.tsx** - Enhanced with React Hook Form

### Lazy Loading Pattern

Used for heavy dialogs:
```typescript
const EditContractDialogLazy = lazy(() =>
  import('./EditContractDialog').then(m => ({ default: m.EditContractDialog }))
);
```

**Files using pattern**:
- `EditContractDialogLazy.tsx`
- `RevisionRequestDialogLazy.tsx`
- `ContractApprovalModalLazy.tsx`

---

## 4. LAYOUT SYSTEM

### Main Layout Structure

**File**: `/src/components/Layout.tsx`

**Two Layout Modes**:

1. **Authenticated Layout** (with sidebar)
   ```
   SidebarProvider
   ├── AppSidebar (collapsible)
   └── SidebarInset
       ├── SidebarTrigger (mobile)
       └── MainContent
   ```

2. **Unauthenticated Layout** (no sidebar)
   ```
   MainContent
   └── Children
   ```

### Sidebar Component

**File**: `/src/components/AppSidebar.tsx`

**Structure**:
```
Sidebar (RTL-aware)
├── SidebarHeader → SidebarLogo
├── SidebarContent
│   ├── SidebarNavigation
│   └── SidebarAccount
└── SidebarFooter
```

**RTL Support**: `side={language === 'ar' ? 'right' : 'left'}`

### Header Component

**File**: `/src/components/Layout/Header.tsx`

**Structure**:
```
Header (sticky)
├── LogoSection
├── LanguageSelector
├── NavigationMenu (desktop)
└── MobileMenu (mobile)
```

---

## 5. FORM PATTERNS & VALIDATION

### React Hook Form Integration

**Standard Pattern**:
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { /* ... */ }
});

return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        control={form.control}
        name="fieldName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Label *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="..." />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </form>
  </Form>
);
```

### Validation Schemas (Zod)

Located in `/src/lib/validators/`:
- `clientSchema` - Client data
- `projectSchema` - Project data
- `invoiceSchema` - Invoice data
- `profileSchema` - Profile data

---

## 6. RESPONSIVE & MOBILE PATTERNS

### Mobile-First Approach

**Breakpoints**:
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px

### Touch Target Sizes

WCAG AA standard: 44x44px minimum

```typescript
<Button className="min-h-[44px] min-w-[44px] touch-manipulation" />
```

### Responsive Table Pattern

**InvoiceTable.tsx** Example:
- **Desktop** (sm:block): Full featured table
- **Mobile** (sm:hidden): Card layout (vertical stacking)

---

## 7. INTERNATIONALIZATION & RTL

### Language-Aware Components

```typescript
const { language, dir } = useLanguage(); // 'en'|'ar', 'ltr'|'rtl'
const t = useT(); // Translation function

<div className={cn(
  "flex items-center gap-4",
  dir === 'rtl' && "flex-row-reverse"
)}>
```

### RTL Implementation

- Sidebar: `side` prop switches
- Flexbox: `flex-row-reverse` for RTL
- Spacing: Conditional margin direction
- Text: Conditional `text-left` vs `text-right`
- Borders: `border-l` vs `border-r`

---

## 8. DIALOG & MODAL PATTERNS

### Dialog Implementation Hierarchy

```
BaseFormDialog
└── ShadcnFormDialog
    ├── AddClientDialog
    ├── EditClientDialog
    └── [other form dialogs]

AlertDialog
├── DeleteClientDialog
└── [confirmation dialogs]

Dialog (Radix UI)
├── EditContractDialog
├── RevisionRequestDialog
└── [custom dialogs]
```

### Standard Dialog Props

```typescript
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  // Dialog-specific content/handlers
}
```

---

## 9. COMPONENT COMPOSITION EXAMPLES

### Example 1: InvoiceTable

```
InvoiceTable.tsx
├── Desktop View: Table
│   └── Columns: ID, Amount, Project, Date, Status, Actions
├── Mobile View: Card layout
│   └── Stacked fields
├── Actions: Download, Send, Delete
└── Empty State
```

### Example 2: MilestoneCard

```
MilestoneCard/index.tsx
├── FreelancerView
│   ├── Deliverable management
│   ├── Payment approval
│   └── Revision handling
└── ClientView
    ├── Payment submission
    ├── Revision requests
    └── Progress tracking
```

### Example 3: CreateInvoice

```
InvoiceForm.tsx (orchestrator)
├── InvoiceHeader
├── BillingInformation
├── CurrencySelection
├── ProjectSelection (auto-populate)
├── LineItemsSection
├── InvoicePreview
└── InvoiceActions
```

---

## 10. COMPONENT STATISTICS

| Category | Count | Key Files |
|----------|-------|-----------|
| ShadcN Base UI | 40+ | Button, Card, Dialog, Table, etc. |
| Clients | 9 | AddClientDialog, ClientTable |
| Invoices | 7 | InvoiceTable, InvoiceStatusBadge |
| CreateInvoice | 9 | InvoiceForm, LineItemsSection |
| CreateProject | 10 | ProjectDetailsForm, MilestonesList |
| MilestoneCard | 14 | FreelancerView, ClientView |
| ProjectCard | 8 | StandardProjectCard, VerticalProjectCard |
| ProjectClient | 16+ | Client portal views |
| ProjectManagement | 7 | Dashboard views |
| Profile | 11 | PersonalInfoForm, BrandingCard |
| Dashboard | 9 | Analytics, Stats, Widgets |
| Authentication | 10 | LoginForm, SignUpContainer |
| Subscription | 11 | Plans, Cards, Warnings |
| Layout | 5 | Header, Sidebar, MainContent |
| Shared | 10+ | LoadingSpinner, EmptyState |
| **TOTAL** | **170+** | |

---

## 11. ARCHITECTURAL STRENGTHS

1. **Excellent Separation of Concerns**
   - Clear layers: Base UI → Domain → Pages
   - Business logic separate from presentation

2. **Consistent Patterns**
   - All form dialogs follow same structure
   - All CRUD operations use dialog pattern
   - All tables support mobile view

3. **Performance Optimizations**
   - Lazy loading for heavy dialogs
   - Memoized components
   - Code splitting at feature level

4. **Accessibility First**
   - Radix UI provides keyboard navigation
   - Semantic HTML throughout
   - ARIA labels and LiveRegion

5. **Bilingual Ready**
   - RTL support built in
   - Language context everywhere
   - All text translated

6. **Responsive Design**
   - Mobile-first approach
   - Touch-optimized targets
   - Adaptive layouts

---

## 12. KEY PATTERNS FOR OS-STYLE CONVERSION

### Current Component Traits Useful for Conversion

1. **Modular Design** - Components can be styled independently
2. **Consistent Props** - Standard open/onOpenChange patterns
3. **Dialog System** - Already modal-like, can become windows
4. **Form Organization** - Easy to add control panels
5. **Layout Flexibility** - Can become tiled/cascading

### Areas Ready for OS Styling

1. **Sidebar** → Window title bars
2. **Dialog System** → Floating windows
3. **Cards** → Window panels
4. **Buttons** → OS-style buttons
5. **Input Fields** → System controls
6. **Tables** → Data grid windows
7. **Menus** → System menus

---

## Summary

Ruzma's component architecture is **production-ready and optimally organized** for an OS-style UI conversion:

- **170+ professionally built components**
- **Clear separation of concerns**
- **Consistent composition patterns**
- **Mobile-first and accessible**
- **Full TypeScript coverage**
- **Internationalized throughout**

The component logic will largely remain unchanged during an OS-style conversion—primarily visual styling will be affected, not architecture or functionality.

---

**Document Generated**: 2025-11-25
**Repository**: /Users/osamakhalil/ruzma
