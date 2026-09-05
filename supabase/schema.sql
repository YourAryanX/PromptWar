-- ============================================================
-- PromptWar Database Schema
-- Apply this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable pgvector extension (needed for future embeddings)
create extension if not exists vector;

-- ============================================================
-- PROFILES TABLE
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  skills text[] default '{}',
  college text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================
-- PROJECTS TABLE
-- ============================================================
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  tech_stack text[] default '{}',
  difficulty text check (difficulty in ('Easy', 'Medium', 'Hard')),
  wow_factor text,
  status text default 'active' check (status in ('active', 'completed', 'archived')),
  submission_date date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================
-- TASKS TABLE (Kanban)
-- ============================================================
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'todo' check (status in ('todo', 'in-progress', 'done')),
  difficulty text check (difficulty in ('Easy', 'Medium', 'Hard')),
  sort_order integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================
-- CHAT HISTORY TABLE
-- ============================================================
create table if not exists public.chat_history (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now() not null
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — Each user sees only their data
-- ============================================================
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.chat_history enable row level security;

-- Profiles: users can only read/write their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Projects: users can only access their own projects
create policy "Users can view own projects" on public.projects
  for select using (auth.uid() = user_id);
create policy "Users can insert own projects" on public.projects
  for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on public.projects
  for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on public.projects
  for delete using (auth.uid() = user_id);

-- Tasks: users can only access tasks belonging to their projects
create policy "Users can view own tasks" on public.tasks
  for select using (
    exists (select 1 from public.projects where projects.id = tasks.project_id and projects.user_id = auth.uid())
  );
create policy "Users can insert own tasks" on public.tasks
  for insert with check (
    exists (select 1 from public.projects where projects.id = tasks.project_id and projects.user_id = auth.uid())
  );
create policy "Users can update own tasks" on public.tasks
  for update using (
    exists (select 1 from public.projects where projects.id = tasks.project_id and projects.user_id = auth.uid())
  );
create policy "Users can delete own tasks" on public.tasks
  for delete using (
    exists (select 1 from public.projects where projects.id = tasks.project_id and projects.user_id = auth.uid())
  );

-- Chat history: users can only access chat belonging to their projects
create policy "Users can view own chat" on public.chat_history
  for select using (
    exists (select 1 from public.projects where projects.id = chat_history.project_id and projects.user_id = auth.uid())
  );
create policy "Users can insert own chat" on public.chat_history
  for insert with check (
    exists (select 1 from public.projects where projects.id = chat_history.project_id and projects.user_id = auth.uid())
  );

-- ============================================================
-- AUTO-UPDATE updated_at timestamps
-- ============================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function update_updated_at_column();
create trigger update_projects_updated_at before update on public.projects
  for each row execute function update_updated_at_column();
create trigger update_tasks_updated_at before update on public.tasks
  for each row execute function update_updated_at_column();

-- ============================================================
-- AUTO-CREATE PROFILE on new auth user signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
