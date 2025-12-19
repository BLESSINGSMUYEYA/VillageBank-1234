import { prisma } from '../lib/prisma'

async function createSuperAdmin() {
  try {
    // Create super admin user in database
    const superAdmin = await prisma.user.upsert({
      where: { email: 'admin@villagebanking.com' },
      update: {
        role: 'SUPER_ADMIN',
        region: 'CENTRAL',
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        id: 'super-admin-001',
        email: 'admin@villagebanking.com',
        firstName: 'Super',
        lastName: 'Admin',
        phoneNumber: '+260123456789',
        role: 'SUPER_ADMIN',
        region: 'CENTRAL',
        isActive: true,
      },
    })

    console.log('Super admin user created/updated in database:')
    console.log('Email:', superAdmin.email)
    console.log('Role:', superAdmin.role)
    console.log('Name:', `${superAdmin.firstName} ${superAdmin.lastName}`)

    console.log('\nNext steps:')
    console.log('1. Sign up at http://localhost:3001/register with email: admin@villagebanking.com')
    console.log('2. After signing up, the webhook will sync the user and assign SUPER_ADMIN role')
    console.log('3. Configure webhook in Clerk dashboard to point to: http://localhost:3001/api/clerk/webhook')

  } catch (error) {
    console.error('Error creating super admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin()
