-- Create Super Admin User for Clerk Integration
-- Run this SQL directly in your PostgreSQL database

INSERT INTO users (
  id,
  email,
  passwordHash,
  firstName,
  lastName,
  phoneNumber,
  role,
  region,
  isActive,
  createdAt,
  updatedAt
) VALUES (
  'super-admin-001',
  'admin@villagebanking.com',
  '', -- Clerk handles authentication
  'Super',
  'Admin',
  '+260123456789',
  'SUPER_ADMIN',
  'CENTRAL',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'SUPER_ADMIN',
  region = 'CENTRAL',
  isActive = true,
  updatedAt = NOW();
