import Database from 'better-sqlite3';
import User from '../models/User';
import config from '../config';

const db = new Database(config.dbPath, {
  fileMustExist: true,
})

export function getUsers() {
  const statement = db.prepare('SELECT id, username FROM users');
  const users = statement.all();
  return users;
}


export async function getUserById(id: number): Promise<User> {
  const statement = db.prepare<number>('SELECT * FROM users WHERE id = ?');
  const user = await statement.get(id) as User;

  return user;
}

export async function getUserByUsername(username: string):  Promise<User> {
  const statement = db.prepare<string>('SELECT * FROM users WHERE username = ?');
  const user = await statement.get(username) as User;

  return user;
}

export function updateUser(user: User): void {
  const statement = db.prepare('UPDATE users SET username = ?, password = ?, email = ? WHERE id = ?');
  statement.run(user.username, user.password, user.email, user.id);
}

export function createUser(user: User): void {
  const statement = db.prepare('INSERT INTO users (username, password, email, id) VALUES (?, ?, ?, ?)');
  statement.run(user.username, user.password, user.email, user.id);
}

export function deleteUser(id: number) {
  const statement = db.prepare('DELETE FROM users WHERE id = ?');
  statement.run(id);
}

/**
 * Retrieves a user ID by session token.
 * @param  sessionToken - The session token.
 * @returns The user ID if found, null otherwise.
 */
export async function getUserIdBySessionToken(sessionToken: string): Promise<number> {
  const sql = db.prepare<string>(`SELECT userId FROM sessions WHERE token = ?`);
  const result = await sql.get(sessionToken) as {userId: number};
  return result?.userId;
}

/**
 * Saves a session token for a user.
 * @param  userId - The user ID.
 * @param sessionToken - The session token to save.
 */
export async function saveSessionToken(userId: number, sessionToken: string): Promise<void> {
  const sql = db.prepare(`INSERT INTO sessions (userId, token) VALUES (?, ?)`);
  await sql.run(userId, sessionToken);
}