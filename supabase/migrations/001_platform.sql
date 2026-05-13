create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  github_id text unique,
  github_login text unique,
  display_name text,
  avatar_url text,
  profile_url text,
  role text not null default 'user' check (role in ('user', 'moderator', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skill_claims (
  id uuid primary key default gen_random_uuid(),
  skill_slug text not null,
  github_repo text not null,
  claimant_id uuid not null references public.profiles(id) on delete cascade,
  claimant_github_login text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'passed', 'flagged', 'rejected')),
  reviewer_id uuid references public.profiles(id),
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skill_posts (
  id uuid primary key default gen_random_uuid(),
  skill_slug text not null,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  product_url text,
  post_type text not null default 'note' check (post_type in ('note', 'product', 'announcement')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'passed', 'flagged', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('skill', 'news')),
  target_id text not null,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'passed', 'flagged', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.news_stories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  dek text not null,
  content text[] not null default '{}',
  source_name text not null,
  source_url text,
  source_type text not null default 'crawler' check (source_type in ('crawler', 'user', 'agent')),
  publisher_github text,
  location_name text not null,
  lat double precision not null,
  lon double precision not null,
  category text not null default 'World',
  impact text not null default 'Medium',
  published_at date not null default current_date,
  ai_summary text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'passed', 'flagged', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.news_submissions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  payload jsonb not null,
  source_type text not null default 'agent' check (source_type in ('crawler', 'user', 'agent')),
  publisher_github text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'passed', 'flagged', 'rejected')),
  pr_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.moderation_reviews (
  id uuid primary key default gen_random_uuid(),
  target_table text not null,
  target_id uuid not null,
  ai_status text not null default 'pending' check (ai_status in ('pending', 'passed', 'flagged', 'rejected')),
  risk_labels text[] not null default '{}',
  ai_summary text,
  reviewer_id uuid references public.profiles(id),
  decision text check (decision in ('approved', 'rejected')),
  review_note text,
  created_at timestamptz not null default now()
);

create index if not exists comments_target_idx on public.comments(target_type, target_id, status, created_at desc);
create index if not exists skill_posts_slug_idx on public.skill_posts(skill_slug, status, created_at desc);
create index if not exists skill_claims_slug_idx on public.skill_claims(skill_slug, status);
create index if not exists news_stories_status_idx on public.news_stories(status, published_at desc);
create index if not exists news_stories_location_idx on public.news_stories(lat, lon);
create index if not exists news_submissions_status_idx on public.news_submissions(status, created_at desc);

alter table public.profiles enable row level security;
alter table public.skill_claims enable row level security;
alter table public.skill_posts enable row level security;
alter table public.comments enable row level security;
alter table public.news_stories enable row level security;
alter table public.news_submissions enable row level security;
alter table public.moderation_reviews enable row level security;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('admin', 'moderator')
  );
$$;

drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable" on public.profiles
  for select to anon, authenticated using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "Approved skill posts are public" on public.skill_posts;
create policy "Approved skill posts are public" on public.skill_posts
  for select to anon, authenticated using (status = 'approved' or public.is_platform_admin() or author_id = (select auth.uid()));

drop policy if exists "Users can submit skill posts" on public.skill_posts;
create policy "Users can submit skill posts" on public.skill_posts
  for insert to authenticated with check (author_id = (select auth.uid()) and status = 'pending');

drop policy if exists "Approved comments are public" on public.comments;
create policy "Approved comments are public" on public.comments
  for select to anon, authenticated using (status = 'approved' or public.is_platform_admin() or author_id = (select auth.uid()));

drop policy if exists "Users can submit comments" on public.comments;
create policy "Users can submit comments" on public.comments
  for insert to authenticated with check (author_id = (select auth.uid()) and status = 'pending');

drop policy if exists "Users can submit skill claims" on public.skill_claims;
create policy "Users can submit skill claims" on public.skill_claims
  for insert to authenticated with check (claimant_id = (select auth.uid()) and status = 'pending');

drop policy if exists "Users can read own claims and admins read all" on public.skill_claims;
create policy "Users can read own claims and admins read all" on public.skill_claims
  for select to authenticated using (claimant_id = (select auth.uid()) or public.is_platform_admin());

drop policy if exists "Approved news stories are public" on public.news_stories;
create policy "Approved news stories are public" on public.news_stories
  for select to anon, authenticated using (status = 'approved' or public.is_platform_admin());

drop policy if exists "Users can submit news submissions" on public.news_submissions;
create policy "Users can submit news submissions" on public.news_submissions
  for insert to authenticated with check (status = 'pending');

drop policy if exists "Submitters and admins can read submissions" on public.news_submissions;
create policy "Submitters and admins can read submissions" on public.news_submissions
  for select to authenticated using (public.is_platform_admin() or publisher_github = (
    select github_login from public.profiles where id = (select auth.uid())
  ));

drop policy if exists "Admins can read moderation reviews" on public.moderation_reviews;
create policy "Admins can read moderation reviews" on public.moderation_reviews
  for select to authenticated using (public.is_platform_admin());

drop policy if exists "Admins can moderate skill posts" on public.skill_posts;
create policy "Admins can moderate skill posts" on public.skill_posts
  for update to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "Admins can moderate comments" on public.comments;
create policy "Admins can moderate comments" on public.comments
  for update to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "Admins can moderate skill claims" on public.skill_claims;
create policy "Admins can moderate skill claims" on public.skill_claims
  for update to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "Admins can manage news stories" on public.news_stories;
create policy "Admins can manage news stories" on public.news_stories
  for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "Admins can moderate news submissions" on public.news_submissions;
create policy "Admins can moderate news submissions" on public.news_submissions
  for update to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

drop policy if exists "Admins can create moderation reviews" on public.moderation_reviews;
create policy "Admins can create moderation reviews" on public.moderation_reviews
  for insert to authenticated with check (public.is_platform_admin());
