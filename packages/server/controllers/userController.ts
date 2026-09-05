import * as db from '../db';
import User from '../models/User';

import { hashPassword } from '../utils/authUtils';

export async function createUser(userData: { username: unknown; password: unknown }) {
  if (typeof userData.username !== 'string' || typeof userData.password !== 'string') {
    throw new Error('username and password must be strings');
  }
  const username = userData.username.trim().toLowerCase();
  const password = userData.password;
  if (username.length < 3) throw new Error('username must be at least 3 characters');
  // bcrypt caps at 72 bytes — longer input would be silently truncated.
  if (password.length < 8) throw new Error('password must be at least 8 characters');
  if (Buffer.byteLength(password) > 72) throw new Error('password must be at most 72 bytes');
  const hashedPassword = await hashPassword(password);
  // Whitelist: id/email from the request body are ignored (id:0 = admin row).
  return db.createUser({ username, password: hashedPassword });
}

export async function deleteUser(userId: number) {
  return db.deleteUser(userId);
}

export async function getUsersList() {
  return db.getUsers();
}
