-- YARA AI memory architecture for PostgreSQL + pgvector.
-- Apply only after provisioning PostgreSQL and enabling pgvector.

create extension if not exists vector;

create table if not exists memory_embeddings_pgvector (
  id uuid primary key,
  memory_id text not null,
  user_id text not null,
  provider text not null default 'local-hash',
  model text not null default 'yara-local-embedding-v1',
  dimension integer not null default 96,
  embedding vector(96) not null,
  content_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (memory_id, provider, model)
);

create index if not exists memory_embeddings_pgvector_user_idx
  on memory_embeddings_pgvector(user_id, updated_at desc);

create index if not exists memory_embeddings_pgvector_embedding_idx
  on memory_embeddings_pgvector
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create table if not exists vector_search_index_pgvector (
  id uuid primary key,
  source_index_id text not null,
  user_id text not null,
  source_type text not null,
  source_id text not null,
  title text not null,
  content text not null,
  content_hash text not null,
  embedding vector(96) not null,
  metadata_json jsonb not null default '{}'::jsonb,
  indexed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, source_type, source_id)
);

create index if not exists vector_search_index_pgvector_user_idx
  on vector_search_index_pgvector(user_id, source_type, updated_at desc);

create index if not exists vector_search_index_pgvector_embedding_idx
  on vector_search_index_pgvector
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);
