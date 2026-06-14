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

function normalizePhone(phone?: string | null) {
  if (!phone) {
    return "";
  }

  return phone.replace(/\D/g, "");
}

function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function registerUser(input: { name: string; email: string; phone?: string; password: string }) {
  const db = getDatabase();
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  const existing = phone
    ? db.prepare("select id from users where email = ? or phone = ?").get(email, phone)
    : db.prepare("select id from users where email = ?").get(email);

  if (existing) {
    throw new Error(phone ? "E-mail ou telefone já cadastrado." : "E-mail já cadastrado.");
  }

  const count = db.prepare("select count(*) as total from users").get() as { total: number };
  const user: UserRow = {
    id: uuid(),
    name: input.name.trim(),
    email,
    phone: phone || null,
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
    throw new Error("E-mail ou senha inválidos.");
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

export function updateUserProfile(
  userId: string,
  input: { name?: string; email?: string; phone?: string | null }
) {
  const db = getDatabase();
  const current = db.prepare("select * from users where id = ?").get(userId) as UserRow | undefined;

  if (!current) {
    throw new Error("Usuário não encontrado.");
  }

  const name = input.name?.trim() || current.name;
  const email = input.email ? normalizeEmail(input.email) : current.email;
  const phone = input.phone === null ? "" : normalizePhone(input.phone ?? current.phone);

  const existingEmail = db
    .prepare("select id from users where email = ? and id <> ?")
    .get(email, userId);
  if (existingEmail) {
    throw new Error("E-mail já cadastrado em outra conta.");
  }

  if (phone) {
    const existingPhone = db
      .prepare("select id from users where phone = ? and id <> ?")
      .get(phone, userId);
    if (existingPhone) {
      throw new Error("Telefone já cadastrado em outra conta.");
    }
  }

  db.prepare(
    `update users
     set name = ?,
         email = ?,
         phone = ?,
         updated_at = current_timestamp
     where id = ?`
  ).run(name, email, phone || null, userId);

  const updated = db.prepare("select * from users where id = ?").get(userId) as UserRow;
  return toPublicUser(updated);
}

export async function changeUserPassword(
  userId: string,
  input: { currentPassword: string; newPassword: string }
) {
  const db = getDatabase();
  const user = db.prepare("select * from users where id = ?").get(userId) as UserRow | undefined;

  if (!user) {
    throw new Error("Usuário não encontrado.");
  }

  if (!(await bcrypt.compare(input.currentPassword, user.password_hash))) {
    throw new Error("Senha atual inválida.");
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 12);
  db.prepare(
    `update users
     set password_hash = ?,
         updated_at = current_timestamp
     where id = ?`
  ).run(passwordHash, userId);

  return {
    message: "Senha atualizada com segurança."
  };
}

export async function requestPasswordReset(input: { identifier: string }) {
  const db = getDatabase();
  const identifier = input.identifier.trim().toLowerCase();
  const user = db
    .prepare("select * from users where email = ?")
    .get(identifier) as UserRow | undefined;

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
    message: "Se o e-mail informado estiver cadastrado, enviaremos instruções de recuperação em breve."
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
    throw new Error("Código de recuperação inválido ou expirado.");
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
    message: "Senha atualizada com sucesso. Você já pode entrar na YARA AI."
  };
}
