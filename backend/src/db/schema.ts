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
      is_pinned integer not null default 0,
      is_archived integer not null default 0,
      pinned_at text,
      sort_order integer not null default 0,
      created_at text not null default current_timestamp,
      updated_at text not null default current_timestamp,
      foreign key (user_id) references users(id) on delete cascade
    );

    create table if not exists messages (
      id text primary key,
      conversation_id text not null,
      role text not null check (role in ('user', 'assistant', 'system')),
      content text not null,
      edited_at text,
      created_at text not null default current_timestamp,
      foreign key (conversation_id) references conversations(id) on delete cascade
    );

    create table if not exists message_feedback (
      id text primary key,
      user_id text not null,
      message_id text not null,
      value text not null check (value in ('like', 'dislike')),
      created_at text not null default current_timestamp,
      updated_at text not null default current_timestamp,
      unique (user_id, message_id),
      foreign key (user_id) references users(id) on delete cascade,
      foreign key (message_id) references messages(id) on delete cascade
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
      description text,
      content text,
      created_at text not null default current_timestamp,
      updated_at text not null default current_timestamp,
      foreign key (user_id) references users(id) on delete cascade
    );

    create table if not exists user_settings (
      user_id text primary key,
      display_name text not null,
      full_name text,
      avatar_url text,
      theme text not null default 'dark',
      ai_style text not null default 'balanced',
      language text not null default 'pt-BR',
      response_length text not null default 'medium',
      voice_enabled integer not null default 1,
      voice_language text not null default 'pt-BR',
      voice_rate real not null default 1,
      voice_pitch real not null default 1,
      voice_gender text not null default 'auto',
      voice_auto_read integer not null default 0,
      updated_at text not null default current_timestamp,
      foreign key (user_id) references users(id) on delete cascade
    );

    create table if not exists user_sessions (
      id text primary key,
      user_id text not null,
      device text not null,
      active integer not null default 1,
      created_at text not null default current_timestamp,
      last_seen_at text not null default current_timestamp,
      revoked_at text,
      foreign key (user_id) references users(id) on delete cascade
    );

    create table if not exists user_learning (
      id text primary key,
      user_id text not null,
      key text not null,
      value text not null,
      confidence real not null default 0.6,
      source text not null,
      created_at text not null default current_timestamp,
      updated_at text not null default current_timestamp,
      unique (user_id, key, value),
      foreign key (user_id) references users(id) on delete cascade
    );

    create table if not exists uploads (
      id text primary key,
      user_id text not null,
      conversation_id text,
      message_id text,
      file_name text not null,
      original_name text,
      file_type text not null,
      file_size integer not null,
      storage_path text not null,
      created_at text not null default current_timestamp,
      foreign key (user_id) references users(id) on delete cascade,
      foreign key (conversation_id) references conversations(id) on delete cascade,
      foreign key (message_id) references messages(id) on delete set null
    );

    create table if not exists conversation_projects (
      conversation_id text not null,
      project_id text not null,
      user_id text not null,
      created_at text not null default current_timestamp,
      primary key (conversation_id, project_id),
      foreign key (conversation_id) references conversations(id) on delete cascade,
      foreign key (project_id) references projects(id) on delete cascade,
      foreign key (user_id) references users(id) on delete cascade
    );

    create table if not exists project_tasks (
      id text primary key,
      user_id text not null,
      project_id text not null,
      title text not null,
      description text,
      status text not null default 'pending' check (status in ('pending', 'done')),
      due_date text,
      created_at text not null default current_timestamp,
      updated_at text not null default current_timestamp,
      foreign key (user_id) references users(id) on delete cascade,
      foreign key (project_id) references projects(id) on delete cascade
    );

    create table if not exists project_notes (
      id text primary key,
      user_id text not null,
      project_id text not null,
      content text not null,
      created_at text not null default current_timestamp,
      updated_at text not null default current_timestamp,
      foreign key (user_id) references users(id) on delete cascade,
      foreign key (project_id) references projects(id) on delete cascade
    );

    create table if not exists project_uploads (
      project_id text not null,
      upload_id text not null,
      user_id text not null,
      created_at text not null default current_timestamp,
      primary key (project_id, upload_id),
      foreign key (project_id) references projects(id) on delete cascade,
      foreign key (upload_id) references uploads(id) on delete cascade,
      foreign key (user_id) references users(id) on delete cascade
    );

    create table if not exists documents (
      id text primary key,
      user_id text not null,
      project_id text,
      title text not null,
      type text not null default 'generated',
      template text not null,
      status text not null default 'ready',
      format text not null,
      file_name text not null,
      file_type text not null,
      file_size integer not null,
      storage_path text not null,
      original_file_id text,
      metadata_json text not null default '{}',
      created_at text not null default current_timestamp,
      updated_at text not null default current_timestamp,
      foreign key (user_id) references users(id) on delete cascade
    );

    create table if not exists document_conversions (
      id text primary key,
      user_id text not null,
      source_document_id text not null,
      result_document_id text,
      from_type text not null,
      to_type text not null,
      status text not null,
      created_at text not null default current_timestamp,
      foreign key (user_id) references users(id) on delete cascade,
      foreign key (source_document_id) references documents(id) on delete cascade,
      foreign key (result_document_id) references documents(id) on delete set null
    );

    create table if not exists images (
      id text primary key,
      user_id text not null,
      project_id text,
      conversation_id text,
      original_name text not null,
      file_name text not null,
      file_type text not null,
      file_size integer not null,
      width integer,
      height integer,
      storage_path text not null,
      created_at text not null default current_timestamp,
      foreign key (user_id) references users(id) on delete cascade,
      foreign key (project_id) references projects(id) on delete set null,
      foreign key (conversation_id) references conversations(id) on delete set null
    );

    create table if not exists image_analyses (
      id text primary key,
      user_id text not null,
      image_id text not null,
      type text not null,
      result_json text not null default '{}',
      created_at text not null default current_timestamp,
      foreign key (user_id) references users(id) on delete cascade,
      foreign key (image_id) references images(id) on delete cascade
    );

    create table if not exists image_edits (
      id text primary key,
      user_id text not null,
      original_image_id text not null,
      result_image_id text,
      edit_type text not null,
      prompt text,
      status text not null,
      provider text not null default 'sharp',
      created_at text not null default current_timestamp,
      foreign key (user_id) references users(id) on delete cascade,
      foreign key (original_image_id) references images(id) on delete cascade,
      foreign key (result_image_id) references images(id) on delete set null
    );

    create table if not exists calendar_events (
      id text primary key,
      user_id text not null,
      title text not null,
      description text,
      event_date text not null,
      event_time text,
      location text,
      participants text,
      reminder_minutes integer,
      status text not null default 'scheduled',
      created_by text not null,
      created_at text not null default current_timestamp,
      updated_at text not null default current_timestamp,
      foreign key (user_id) references users(id) on delete cascade
    );

    create table if not exists reminders (
      id text primary key,
      user_id text not null,
      title text not null,
      message text,
      scheduled_at text not null,
      recurrence text not null default 'none',
      status text not null default 'pending',
      created_at text not null default current_timestamp,
      updated_at text not null default current_timestamp,
      foreign key (user_id) references users(id) on delete cascade
    );

    create table if not exists notifications (
      id text primary key,
      user_id text not null,
      type text not null,
      title text not null,
      message text not null,
      status text not null default 'scheduled',
      created_at text not null default current_timestamp,
      foreign key (user_id) references users(id) on delete cascade
    );

    create table if not exists google_calendar_connections (
      user_id text primary key,
      email text,
      access_token_encrypted text,
      refresh_token_encrypted text,
      expires_at text,
      scopes text,
      connected_at text not null default current_timestamp,
      updated_at text not null default current_timestamp,
      foreign key (user_id) references users(id) on delete cascade
    );

    create table if not exists search_history (
      id text primary key,
      user_id text not null,
      query text not null,
      provider text not null default 'none',
      status text not null,
      response text not null,
      results_json text not null default '[]',
      sources_json text not null default '[]',
      created_at text not null default current_timestamp,
      foreign key (user_id) references users(id) on delete cascade
    );

  `);

  ensureColumn("users", "phone", "text");
  ensureColumn("users", "updated_at", "text");
  ensureColumn("users", "reset_password_token_hash", "text");
  ensureColumn("users", "reset_password_expires_at", "text");
  ensureColumn("conversations", "is_pinned", "integer not null default 0");
  ensureColumn("conversations", "is_archived", "integer not null default 0");
  ensureColumn("conversations", "pinned_at", "text");
  ensureColumn("conversations", "sort_order", "integer not null default 0");
  ensureColumn("projects", "description", "text");
  ensureColumn("projects", "content", "text");
  ensureColumn("projects", "updated_at", "text");
  ensureColumn("messages", "edited_at", "text");
  ensureColumn("user_settings", "full_name", "text");
  ensureColumn("user_settings", "avatar_url", "text");
  ensureColumn("user_settings", "language", "text not null default 'pt-BR'");
  ensureColumn("user_settings", "response_length", "text not null default 'medium'");
  ensureColumn("user_settings", "voice_enabled", "integer not null default 1");
  ensureColumn("user_settings", "voice_language", "text not null default 'pt-BR'");
  ensureColumn("user_settings", "voice_rate", "real not null default 1");
  ensureColumn("user_settings", "voice_pitch", "real not null default 1");
  ensureColumn("user_settings", "voice_gender", "text not null default 'auto'");
  ensureColumn("user_settings", "voice_auto_read", "integer not null default 0");
  ensureColumn("user_sessions", "last_seen_at", "text");
  ensureColumn("user_sessions", "revoked_at", "text");
  ensureColumn("uploads", "message_id", "text");
  ensureColumn("uploads", "original_name", "text");
  ensureColumn("documents", "project_id", "text");
  ensureColumn("documents", "type", "text not null default 'generated'");
  ensureColumn("documents", "status", "text not null default 'ready'");
  ensureColumn("documents", "original_file_id", "text");
  ensureColumn("documents", "updated_at", "text");
  ensureColumn("images", "project_id", "text");
  ensureColumn("images", "conversation_id", "text");
  ensureColumn("images", "width", "integer");
  ensureColumn("images", "height", "integer");
  ensureColumn("image_edits", "prompt", "text");
  ensureColumn("image_edits", "provider", "text not null default 'sharp'");
  ensureColumn("calendar_events", "description", "text");
  ensureColumn("calendar_events", "event_time", "text");
  ensureColumn("calendar_events", "location", "text");
  ensureColumn("calendar_events", "participants", "text");
  ensureColumn("calendar_events", "reminder_minutes", "integer");
  ensureColumn("calendar_events", "status", "text not null default 'scheduled'");
  ensureColumn("calendar_events", "created_by", "text not null default 'user'");
  ensureColumn("calendar_events", "updated_at", "text");
  ensureColumn("reminders", "message", "text");
  ensureColumn("reminders", "recurrence", "text not null default 'none'");
  ensureColumn("reminders", "status", "text not null default 'pending'");
  ensureColumn("reminders", "updated_at", "text");
  ensureColumn("notifications", "status", "text not null default 'scheduled'");
  ensureColumn("google_calendar_connections", "email", "text");
  ensureColumn("google_calendar_connections", "scopes", "text");
  ensureColumn("google_calendar_connections", "updated_at", "text");
  ensureColumn("search_history", "results_json", "text not null default '[]'");
  ensureColumn("search_history", "provider", "text not null default 'none'");
  ensureColumn("search_history", "sources_json", "text not null default '[]'");

  db.exec(`
    update users set updated_at = current_timestamp where updated_at is null;
    update projects set updated_at = current_timestamp where updated_at is null;
    update projects set content = output where content is null;
    update documents set type = 'generated' where type is null;
    update documents set status = 'ready' where status is null;
    update documents set updated_at = created_at where updated_at is null;
    update user_settings set language = 'pt-BR' where language is null;
    update user_settings set response_length = 'medium' where response_length is null;
    update user_settings set voice_language = 'pt-BR' where voice_language is null;
    update user_settings set voice_gender = 'auto' where voice_gender is null;

    create unique index if not exists users_phone_unique
      on users(phone)
      where phone is not null and phone <> '';

    create index if not exists conversations_user_archive_sort
      on conversations(user_id, is_archived, is_pinned, sort_order, updated_at);

    create index if not exists uploads_user_conversation
      on uploads(user_id, conversation_id, created_at);

    create index if not exists uploads_message
      on uploads(message_id);

    create index if not exists user_learning_user_key
      on user_learning(user_id, key, updated_at);

    create index if not exists search_history_user_created
      on search_history(user_id, created_at);

    create index if not exists message_feedback_user_message
      on message_feedback(user_id, message_id);

    create index if not exists user_sessions_user_active
      on user_sessions(user_id, active, last_seen_at);

    create index if not exists project_tasks_user_project
      on project_tasks(user_id, project_id, status, updated_at);

    create index if not exists project_notes_user_project
      on project_notes(user_id, project_id, updated_at);

    create index if not exists project_uploads_user_project
      on project_uploads(user_id, project_id, created_at);

    create index if not exists documents_user_created
      on documents(user_id, created_at);

    create index if not exists document_conversions_user_created
      on document_conversions(user_id, created_at);

    create index if not exists images_user_created
      on images(user_id, created_at);

    create index if not exists image_analyses_user_created
      on image_analyses(user_id, created_at);

    create index if not exists image_edits_user_created
      on image_edits(user_id, created_at);

    create index if not exists calendar_events_user_date
      on calendar_events(user_id, event_date, event_time);

    create index if not exists reminders_user_scheduled
      on reminders(user_id, scheduled_at, status);

    create index if not exists notifications_user_created
      on notifications(user_id, created_at);
  `);
}

function ensureColumn(table: string, column: string, definition: string) {
  const db = getDatabase();
  const columns = db.prepare(`pragma table_info(${table})`).all() as Array<{ name: string }>;

  if (!columns.some((item) => item.name === column)) {
    db.exec(`alter table ${table} add column ${column} ${definition}`);
  }
}
