# Prisma 7 Migration Guide

**Version:** 1.0  
**Last Updated:** December 11, 2025  
**Status:** ✅ Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Migration Checklist](#pre-migration-checklist)
3. [Migration Process](#migration-process)
4. [Schema Updates](#schema-updates)
5. [Testing & Verification](#testing--verification)
6. [Common Issues](#common-issues)
7. [Rollback Procedure](#rollback-procedure)

---

## Overview

This guide covers upgrading the Academora_02 project to Prisma 7, including:
- Schema validation and updates
- Type safety enhancements
- Performance optimizations
- Database compatibility checks

### Key Prisma 7 Features

✅ **Enhanced Type Safety** - Improved TypeScript integration  
✅ **Performance Improvements** - Faster query execution and type generation  
✅ **Better Error Messages** - More descriptive database error reporting  
✅ **Extended Schema Features** - New field types and validation options  
✅ **Improved Migrations** - More reliable migration execution

---

## Pre-Migration Checklist

### 1. Backup Database
```bash
# Create a database backup before starting
# For PostgreSQL via Neon:
pg_dump $DATABASE_URL > academora_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Review Current Version
```bash
npm list prisma
# Should show current version (6.x or earlier)
```

### 3. Audit Dependencies
```bash
npm list @prisma/client
npm list prisma-json-schema-generator  # If using
```

### 4. Document Current State
- List all current Prisma migrations:
  ```bash
  prisma migrate show
  ```
- Export schema as JSON:
  ```bash
  prisma db pull
  ```

### 5. Create Feature Branch
```bash
git checkout -b feature/prisma-7-upgrade
```

### 6. Verify Current Tests Pass
```bash
npm test
# All tests must pass before migration
```

---

## Migration Process

### Step 1: Update package.json

```bash
npm install prisma@7 @prisma/client@7
```

### Step 2: Update Prisma Version in package.json

Check that these versions are updated:
```json
{
  "devDependencies": {
    "prisma": "^7.0.0"
  },
  "dependencies": {
    "@prisma/client": "^7.0.0"
  }
}
```

### Step 3: Clear Generated Files

```bash
# Remove Prisma generated artifacts
rm -rf node_modules/.prisma
rm -rf .prisma

# Regenerate
npx prisma generate
```

### Step 4: Review Schema for Breaking Changes

```bash
# Check current schema
npx prisma db pull

# Compare with existing schema.prisma
# Look for any deprecations or changes needed
```

### Step 5: Update Generator Configuration

In `prisma/schema.prisma`, ensure generator is correct:

```prisma
generator client {
  provider = "prisma-client-js"
  // Prisma 7 specific configurations
  output   = "../node_modules/.prisma/client"
  binaryTargets = ["native"]
}
```

### Step 6: Validate Schema

```bash
# Check schema for syntax errors
npx prisma validate

# Check for migration conflicts
npx prisma migrate status
```

### Step 7: Handle Pending Migrations

If there are pending migrations:

```bash
# Apply all pending migrations
npx prisma migrate deploy

# Or for development:
npx prisma migrate dev
```

### Step 8: Regenerate Prisma Client

```bash
# This must be run after upgrade
npx prisma generate

# Verify client was generated
ls -la node_modules/.prisma/client/
```

---

## Schema Updates

### Common Schema Changes for Prisma 7

#### 1. Update Database Connection (if needed)

No changes required for PostgreSQL connections, but verify:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 2. Check Field Types

Prisma 7 supports additional native types. Review for opportunities to use:
- `BigInt` instead of `Int` for large numbers
- `Bytes` for binary data
- `Decimal` for precise financial calculations

#### 3. Update Relations

Ensure all relations follow Prisma 7 conventions:

```prisma
model User {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  profile   Profile?
  
  @@map("users")
}

model Profile {
  id     Int  @id @default(autoincrement())
  userId Int  @unique
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("profiles")
}
```

#### 4. Add Missing Indexes

Review for performance-critical queries and add indexes:

```prisma
model University {
  id        Int     @id @default(autoincrement())
  name      String
  slug      String  @unique
  
  @@index([name])
  @@index([slug])
}
```

---

## Testing & Verification

### Unit Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

### Database Integrity Tests

```typescript
// tests/database.test.ts
import { PrismaClient } from '@prisma/client';

describe('Database Connection', () => {
  const prisma = new PrismaClient();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should connect to database', async () => {
    const result = await prisma.$queryRaw`SELECT 1`;
    expect(result).toBeDefined();
  });

  it('should create and retrieve records', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com' },
    });
    expect(user.id).toBeDefined();
    await prisma.user.delete({ where: { id: user.id } });
  });
});
```

### Schema Validation Tests

```typescript
// tests/schema.test.ts
import { PrismaClient } from '@prisma/client';

describe('Prisma Schema', () => {
  const prisma = new PrismaClient();

  it('should have all expected models', () => {
    const models = ['User', 'University', 'UniversityBlock', 'Article'];
    models.forEach(model => {
      expect(prisma[model.toLowerCase()]).toBeDefined();
    });
  });

  it('should validate required fields', async () => {
    await expect(
      prisma.user.create({
        data: { email: null } as any,
      })
    ).rejects.toThrow();
  });
});
```

### Migration Validation

```bash
# Verify migration history is intact
npx prisma migrate status

# Test migration reset (on development database only!)
npx prisma migrate reset --skip-seed

# Verify seed data loaded correctly
npm run db:seed
```

### Performance Testing

```typescript
// tests/performance.test.ts
import { performance } from 'perf_hooks';
import { PrismaClient } from '@prisma/client';

describe('Query Performance', () => {
  const prisma = new PrismaClient();

  it('should execute queries efficiently', async () => {
    const start = performance.now();
    
    await prisma.university.findMany({
      include: {
        blocks: true,
        claims: true,
      },
    });
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1000); // Should complete in < 1 second
  });
});
```

---

## Common Issues

### Issue 1: Type Generation Errors

**Symptoms:** `Type 'X' does not have property 'Y'`

**Solution:**
```bash
# Clear and regenerate
rm -rf node_modules/.prisma
npx prisma generate
npm install
```

### Issue 2: Migration Conflicts

**Symptoms:** `The following migrations have not been applied`

**Solution:**
```bash
# If safe (development only):
npx prisma migrate reset

# Otherwise, manually resolve:
npx prisma migrate resolve --rolled-back <migration-name>
```

### Issue 3: Database Connection Timeouts

**Symptoms:** `Client request timed out`

**Solution:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add connection pool settings
  extensions = ["uuid-ossp"]
}
```

### Issue 4: Relation Errors

**Symptoms:** `Foreign key constraint failed`

**Solution:**
- Verify `@relation` directives match actual foreign keys
- Check cascade delete settings
- Ensure relation names are unique

```prisma
// Correct syntax:
model Article {
  id        Int    @id @default(autoincrement())
  universityId Int
  university University @relation(fields: [universityId], references: [id], onDelete: Cascade)
}
```

### Issue 5: Generated Client Import Errors

**Symptoms:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
# Ensure client is generated
npx prisma generate

# Verify generation output
ls -la node_modules/@prisma/client/

# If still broken:
rm -rf node_modules
npm install
npx prisma generate
```

---

## Rollback Procedure

### If Migration Fails in Production

```bash
# 1. Stop application servers
# 2. Verify backup exists
ls -la academora_backup_*.sql

# 3. Restore database from backup
psql $DATABASE_URL < academora_backup_YYYYMMDD_HHMMSS.sql

# 4. Revert package.json to previous Prisma version
npm install prisma@6 @prisma/client@6

# 5. Regenerate client with old version
npx prisma generate

# 6. Restart application
npm start
```

### If Schema Changes Broke Compatibility

```bash
# 1. Identify problematic schema changes
git diff prisma/schema.prisma

# 2. Revert to previous schema
git checkout HEAD~1 prisma/schema.prisma

# 3. Create new migration to address issue
npx prisma migrate dev --name fix_compatibility_issue

# 4. Test thoroughly before production deployment
npm test
npm run test:integration
```

### If Type Errors Block Deployment

```bash
# 1. Check TypeScript compilation
npx tsc --noEmit

# 2. Fix type issues in code:
# - Update imports from '@prisma/client'
# - Verify model names match schema
# - Check for deprecated Prisma features

# 3. Regenerate types
npx prisma generate

# 4. Re-run type checking
npx tsc --noEmit
```

---

## Post-Migration Checklist

- ✅ All tests passing
- ✅ Database schema validated
- ✅ Type generation successful
- ✅ Migrations applied cleanly
- ✅ Performance benchmarks acceptable
- ✅ No deprecated features in use
- ✅ Error handling updated for new error types
- ✅ Documentation updated
- ✅ Team trained on new features
- ✅ Production deployment planned

---

## Monitoring After Upgrade

### Key Metrics to Track

1. **Query Performance**
   ```typescript
   // Log slow queries
   const prisma = new PrismaClient({
     log: [
       { emit: 'event', level: 'query' },
       { emit: 'stdout', level: 'error' },
     ],
   });

   prisma.$on('query', (e) => {
     if (e.duration > 1000) {
       console.log(`Slow query (${e.duration}ms): ${e.query}`);
     }
   });
   ```

2. **Connection Pool Usage**
   - Monitor active connections
   - Check for connection leaks
   - Verify pool size is appropriate

3. **Migration Duration**
   - Log time taken for data migrations
   - Alert if any migration exceeds expected time

4. **Error Rates**
   - Track database errors
   - Monitor constraint violations
   - Watch for type mismatches

---

## Resources

- [Prisma 7 Release Notes](https://www.prisma.io/docs/about/releases/prisma-7)
- [Prisma Migration Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Schema Documentation](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [PostgreSQL with Prisma](https://www.prisma.io/docs/concepts/database-connectors/postgresql)

---

## Support & Troubleshooting

### Getting Help

1. Check Prisma documentation at https://www.prisma.io/docs/
2. Review Prisma GitHub issues: https://github.com/prisma/prisma/issues
3. Post questions on Prisma Forum: https://github.com/prisma/prisma/discussions

### Reporting Issues

If you encounter issues:
1. Document the exact error message
2. Provide schema.prisma file
3. Include Prisma version and database info
4. Create minimal reproduction case

---

## Conclusion

Prisma 7 provides significant improvements in type safety, performance, and developer experience. Follow this guide carefully for a smooth migration. Test thoroughly at each step and maintain backups throughout the process.

For questions or issues, refer to the troubleshooting section or consult the Prisma documentation.

---

**Last Updated:** December 11, 2025  
**Maintained By:** Academora Development Team  
**Status:** ✅ Active & Verified
