import db from "../db";
import User from "../models/User";

import { hashPassword } from "../utils/authUtils";

export async function createUser(userData: User) {

  const hashedPassword = await hashPassword(userData.password);
  const user: User  = {
    username: userData.username,
    password: hashedPassword
  };

  return  db.createUser(user);

}

export async function deleteUser(userId: number) {
  return db.deleteUser(userId);
}

export async function getUsersList() {
  return db.getUsers();
}