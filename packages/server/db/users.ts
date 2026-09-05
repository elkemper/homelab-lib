import Database from 'better-sqlite3';
import User from '../models/User';
import config from '../config';

// Lazy: importing this module (e.g. in unit tests or before startupChecks)
// must not throw when DB_PATH is unset or the file is absent.
let _db: Database.Database | null = null;
function conn(): Database.Database {
  if (!_db) {
    _db = new Database(config.dbPath, {
      fileMustExist: true,
    });
  }
  return _db;
}

export async function getUsers(): Promise<User[]> {
  const statement = conn().prepare('SELECT id, username FROM users');
  const users = (await statement.all()) as User[];

  return users;
}

export async function getUserById(id: number): Promise<User> {
  const statement = conn().prepare<number>('SELECT * FROM users WHERE id = ?');
  const user = (await statement.get(id)) as User;

  return user;
}

export async function getUserByUsername(username: string): Promise<User> {
  const statement = conn().prepare<string>('SELECT * FROM users WHERE username = ?');
  const user = (await statement.get(username)) as User;

  return user;
}

export function updateUser(user: User): void {
  const statement = conn().prepare('UPDATE users SET username = ?, password = ?, email = ? WHERE id = ?');
  statement.run(user.username, user.password, user.email, user.id);
}

export function createUser(user: User): number {
  // The ONLY caller-supplied id ever honored is 0 (admin bootstrap via
  // adminController). Everything else autoincrements — passing id:0 from
  // a request body can no longer hijack the admin row (userController
  // strips id before calling here).
  if (user.id === 0) {
    const adminStmt = conn().prepare('INSERT INTO users (id, username, password) VALUES (0, ?, ?)');
    adminStmt.run(user.username, user.password);
    return 0;
  }
  const statement = conn().prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  const info = statement.run(user.username, user.password);
  return Number(info.lastInsertRowid);
}

export function deleteUser(id: number) {
  const statement = conn().prepare('DELETE FROM users WHERE id = ?');
  statement.run(id);
}

/**
 * Retrieves a user ID by session token.
 * @param  sessionToken - The session token.
 * @returns The user ID if found, null otherwise.
 */
export async function getUserIdBySessionToken(sessionToken: string): Promise<number> {
  const sql = conn().prepare<string>(`SELECT * FROM sessions WHERE token = ?`);
  const currentTime = Math.floor(Date.now() / 1000);
  const result = (await sql.get(sessionToken)) as { userId: number };
  return result?.userId;
}

/**
 * Saves a session token for a user.
 * @param  userId - The user ID.
 * @param sessionToken - The session token to save.
 */
export async function saveSessionToken(userId: number, sessionToken: string, expiresAt: number): Promise<void> {
  const sql = conn().prepare(`INSERT INTO sessions (userId, token, expiresAt) VALUES (?, ?, ?)`);
  await sql.run(userId, sessionToken, expiresAt);
}

/**
 * Deletes a session token by its value.
 * @param  sessionToken - The session token to delete.
 */
export async function deleteSessionToken(sessionToken: string): Promise<void> {
  const sql = conn().prepare(`DELETE FROM sessions WHERE token = ?`);
  await sql.run(sessionToken);
}

/**
 * Deletes all session tokens.
 */
export async function deleteAllSessionTokens(): Promise<void> {
  const sql = conn().prepare(`DELETE FROM sessions`);
  await sql.run();
}

/**
 * Deletes expired session tokens.
 */
export async function deleteExpiredSessionTokens(): Promise<void> {
  const currentTime = Math.floor(Date.now() / 1000);
  const sql = conn().prepare(`DELETE FROM sessions WHERE expiresAt < ?`);
  await sql.run(currentTime);
}
