-- AM Platform — Database Schema
-- Run this migration after creating the Supabase project

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- Properties
-- ============================================================
create table properties (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  address text not null,
  city text not null default '',
  state text not null default '',
  zip_code text not null default '',
  bedrooms integer not null default 0,
  bathrooms numeric(3,1) not null default 0,
  sqft integer not null default 0,
  year_built integer,
  property_type text not null default 'Single Family',
  latitude double precision not null default 0,
  longitude double precision not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table properties enable row level security;

create policy "Users can view own properties"
  on properties for select using (auth.uid() = user_id);

create policy "Users can insert own properties"
  on properties for insert with check (auth.uid() = user_id);

create policy "Users can update own properties"
  on properties for update using (auth.uid() = user_id);

create policy "Users can delete own properties"
  on properties for delete using (auth.uid() = user_id);

-- ============================================================
-- Analyses (Comp Analysis results)
-- ============================================================
create table analyses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid references properties(id) on delete set null,
  status text not null default 'completed',
  address text not null,
  recommended_rent numeric(10,2),
  comps_data jsonb not null default '{}',
  vacancy_data jsonb not null default '{}',
  score_data jsonb not null default '{}',
  rentometer_data jsonb not null default '{}',
  report_json jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table analyses enable row level security;

create policy "Users can view own analyses"
  on analyses for select using (auth.uid() = user_id);

create policy "Users can insert own analyses"
  on analyses for insert with check (auth.uid() = user_id);

create policy "Users can update own analyses"
  on analyses for update using (auth.uid() = user_id);

create policy "Users can delete own analyses"
  on analyses for delete using (auth.uid() = user_id);

-- ============================================================
-- Underwriting Models
-- ============================================================
create table underwriting_models (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid references properties(id) on delete set null,
  investment_type text not null default 'Long Term Hold',
  inputs jsonb not null default '{}',
  results jsonb not null default '{}',
  recommendation jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table underwriting_models enable row level security;

create policy "Users can view own UW models"
  on underwriting_models for select using (auth.uid() = user_id);

create policy "Users can insert own UW models"
  on underwriting_models for insert with check (auth.uid() = user_id);

create policy "Users can update own UW models"
  on underwriting_models for update using (auth.uid() = user_id);

create policy "Users can delete own UW models"
  on underwriting_models for delete using (auth.uid() = user_id);

-- Unique constraint for property upsert (user_id + address)
create unique index idx_properties_user_address on properties(user_id, address);

-- ============================================================
-- Indexes
-- ============================================================
create index idx_properties_user_id on properties(user_id);
create index idx_analyses_user_id on analyses(user_id);
create index idx_analyses_property_id on analyses(property_id);
create index idx_underwriting_models_user_id on underwriting_models(user_id);
create index idx_underwriting_models_property_id on underwriting_models(property_id);

-- ============================================================
-- Updated_at triggers
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_properties_updated_at
  before update on properties
  for each row execute function update_updated_at();

create trigger set_analyses_updated_at
  before update on analyses
  for each row execute function update_updated_at();

create trigger set_underwriting_models_updated_at
  before update on underwriting_models
  for each row execute function update_updated_at();
