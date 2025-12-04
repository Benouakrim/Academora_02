# Quick Reference: Database Seeding Commands

## Run All Seeds
```bash
npm run db:seed
```

## Run Specific Seeds
```bash
# Articles only (includes dependencies: users, taxonomies)
npm run db:seed:select articles

# Universities only
npm run db:seed:select universities

# Multiple seeds
npm run db:seed:select users universities articles

# Just taxonomies (categories and tags)
npm run db:seed:select taxonomies
```

## Seed Files Created

1. **users.seed.ts** - 5 users (admin, 2 students, 2 staff)
2. **financialProfiles.seed.ts** - Financial data
3. **taxonomies.seed.ts** - 6 categories, 10 tags
4. **universities.seed.ts** - 5 universities (MIT, Stanford, Oxford, Harvard, UC Berkeley)
5. **universityGroups.seed.ts** - University groups
6. **microContent.seed.ts** - Tips and micro-content
7. **articles.seed.ts** - **10 comprehensive articles**
8. **universityClaims.seed.ts** - Verification claims
9. **referrals.seed.ts** - Referral data
10. **badges.seed.ts** - 3 badges
11. **reviews.seed.ts** - University reviews
12. **savedUniversities.seed.ts** - Saved universities

## The 10 Articles Created

1. **Complete Guide to University Admissions in 2025** - Comprehensive admissions guide
2. **Financial Aid and Scholarships Guide** - FAFSA, scholarships, aid strategies
3. **International Student Visa Guide** - F-1, OPT, CPT explained
4. **Choosing the Right Engineering Major** - All engineering disciplines
5. **Ivy League Application Secrets** - What top schools really want
6. **College Campus Life - Freshman Year** - Dorm life, academics, social
7. **Landing Competitive Internships** - Complete internship guide
8. **Study Abroad Programs Guide** - International education options
9. **10 Evidence-Based Study Techniques** - Scientific learning methods
10. **Business School and MBA Guide** - MBA applications and GMAT

Each article is 2000-3000+ words with:
- SEO-optimized metadata
- Proper categories and tags
- Featured images
- Rich formatting
- View counts
- Publication dates

## System Features

✅ **Modular Architecture** - Each table has its own seed file
✅ **Automatic Dependencies** - Dependencies run automatically
✅ **Selective Seeding** - Run only what you need
✅ **Clean Database** - Automatically cleans before seeding
✅ **Data Sharing** - Seeds can share data with dependents
✅ **Summary Report** - See counts after seeding

## Example Workflow

```bash
# Development: Seed just what you're working on
npm run db:seed:select articles

# Testing: Seed everything
npm run db:seed

# Quick data check
npm run db:studio
```
