# Ruzma Design System

## Design Philosophy
Ruzma's design system emphasizes **professional simplicity**, **mobile-first accessibility**, and **contextual user experience**. The system balances clean aesthetics with functional usability, creating a trustworthy platform for professional freelancer-client relationships.

## Visual Identity

### Color System
The platform uses a sophisticated neutral color palette with strategic accent colors for professional credibility.

```css
:root {
  /* Primary Colors */
  --primary: hsl(224, 71%, 4%);           /* Deep navy for primary actions */
  --primary-foreground: hsl(210, 40%, 98%); /* Light text on primary */
  
  /* Secondary Colors */
  --secondary: hsl(220, 13%, 91%);        /* Light gray for secondary elements */
  --secondary-foreground: hsl(220, 9%, 46%); /* Medium gray text */
  
  /* Semantic Colors */
  --destructive: hsl(0, 84%, 60%);        /* Red for warnings/errors */
  --muted: hsl(220, 13%, 91%);           /* Subtle background */
  --accent: hsl(220, 13%, 91%);          /* Highlight color */
  
  /* Sidebar Colors */
  --sidebar-background: hsl(224, 71%, 4%);
  --sidebar-foreground: hsl(213, 31%, 91%);
  --sidebar-primary: hsl(224, 76%, 94%);
  --sidebar-accent: hsl(216, 34%, 17%);
}
```

### Typography
**Primary Font**: Inter - Modern, highly legible sans-serif optimized for screens

```css
.font-sans {
  font-family: 'Inter', 'system-ui', 'sans-serif';
}

/* Typography Scale */
.text-xs     { font-size: 0.75rem; line-height: 1rem; }
.text-sm     { font-size: 0.875rem; line-height: 1.25rem; }
.text-base   { font-size: 1rem; line-height: 1.5rem; }
.text-lg     { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl     { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl    { font-size: 1.5rem; line-height: 2rem; }
.text-3xl    { font-size: 1.875rem; line-height: 2.25rem; }
```

### Spacing & Layout
Mobile-first responsive spacing system with consistent vertical rhythm.

```css
/* Custom Spacing */
--mobile-padding: 1rem;
--tablet-padding: 1.5rem;
--desktop-padding: 2rem;
--touch-target: 44px;        /* Minimum touch target size */

/* Safe Area Support */
--safe-top: env(safe-area-inset-top);
--safe-bottom: env(safe-area-inset-bottom);
```

## Component Architecture

### Component Hierarchy
```
Design System Components
├── Primitives (Radix UI)
│   ├── Dialog, Dropdown, Toast
│   ├── Accordion, Tabs, Progress
│   └── Form Controls, Navigation
├── Base Components (shadcn/ui)
│   ├── Button, Input, Select
│   ├── Card, Badge, Avatar
│   └── Table, Calendar, Chart
├── Composite Components
│   ├── ProjectCard, MilestoneCard
│   ├── ClientPortal, Dashboard
│   └── InvoiceGenerator, Analytics
└── Layout Components
    ├── AppSidebar, Layout
    ├── MobileNavigation
    └── LanguageLayout
```

### Button System
Comprehensive button variants for different contexts and importance levels.

```typescript
interface ButtonProps {
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  disabled?: boolean;
}

// Button Variants
.btn-default     { background: hsl(224, 71%, 4%); color: white; }
.btn-destructive { background: hsl(0, 84%, 60%); color: white; }
.btn-outline     { border: 1px solid; background: transparent; }
.btn-ghost       { background: transparent; hover:background: muted; }
```

### Input Components
Consistent form input styling with validation states and accessibility features.

```typescript
interface InputProps {
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  variant: 'default' | 'error' | 'success';
  size: 'sm' | 'default' | 'lg';
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}
```

### Card System
Flexible card components for content organization and hierarchy.

```typescript
interface CardProps {
  variant: 'default' | 'outline' | 'elevated';
  padding: 'none' | 'sm' | 'default' | 'lg';
  interactive?: boolean;  // Hover effects and cursor pointer
}
```

## Mobile-First Design Principles

### Responsive Breakpoints
```css
/* Mobile-first breakpoint system */
.xs    { min-width: 480px; }   /* Large phones */
.sm    { min-width: 640px; }   /* Tablets portrait */
.md    { min-width: 768px; }   /* Tablets landscape */
.lg    { min-width: 1024px; }  /* Desktop */
.xl    { min-width: 1280px; }  /* Large desktop */
.2xl   { min-width: 1536px; }  /* Extra large */

/* Touch-specific breakpoints */
.touch    { @media (hover: none) and (pointer: coarse) }
.no-touch { @media (hover: hover) and (pointer: fine) }
```

### Touch Optimization
All interactive elements meet accessibility standards for touch interfaces.

```css
/* Minimum touch targets */
.min-h-touch-target { min-height: 44px; }
.min-w-touch-target { min-width: 44px; }

/* Touch-friendly spacing */
.touch-spacing { padding: 12px; margin: 8px 0; }

/* Large tap areas for mobile */
@media (hover: none) {
  .btn { min-height: 48px; padding: 12px 16px; }
  .input { min-height: 48px; font-size: 16px; } /* Prevents zoom on iOS */
}
```

### Mobile Navigation
Adaptive navigation that transforms based on screen size.

```typescript
interface NavigationProps {
  mode: 'desktop' | 'mobile' | 'tablet';
  collapsed?: boolean;
  overlay?: boolean;
}

// Mobile: Bottom navigation or hamburger menu
// Tablet: Collapsible sidebar
// Desktop: Full sidebar with hover states
```

## Animation & Micro-interactions

### Animation Principles
- **Performance**: Hardware-accelerated animations using transform and opacity
- **Accessibility**: Respects `prefers-reduced-motion` user preference
- **Purpose**: Animations provide feedback and guide user attention
- **Duration**: Quick (150ms) for micro-interactions, medium (300ms) for transitions

### Animation Library
```css
/* Custom animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes mobile-slide-in {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

/* Animation utilities */
.animate-fade-in { animation: fadeIn 300ms ease-out; }
.animate-mobile-slide-in { animation: mobile-slide-in 0.3s ease-out; }
```

### Loading States
Consistent loading indicators across all async operations.

```typescript
interface LoadingState {
  type: 'spinner' | 'skeleton' | 'progress';
  size: 'sm' | 'default' | 'lg';
  text?: string;
}

// Skeleton loading for content areas
// Spinner for button actions  
// Progress bar for file uploads
```

## Dark Mode & Theme Support

### Theme System
Comprehensive dark mode support with automatic system detection.

```css
/* Light theme (default) */
:root {
  --background: hsl(0, 0%, 100%);
  --foreground: hsl(222, 84%, 5%);
  --muted: hsl(210, 40%, 96%);
}

/* Dark theme */
.dark {
  --background: hsl(222, 84%, 5%);
  --foreground: hsl(210, 40%, 98%);
  --muted: hsl(217, 32%, 17%);
}
```

### Theme Toggle
User preference storage with system detection fallback.

```typescript
interface ThemePreference {
  mode: 'light' | 'dark' | 'system';
  persistPreference: boolean;
}
```

## Accessibility Features

### WCAG 2.1 Compliance
- **AA Level Compliance**: Minimum 4.5:1 color contrast ratio
- **Focus Management**: Visible focus indicators and logical tab order
- **Screen Reader Support**: Semantic HTML and ARIA attributes
- **Keyboard Navigation**: Complete keyboard accessibility

### Color Accessibility
```css
/* High contrast colors for accessibility */
.text-high-contrast { color: hsl(222, 84%, 5%); }
.bg-high-contrast { background: hsl(0, 0%, 100%); }

/* Focus indicators */
.focus-visible:focus {
  outline: 2px solid hsl(217, 91%, 60%);
  outline-offset: 2px;
}
```

### Form Accessibility
```typescript
interface AccessibleFormProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
}
```

## Icon System

### Icon Library
Uses Lucide React for consistent, scalable icons.

```typescript
interface IconProps {
  name: string;
  size: 'sm' | 'default' | 'lg' | 'xl';
  variant: 'default' | 'muted' | 'accent';
}

// Common icons
<PlusIcon size="sm" />
<TrashIcon variant="destructive" />
<CheckIcon size="lg" className="text-success" />
```

### Icon Usage Guidelines
- **Consistency**: Same icons for same actions across the platform
- **Size**: Minimum 16px for accessibility, optimal 20-24px
- **Context**: Icons paired with text labels for clarity
- **Color**: Icons follow text color hierarchy

## Layout Patterns

### Dashboard Layout
```typescript
interface DashboardLayout {
  sidebar: {
    width: '240px' | 'collapsed';
    position: 'fixed' | 'relative';
    overlay?: boolean;
  };
  header: {
    height: '64px';
    sticky: boolean;
    breadcrumbs?: boolean;
  };
  main: {
    padding: 'mobile' | 'tablet' | 'desktop';
    maxWidth?: string;
  };
}
```

### Client Portal Layout
Simplified, branded layout for client-facing pages.

```typescript
interface ClientPortalLayout {
  branding: {
    logo?: string;
    primaryColor: string;
    companyName: string;
  };
  navigation: 'minimal' | 'full';
  sidebar: boolean;
}
```

### Mobile Layout Adaptations
- **Stack Navigation**: Hierarchical navigation on mobile
- **Bottom Actions**: Primary actions accessible with thumb
- **Swipe Gestures**: Intuitive mobile interactions
- **Safe Area**: Proper handling of device-specific UI elements

## Form Design Patterns

### Form Layout
```css
/* Form spacing and layout */
.form-group {
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### Validation States
```typescript
interface ValidationState {
  state: 'default' | 'error' | 'success' | 'warning';
  message?: string;
  showIcon?: boolean;
}
```

### Form Patterns
- **Progressive Disclosure**: Complex forms broken into steps
- **Inline Validation**: Real-time validation feedback
- **Required Fields**: Clear indication of required vs optional
- **Help Text**: Contextual guidance for complex fields

## Data Visualization

### Chart Design
Consistent styling for data visualization components.

```typescript
interface ChartTheme {
  colors: {
    primary: string[];
    secondary: string[];
    accent: string[];
  };
  grid: {
    stroke: string;
    strokeWidth: number;
  };
  text: {
    fill: string;
    fontSize: number;
  };
}
```

### Dashboard Widgets
- **Metric Cards**: Key performance indicators
- **Progress Indicators**: Goal tracking and completion
- **Trend Charts**: Historical data visualization
- **Comparison Tables**: Side-by-side data comparison

## Performance Considerations

### CSS Optimization
- **Purge Unused CSS**: Tailwind CSS purging for minimal bundle size
- **Critical CSS**: Above-the-fold styles inlined
- **Font Loading**: Optimized web font loading strategy
- **CSS Custom Properties**: Efficient theme switching

### Animation Performance
- **Hardware Acceleration**: GPU-accelerated animations
- **Reduced Motion**: Respect user accessibility preferences
- **Animation Cleanup**: Proper cleanup of animation listeners
- **Frame Rate**: Consistent 60fps animations

### Image Optimization
- **Responsive Images**: Appropriate sizing for different viewports
- **Format Selection**: WebP with fallbacks for compatibility
- **Lazy Loading**: Images load as they enter viewport
- **Compression**: Optimized image compression for web delivery

## Component Documentation

### Storybook Integration
Each component includes comprehensive documentation with:
- **Usage Examples**: Common implementation patterns
- **Props API**: TypeScript interface documentation
- **Accessibility Notes**: WCAG compliance details
- **Design Tokens**: Color, spacing, and typography references

### Design Tokens
```typescript
export const designTokens = {
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem', 
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem', 
    lg: '0.5rem',
    xl: '0.75rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  }
};
```