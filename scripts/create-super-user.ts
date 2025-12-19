import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { UserRole, Region } from '@prisma/client';

async function createSuperUser() {
  try {
    const superUserData = {
      email: 'admin@villagebanking.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      firstName: 'Super',
      lastName: 'Admin',
      phoneNumber: '+260123456789',
      role: UserRole.SUPER_ADMIN,
      region: Region.CENTRAL,
      isActive: true,
    };

    // Check if super user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: superUserData.email },
    });

    if (existingUser) {
      console.log('Super user already exists:', existingUser.email);
      return;
    }

    // Create super user
    const superUser = await prisma.user.create({
      data: superUserData,
    });

    console.log('Super user created successfully:');
    console.log('Email:', superUser.email);
    console.log('Password: admin123');
    console.log('Role:', superUser.role);
    console.log('Name:', `${superUser.firstName} ${superUser.lastName}`);

  } catch (error) {
    console.error('Error creating super user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperUser();
