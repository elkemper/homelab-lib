
import db from '../db';
import config from '../config';
import { hashPassword } from '../utils/authUtils';

export async function createOrUpdateAdmin(): Promise<void> {
  const adminUsername = config.adminUsername;
  const adminPassword = config.adminPassword;

  try {
    const admin = await db.getUserById(0);

    if (admin) {
      const hashedPassword = await hashPassword(adminPassword);
      return  db.updateUser({ id: 0, username: adminUsername, password: hashedPassword });
    } else {
      const hashedPassword = await hashPassword(adminPassword);
      return db.createUser({ id: 0, username: adminUsername, password: hashedPassword });
    }
  } catch (error) {
    console.error('Failed to create or update admin:', error);
  }
}