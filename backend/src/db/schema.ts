import { getDatabase } from "./connection";

export function runMigrations() {
  const db = getDatabase();

  db.exec(`
    create table if not exists users (
      id text primary key,
      name text not null,
      email text not null unique,
      password_hash text not null,
      role text not null default 'user',
      created_at text not null default current_timestamp
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
}

