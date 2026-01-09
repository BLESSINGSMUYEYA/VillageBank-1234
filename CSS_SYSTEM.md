# CSS Design System - Quick Reference

> **uBank Village Banking Application**  
> Hybrid CSS system combining CSS variables with utility classes

---

## Table of Contents

- [CSS Variables](#css-variables)
- [Utility Classes](#utility-classes)
- [Common Patterns](#common-patterns)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)

---

## CSS Variables

### Color System

All colors support light and dark modes automatically.

#### Primary Colors
```css
var(--primary)                 /* Deep Royal Blue */
var(--primary-foreground)      /* Text on primary */
var(--secondary)               /* Muted Slate Blue */
var(--secondary-foreground)    /* Text on secondary */
```

#### Accent Colors
```css
var(--banana)                  /* Bright Electric Blue/Yellow (CTA color) */
var(--banana-foreground)       /* Text on banana */
var(--banana-soft)             /* Subtle banana tint */
```

#### Semantic Colors
```css
var(--success)                 /* Green for success states */
var(--warning)                 /* Orange for warnings */
var(--info)                    /* Blue for information */
var(--destructive)             /* Red for errors/destructive actions */
```

#### UI Colors
```css
var(--background)              /* Page background */
var(--foreground)              /* Default text color */
var(--card)                    /* Card background */
var(--muted)                   /* Muted backgrounds */
var(--muted-foreground)        /* Muted text */
var(--border)                  /* Border color */
var(--input)                   /* Input border color */
var(--ring)                    /* Focus ring color */
```

### Spacing & Sizing

```css
--radius                       /* Base border radius (0.625rem) */
--radius-sm                    /* Small radius */
--radius-md                    /* Medium radius */
--radius-lg                    /* Large radius */
--radius-xl                    /* Extra large radius */
```

---

## Utility Classes

### Layout Utilities

#### Flexbox Patterns
```tsx
<div className="flex-center">          {/* Center both axes */}
<div className="flex-between">         {/* Space between with center alignment */}
<div className="flex-start">           {/* Align start */}
<div className="flex-end">             {/* Align end */}
<div className="flex-col-center">      {/* Vertical center layout */}
<div className="flex-col-start">       {/* Vertical start layout */}
```

---

### Spacing Utilities

```tsx
<div className="page-container">       {/* Standard page wrapper with fade-in */}
<div className="section-spacing">      {/* Section bottom margin (mb-6 sm:mb-8) */}
<div className="card-padding">         {/* Card padding (p-4 sm:p-6) */}
<div className="card-header-spacing">  {/* Card header spacing */}
```

---

### Typography Utilities

#### Headings
```tsx
<h1 className="text-page-title">       {/* Main page title with gradient */}
<h2 className="text-section-title">    {/* Section title */}
<h3 className="text-subsection-title"> {/* Subsection title */}
<h4 className="text-card-title">       {/* Card title */}
<h5 className="text-small-heading">    {/* Small heading */}
```

#### Body Text
```tsx
<p className="text-body">              {/* Standard body text */}
<p className="text-body-sm">           {/* Small body text */}
<span className="text-label">         {/* Uppercase label text */}
```

---

### Card Utilities

```tsx
{/* Standard card */}
<Card className="card-standard">

{/* Interactive card with hover effects */}
<Card className="card-interactive">

{/* Primary gradient card */}
<Card className="card-gradient-primary">

{/* Banana gradient card */}
<Card className="card-gradient-banana">

{/* Muted card */}
<Card className="card-muted">
```

---

### Button Utilities

```tsx
{/* Primary CTA - Use for main actions */}
<button className="btn-primary-cta">

{/* Secondary button */}
<button className="btn-secondary">

{/* Ghost button */}
<button className="btn-ghost">

{/* Icon button */}
<button className="btn-icon">
```

---

### Badge Utilities

```tsx
<Badge className="badge-success">      {/* Green success badge */}
<Badge className="badge-warning">      {/* Orange warning badge */}
<Badge className="badge-info">         {/* Blue info badge */}
<Badge className="badge-error">        {/* Red error badge */}
<Badge className="badge-neutral">      {/* Neutral gray badge */}
```

---

### Input Utilities

```tsx
<input className="input-standard" />   {/* Standard input field */}
<input className="input-muted" />      {/* Muted background input */}
```

---

### Effect Utilities

#### Hover Effects
```tsx
<div className="hover-lift">           {/* Lift on hover */}
<div className="hover-scale">          {/* Scale on hover/active */}
<div className="hover-glow">           {/* Glow effect on hover */}
```

#### Focus States
```tsx
<input className="focus-ring-primary"> {/* Primary focus ring */}
<input className="focus-ring-banana">  {/* Banana focus ring */}
```

---

### Grid Utilities

```tsx
<div className="grid-stats">           {/* 4-column stats grid */}
<div className="grid-content">         {/* 3-column content grid */}
<div className="grid-two-col">         {/* 2-column layout */}
<div className="grid-auto-fit">        {/* Auto-fit responsive grid */}
```

---

### Background Utilities

```tsx
<div className="bg-gradient-primary-subtle">   {/* Subtle primary gradient */}
<div className="bg-gradient-banana-subtle">    {/* Subtle banana gradient */}
<div className="bg-dotted">                    {/* Dotted pattern */}
<div className="glass-morphism">               {/* Glass effect */}
<div className="zen-card">                     {/* Zen card style */}
```

---

### Border Utilities

```tsx
<div className="border-standard">              {/* Standard border */}
<div className="border-dashed-standard">       {/* Dashed border */}
```

---

### Shadow Utilities

```tsx
<div className="shadow-card">          {/* Card shadow with hover */}
<div className="shadow-elevated">      {/* Elevated shadow */}
<div className="shadow-floating">      {/* Floating shadow */}
```

---

### Transition Utilities

```tsx
<div className="transition-standard">  {/* 300ms transition */}
<div className="transition-fast">      {/* 150ms transition */}
<div className="transition-slow">      {/* 500ms transition */}
<div className="spring-transition">    {/* Spring animation */}
```

---

### Container Utilities

```tsx
<div className="container-narrow">     {/* max-w-2xl centered */}
<div className="container-medium">     {/* max-w-4xl centered */}
<div className="container-wide">       {/* max-w-6xl centered */}
```

---

## Common Patterns

### Standard Page Layout

```tsx
export default function MyPage() {
  return (
    <div className="page-container">
      <PageHeader
        title="Page Title"
        description="Page description"
        action={
          <Button className="btn-primary-cta">
            Action
          </Button>
        }
      />
      
      {/* Stats Section */}
      <div className="grid-stats">
        <StatsCard variant="default" label="Metric" value="123" />
        <StatsCard variant="featured" label="Featured" value="456" />
      </div>
      
      {/* Content Section */}
      <Card className="card-standard">
        <CardHeader className="card-header-spacing">
          <CardTitle className="text-card-title">Section Title</CardTitle>
        </CardHeader>
        <CardContent className="card-padding">
          {/* Content */}
        </CardContent>
      </Card>
    </div>
  )
}
```

### Interactive Card Grid

```tsx
<div className="grid-content">
  {items.map(item => (
    <Card key={item.id} className="card-interactive">
      <CardHeader className="card-header-spacing">
        <div className="flex-between">
          <CardTitle className="text-card-title">{item.title}</CardTitle>
          <Badge className="badge-success">ACTIVE</Badge>
        </div>
      </CardHeader>
      <CardContent className="card-padding">
        <p className="text-body">{item.description}</p>
      </CardContent>
    </Card>
  ))}
</div>
```

### Form with Utility Classes

```tsx
<form className="space-y-6">
  <div className="space-y-2">
    <label className="text-small-heading">Field Name</label>
    <input 
      type="text"
      className="input-standard w-full focus-ring-primary"
      placeholder="Enter value"
    />
  </div>
  
  <div className="flex-end gap-4">
    <Button className="btn-secondary">Cancel</Button>
    <Button className="btn-primary-cta">Submit</Button>
  </div>
</form>
```

### Stats Dashboard

```tsx
<div className="grid-stats">
  <Card className="card-standard">
    <CardContent className="card-padding">
      <div className="flex-col-start gap-2">
        <span className="text-label">Total Users</span>
        <span className="text-section-title">1,234</span>
        <span className="text-body-sm">↑ 12% from last month</span>
      </div>
    </CardContent>
  </Card>
  
  <Card className="card-gradient-banana">
    <CardContent className="card-padding">
      <div className="flex-col-start gap-2">
        <span className="text-label text-white/80">Featured Metric</span>
        <span className="text-section-title">5,678</span>
      </div>
    </CardContent>
  </Card>
</div>
```

---

## Best Practices

### DO ✅

1. **Use utility classes for repetitive patterns**
   ```tsx
   // Good - reusable pattern
   <Card className="card-standard" />
   
   // Instead of repeating
   <Card className="bg-card border border-border/50 shadow-sm rounded-2xl sm:rounded-3xl" />
   ```

2. **Combine utilities with Tailwind classes**
   ```tsx
   // Perfect - mix when needed
   <div className="card-standard hover-lift p-8 max-w-md">
   ```

3. **Use CSS variables for custom styles**
   ```tsx
   <div style={{ backgroundColor: 'var(--banana-soft)' }}>
   ```

4. **Leverage component utilities**
   ```tsx
   <Card className="card-interactive">  {/* Includes all hover/active states */}
   ```

### DON'T ❌

1. **Don't duplicate patterns inline**
   ```tsx
   // Bad - repetitive
   <Card className="bg-card border border-border/50 shadow-sm rounded-2xl sm:rounded-3xl" />
   <Card className="bg-card border border-border/50 shadow-sm rounded-2xl sm:rounded-3xl" />
   
   // Good - use utility
   <Card className="card-standard" />
   <Card className="card-standard" />
   ```

2. **Don't override utility classes unnecessarily**
   ```tsx
   // Bad - fighting the utility
   <Button className="btn-primary-cta bg-red-500">  {/* Don't override */}
   
   // Good - use appropriate utility or create new one
   <Button className="btn-destructive">
   ```

3. **Don't mix patterns**
   ```tsx
   // Bad - inconsistent
   <h1 className="text-2xl font-black ...">Title 1</h1>
   <h1 className="text-3xl font-bold ...">Title 2</h1>
   
   // Good - consistent
   <h1 className="text-page-title">Title 1</h1>
   <h1 className="text-page-title">Title 2</h1>
   ```

---

## Migration Guide

### Migrating from Inline Styles

**Before:**
```tsx
<div className="flex items-center justify-between mb-6">
  <h2 className="text-2xl font-black text-foreground">Title</h2>
  <button className="bg-banana hover:bg-yellow-400 text-banana-foreground font-black rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95">
    Action
  </button>
</div>
```

**After:**
```tsx
<div className="flex-between section-spacing">
  <h2 className="text-section-title">Title</h2>
  <button className="btn-primary-cta">Action</button>
</div>
```

### Refactoring Cards

**Before:**
```tsx
<Card className="bg-card border border-border/50 shadow-sm rounded-2xl sm:rounded-3xl transition-all duration-300 hover:shadow-lg hover:border-banana/30 hover:-translate-y-1">
```

**After:**
```tsx
<Card className="card-interactive">
```

### Typography Consistency

**Before:**
```tsx
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-900 to-indigo-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
  Page Title
</h1>
```

**After:**
```tsx
<h1 className="text-page-title">Page Title</h1>
```

---

## Quick Lookup

### Most Common Classes

| Pattern | Class | Usage |
|---------|-------|-------|
| Center flex | `flex-center` | Center content both axes |
| Space between | `flex-between` | Header layouts |
| Page wrapper | `page-container` | Every page root |
| Standard card | `card-standard` | Most cards |
| Interactive card | `card-interactive` | Clickable cards |
| Primary button | `btn-primary-cta` | Main actions |
| Page title | `text-page-title` | H1 titles |
| Card title | `text-card-title` | Card headers |
| Stats grid | `grid-stats` | 4-column metrics |
| Success badge | `badge-success` | Status indicators |

---

## Color Reference

### Using CSS Variables in Custom Styles

```tsx
// In JSX style prop
<div style={{ 
  backgroundColor: 'var(--banana)',
  color: 'var(--banana-foreground)'
}} />

// In custom CSS file
.my-custom-class {
  background-color: var(--primary);
  border: 1px solid var(--border);
}

// With Tailwind arbitrary values
<div className="bg-[var(--banana)]" />
```

---

## Need Help?

- **Pattern not listed?** Check if Tailwind has a built-in class first
- **Creating new patterns?** Use utilities 3+ times before creating a class
- **Questions?** Refer to [`STYLE_GUIDE.md`](file:///c:/Users/mwenitete/Desktop/Blessings/yes/village-banking/STYLE_GUIDE.md) for component examples

---

**Last Updated:** January 8, 2026  
**Version:** 1.0.0
