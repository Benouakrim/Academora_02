# Academora Database Seeding System

This folder contains a modular seeding system that allows you to seed your database either all at once or selectively by individual tables.

## Structure

```
seeds/
├── seedRunner.ts           # Core seed execution engine
├── index.ts                # Exports all seed functions
├── users.seed.ts           # User seeding
├── financialProfiles.seed.ts
├── taxonomies.seed.ts      # Categories and Tags
├── universities.seed.ts    # University data
├── universityGroups.seed.ts
├── microContent.seed.ts
├── articles.seed.ts        # Blog articles (10 detailed articles)
├── universityClaims.seed.ts
├── referrals.seed.ts
├── badges.seed.ts
├── reviews.seed.ts
└── savedUniversities.seed.ts
```

## Usage

### Seed All Tables

Run all seeds in dependency order:

```bash
npm run db:seed
```

### Seed Specific Tables

Run only selected seeds (dependencies are automatically included):

```bash
npm run db:seed:select users taxonomies
npm run db:seed:select articles
npm run db:seed:select universities reviews
```

### Available Seeds

- `users` - Creates admin and test users
- `financialProfiles` - Financial profiles for users
- `taxonomies` - Categories and tags for content
- `universities` - University data (MIT, Stanford, Oxford, Harvard, UC Berkeley)
- `universityGroups` - University groups (e.g., Ivy League)
- `microContent` - Quick tips and micro-content for universities
- `articles` - 10 comprehensive blog articles
- `universityClaims` - University verification claims
- `referrals` - User referral data
- `badges` - Achievement badges
- `reviews` - University reviews
- `savedUniversities` - Saved universities for users

## How It Works

### Seed Runner

The `SeedRunner` class:
- Manages seed execution order based on dependencies
- Ensures dependencies run before dependent seeds
- Shares data between seeds
- Handles database cleanup
- Provides execution summary

### Creating a New Seed

1. Create a new file: `seedName.seed.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import { SeedFunction } from './seedRunner'

export const myTableSeed: SeedFunction = {
  name: 'myTable',
  dependencies: ['users'], // Optional: list required seeds
  seed: async (prisma: PrismaClient, data: any) => {
    // Access dependency data
    const { adminUser } = data.users
    
    // Create your data
    const result = await prisma.myTable.create({
      data: {
        userId: adminUser.id,
        // ... other fields
      }
    })
    
    // Return data for dependent seeds
    return result
  }
}
```

2. Export it in `index.ts`:

```typescript
export { myTableSeed } from './myTable.seed'
```

3. Register it in `seed.ts`:

```typescript
import { myTableSeed } from './seeds'
// ...
runner.register(myTableSeed)
```

## Dependencies

Seeds automatically handle dependencies. For example:
- `articles` depends on `users` and `taxonomies`
- `reviews` depends on `universities` and `users`
- `badges` depends on `users`

When you run `--seed articles`, the system automatically runs `users` and `taxonomies` first.

## Articles Seed

The articles seed includes 10 comprehensive, well-written articles covering:

1. Complete Guide to University Admissions
2. Financial Aid and Scholarships Guide
3. International Student Visa Guide (F-1, OPT, CPT)
4. Choosing the Right Engineering Major
5. Ivy League Application Secrets
6. College Campus Life - Freshman Year
7. Landing Competitive Internships
8. Study Abroad Programs Complete Guide
9. 10 Evidence-Based Study Techniques
10. Business School and MBA Application Guide

Each article includes:
- SEO-optimized title and meta descriptions
- Rich, detailed content with proper formatting
- Relevant categories and tags
- View counts and publication dates
- Featured images

## Tips

- Always run seeds in a development environment first
- The seed runner cleans the database before seeding
- Use selective seeding during development to save time
- Dependency order is handled automatically
- View the summary after seeding to verify data counts
