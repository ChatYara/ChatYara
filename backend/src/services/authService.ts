import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { env } from "../config/env";
import { getDatabase } from "../db/connection";

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  role: string;
  created_at?: string;
  updated_at?: string;
  reset_password_token_hash?: string | null;
  reset_password_expires_at?: string | null;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
};

function toPublicUser(user: UserRow): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function registerUser(input: { name: string; email: string; phone: string; password: string }) {
  const db = getDatabase();
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  const existing = db
    .prepare("select id from users where email = ? or phone = ?")
    .get(email, phone);

  if (existing) {
    throw new Error("Email ou telefone ja cadastrado.");
  }

  const count = db.prepare("select count(*) as total from users").get() as { total: number };
  const user: UserRow = {
    id: uuid(),
    name: input.name.trim(),
    email,
    phone,
    password_hash: await bcrypt.hash(input.password, 12),
    role: count.total === 0 ? "admin" : "user"
  };

  db.prepare(
    "insert into users (id, name, email, phone, password_hash, role) values (?, ?, ?, ?, ?, ?)"
  ).run(user.id, user.name, user.email, user.phone, user.password_hash, user.role);

  return {
    user: toPublicUser(user),
    token: createToken(user)
  };
}

export async function loginUser(input: { identifier: string; password: string }) {
  const db = getDatabase();
  const identifier = input.identifier.trim().toLowerCase();
  const phone = normalizePhone(identifier);
  const user = db
    .prepare("select * from users where email = ? or phone = ?")
    .get(identifier, phone) as UserRow | undefined;

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

export async function requestPasswordReset(input: { identifier: string }) {
  const db = getDatabase();
  const identifier = input.identifier.trim().toLowerCase();
  const phone = normalizePhone(identifier);
  const user = db
    .prepare("select * from users where email = ? or phone = ?")
    .get(identifier, phone) as UserRow | undefined;

  if (user) {
    const resetToken = crypto.randomBytes(24).toString("hex");
    const tokenHash = hashResetToken(resetToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();

    db.prepare(
      `update users
       set reset_password_token_hash = ?,
           reset_password_expires_at = ?,
           updated_at = current_timestamp
       where id = ?`
    ).run(tokenHash, expiresAt, user.id);
  }

  return {
    message: "Se os dados informados estiverem cadastrados, enviaremos instrucoes de recuperacao em breve."
  };
}

export async function resetPassword(input: {
  identifier: string;
  token: string;
  password: string;
}) {
  const db = getDatabase();
  const identifier = input.identifier.trim().toLowerCase();
  const phone = normalizePhone(identifier);
  const tokenHash = hashResetToken(input.token.trim());
  const user = db
    .prepare(
      `select * from users
       where (email = ? or phone = ?)
         and reset_password_token_hash = ?
         and reset_password_expires_at > ?`
    )
    .get(identifier, phone, tokenHash, new Date().toISOString()) as UserRow | undefined;

  if (!user) {
    throw new Error("Codigo de recuperacao invalido ou expirado.");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  db.prepare(
    `update users
     set password_hash = ?,
         reset_password_token_hash = null,
         reset_password_expires_at = null,
         updated_at = current_timestamp
     where id = ?`
  ).run(passwordHash, user.id);

  return {
    message: "Senha atualizada com sucesso. Voce ja pode entrar na YARA AI."
  };
}
