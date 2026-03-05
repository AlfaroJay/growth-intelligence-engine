-- ============================================================
-- AlphaCreative Growth Intelligence Engine – Database Schema
-- AC-GIE-v1.0
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLE: intake_submissions
-- Stores raw intake form data from users
-- ============================================================
create table if not exists intake_submissions (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  name                text not null,
  email               text not null,
  company             text not null,
  website             text not null,
  role                text,
  services_selected   text[] not null default '{}',
  budget              text not null,
  timeline            text not null,
  tracking_maturity   text not null,
  marketing_channels  text[] not null default '{}',
  raw_payload         jsonb not null default '{}'
);

-- Index for quick lookups by email
create index if not exists idx_intake_submissions_email
  on intake_submissions(email);

-- ============================================================
-- TABLE: audit_jobs
-- Tracks each audit run – one per intake submission
-- ============================================================
create table if not exists audit_jobs (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references intake_submissions(id) on delete cascade,
  domain        text not null,
  created_at    timestamptz not null default now(),
  status        text not null default 'queued'
                  check (status in ('queued', 'running', 'complete', 'failed')),
  started_at    timestamptz,
  finished_at   timestamptz,
  result        jsonb,   -- raw crawl + signals data
  score         jsonb,   -- structured score output from scoring engine
  report_html   text,    -- rendered HTML report
  share_token   text not null unique default encode(gen_random_bytes(18), 'hex'),
  error_message text
);

-- Index for fast lookup by submission and status
create index if not exists idx_audit_jobs_submission_id
  on audit_jobs(submission_id);

create index if not exists idx_audit_jobs_status
  on audit_jobs(status);

create index if not exists idx_audit_jobs_share_token
  on audit_jobs(share_token);

-- ============================================================
-- TABLE: crawled_pages
-- One row per URL crawled during an audit job
-- ============================================================
create table if not exists crawled_pages (
  id               bigserial primary key,
  job_id           uuid not null references audit_jobs(id) on delete cascade,
  url              text not null,
  status_code      integer,
  title            text,
  meta_description text,
  h1_present       boolean not null default false,
  canonical        text,
  word_count       integer not null default 0,
  internal_links   integer not null default 0,
  crawled_at       timestamptz not null default now()
);

create index if not exists idx_crawled_pages_job_id
  on crawled_pages(job_id);

-- ============================================================
-- ROW-LEVEL SECURITY
-- Disabled: Service role key is server-only and never exposed to clients.
-- RLS only protects against unauthorized client access, which we don't have.
-- ============================================================
-- RLS is intentionally disabled for these tables.
-- The service role key (used in /api routes) is never exposed to the client.
-- Security is maintained because:
-- 1. Service role key is in .env.local (server-only)
-- 2. Client never receives the key
-- 3. All database access goes through authenticated API routes

-- ============================================================
-- HELPFUL VIEW: jobs with submission context (for admin portal)
-- ============================================================
create or replace view admin_jobs_view as
  select
    j.id            as job_id,
    j.created_at,
    j.domain,
    j.status,
    j.started_at,
    j.finished_at,
    j.share_token,
    j.score,
    j.error_message,
    s.id            as submission_id,
    s.name,
    s.email,
    s.company,
    s.website,
    s.services_selected,
    s.budget,
    s.timeline,
    s.tracking_maturity,
    s.marketing_channels,
    s.role
  from audit_jobs j
  join intake_submissions s on s.id = j.submission_id
  order by j.created_at desc;
