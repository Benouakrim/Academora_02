# Landing Page Customization Guide

Quick reference for personalizing the landing page for your brand and audience.

## 🎨 Easy Customizations

### 1. **Hero Section Text**
File: `HeroSection.tsx` (Line ~28-35)

```tsx
// Change the main headline
<h1>Find Your{' '}
  <span className="text-gradient-brand">
    Dream University  // ← Change this
  </span>
</h1>

// Change the subheadline
<p>Data-driven matching, financial aid predictions, and real student insights...
// ← Change this
</p>
```

### 2. **Trust Indicators (Logos)**
File: `HeroSection.tsx` (Line ~70-80) & `SocialProofSection.tsx` (Line ~110-125)

```tsx
// Replace university names with your actual partners
{['MIT', 'Stanford', 'Harvard', 'Oxford', 'Cambridge'].map((name) => (
  // ↑ Change these names to your partners
))}
```

### 3. **Testimonials**
File: `SocialProofSection.tsx` (Line ~14-37)

```tsx
const testimonials = [
  {
    name: "Sarah Chen",           // ← Your student's name
    role: "Stanford Student",     // ← Their role/school
    text: "Academora helped...",  // ← Their quote
    rating: 5,
    avatar: "SC"                  // ← Initials for avatar
  },
  // Add more testimonials here
]
```

### 4. **Statistics**
File: `SocialProofSection.tsx` (Line ~38-43)

```tsx
const stats = [
  { number: "50,000+", label: "Students Helped" },      // ← Update your numbers
  { number: "1,200+", label: "Universities Covered" },
  { number: "98%", label: "Satisfaction Rate" },
  { number: "4.9/5", label: "Average Rating" }
]
```

### 5. **Benefits Cards**
File: `BenefitsSection.tsx` (Line ~15-54)

```tsx
const benefits = [
  {
    icon: Brain,
    title: "AI-Powered Matching",           // ← Change title
    description: "Our intelligent algorithm...", // ← Change description
    color: "from-blue-500 to-cyan-500"     // ← Change colors
  },
  // Edit the 6 benefit cards
]
```

### 6. **Problem/Solution Items**
File: `ProblemSolutionSection.tsx` (Line ~9-31)

```tsx
const problems = [
  "Applying to universities blindly...",  // ← Update problems
  // 5 problems total
]

const solutions = [
  "Instant net price estimates...",      // ← Update solutions
  // 5 solutions total
]
```

### 7. **Product Demo Steps**
File: `ProductDemoSection.tsx` (Line ~9-37)

```tsx
const steps = [
  {
    number: 1,
    title: "Tell Us About Yourself",           // ← Change title
    description: "Share your academic profile...", // ← Change description
    icon: Search,
    color: "from-blue-500 to-cyan-500"
  },
  // 4 steps total
]
```

### 8. **FAQ Questions**
File: `FAQSection.tsx` (Line ~7-75)

```tsx
{
  category: "Getting Started",              // ← Category name
  questions: [
    {
      q: "Is Academora really free to use?",  // ← Question
      a: "Yes! Our core features..."         // ← Answer
    },
    // Add/edit 16 Q&As
  ]
}
```

### 9. **Risk Reversal Guarantees**
File: `RiskReversalSection.tsx` (Line ~7-41)

```tsx
const guarantees = [
  {
    icon: Check,
    title: "30-Day Money-Back Guarantee",    // ← Change guarantee
    description: "Try our premium features...", // ← Change description
    color: "from-green-500 to-emerald-500"
  },
  // 4 guarantees total
]
```

### 10. **Footer Links**
File: `FooterSection.tsx` (Line ~28-77)

```tsx
const footerLinks = {
  company: [
    { label: 'About Us', href: '#' },        // ← Update href
    { label: 'Blog', href: '#' },
    // Update all footer links
  ],
  // Update company, product, support, legal sections
}

// Update contact info (Line ~190-215)
<a href="mailto:support@academora.com">  // ← Your email
  support@academora.com
</a>
```

---

## 🎯 Content-Only Changes (No Code Required)

### Copy Updates
1. **Hero Section**: Main headline, subheadline, CTA text
2. **Feature Names**: "Match", "Compare", "Plan"
3. **Benefit Titles**: AI Matching, Financial Insights, etc.
4. **Problem/Solution**: Pain points and resolutions
5. **FAQ Answers**: Complete answers
6. **Trust Statements**: Statistics and metrics

### Color Customization
Each section has gradient colors you can modify:

```tsx
// Pattern: "from-[color]-500 to-[color]-500"
color: "from-blue-500 to-cyan-500"     // ← Change colors here

// Available colors:
// blue, cyan, green, emerald, purple, pink, orange, red, amber, yellow
```

---

## 🔗 Navigation Links

File: `HeroSection.tsx`, `ProductDemoSection.tsx`, `SecondaryCTASection.tsx`, `RiskReversalSection.tsx`

```tsx
// Update these internal routes to match your app
<Link to="/search">              // ← Your search page
<Link to="/sign-up">            // ← Your sign-up page
<Link to="/dashboard">          // ← Your dashboard
```

---

## 📊 ROI Calculator Customization

File: `ROICalculator.tsx` (Line ~10-15)

```tsx
const [tuitionCost, setTuitionCost] = useState(50000)      // ← Default tuition
const [academoraEstimate, setAcademoraEstimate] = useState(35000)  // ← Default estimate
const [scholarships, setScholarships] = useState(10000)    // ← Default scholarships

// Slider ranges (Line ~55-67)
min={20000}    // ← Minimum tuition
max={100000}   // ← Maximum tuition
step={5000}    // ← Step increment

min={0}        // ← Min scholarships
max={50000}    // ← Max scholarships
```

---

## 🎬 Animation Speed Adjustments

Every animation has a `duration` property you can adjust:

```tsx
transition={{ duration: 0.5 }}  // ← 0.5 seconds
// Increase for slower, decrease for faster
// Typical range: 0.3 (fast) to 1.0 (slow)
```

---

## 📱 Responsive Breakpoints

The site uses Tailwind breakpoints:

```tsx
// Mobile first, then tablet and desktop
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
// 1 column on mobile
// 2 columns on tablet (md:)
// 3 columns on desktop (lg:)
```

---

## 🎨 Typography Customizations

### Heading Sizes
```tsx
// h1 (Hero main headline)
className="text-5xl md:text-7xl"     // 5xl mobile, 7xl desktop

// h2 (Section headlines)
className="text-4xl md:text-5xl"     // 4xl mobile, 5xl desktop

// h3 (Card titles)
className="text-2xl"

// p (Body text)
className="text-lg"                  // Large
className="text-base"                // Default
className="text-sm"                  // Small
```

---

## 🔑 Key Configuration Points

| Element | File | Line | What to Change |
|---------|------|------|---|
| Main Headline | HeroSection | 28 | "Find Your Dream University" |
| Subheadline | HeroSection | 39 | Problem statement |
| Trust Logos | HeroSection, SocialProof | 73, 110 | University names |
| Testimonials | SocialProof | 14-37 | Student names, quotes, roles |
| Statistics | SocialProof | 38-43 | Numbers and labels |
| Benefits | Benefits | 15-54 | 6 benefit titles and descriptions |
| Problems/Solutions | ProblemSolution | 9-31 | 5 each |
| Demo Steps | ProductDemo | 9-37 | 4 step titles and descriptions |
| Calculator Defaults | ROICalculator | 10-15 | Default financial amounts |
| FAQ | FAQ | 7-75 | All 16 Q&As |
| Guarantees | RiskReversal | 7-41 | 4 guarantee descriptions |
| Footer Links | Footer | 28-100 | All navigation links |

---

## ✅ Customization Checklist

- [ ] Update hero headline and subheadline
- [ ] Replace placeholder company logos
- [ ] Add real testimonials (3+)
- [ ] Update statistics with your numbers
- [ ] Modify benefit descriptions
- [ ] Update problem/solution list
- [ ] Customize demo steps
- [ ] Adjust calculator defaults
- [ ] Complete FAQ with your answers
- [ ] Update guarantee promises
- [ ] Fix all navigation links (to /search, /sign-up, etc.)
- [ ] Update footer contact information
- [ ] Change trust badges/certifications
- [ ] Update colors to match brand
- [ ] Test on mobile and desktop
- [ ] Connect to analytics
- [ ] Deploy and monitor conversions

---

## 🚀 Performance Tips

1. **Keep images small**: Use gradients instead when possible
2. **Limit animations**: Too many can slow page down
3. **Optimize fonts**: Use system fonts or cached Google Fonts
4. **Lazy load**: Sections already use `whileInView` for this
5. **Monitor bundle size**: Each section is a separate component

---

## 🧪 Testing Recommendations

### Desktop Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Testing
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] Tablet orientation (portrait & landscape)
- [ ] Slow network conditions

### Functionality Testing
- [ ] All CTA buttons work
- [ ] Calculator calculations are correct
- [ ] FAQ accordion opens/closes
- [ ] Links navigate correctly
- [ ] Animations run smoothly
- [ ] No console errors

---

## 📊 Analytics Events to Track

Consider tracking these with your analytics platform:

```tsx
// Track section views
trackEvent('landing', 'hero_viewed')
trackEvent('landing', 'benefits_viewed')
trackEvent('landing', 'calculator_viewed')

// Track interactions
trackEvent('landing', 'cta_primary_clicked')
trackEvent('landing', 'cta_secondary_clicked')
trackEvent('landing', 'calculator_used')
trackEvent('landing', 'faq_question_opened')

// Track conversions
trackEvent('landing', 'signup_started')
trackEvent('landing', 'demo_requested')
trackEvent('landing', 'email_submitted')
```

---

**Save this guide for future reference when making updates!** 📝
