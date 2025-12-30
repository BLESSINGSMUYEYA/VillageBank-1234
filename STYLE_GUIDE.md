# Village Banking System - Style Guide

> **Last Updated:** December 29, 2025  
> **Version:** 2.0

This style guide ensures visual consistency across all pages and components in the Village Banking application.

---

## 📐 Design System

### Color Palette

#### Primary Colors
```css
/* Navy Blue Theme */
--primary: oklch(0.35 0.15 250)        /* Navy Blue #1E3A8A */
--accent: oklch(0.55 0.2 250)          /* Royal Blue #3B82F6 */

/* Banana Gold (Accent/CTA) */
--banana: oklch(0.85 0.16 85)          /* Vibrant Banana Gold */
--banana-foreground: oklch(0.2 0.05 260)
--banana-soft: oklch(0.96 0.03 85)
```

#### Semantic Colors
```css
/* Success */
--success: green-600
--success-bg: green-100 (light) / green-900/30 (dark)

/* Warning */
--warning: orange-600
--warning-bg: orange-100 (light) / orange-900/30 (dark)

/* Error */
--destructive: oklch(0.577 0.245 27.325)

/* Info */
--info: blue-600
--info-bg: blue-100 (light) / blue-900/30 (dark)
```

---

## 🎨 Component Standards

### 1. Page Headers

**Use Component:** `<PageHeader />`

**Location:** `components/layout/PageHeader.tsx`

**Usage:**
```tsx
import { PageHeader } from '@/components/layout/PageHeader'

<PageHeader
  title="Page Title"
  description="Page description goes here"
  action={
    <Button className="...">Action Button</Button>
  }
/>
```

**Style Rules:**
- **Title:** Gradient text from blue-900 to indigo-800 (dark: white to blue-200)
- **Font:** `text-2xl sm:text-3xl lg:text-4xl font-black`
- **Bottom border:** `border-b border-border/50 pb-6`
- **Margin:** `mb-6 sm:mb-8`
- **Description:** `text-muted-foreground font-medium`

---

### 2. Stats Cards

**Use Component:** `<StatsCard />`

**Location:** `components/ui/stats-card.tsx`

**Variants:**

#### Default
```tsx
<StatsCard
  variant="default"
  label="Total Groups"
  value={stats.totalGroups}
  description="Active groups"
/>
```
- **Background:** `bg-card border border-border/50`
- **Shadow:** `shadow-sm hover:shadow-md`

#### Featured (Banana)
```tsx
<StatsCard
  variant="featured"
  label="Contribution Streak"
  value={financials.contributionStreak}
  description="Consecutive months"
/>
```
- **Background:** Gradient from banana to yellow-500
- **Text:** White on gradient

#### Gradient
```tsx
<StatsCard
  variant="gradient"
  gradient="from-blue-900 to-indigo-900"
  label="Active Loans"
  value={activeLoans.length}
  description="Current loans"
/>
```
- **Background:** Custom gradient
- **Text:** White on gradient

---

### 3. Empty States

**Use Component:** `<EmptyState />`

**Location:** `components/ui/empty-state.tsx`

**Usage:**
```tsx
import { EmptyState } from '@/components/ui/empty-state'

<EmptyState
  icon={DollarSign}
  title="No Contributions Yet"
  description="Start contributing to build your financial portfolio."
  action={
    <Link href="/contributions/new">
      <Button>Make First Contribution</Button>
    </Link>
  }
/>
```

**Style Rules:**
- **Container:** `bg-muted/10 rounded-2xl sm:rounded-3xl border border-dashed border-border/60`
- **Padding:** `py-12 sm:py-16 px-4`
- **Icon size:** `w-16 h-16 sm:w-20 sm:h-20`
- **Icon color:** Muted with 50% opacity
- **Title:** `text-xl sm:text-2xl font-black`
- **Description:** `text-sm sm:text-base font-medium max-w-sm`

---

### 4. Buttons

#### Primary CTA (Call to Action)
```tsx
<Button className="bg-banana hover:bg-yellow-400 text-banana-foreground font-black rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95">
  Action
</Button>
```

**Rules:**
- **ALWAYS** use banana color for primary CTAs
- **Font weight:** `font-black`
- **Border radius:** `rounded-xl`
- **Hover effect:** Scale 105%
- **Active effect:** Scale 95%

#### Secondary
```tsx
<Button variant="outline" className="rounded-xl font-bold">
  Secondary Action
</Button>
```

#### Icon Buttons
```tsx
<Button size="icon" variant="ghost" className="rounded-full">
  <Settings className="w-5 h-5" />
</Button>
```

---

### 5. Cards

#### Standard Card
```tsx
<Card className="bg-card border border-border/50 shadow-sm rounded-2xl sm:rounded-3xl">
  <CardHeader>
    <CardTitle className="text-xl font-black text-foreground">Title</CardTitle>
    <CardDescription className="text-sm font-medium text-muted-foreground">
      Description
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

#### Interactive Card (Hoverable)
```tsx
<Card className="bg-card border border-border/50 shadow-sm hover:shadow-lg hover:border-banana/30 transition-all duration-300 hover:-translate-y-1 rounded-2xl sm:rounded-3xl">
```

---

### 6. Badges

**Status Badges:**
```tsx
{/* Active/Success */}
<Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg font-bold border-none px-2.5 py-1 text-xs uppercase tracking-wider">
  ACTIVE
</Badge>

{/* Pending/Warning */}
<Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg font-bold border-none px-2.5 py-1 text-xs uppercase tracking-wider">
  PENDING
</Badge>

{/* Completed/Info */}
<Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg font-bold border-none px-2.5 py-1 text-xs uppercase tracking-wider">
  COMPLETED
</Badge>

{/* Error/Rejected */}
<Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg font-bold border-none px-2.5 py-1 text-xs uppercase tracking-wider">
  REJECTED
</Badge>
```

---

### 7. Tabs

**Standard Pattern:**
```tsx
<TabsList className="bg-card/50 backdrop-blur-sm p-1 rounded-2xl border border-border/50 w-full justify-start overflow-x-auto flex-nowrap h-14 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
  <TabsTrigger
    value="tab1"
    className="rounded-xl px-6 h-10 font-bold data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
  >
    Tab 1
  </TabsTrigger>
</TabsList>
```

**Rules:**
- **Background:** Semi-transparent card with backdrop blur
- **Border radius:** `rounded-2xl`
- **Height:** `h-14`
- **Active state:** Navy blue background with white text
- **Enable horizontal scroll** with thin scrollbar

---

## 📏 Typography Scale

### Headings
```tsx
/* Page Title (h1) */
className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-900 to-indigo-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent"

/* Section Title (h2) */
className="text-2xl font-black text-foreground"

/* Subsection (h3) */
className="text-xl font-black text-foreground"

/* Card Title */
className="text-lg sm:text-xl font-black text-foreground"

/* Small Heading */
className="text-sm font-bold text-foreground"
```

### Body Text
```tsx
/* Regular Body */
className="text-sm font-medium text-muted-foreground"

/* Small Text */
className="text-xs font-medium text-muted-foreground"

/* Label (All Caps) */
className="text-[10px] font-black text-muted-foreground uppercase tracking-widest"
```

---

## 📐 Spacing System

### Container Spacing
```tsx
/* Main container */
className="space-y-6 sm:space-y-8 animate-fade-in pb-24 sm:pb-10"

/* Section spacing */
className="mb-6 sm:mb-8"

/* Card padding */
className="p-4 sm:p-6"
```

### Grid Layouts
```tsx
/* Stats Grid (4 columns) */
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"

/* Content Grid (3 columns) */
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"

/* Two Column Layout */
className="grid grid-cols-1 lg:grid-cols-2 gap-6"
```

---

## 🌊 Animations & Transitions

### Standard Transitions
```tsx
/* Hover Card */
className="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"

/* Button Hover */
className="transition-all hover:scale-105 active:scale-95"

/* Smooth Opacity */
className="transition-opacity duration-300"

/* Background Change */
className="transition-colors duration-200"
```

### Page Entrance
```tsx
/* Apply to main container */
className="animate-fade-in"
```

---

## 🎯 Icon Guidelines

### Standard Sizes
```tsx
/* Navigation/Header icons */
className="w-5 h-5"

/* Card icons (small) */
className="w-4 h-4"

/* Card icons (medium) */
className="w-6 h-6"

/* Empty state icons */
className="w-12 h-12 sm:w-16 sm:h-16"

/* Large decorative icons */
className="w-20 h-20 sm:w-24 sm:h-24"
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
sm:   640px
md:   768px
lg:   1024px
xl:   1280px
2xl:  1536px

/* Custom breakpoint */
min-[480px]: 480px  /* For grid adjustments */
```

---

## ✅ Component Checklist

When creating or updating a page, ensure:

- [ ] Uses `<PageHeader />` component
- [ ] Primary buttons use banana color
- [ ] Empty states use `<EmptyState />` component
- [ ] Stats cards use `<StatsCard />` component (if applicable)
- [ ] All cards have consistent styling (`border-border/50`, `rounded-2xl sm:rounded-3xl`)
- [ ] Tabs follow standard pattern (if applicable)
- [ ] Badges use standard color scheme
- [ ] Page container has `animate-fade-in`
- [ ] Responsive spacing is consistent
- [ ] Icons follow size guidelines

---

## 🚫 Don'ts

❌ **DO NOT** use these patterns:
- Custom header structures (use `<PageHeader />`)
- `bg-blue-900` for primary CTAs (use `bg-banana`)
- `bg-foreground` for buttons (use `bg-banana`)
- Custom empty state markup (use `<EmptyState />`)
- Inconsistent border radius on cards
- `text-h1`, `text-h2` classes (use font size utilities)
- Custom page title gradients (use standardized gradient)

---

## 📝 Examples

### Complete Page Structure
```tsx
import { PageHeader } from '@/components/layout/PageHeader'
import { StatsCard } from '@/components/ui/stats-card'
import { EmptyState } from '@/components/ui/empty-state'

export function MyPage() {
  return (
    <div className="space-y-8 animate-fade-in relative">
      <PageHeader
        title="Page Title"
        description="Page description"
        action={
          <Button className="bg-banana hover:bg-yellow-400 text-banana-foreground font-black rounded-xl">
            Action
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard variant="default" label="Metric" value="123" />
        <StatsCard variant="featured" label="Featured" value="456" />
      </div>

      {/* Content */}
      <Card className="bg-card border border-border/50 shadow-sm rounded-2xl sm:rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-black text-foreground">
            Section Title
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            // Render data
          ) : (
            <EmptyState
              icon={Icon}
              title="No Data"
              description="Description here"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 🔄 Version History

### v2.0 (Dec 29, 2025)
- Introduced standardized components (`PageHeader`, `StatsCard`, `EmptyState`)
- Unified button styling with banana color for all CTAs
- Standardized tab navigation patterns
- Consistent card styling across all pages
- Updated empty state patterns

### v1.0 (Initial)
- Basic navy blue theme
- Initial component patterns
