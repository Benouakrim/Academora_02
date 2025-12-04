# 🔧 Extending the Seeding System

## How to Add a New Seed

### Step 1: Create the Seed File

Create a new file in `/server/prisma/seeds/` named `tableName.seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import { SeedFunction } from './seedRunner'

export const myNewSeed: SeedFunction = {
  name: 'myNewTable',
  // Optional: dependencies array
  dependencies: ['users', 'universities'],
  seed: async (prisma: PrismaClient, data: any) => {
    // Access data from dependencies
    const { users } = data
    
    // Create your data
    const result = await prisma.myTable.createMany({
      data: [
        { field: 'value', userId: users[0].id },
        { field: 'value2', userId: users[1].id },
      ]
    })
    
    // Return data for dependent seeds to use
    return result
  }
}
```

### Step 2: Export in index.ts

Add to `/server/prisma/seeds/index.ts`:

```typescript
export { myNewSeed } from './myNewTable.seed'
```

### Step 3: Register in seed.ts

Add to `/server/prisma/seed.ts`:

```typescript
import { myNewSeed } from './seeds'

// Inside main():
runner.register(myNewSeed)
```

That's it! Your new seed is ready to use.

## Example: Adding More Articles

### Extend the Articles Seed

Edit `/server/prisma/seeds/articles.seed.ts` and add to the articles array:

```typescript
{
  slug: "my-new-article",
  title: "My New Article Title",
  excerpt: "Brief description of the article...",
  content: `Full article content here...
  
  ## Section 1
  Content...
  
  ## Section 2
  More content...`,
  featuredImage: "https://images.unsplash.com/...",
  status: ArticleStatus.PUBLISHED,
  publishedAt: new Date("2024-06-20"),
  viewCount: 0,
  metaTitle: "Article Title - Academora",
  metaDescription: "Article description for SEO.",
  authorId: adminUser.id,
  categoryId: admissionsCategory?.id,
  tags: {
    connect: [
      { id: scholarshipsTag.id },
      { id: ivyLeagueTag.id }
    ]
  }
}
```

Then run:
```bash
npm run db:seed:select articles
```

## Example: Adding New Universities

Edit `/server/prisma/seeds/universities.seed.ts`:

```typescript
{
  name: "Princeton University",
  slug: "princeton",
  shortName: "Princeton",
  description: "...",
  city: "Princeton",
  state: "NJ",
  // ... other fields
}
```

Then seed:
```bash
npm run db:seed:select universities
```

## Handling Complex Dependencies

### Scenario: Seed A depends on B, which depends on C

1. Define dependencies in order:
```typescript
export const seedA: SeedFunction = {
  name: 'seedA',
  dependencies: ['seedB'],
  seed: async (prisma, data) => {
    // data.seedB will have results from seedB
    // data.seedC will also be available (from seedB's dependencies)
  }
}

export const seedB: SeedFunction = {
  name: 'seedB',
  dependencies: ['seedC'],
  seed: async (prisma, data) => {
    // data.seedC is available
  }
}
```

2. The runner automatically resolves this order: C → B → A

## Best Practices

### ✅ DO:
- Keep seeds focused on one entity/table
- Return data that dependent seeds might need
- Use meaningful seed names
- Add console.log for important milestones
- Test selective seeding often
- Document complex seeds with comments

### ❌ DON'T:
- Mix multiple entities in one seed
- Hardcode IDs instead of using references
- Forget to export in index.ts
- Create circular dependencies
- Make seeds interdependent without declaring it
- Forget to register in seed.ts

## Testing Your New Seed

```bash
# Test with dependencies
npm run db:seed:select myNewTable

# Test with all seeds
npm run db:seed

# View results in Prisma Studio
npm run db:studio
```

## Debugging

### Enable detailed logging

Modify `/server/prisma/seeds/seedRunner.ts`:

```typescript
private async runSeed(name: string): Promise<any> {
  console.log(`[DEBUG] Running seed: ${name}`)
  if (this.executedSeeds.has(name)) {
    console.log(`[DEBUG] Already executed: ${name}`)
    return this.seedData.get(name)
  }
  // ...
}
```

### Check seed data

```typescript
console.log('DEBUG: Users created:', data.users)
console.log('DEBUG: Admin ID:', data.users.adminUser.id)
```

## Performance Tips

### For Large Datasets

Use `createMany` instead of multiple `create`:

```typescript
// ❌ Slow
for (const item of items) {
  await prisma.table.create({ data: item })
}

// ✅ Fast
await prisma.table.createMany({ data: items })
```

### For Selective Seeding

Only seed what you need during development:

```bash
# Instead of:
npm run db:seed

# Do:
npm run db:seed:select articles
npm run db:seed:select universities
```

## Real-World Example: Adding More Universities

```typescript
// In universities.seed.ts, add to universities array:

{
  name: "Yale University",
  slug: "yale",
  shortName: "Yale",
  description: "Historic Ivy League institution in New Haven, Connecticut.",
  city: "New Haven",
  state: "CT",
  zipCode: "06520",
  country: "USA",
  address: "Yale Central",
  latitude: 41.3083,
  longitude: -72.9279,
  logoUrl: "https://upload.wikimedia.org/wikipedia/...",
  heroImageUrl: "https://images.unsplash.com/...",
  websiteUrl: "https://www.yale.edu",
  established: 1701,
  // ... other fields
}
```

Then run:
```bash
npm run db:seed:select universities
```

## Clearing and Reseeding

To reset your database and reseed:

```bash
# Option 1: Reset entire database (via Prisma)
npx prisma db push --force-reset

# Option 2: Just re-run seed (clears first)
npm run db:seed
```

---

**The seeding system is flexible and extensible. Add as many seeds as you need!**
