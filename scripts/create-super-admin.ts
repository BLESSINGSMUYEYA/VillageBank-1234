import { prisma } from '../lib/prisma'

async function createSuperAdmin() {
  try {
    // Create super admin user in database
    const superAdmin = await prisma.user.upsert({
      where: { email: 'admin@villagebanking.com' },
      update: {
        role: 'SUPER_ADMIN',
        region: 'CENTRAL',
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
      },
    })

    console.log('Super admin user created/updated in database:')
    console.log('Email:', superAdmin.email)
    console.log('Role:', superAdmin.role)
    console.log('Name:', `${superAdmin.firstName} ${superAdmin.lastName}`)

    console.log('\nNext steps:')
    console.log('1. User is already created in the Database directly.')
    console.log('2. You can login with email: admin@villagebanking.com')

  } catch (error) {
    console.error('Error creating super admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin()
