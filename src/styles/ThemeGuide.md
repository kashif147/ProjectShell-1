# Unified Application Theme Guide

## Overview

This document outlines the unified theme system implemented across the application to ensure consistent design and user experience.

## Theme Variables

### Primary Colors

- `--primary-blue`: #215e97 (Main brand color)
- `--primary-blue-dark`: #1a4d7a (Darker variant)
- `--primary-blue-light`: #3b82f6 (Lighter variant)
- `--primary-blue-lighter`: #60a5fa (Lightest variant)

### Secondary Colors

- `--secondary-orange`: #c97a2f (Accent color)
- `--secondary-orange-dark`: #ad8135 (Darker variant)
- `--secondary-orange-light`: #f59e0b (Lighter variant)

### Neutral Colors

- `--font-color`: #123c63 (Primary text)
- `--font-color-light`: #374151 (Secondary text)
- `--font-color-lighter`: #6b7280 (Tertiary text)
- `--border-color`: #d9d9d9 (Primary borders)
- `--border-color-light`: #e5e7eb (Light borders)
- `--background-primary`: #ffffff (Main background)
- `--background-secondary`: #f8fafc (Secondary background)
- `--background-tertiary`: #f1f5f9 (Tertiary background)
- `--background-hover`: #e2e8f0 (Hover states)

### Status Colors

- `--success-color`: #10b981 (Success states)
- `--success-bg`: #d1fae5 (Success backgrounds)
- `--warning-color`: #f59e0b (Warning states)
- `--warning-bg`: #fef3c7 (Warning backgrounds)
- `--error-color`: #ef4444 (Error states)
- `--error-bg`: #fee2e2 (Error backgrounds)
- `--info-color`: #3b82f6 (Info states)
- `--info-bg`: #dbeafe (Info backgrounds)

## Theme Classes

### Cards

```css
.theme-card              /* Standard card with unified styling */
/* Standard card with unified styling */
.theme-card-header       /* Card header with gradient background */
.theme-card-title        /* Card title styling */
.theme-card-subtitle     /* Card subtitle styling */
.theme-card-body; /* Card body padding */
```

### Buttons

```css
.theme-btn               /* Base button styling */
/* Base button styling */
.theme-btn-primary       /* Primary button (blue gradient) */
.theme-btn-secondary     /* Secondary button (gray) */
.theme-btn-success       /* Success button (green gradient) */
.theme-btn-warning       /* Warning button (orange gradient) */
.theme-btn-error; /* Error button (red gradient) */
```

### Tables

```css
.theme-table             /* Standard table styling */
/* Standard table styling */
.theme-table-header      /* Table header with blue gradient */
.theme-table-cell        /* Table cell styling */
.theme-table-row; /* Table row styling */
```

### Forms

```css
.theme-input             /* Standard input styling */
/* Standard input styling */
.theme-select; /* Standard select styling */
```

### Status Indicators

```css
.theme-status            /* Base status styling */
/* Base status styling */
.theme-status-success    /* Success status */
.theme-status-warning    /* Warning status */
.theme-status-error      /* Error status */
.theme-status-info; /* Info status */
```

### Tabs

```css
.theme-tabs/* Tab container styling */;
```

### KPI Cards

```css
.theme-kpi-card          /* KPI card styling */
/* KPI card styling */
.theme-kpi-title         /* KPI title */
.theme-kpi-value         /* KPI value */
.theme-kpi-change; /* KPI change indicator */
```

### Chart Cards

```css
.theme-chart-card/* Chart card styling */;
```

### Modals

```css
.theme-modal/* Modal styling */;
```

### Filter Cards

```css
.theme-filter-card/* Filter card styling */;
```

## Usage Examples

### Creating a Card

```jsx
<Card className="theme-card">
  <div className="theme-card-header">
    <h2 className="theme-card-title">Card Title</h2>
    <p className="theme-card-subtitle">Card subtitle</p>
  </div>
  <div className="theme-card-body">Card content goes here</div>
</Card>
```

### Creating Buttons

```jsx
<Button className="theme-btn theme-btn-primary">
  Primary Action
</Button>
<Button className="theme-btn theme-btn-secondary">
  Secondary Action
</Button>
```

### Creating KPI Cards

```jsx
<Card className="theme-kpi-card">
  <Statistic
    title={<span className="theme-kpi-title">Total Users</span>}
    value={1234}
    valueStyle={{ color: "var(--primary-blue)" }}
  />
</Card>
```

### Creating Tables

```jsx
<Table className="theme-table" columns={columns} dataSource={data} />
```

## Implementation Guidelines

### 1. Always Use Theme Classes

Instead of inline styles or custom CSS, use the provided theme classes:

❌ **Don't:**

```jsx
<Card style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
```

✅ **Do:**

```jsx
<Card className="theme-card">
```

### 2. Use CSS Variables for Colors

Instead of hardcoded colors, use CSS variables:

❌ **Don't:**

```css
color: #215e97;
background: #f8fafc;
```

✅ **Do:**

```css
color: var(--primary-blue);
background: var(--background-secondary);
```

### 3. Consistent Spacing

Use the spacing variables for consistent margins and padding:

❌ **Don't:**

```css
padding: 16px;
margin: 24px;
```

✅ **Do:**

```css
padding: var(--spacing-md);
margin: var(--spacing-lg);
```

### 4. Consistent Border Radius

Use the radius variables for consistent rounded corners:

❌ **Don't:**

```css
border-radius: 8px;
```

✅ **Do:**

```css
border-radius: var(--radius-md);
```

### 5. Consistent Shadows

Use the shadow variables for consistent depth:

❌ **Don't:**

```css
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
```

✅ **Do:**

```css
box-shadow: var(--shadow-md);
```

## Responsive Design

The theme includes responsive breakpoints and mobile-optimized spacing:

```css
@media (max-width: 768px) {
  :root {
    --spacing-md: 12px;
    --spacing-lg: 16px;
    --font-size-3xl: 24px;
  }
}
```

## Print Styles

The theme includes print-optimized styles that automatically apply when printing:

- Removes interactive elements
- Uses black and white colors
- Optimizes spacing for paper
- Ensures proper page breaks

## Migration Guide

### From Old Styles to New Theme

1. **Replace Card Classes:**

   - `report-card` → `theme-card`
   - `kpi-card` → `theme-kpi-card`
   - `chart-card` → `theme-chart-card`

2. **Replace Button Classes:**

   - Add `theme-btn` base class
   - Use appropriate variant classes

3. **Replace Table Classes:**

   - `report-table` → `theme-table`

4. **Update Color References:**
   - Replace hardcoded colors with CSS variables
   - Use semantic color names

## Best Practices

1. **Consistency First:** Always use theme classes over custom styles
2. **Semantic Colors:** Use status colors for their intended purposes
3. **Responsive Design:** Test on different screen sizes
4. **Accessibility:** Ensure sufficient color contrast
5. **Performance:** Use CSS variables for better maintainability

## Troubleshooting

### Common Issues

1. **Colors not applying:** Ensure CSS variables are defined in `:root`
2. **Spacing issues:** Check if spacing variables are being used correctly
3. **Print problems:** Verify print styles are not being overridden

### Debugging

Use browser dev tools to inspect CSS variables:

```css
/* Check if variables are defined */
:root {
  --primary-blue: #215e97; /* Should be visible in computed styles */
}
```

## Future Enhancements

- Dark mode support
- Additional color schemes
- More component variants
- Animation presets
- Icon theme integration
