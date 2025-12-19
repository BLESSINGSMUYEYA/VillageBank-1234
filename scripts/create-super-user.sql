-- Create Super User for Village Banking App
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
  'admin-001',
  'admin@villagebanking.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- bcrypt hash for 'admin123'
  'Super',
  'Admin',
  '+260123456789',
  'SUPER_ADMIN',
  'CENTRAL',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
