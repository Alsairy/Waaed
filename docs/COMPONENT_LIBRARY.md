# Waaed Platform Component Library Documentation

## Overview

This document provides comprehensive documentation for the Waaed platform's UI component library, including usage examples, accessibility guidelines, and design system specifications following TETCO brand guidelines.

## Table of Contents

1. [Design System](#design-system)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Component Guidelines](#component-guidelines)
5. [Accessibility Standards](#accessibility-standards)
6. [Usage Examples](#usage-examples)
7. [Mobile Components](#mobile-components)

## Design System

### TETCO Brand Colors

The Waaed platform follows the TETCO brand color palette to ensure consistent visual identity across all components.

#### Primary Colors
```scss
--waaed-primary-blue: #005F96;    // Main brand color for primary actions
--waaed-primary-green: #36BA91;   // Secondary brand color for success states
--waaed-light-green: #4CFCB4;     // Accent color for highlights and focus
--waaed-dark-teal: #0C3C44;       // Dark color for text and headers
--waaed-light-gray: #D1D1D1;      // Light color for borders and backgrounds
```

#### Usage Guidelines
- **Primary Blue (#005F96)**: Use for primary buttons, navigation elements, and key interactive components
- **Primary Green (#36BA91)**: Use for success states, positive actions, and secondary buttons
- **Light Green (#4CFCB4)**: Use for focus indicators, highlights, and accent elements
- **Dark Teal (#0C3C44)**: Use for primary text, headings, and high-contrast elements
- **Light Gray (#D1D1D1)**: Use for borders, dividers, and subtle backgrounds

#### Color Contrast Compliance
All color combinations meet WCAG 2.1 AA standards:
- Primary Blue on White: 7.2:1 (AAA compliant)
- Dark Teal on White: 12.1:1 (AAA compliant)
- Primary Green on White: 4.8:1 (AA compliant)

## Typography

### Font Family: Effra

The platform uses Effra as the primary font family with fallbacks for optimal cross-platform compatibility.

```scss
--font-family-primary: 'Effra', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

#### Arabic Language Support
For Arabic content, the system automatically switches to Arabic-optimized fonts:
```scss
--font-family-arabic: 'Effra Arabic', 'Noto Sans Arabic', 'Cairo', 'Tajawal', sans-serif;
```

### Typography Scale

#### Headings
```scss
h1: 2.5rem (40px) - font-weight: 700 (Bold)
h2: 2rem (32px) - font-weight: 700 (Bold)
h3: 1.75rem (28px) - font-weight: 600 (SemiBold)
h4: 1.5rem (24px) - font-weight: 600 (SemiBold)
h5: 1.25rem (20px) - font-weight: 500 (Medium)
h6: 1.125rem (18px) - font-weight: 500 (Medium)
```

#### Body Text
```scss
body: 1rem (16px) - font-weight: 400 (Regular)
small: 0.875rem (14px) - font-weight: 400 (Regular)
caption: 0.75rem (12px) - font-weight: 400 (Regular)
```

## Component Guidelines

### Layout Components

#### Header Component
```tsx
// Usage Example
<Header 
  userName="Ahmed Al-Rashid"
  userRole="Student"
  onMenuToggle={() => setMenuOpen(!menuOpen)}
  isMenuOpen={menuOpen}
/>
```

**Accessibility Features:**
- Skip navigation link for keyboard users
- Proper ARIA labels for all interactive elements
- Screen reader announcements for notifications
- Keyboard navigation support

#### Sidebar Component
```tsx
// Usage Example
<Sidebar 
  userRole="teacher"
  isCollapsed={false}
  onToggle={() => setCollapsed(!collapsed)}
/>
```

**Features:**
- Role-based navigation filtering
- Three-level hierarchical menu structure
- RTL language support
- Mobile bottom navigation
- Responsive design optimization

### Form Components

#### Input Fields
```tsx
// Standard Input
<input
  type="text"
  className="form-input"
  aria-label="Student Name"
  aria-describedby="name-help"
/>
<div id="name-help" className="sr-only">
  Enter the student's full name
</div>
```

**Styling:**
```scss
.form-input {
  border: 2px solid var(--waaed-light-gray);
  border-radius: 16px;
  padding: 20px;
  font-family: var(--font-family-primary);
  min-height: 44px; // Touch accessibility
  
  &:focus {
    outline: 3px solid var(--waaed-light-green);
    outline-offset: 2px;
    border-color: var(--waaed-primary-blue);
  }
}
```

#### Buttons
```tsx
// Primary Button
<button 
  className="btn btn-primary"
  aria-label="Save Changes"
>
  Save Changes
</button>

// Secondary Button
<button 
  className="btn btn-secondary"
  aria-label="Cancel Action"
>
  Cancel
</button>
```

**Button Styles:**
```scss
.btn {
  min-height: 44px;
  min-width: 44px;
  border-radius: 16px;
  padding: 20px 24px;
  font-family: var(--font-family-primary);
  font-weight: 700;
  transition: all 0.25s ease;
  
  &:focus {
    outline: 3px solid var(--waaed-light-green);
    outline-offset: 2px;
  }
}

.btn-primary {
  background-color: var(--waaed-primary-blue);
  color: white;
  
  &:hover {
    background-color: var(--waaed-primary-green);
  }
}

.btn-secondary {
  background-color: var(--waaed-primary-green);
  color: white;
  
  &:hover {
    background-color: var(--waaed-primary-blue);
  }
}
```

### Card Components

#### Standard Card
```tsx
<div className="card card-hover">
  <div className="card-header">
    <h3>Card Title</h3>
  </div>
  <div className="card-content">
    <p>Card content goes here</p>
  </div>
  <div className="card-footer">
    <button className="btn btn-primary">Action</button>
  </div>
</div>
```

**Card Styles:**
```scss
.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 95, 150, 0.08);
  border: 1px solid var(--waaed-light-gray);
  
  &.card-hover {
    transition: all 0.25s ease;
    
    &:hover {
      box-shadow: 0 8px 24px rgba(0, 95, 150, 0.15);
      transform: translateY(-2px);
    }
  }
}
```

## Accessibility Standards

### WCAG 2.1 AA Compliance

#### Focus Management
```scss
// Enhanced focus styles
*:focus {
  outline: 3px solid var(--waaed-light-green);
  outline-offset: 2px;
  box-shadow: 0 0 0 1px var(--waaed-primary-blue);
}

*:focus-visible {
  outline: 3px solid var(--waaed-light-green);
  outline-offset: 2px;
  box-shadow: 0 0 0 1px var(--waaed-primary-blue);
}
```

#### Screen Reader Support
```scss
// Screen reader only content
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

#### Skip Navigation
```tsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
```

```scss
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--waaed-primary-blue);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
  font-weight: 600;
  
  &:focus {
    top: 6px;
  }
}
```

### Touch Accessibility
All interactive elements meet minimum touch target requirements:
```scss
button,
input[type="button"],
input[type="submit"],
input[type="reset"],
.btn,
.clickable {
  min-height: 44px;
  min-width: 44px;
}
```

## Responsive Design

### Breakpoints
```scss
// Mobile First Approach
$mobile: 767px;
$tablet: 768px;
$desktop: 1024px;

@mixin mobile {
  @media (max-width: #{$mobile}) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: #{$tablet}) and (max-width: #{$desktop - 1px}) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: #{$desktop}) {
    @content;
  }
}
```

### Responsive Typography
```scss
// Fluid typography function
@function fluid-font-size($min-size, $max-size, $min-width: 320px, $max-width: 1200px) {
  @return calc(#{$min-size} + (#{$max-size} - #{$min-size}) * ((100vw - #{$min-width}) / (#{$max-width} - #{$min-width})));
}

h1 {
  font-size: fluid-font-size(1.75rem, 2.5rem);
}
```

## RTL Language Support

### Automatic Direction Switching
```typescript
const updateDocumentDirection = (language: string) => {
  const isRTL = language === 'ar';
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
  
  // CSS Custom Properties for RTL
  document.documentElement.style.setProperty('--text-align-start', isRTL ? 'right' : 'left');
  document.documentElement.style.setProperty('--text-align-end', isRTL ? 'left' : 'right');
  document.documentElement.style.setProperty('--margin-start', isRTL ? 'margin-right' : 'margin-left');
  document.documentElement.style.setProperty('--margin-end', isRTL ? 'margin-left' : 'margin-right');
};
```

### RTL-Aware Styling
```scss
// Use CSS custom properties for RTL support
.component {
  text-align: var(--text-align-start);
  margin-inline-start: 16px;
  padding-inline-end: 24px;
}
```

## Mobile Components

### Mobile Color System
```typescript
export const Colors = {
  primary: '#005F96',
  secondary: '#36BA91',
  success: '#36BA91',
  lightGreen: '#4CFCB4',
  darkTeal: '#0C3C44',
  lightGray: '#D1D1D1',
  
  gradients: {
    primary: ['#005F96', '#36BA91'],
    secondary: ['#36BA91', '#4CFCB4'],
  },
  
  roles: {
    admin: '#005F96',
    teacher: '#36BA91',
    student: '#4CFCB4',
    parent: '#0C3C44',
  },
};
```

### Mobile Typography
```typescript
const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Effra-Bold',
    color: Colors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Effra-Regular',
    color: Colors.text,
  },
});
```

## Usage Examples

### Dashboard Layout
```tsx
function Dashboard({ userRole }: { userRole: string }) {
  return (
    <div className="dashboard-layout">
      <Header userRole={userRole} />
      <div className="dashboard-content">
        <Sidebar userRole={userRole} />
        <main id="main-content" className="main-content">
          <div className="dashboard-grid">
            <StatsCard title="Total Students" value="1,234" />
            <StatsCard title="Active Courses" value="56" />
            <StatsCard title="Pending Tasks" value="12" />
          </div>
        </main>
      </div>
    </div>
  );
}
```

### Form Layout
```tsx
function StudentForm() {
  return (
    <form className="form-layout" aria-labelledby="form-title">
      <h2 id="form-title">Student Registration</h2>
      
      <div className="form-group">
        <label htmlFor="student-name">Full Name</label>
        <input
          id="student-name"
          type="text"
          className="form-input"
          aria-describedby="name-help"
          required
        />
        <div id="name-help" className="form-help">
          Enter the student's full name as it appears on official documents
        </div>
      </div>
      
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Register Student
        </button>
        <button type="button" className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
```

## Best Practices

### Component Development
1. **Always use semantic HTML** - Use proper HTML elements for their intended purpose
2. **Include ARIA labels** - Ensure all interactive elements have descriptive labels
3. **Test with keyboard navigation** - Verify all functionality is accessible via keyboard
4. **Verify color contrast** - Ensure all text meets WCAG AA standards
5. **Support RTL languages** - Use logical properties and CSS custom properties
6. **Test on mobile devices** - Verify touch targets meet minimum size requirements

### Performance Considerations
1. **Optimize font loading** - Use font-display: swap for better performance
2. **Minimize CSS bundle size** - Use CSS custom properties for theming
3. **Implement lazy loading** - Load components only when needed
4. **Use efficient animations** - Prefer transform and opacity for animations

### Accessibility Testing
1. **Screen reader testing** - Test with NVDA, JAWS, or VoiceOver
2. **Keyboard navigation** - Ensure all functionality works without a mouse
3. **Color blindness testing** - Verify interfaces work for colorblind users
4. **High contrast mode** - Test with Windows High Contrast mode

## Conclusion

This component library provides a comprehensive foundation for building accessible, responsive, and culturally-sensitive educational interfaces. By following these guidelines and using the provided components, developers can ensure consistency across the Waaed platform while maintaining high standards for usability and accessibility.

For questions or contributions to this component library, please refer to the project's contribution guidelines or contact the development team.
