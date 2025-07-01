# Waaed Platform Style Guide

## Overview

This style guide provides comprehensive guidelines for maintaining visual consistency across the Waaed educational platform. It covers color usage, typography, spacing, component styling, and accessibility standards following TETCO brand guidelines.

## Brand Identity

### TETCO Brand Colors

The Waaed platform strictly adheres to the TETCO brand color palette to ensure consistent visual identity across all touchpoints.

#### Primary Color Palette

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| Primary Blue | `#005F96` | `rgb(0, 95, 150)` | Primary actions, navigation, headers |
| Primary Green | `#36BA91` | `rgb(54, 186, 145)` | Success states, secondary actions |
| Light Green | `#4CFCB4` | `rgb(76, 252, 180)` | Highlights, focus indicators, accents |
| Dark Teal | `#0C3C44` | `rgb(12, 60, 68)` | Primary text, headings |
| Light Gray | `#D1D1D1` | `rgb(209, 209, 209)` | Borders, dividers, subtle backgrounds |

#### Color Usage Guidelines

**Primary Blue (#005F96)**
- Use for: Primary buttons, main navigation, key CTAs
- Don't use for: Body text, error states
- Accessibility: 7.2:1 contrast ratio on white (AAA compliant)

**Primary Green (#36BA91)**
- Use for: Success messages, positive actions, secondary buttons
- Don't use for: Error states, warning messages
- Accessibility: 4.8:1 contrast ratio on white (AA compliant)

**Light Green (#4CFCB4)**
- Use for: Focus indicators, highlights, active states
- Don't use for: Large text areas, primary actions
- Accessibility: Use only for accents, not primary text

**Dark Teal (#0C3C44)**
- Use for: Headings, primary text, high-contrast elements
- Don't use for: Backgrounds with white text
- Accessibility: 12.1:1 contrast ratio on white (AAA compliant)

**Light Gray (#D1D1D1)**
- Use for: Borders, dividers, disabled states
- Don't use for: Primary text, important elements
- Accessibility: Use only for decorative elements

#### Extended Color Palette

```scss
// Semantic Colors
$success: #36BA91;
$warning: #FF9500;
$error: #FF3B30;
$info: #005F96;

// Neutral Colors
$white: #FFFFFF;
$gray-50: #F8F9FA;
$gray-100: #F2F2F7;
$gray-200: #E5E5EA;
$gray-300: #D1D1D1;
$gray-400: #8E8E93;
$gray-500: #6C757D;
$gray-600: #495057;
$gray-700: #343A40;
$gray-800: #212529;
$gray-900: #0C3C44;
```

## Typography

### Font Family: Effra

Effra is the primary typeface for the Waaed platform, chosen for its modern appearance and excellent readability in both English and Arabic contexts.

#### Font Loading
```css
@import url('https://fonts.googleapis.com/css2?family=Effra:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap');
```

#### Font Stack
```scss
// Primary font stack
$font-family-primary: 'Effra', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

// Arabic font stack
$font-family-arabic: 'Effra Arabic', 'Noto Sans Arabic', 'Cairo', 'Tajawal', sans-serif;

// Monospace font stack
$font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
```

### Typography Scale

#### Heading Hierarchy
```scss
h1, .h1 {
  font-size: 2.5rem;    // 40px
  font-weight: 700;     // Bold
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin-bottom: 1.5rem;
}

h2, .h2 {
  font-size: 2rem;      // 32px
  font-weight: 700;     // Bold
  line-height: 1.25;
  letter-spacing: -0.01em;
  margin-bottom: 1.25rem;
}

h3, .h3 {
  font-size: 1.75rem;   // 28px
  font-weight: 600;     // SemiBold
  line-height: 1.3;
  margin-bottom: 1rem;
}

h4, .h4 {
  font-size: 1.5rem;    // 24px
  font-weight: 600;     // SemiBold
  line-height: 1.35;
  margin-bottom: 0.875rem;
}

h5, .h5 {
  font-size: 1.25rem;   // 20px
  font-weight: 500;     // Medium
  line-height: 1.4;
  margin-bottom: 0.75rem;
}

h6, .h6 {
  font-size: 1.125rem;  // 18px
  font-weight: 500;     // Medium
  line-height: 1.45;
  margin-bottom: 0.625rem;
}
```

#### Body Text
```scss
body, .body {
  font-size: 1rem;      // 16px
  font-weight: 400;     // Regular
  line-height: 1.6;
  color: var(--waaed-dark-teal);
}

.body-large {
  font-size: 1.125rem;  // 18px
  line-height: 1.55;
}

.body-small {
  font-size: 0.875rem;  // 14px
  line-height: 1.65;
}

.caption {
  font-size: 0.75rem;   // 12px
  font-weight: 400;
  line-height: 1.5;
  color: var(--gray-500);
}
```

#### Font Weights
```scss
$font-weight-light: 300;
$font-weight-regular: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
```

### Responsive Typography

#### Fluid Typography Function
```scss
@function fluid-font-size($min-size, $max-size, $min-width: 320px, $max-width: 1200px) {
  @return calc(#{$min-size} + (#{$max-size} - #{$min-size}) * ((100vw - #{$min-width}) / (#{$max-width} - #{$min-width})));
}

// Usage
h1 {
  font-size: fluid-font-size(1.75rem, 2.5rem);
}
```

#### Responsive Breakpoints
```scss
$breakpoints: (
  mobile: 320px,
  tablet: 768px,
  desktop: 1024px,
  wide: 1440px
);

@mixin mobile {
  @media (max-width: 767px) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: 768px) and (max-width: 1023px) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: 1024px) {
    @content;
  }
}
```

## Spacing System

### 8px Grid System

The Waaed platform uses an 8px grid system for consistent spacing throughout the interface.

```scss
$spacer: 8px;

$spacers: (
  0: 0,
  1: $spacer * 0.5,    // 4px
  2: $spacer,          // 8px
  3: $spacer * 1.5,    // 12px
  4: $spacer * 2,      // 16px
  5: $spacer * 2.5,    // 20px
  6: $spacer * 3,      // 24px
  7: $spacer * 3.5,    // 28px
  8: $spacer * 4,      // 32px
  9: $spacer * 4.5,    // 36px
  10: $spacer * 5,     // 40px
  12: $spacer * 6,     // 48px
  16: $spacer * 8,     // 64px
  20: $spacer * 10,    // 80px
  24: $spacer * 12,    // 96px
  32: $spacer * 16,    // 128px
);
```

#### Spacing Utilities
```scss
// Margin utilities
.m-0 { margin: 0; }
.m-1 { margin: 4px; }
.m-2 { margin: 8px; }
.m-4 { margin: 16px; }
.m-6 { margin: 24px; }
.m-8 { margin: 32px; }

// Padding utilities
.p-0 { padding: 0; }
.p-1 { padding: 4px; }
.p-2 { padding: 8px; }
.p-4 { padding: 16px; }
.p-6 { padding: 24px; }
.p-8 { padding: 32px; }

// Directional spacing
.mt-4 { margin-top: 16px; }
.mb-4 { margin-bottom: 16px; }
.ml-4 { margin-left: 16px; }
.mr-4 { margin-right: 16px; }
.mx-4 { margin-left: 16px; margin-right: 16px; }
.my-4 { margin-top: 16px; margin-bottom: 16px; }
```

## Component Styling

### Buttons

#### Button Variants
```scss
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
  border: none;
  border-radius: 16px;
  font-family: var(--font-family-primary);
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.25s ease;
  
  &:focus {
    outline: 3px solid var(--waaed-light-green);
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-primary {
  background-color: var(--waaed-primary-blue);
  color: white;
  
  &:hover:not(:disabled) {
    background-color: var(--waaed-primary-green);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 95, 150, 0.3);
  }
}

.btn-secondary {
  background-color: var(--waaed-primary-green);
  color: white;
  
  &:hover:not(:disabled) {
    background-color: var(--waaed-primary-blue);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(54, 186, 145, 0.3);
  }
}

.btn-outline {
  background-color: transparent;
  color: var(--waaed-primary-blue);
  border: 2px solid var(--waaed-primary-blue);
  
  &:hover:not(:disabled) {
    background-color: var(--waaed-primary-blue);
    color: white;
  }
}
```

#### Button Sizes
```scss
.btn-sm {
  min-height: 36px;
  padding: 8px 16px;
  font-size: 0.875rem;
}

.btn-lg {
  min-height: 52px;
  padding: 16px 32px;
  font-size: 1.125rem;
}

.btn-xl {
  min-height: 60px;
  padding: 20px 40px;
  font-size: 1.25rem;
}
```

### Form Elements

#### Input Fields
```scss
.form-input {
  width: 100%;
  min-height: 44px;
  padding: 12px 16px;
  border: 2px solid var(--waaed-light-gray);
  border-radius: 12px;
  font-family: var(--font-family-primary);
  font-size: 1rem;
  background-color: white;
  transition: all 0.25s ease;
  
  &:focus {
    outline: 3px solid var(--waaed-light-green);
    outline-offset: 2px;
    border-color: var(--waaed-primary-blue);
  }
  
  &:invalid {
    border-color: var(--error);
  }
  
  &:disabled {
    background-color: var(--gray-100);
    cursor: not-allowed;
  }
}

.form-textarea {
  @extend .form-input;
  min-height: 120px;
  resize: vertical;
}

.form-select {
  @extend .form-input;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}
```

#### Form Labels
```scss
.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--waaed-dark-teal);
  
  &.required::after {
    content: " *";
    color: var(--error);
  }
}

.form-help {
  margin-top: 4px;
  font-size: 0.875rem;
  color: var(--gray-500);
}

.form-error {
  margin-top: 4px;
  font-size: 0.875rem;
  color: var(--error);
}
```

### Cards

#### Card Base
```scss
.card {
  background: white;
  border: 1px solid var(--waaed-light-gray);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 95, 150, 0.08);
  overflow: hidden;
  transition: all 0.25s ease;
  
  &.card-hover {
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 95, 150, 0.15);
    }
  }
}

.card-header {
  padding: 24px 24px 0;
  
  .card-title {
    margin: 0 0 8px;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--waaed-dark-teal);
  }
  
  .card-subtitle {
    margin: 0;
    font-size: 0.875rem;
    color: var(--gray-500);
  }
}

.card-content {
  padding: 16px 24px;
}

.card-footer {
  padding: 0 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
```

#### Card Variants
```scss
.card-primary {
  border-color: var(--waaed-primary-blue);
  
  .card-header {
    background: linear-gradient(135deg, var(--waaed-primary-blue), var(--waaed-primary-green));
    color: white;
    margin: -1px -1px 0;
    padding: 24px;
    
    .card-title {
      color: white;
    }
  }
}

.card-success {
  border-color: var(--waaed-primary-green);
  background: linear-gradient(135deg, rgba(54, 186, 145, 0.05), rgba(76, 252, 180, 0.05));
}

.card-compact {
  .card-header,
  .card-content,
  .card-footer {
    padding: 16px;
  }
}
```

## Layout System

### Grid System
```scss
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  
  @include tablet {
    padding: 0 24px;
  }
  
  @include desktop {
    padding: 0 32px;
  }
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -8px;
}

.col {
  flex: 1;
  padding: 0 8px;
}

// Column sizes
@for $i from 1 through 12 {
  .col-#{$i} {
    flex: 0 0 percentage($i / 12);
    max-width: percentage($i / 12);
    padding: 0 8px;
  }
}
```

### Flexbox Utilities
```scss
.d-flex { display: flex; }
.d-inline-flex { display: inline-flex; }

.flex-row { flex-direction: row; }
.flex-column { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.flex-nowrap { flex-wrap: nowrap; }

.justify-start { justify-content: flex-start; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }

.align-start { align-items: flex-start; }
.align-center { align-items: center; }
.align-end { align-items: flex-end; }
.align-stretch { align-items: stretch; }
```

## Accessibility Guidelines

### Focus Management
```scss
// Global focus styles
*:focus {
  outline: 3px solid var(--waaed-light-green);
  outline-offset: 2px;
}

// Skip link
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--waaed-primary-blue);
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
  font-weight: 600;
  
  &:focus {
    top: 6px;
  }
}

// Screen reader only
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

### High Contrast Support
```scss
@media (prefers-contrast: high) {
  :root {
    --waaed-primary-blue: #000080;
    --waaed-primary-green: #008000;
    --waaed-light-green: #00FF00;
    --waaed-dark-teal: #000000;
    --waaed-light-gray: #808080;
  }
}
```

### Reduced Motion Support
```scss
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## RTL Language Support

### CSS Logical Properties
```scss
// Use logical properties for RTL support
.component {
  margin-inline-start: 16px;
  margin-inline-end: 24px;
  padding-inline: 20px;
  border-inline-start: 2px solid var(--waaed-primary-blue);
  text-align: start;
}

// CSS custom properties for RTL
:root {
  --text-align-start: left;
  --text-align-end: right;
  --margin-start: margin-left;
  --margin-end: margin-right;
}

[dir="rtl"] {
  --text-align-start: right;
  --text-align-end: left;
  --margin-start: margin-right;
  --margin-end: margin-left;
}
```

## Animation and Transitions

### Standard Transitions
```scss
$transition-fast: 0.15s ease;
$transition-base: 0.25s ease;
$transition-slow: 0.35s ease;

// Common transition patterns
.transition-all {
  transition: all var(--transition-base);
}

.transition-colors {
  transition: color var(--transition-base), background-color var(--transition-base), border-color var(--transition-base);
}

.transition-transform {
  transition: transform var(--transition-base);
}
```

### Hover Effects
```scss
.hover-lift {
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 95, 150, 0.15);
  }
}

.hover-scale {
  transition: transform var(--transition-base);
  
  &:hover {
    transform: scale(1.05);
  }
}
```

## Best Practices

### Color Usage
1. Always ensure sufficient color contrast (minimum 4.5:1 for normal text)
2. Don't rely solely on color to convey information
3. Use semantic colors consistently (success = green, error = red)
4. Test with colorblind users or simulation tools

### Typography
1. Maintain consistent vertical rhythm using the 8px grid
2. Use appropriate heading hierarchy (don't skip levels)
3. Ensure readable line lengths (45-75 characters)
4. Test with different font sizes and zoom levels

### Spacing
1. Use the 8px grid system consistently
2. Maintain consistent spacing between related elements
3. Use white space effectively to create visual hierarchy
4. Ensure touch targets are at least 44px for mobile

### Accessibility
1. Always include proper ARIA labels and roles
2. Ensure keyboard navigation works for all interactive elements
3. Test with screen readers
4. Provide alternative text for images
5. Use semantic HTML elements

### Performance
1. Optimize font loading with font-display: swap
2. Use CSS custom properties for theming
3. Minimize CSS bundle size
4. Use efficient selectors

This style guide serves as the foundation for maintaining visual consistency and accessibility across the Waaed platform. Regular updates and team reviews ensure these standards continue to meet user needs and industry best practices.
