import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { env } from "../config/env";
import { getDatabase } from "../db/connection";

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

function toPublicUser(user: UserRow): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

function createToken(user: UserRow) {
  return jwt.sign(
    {
      email: user.email,
      role: user.role
    },
    env.jwtSecret,
    {
      subject: user.id,
      expiresIn: "7d"
    }
  );
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  const db = getDatabase();
  const email = input.email.trim().toLowerCase();
  const existing = db.prepare("select id from users where email = ?").get(email);

  if (existing) {
    throw new Error("Este email ja esta cadastrado.");
  }

  const count = db.prepare("select count(*) as total from users").get() as { total: number };
  const user: UserRow = {
    id: uuid(),
    name: input.name.trim(),
    email,
    password_hash: await bcrypt.hash(input.password, 12),
    role: count.total === 0 ? "admin" : "user"
  };

  db.prepare(
    "insert into users (id, name, email, password_hash, role) values (?, ?, ?, ?, ?)"
  ).run(user.id, user.name, user.email, user.password_hash, user.role);

  return {
    user: toPublicUser(user),
    token: createToken(user)
  };
}

export async function loginUser(input: { email: string; password: string }) {
  const db = getDatabase();
  const user = db
    .prepare("select * from users where email = ?")
    .get(input.email.trim().toLowerCase()) as UserRow | undefined;

  if (!user || !(await bcrypt.compare(input.password, user.password_hash))) {
    throw new Error("Email ou senha invalidos.");
  }

  return {
    user: toPublicUser(user),
    token: createToken(user)
  };
}

export function getUserById(userId: string) {
  const user = getDatabase().prepare("select * from users where id = ?").get(userId) as
    | UserRow
    | undefined;

  return user ? toPublicUser(user) : null;
}

