import { PrismaClient, UserRole } from '@prisma/client'
import { SeedFunction } from './seedRunner'

export const usersSeed: SeedFunction = {
  name: 'users',
  seed: async (prisma: PrismaClient) => {
    const adminUser = await prisma.user.create({
      data: {
        clerkId: "user_36OJAvCba1yfey1kJ1E23oZNd8O",
        email: "ay.perso2001@gmail.com",
        firstName: "Ayoub",
        lastName: "Benouakrim",
        role: UserRole.ADMIN,
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
        gpa: 4.0,
        satScore: 1600,
        actScore: 36,
        preferredMajor: "Computer Science",
        careerGoals: ["Software Engineer", "Entrepreneur"],
        hobbies: ["Coding", "Chess", "Reading"],
        languagesSpoken: ["English", "Spanish"],
        referralCode: "ADMIN2024",
      }
    })

    const student1 = await prisma.user.create({
      data: {
        clerkId: "user_36M1KsdIiCucGqk3LtzgyJ43wBc",
        email: "ay.tester2001@gmail.com",
        firstName: "Alex",
        lastName: "Johnson",
        role: UserRole.USER,
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        gpa: 3.8,
        satScore: 1450,
        actScore: 32,
        preferredMajor: "Engineering",
        dreamJobTitle: "Software Engineer",
        careerGoals: ["Build innovative products", "Lead tech teams"],
        preferredLearningStyle: "Hands-on",
        personalityType: "INTJ",
        hobbies: ["Robotics", "Gaming", "Hiking"],
        languagesSpoken: ["English"],
        referralCode: "STUDENT1",
      }
    })

    const student2 = await prisma.user.create({
      data: {
        clerkId: "user_student2_demo_id",
        email: "referrer@test.com",
        firstName: "Sarah",
        lastName: "Williams",
        role: UserRole.USER,
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        gpa: 3.9,
        satScore: 1500,
        actScore: 34,
        preferredMajor: "Business",
        dreamJobTitle: "Product Manager",
        careerGoals: ["Launch successful startups", "Mentor others"],
        preferredLearningStyle: "Visual",
        personalityType: "ENFP",
        hobbies: ["Networking", "Travel", "Photography"],
        languagesSpoken: ["English", "French"],
        referralCode: "SARAH2024",
      }
    })

    const stanfordStaff = await prisma.user.create({
      data: {
        clerkId: "user_stanford_staff_demo_id",
        email: "staff@stanford.edu",
        firstName: "Michael",
        lastName: "Chen",
        role: UserRole.USER,
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
        preferredMajor: "Education Administration",
        referralCode: "STAFF001",
      }
    })

    const mitStaff = await prisma.user.create({
      data: {
        clerkId: "user_mit_staff_demo_id",
        email: "admissions@mit.edu",
        firstName: "Emily",
        lastName: "Rodriguez",
        role: UserRole.USER,
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
        preferredMajor: "Higher Education",
        referralCode: "MIT001",
      }
    })

    return { adminUser, student1, student2, stanfordStaff, mitStaff }
  }
}
