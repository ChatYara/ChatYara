import { getDatabase } from "./connection";

export function runMigrations() {
  const db = getDatabase();

  db.exec(`
    create table if not exists users (
      id text primary key,
      name text not null,
      email text not null unique,
      phone text,
      password_hash text not null,
      role text not null default 'user',
      created_at text not null default current_timestamp,
      updated_at text not null default current_timestamp,
      reset_password_token_hash text,
      reset_password_expires_at text
    );

    create table if not exists conversations (
      id text primary key,
      user_id text not null,
      title text not null,
      created_at text not null default current_timestamp,
      updated_at text not null default current_timestamp,
      foreign key (user_id) references users(id) on delete cascade
    );

    create table if not exists messages (
      id text primary key,
      conversation_id text not null,
      role text not null check (role in ('user', 'assistant', 'system')),
      content text not null,
      created_at text not null default current_timestamp,
      foreign key (conversation_id) references conversations(id) on delete cascade
    );

    create table if not exists favorites (
      id text primary key,
      user_id text not null,
      message_id text not null,
      created_at text not null default current_timestamp,
      unique (user_id, message_id),
      foreign key (user_id) references users(id) on delete cascade,
      foreign key (message_id) references messages(id) on delete cascade
    );

    create table if not exists memories (
      id text primary key,
      user_id text not null,
      title text not null,
      content text not null,
      created_at text not null default current_timestamp,
      updated_at text not null default current_timestamp,
      foreign key (user_id) references users(id) on delete cascade
    );

    create table if not exists projects (
      id text primary key,
      user_id text not null,
      name text not null,
      type text not null,
      prompt text not null,
      output text not null,
      created_at text not null default current_timestamp,
      foreign key (user_id) references users(id) on delete cascade
    );
  `);

  ensureColumn("users", "phone", "text");
  ensureColumn("users", "updated_at", "text");
  ensureColumn("users", "reset_password_token_hash", "text");
  ensureColumn("users", "reset_password_expires_at", "text");
  db.exec(`
    update users set updated_at = current_timestamp where updated_at is null;

    create unique index if not exists users_phone_unique
      on users(phone)
      where phone is not null and phone <> '';
  `);
}

function ensureColumn(table: string, column: string, definition: string) {
  const db = getDatabase();
  const columns = db.prepare(`pragma table_info(${table})`).all() as Array<{ name: string }>;

  if (!columns.some((item) => item.name === column)) {
    db.exec(`alter table ${table} add column ${column} ${definition}`);
  }
}
