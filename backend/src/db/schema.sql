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

create unique index if not exists users_phone_unique
  on users(phone)
  where phone is not null and phone <> '';

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
  category text not null default 'general',
  importance integer not null default 3,
  content text not null,
  embedding_json text,
  source text not null default 'manual',
  project_id text,
  conversation_id text,
  pinned integer not null default 0,
  metadata_json text not null default '{}',
  last_accessed_at text,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (project_id) references projects(id) on delete set null,
  foreign key (conversation_id) references conversations(id) on delete set null
);

create table if not exists memory_embeddings (
  id text primary key,
  memory_id text not null,
  user_id text not null,
  provider text not null default 'local-hash',
  model text not null default 'yara-local-embedding-v1',
  dimension integer not null,
  embedding_json text not null,
  content_hash text not null,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  unique (memory_id, provider, model),
  foreign key (memory_id) references memories(id) on delete cascade,
  foreign key (user_id) references users(id) on delete cascade
);

create table if not exists memory_relations (
  id text primary key,
  user_id text not null,
  source_memory_id text not null,
  target_memory_id text,
  target_type text not null default 'memory',
  relation_type text not null,
  weight real not null default 0.5,
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (source_memory_id) references memories(id) on delete cascade,
  foreign key (target_memory_id) references memories(id) on delete cascade
);

create table if not exists memory_sessions (
  id text primary key,
  user_id text not null,
  conversation_id text,
  status text not null default 'active',
  recent_context_json text not null default '[]',
  token_estimate integer not null default 0,
  last_message_at text,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  unique (user_id, conversation_id),
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (conversation_id) references conversations(id) on delete cascade
);

create table if not exists memory_summaries (
  id text primary key,
  user_id text not null,
  conversation_id text,
  project_id text,
  summary text not null,
  message_count integer not null default 0,
  importance integer not null default 3,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (conversation_id) references conversations(id) on delete cascade,
  foreign key (project_id) references projects(id) on delete set null
);

create table if not exists memory_audit_logs (
  id text primary key,
  user_id text not null,
  memory_id text,
  action text not null,
  status text not null default 'success',
  message text,
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (memory_id) references memories(id) on delete set null
);

create index if not exists memories_user_category_importance
  on memories(user_id, category, importance, updated_at);

create index if not exists memories_user_pinned
  on memories(user_id, pinned, updated_at);

create index if not exists memory_embeddings_user_memory
  on memory_embeddings(user_id, memory_id, updated_at);

create index if not exists memory_relations_user_source
  on memory_relations(user_id, source_memory_id, relation_type);

create index if not exists memory_sessions_user_conversation
  on memory_sessions(user_id, conversation_id, updated_at);

create index if not exists memory_summaries_user_conversation
  on memory_summaries(user_id, conversation_id, updated_at);

create index if not exists memory_audit_user_created
  on memory_audit_logs(user_id, created_at);

create table if not exists memory_consolidations (
  id text primary key,
  user_id text not null,
  status text not null default 'completed',
  summary text not null,
  source_count integer not null default 0,
  duplicate_count integer not null default 0,
  conflict_count integer not null default 0,
  stale_count integer not null default 0,
  quality_score real not null default 0,
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade
);

create table if not exists consolidated_memory_items (
  id text primary key,
  user_id text not null,
  consolidation_id text not null,
  category text not null default 'general',
  title text not null,
  content text not null,
  source_types_json text not null default '[]',
  source_refs_json text not null default '[]',
  confidence_score real not null default 0.5,
  freshness_score real not null default 0.5,
  quality_score real not null default 0.5,
  status text not null default 'active',
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (consolidation_id) references memory_consolidations(id) on delete cascade
);

create table if not exists memory_conflicts (
  id text primary key,
  user_id text not null,
  consolidation_id text,
  title text not null,
  description text not null,
  source_a_json text not null default '{}',
  source_b_json text not null default '{}',
  severity text not null default 'medium',
  status text not null default 'pending',
  resolution text,
  resolved_at text,
  created_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (consolidation_id) references memory_consolidations(id) on delete set null
);

create table if not exists memory_quality_scores (
  id text primary key,
  user_id text not null,
  source_type text not null,
  source_id text not null,
  quality_score real not null default 0.5,
  freshness_score real not null default 0.5,
  confidence_score real not null default 0.5,
  duplicate_score real not null default 0,
  conflict_score real not null default 0,
  metadata_json text not null default '{}',
  updated_at text not null default current_timestamp,
  unique (user_id, source_type, source_id),
  foreign key (user_id) references users(id) on delete cascade
);

create table if not exists memory_consolidation_audit_logs (
  id text primary key,
  user_id text not null,
  consolidation_id text,
  action text not null,
  status text not null default 'success',
  message text,
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (consolidation_id) references memory_consolidations(id) on delete set null
);

create index if not exists memory_consolidations_user_created
  on memory_consolidations(user_id, created_at);

create index if not exists consolidated_memory_items_user_consolidation
  on consolidated_memory_items(user_id, consolidation_id, quality_score);

create index if not exists memory_conflicts_user_status
  on memory_conflicts(user_id, status, created_at);

create index if not exists memory_quality_scores_user_source
  on memory_quality_scores(user_id, source_type, source_id);

create index if not exists memory_consolidation_audit_user_created
  on memory_consolidation_audit_logs(user_id, created_at);

create table if not exists projects (
  id text primary key,
  user_id text not null,
  name text not null,
  type text not null,
  prompt text not null,
  output text not null,
  description text,
  content text,
  is_archived integer not null default 0,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade
);

create table if not exists project_memories (
  id text primary key,
  user_id text not null,
  name text not null,
  description text,
  status text not null default 'active',
  current_pillar text,
  current_phase text,
  next_steps_json text not null default '[]',
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  unique (user_id, name),
  foreign key (user_id) references users(id) on delete cascade
);

create table if not exists project_phases (
  id text primary key,
  user_id text not null,
  project_memory_id text not null,
  pillar text,
  name text not null,
  status text not null default 'planned',
  summary text,
  started_at text,
  completed_at text,
  sort_order integer not null default 0,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  unique (user_id, project_memory_id, name),
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (project_memory_id) references project_memories(id) on delete cascade
);

create table if not exists project_decisions (
  id text primary key,
  user_id text not null,
  project_memory_id text not null,
  title text not null,
  content text not null,
  impact text,
  source text not null default 'manual',
  decided_at text not null default current_timestamp,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (project_memory_id) references project_memories(id) on delete cascade
);

create table if not exists project_milestones (
  id text primary key,
  user_id text not null,
  project_memory_id text not null,
  title text not null,
  description text,
  status text not null default 'completed',
  milestone_date text,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (project_memory_id) references project_memories(id) on delete cascade
);

create table if not exists project_pending_items (
  id text primary key,
  user_id text not null,
  project_memory_id text not null,
  title text not null,
  description text,
  priority text not null default 'medium',
  status text not null default 'open',
  due_date text,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (project_memory_id) references project_memories(id) on delete cascade
);

create table if not exists project_commits (
  id text primary key,
  user_id text not null,
  project_memory_id text not null,
  hash text not null,
  message text not null,
  branch text not null default 'main',
  committed_at text not null default current_timestamp,
  created_at text not null default current_timestamp,
  unique (user_id, project_memory_id, hash),
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (project_memory_id) references project_memories(id) on delete cascade
);

create table if not exists project_timeline_events (
  id text primary key,
  user_id text not null,
  project_memory_id text not null,
  event_type text not null,
  title text not null,
  description text,
  event_at text not null default current_timestamp,
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (project_memory_id) references project_memories(id) on delete cascade
);

create table if not exists project_memory_audit_logs (
  id text primary key,
  user_id text not null,
  project_memory_id text,
  action text not null,
  status text not null default 'success',
  message text,
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (project_memory_id) references project_memories(id) on delete set null
);

create table if not exists knowledge_nodes (
  id text primary key,
  user_id text not null,
  node_key text not null,
  type text not null,
  label text not null,
  summary text,
  importance real not null default 0.5,
  source_table text,
  source_id text,
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  unique (user_id, node_key),
  foreign key (user_id) references users(id) on delete cascade
);

create table if not exists knowledge_edges (
  id text primary key,
  user_id text not null,
  source_node_id text not null,
  target_node_id text not null,
  relation_type text not null,
  weight real not null default 0.5,
  evidence text,
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  unique (user_id, source_node_id, target_node_id, relation_type),
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (source_node_id) references knowledge_nodes(id) on delete cascade,
  foreign key (target_node_id) references knowledge_nodes(id) on delete cascade
);

create table if not exists graph_queries (
  id text primary key,
  user_id text not null,
  query text not null,
  result_json text not null default '{}',
  created_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade
);

create table if not exists graph_insights (
  id text primary key,
  user_id text not null,
  title text not null,
  content text not null,
  insight_type text not null default 'relationship',
  confidence real not null default 0.7,
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade
);

create table if not exists graph_audit_logs (
  id text primary key,
  user_id text not null,
  action text not null,
  status text not null default 'success',
  message text,
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade
);

create index if not exists project_memories_user_status
  on project_memories(user_id, status, updated_at);

create index if not exists project_phases_user_project
  on project_phases(user_id, project_memory_id, status, sort_order);

create index if not exists project_decisions_user_project
  on project_decisions(user_id, project_memory_id, decided_at);

create index if not exists project_milestones_user_project
  on project_milestones(user_id, project_memory_id, milestone_date);

create index if not exists project_pending_user_project
  on project_pending_items(user_id, project_memory_id, status, priority);

create index if not exists project_commits_user_project
  on project_commits(user_id, project_memory_id, committed_at);

create index if not exists project_timeline_user_project
  on project_timeline_events(user_id, project_memory_id, event_at);

create index if not exists project_memory_audit_user_project
  on project_memory_audit_logs(user_id, project_memory_id, created_at);

create index if not exists knowledge_nodes_user_type
  on knowledge_nodes(user_id, type, importance);

create index if not exists knowledge_edges_user_relation
  on knowledge_edges(user_id, relation_type, weight);

create index if not exists graph_queries_user_created
  on graph_queries(user_id, created_at);

create index if not exists graph_insights_user_type
  on graph_insights(user_id, insight_type, confidence);

create index if not exists graph_audit_user_created
  on graph_audit_logs(user_id, created_at);

create table if not exists systems (
  id text primary key,
  user_id text not null,
  name text not null,
  prompt text not null,
  type text not null,
  complexity text not null,
  scalability text not null,
  architecture text not null,
  frontend text,
  backend text,
  database_choice text,
  needs_auth integer not null default 1,
  needs_database integer not null default 1,
  needs_mobile integer not null default 0,
  needs_admin integer not null default 1,
  objective text not null,
  scope_json text not null default '{}',
  stack_json text not null default '{}',
  folder_structure_json text not null default '[]',
  development_plan_json text not null default '[]',
  status text not null default 'ready',
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade
);

create index if not exists systems_user_created
  on systems(user_id, created_at);

create table if not exists system_generations (
  id text primary key,
  user_id text not null,
  system_id text not null,
  prompt text not null,
  analysis_json text not null default '{}',
  output_json text not null default '{}',
  created_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (system_id) references systems(id) on delete cascade
);

create index if not exists system_generations_user_system
  on system_generations(user_id, system_id, created_at);

create table if not exists system_files (
  id text primary key,
  user_id text not null,
  system_id text not null,
  name text not null,
  type text not null,
  content text not null,
  file_id text,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (system_id) references systems(id) on delete cascade,
  foreign key (file_id) references files(id) on delete set null
);

create index if not exists system_files_user_system
  on system_files(user_id, system_id, created_at);

create table if not exists system_audit_logs (
  id text primary key,
  user_id text not null,
  system_id text,
  action text not null,
  status text not null default 'success',
  message text,
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (system_id) references systems(id) on delete set null
);

create index if not exists system_audit_user_system
  on system_audit_logs(user_id, system_id, created_at);

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

create table if not exists cognitive_profiles (
  user_id text primary key,
  preferred_name text,
  profession text,
  studies text,
  projects_json text not null default '[]',
  interests_json text not null default '[]',
  goals_json text not null default '{"shortTerm":"","mediumTerm":"","longTerm":""}',
  history_json text not null default '[]',
  confidence_score real not null default 0.5,
  source text not null default 'manual',
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade
);

create table if not exists cognitive_profile_facts (
  id text primary key,
  user_id text not null,
  fact_type text not null,
  label text not null,
  content text not null,
  confidence_score real not null default 0.5,
  source text not null,
  status text not null default 'suggested',
  conversation_id text,
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (conversation_id) references conversations(id) on delete set null
);

create table if not exists cognitive_preferences (
  user_id text primary key,
  communication_style text,
  language text not null default 'pt-BR',
  response_style text not null default 'balanced',
  response_length text not null default 'medium',
  personal_settings_json text not null default '{}',
  confidence_score real not null default 0.5,
  source text not null default 'settings',
  updated_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade
);

create table if not exists cognitive_objectives (
  id text primary key,
  user_id text not null,
  horizon text not null check (horizon in ('short', 'medium', 'long')),
  title text not null,
  description text,
  status text not null default 'active',
  confidence_score real not null default 0.5,
  source text not null default 'manual',
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade
);

create table if not exists cognitive_profile_audit_logs (
  id text primary key,
  user_id text not null,
  action text not null,
  status text not null default 'success',
  message text,
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade
);

create index if not exists cognitive_profile_facts_user_type
  on cognitive_profile_facts(user_id, fact_type, status, updated_at);

create index if not exists cognitive_objectives_user_horizon
  on cognitive_objectives(user_id, horizon, status, updated_at);

create index if not exists cognitive_profile_audit_user_created
  on cognitive_profile_audit_logs(user_id, created_at);

create table if not exists audit_events (
  id text primary key,
  user_id text,
  category text not null,
  action text not null,
  entity_type text,
  entity_id text,
  status text not null default 'success',
  ip_address text,
  user_agent text,
  message text,
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete set null
);

create index if not exists audit_events_user_created
  on audit_events(user_id, created_at);

create index if not exists audit_events_category_action
  on audit_events(category, action, created_at);

create table if not exists application_logs (
  id text primary key,
  level text not null,
  channel text not null,
  message text not null,
  context_json text not null default '{}',
  created_at text not null default current_timestamp
);

create index if not exists application_logs_level_created
  on application_logs(level, channel, created_at);

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

create table if not exists files (
  id text primary key,
  user_id text not null,
  conversation_id text,
  message_id text,
  name text not null,
  type text not null,
  size integer not null,
  path text not null,
  category text not null default 'generated',
  status text not null default 'ready',
  is_favorite integer not null default 0,
  is_shared integer not null default 0,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade,
  foreign key (conversation_id) references conversations(id) on delete set null,
  foreign key (message_id) references messages(id) on delete set null
);

create index if not exists files_user_created
  on files(user_id, created_at);

create index if not exists files_user_type
  on files(user_id, type, category);

create index if not exists files_message
  on files(message_id);

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
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
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

create index if not exists documents_user_created
  on documents(user_id, created_at);

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

create index if not exists document_conversions_user_created
  on document_conversions(user_id, created_at);

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

create index if not exists images_user_created
  on images(user_id, created_at);

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

create index if not exists image_analyses_user_created
  on image_analyses(user_id, created_at);

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

create index if not exists image_edits_user_created
  on image_edits(user_id, created_at);

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
  external_provider text,
  external_event_id text,
  external_calendar_id text,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade
);

create index if not exists calendar_events_user_date
  on calendar_events(user_id, event_date, event_time);

create unique index if not exists calendar_events_google_unique
  on calendar_events(user_id, external_provider, external_event_id)
  where external_event_id is not null;

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

create index if not exists reminders_user_scheduled
  on reminders(user_id, scheduled_at, status);

create table if not exists notifications (
  id text primary key,
  user_id text not null,
  type text not null,
  title text not null,
  message text not null,
  status text not null default 'scheduled',
  scheduled_for text,
  delivered_at text,
  channel text,
  created_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade
);

create index if not exists notifications_user_created
  on notifications(user_id, created_at);

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

create table if not exists oauth_connections (
  id text primary key,
  user_id text not null,
  provider text not null,
  service text not null,
  email text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  expires_at text,
  scopes text,
  status text not null default 'connected',
  last_sync_at text,
  last_error text,
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  unique (user_id, provider, service),
  foreign key (user_id) references users(id) on delete cascade
);

create index if not exists oauth_connections_user_service
  on oauth_connections(user_id, provider, service, status);

create table if not exists integrations (
  id text primary key,
  user_id text not null,
  provider text not null,
  service text not null,
  status text not null default 'available',
  capabilities_json text not null default '[]',
  settings_json text not null default '{}',
  last_sync_at text,
  last_error text,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  unique (user_id, provider, service),
  foreign key (user_id) references users(id) on delete cascade
);

create index if not exists integrations_user_service
  on integrations(user_id, provider, service, status);

create table if not exists oauth_states (
  state text primary key,
  user_id text not null,
  provider text not null,
  service text not null,
  scopes text not null,
  redirect_path text,
  expires_at text not null,
  created_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade
);

create index if not exists oauth_states_expires
  on oauth_states(expires_at);

create table if not exists integration_audit_logs (
  id text primary key,
  user_id text,
  provider text not null,
  service text not null,
  action text not null,
  status text not null,
  message text,
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete set null
);

create index if not exists integration_audit_user_created
  on integration_audit_logs(user_id, created_at);

create table if not exists gmail_messages_cache (
  id text primary key,
  user_id text not null,
  gmail_id text not null,
  thread_id text,
  subject text,
  from_email text,
  snippet text,
  labels_json text not null default '[]',
  received_at text,
  payload_json text not null default '{}',
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  unique (user_id, gmail_id),
  foreign key (user_id) references users(id) on delete cascade
);

create index if not exists gmail_cache_user_received
  on gmail_messages_cache(user_id, received_at);

create table if not exists drive_files_cache (
  id text primary key,
  user_id text not null,
  drive_id text not null,
  name text not null,
  mime_type text,
  web_view_link text,
  size integer,
  modified_at text,
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  unique (user_id, drive_id),
  foreign key (user_id) references users(id) on delete cascade
);

create index if not exists drive_cache_user_modified
  on drive_files_cache(user_id, modified_at);

create table if not exists push_subscriptions (
  id text primary key,
  user_id text not null,
  endpoint text not null,
  subscription_json text not null,
  status text not null default 'active',
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  unique (user_id, endpoint),
  foreign key (user_id) references users(id) on delete cascade
);

create index if not exists push_subscriptions_user_status
  on push_subscriptions(user_id, status);

create table if not exists automations (
  id text primary key,
  user_id text not null,
  name text not null,
  type text not null,
  trigger_type text not null default 'scheduled',
  schedule_expression text,
  next_run_at text,
  action_json text not null default '{}',
  status text not null default 'active',
  last_run_at text,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade
);

create index if not exists automations_user_next
  on automations(user_id, status, next_run_at);

create table if not exists automation_executions (
  id text primary key,
  automation_id text not null,
  user_id text not null,
  status text not null,
  result_json text not null default '{}',
  error text,
  started_at text not null default current_timestamp,
  finished_at text,
  foreign key (automation_id) references automations(id) on delete cascade,
  foreign key (user_id) references users(id) on delete cascade
);

create index if not exists automation_executions_user_started
  on automation_executions(user_id, started_at);

create table if not exists backups (
  id text primary key,
  user_id text,
  type text not null default 'manual',
  status text not null default 'completed',
  file_name text not null,
  file_size integer not null default 0,
  storage_path text not null,
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete set null
);

create index if not exists backups_created
  on backups(created_at);

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

create table if not exists vector_search_index (
  id text primary key,
  user_id text not null,
  source_type text not null,
  source_id text not null,
  title text not null,
  content text not null,
  search_text text not null,
  embedding_json text not null,
  content_hash text not null,
  metadata_json text not null default '{}',
  indexed_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  unique (user_id, source_type, source_id),
  foreign key (user_id) references users(id) on delete cascade
);

create index if not exists vector_search_index_user_type
  on vector_search_index(user_id, source_type, updated_at);

create table if not exists semantic_search_history (
  id text primary key,
  user_id text not null,
  query text not null,
  mode text not null default 'hybrid',
  status text not null default 'completed',
  results_json text not null default '[]',
  top_score real not null default 0,
  created_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade
);

create index if not exists semantic_search_history_user_created
  on semantic_search_history(user_id, created_at);

create table if not exists vector_search_audit_logs (
  id text primary key,
  user_id text not null,
  action text not null,
  status text not null default 'success',
  message text,
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp,
  foreign key (user_id) references users(id) on delete cascade
);

create index if not exists vector_search_audit_user_created
  on vector_search_audit_logs(user_id, created_at);
