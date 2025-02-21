-- Disable RLS on existing tables
do $$
declare
    _table text;
begin
    for _table in (select tablename from pg_tables where schemaname = 'public')
    loop
        execute format('alter table if exists public.%I disable row level security;', _table);
    end loop;
end $$;

-- Drop all foreign key constraints
do $$
declare
    _constraint record;
begin
    for _constraint in (
        select 
            tc.constraint_name,
            tc.table_name
        from information_schema.table_constraints tc
        where tc.constraint_type = 'FOREIGN KEY'
        and tc.table_schema = 'public'
    ) loop
        execute format('alter table public.%I drop constraint if exists %I cascade;',
            _constraint.table_name,
            _constraint.constraint_name
        );
    end loop;
end $$;

-- Drop all policies
do $$
declare
    _policy record;
begin
    for _policy in (
        select schemaname, tablename, policyname
        from pg_policies
        where schemaname = 'public'
    ) loop
        execute format('drop policy if exists %I on %I.%I;',
            _policy.policyname,
            _policy.schemaname,
            _policy.tablename
        );
    end loop;
end $$;

-- Drop custom types first
drop type if exists user_type cascade;
drop type if exists campaign_status cascade;
drop type if exists payment_status cascade;

-- Drop all tables
do $$
declare
    _table text;
begin
    for _table in (
        select tablename 
        from pg_tables 
        where schemaname = 'public'
        and tablename not in ('spatial_ref_sys')
    )
    loop
        execute format('drop table if exists public.%I cascade;', _table);
    end loop;
end $$;

-- Drop functions
drop function if exists public.handle_updated_at() cascade;

-- Drop all types
do $$
declare
    t record;
begin
    for t in (
        select typname
        from pg_type t
        join pg_namespace n on t.typnamespace = n.oid
        where n.nspname = 'public'
        and t.typtype = 'e'
    )
    loop
        execute format('drop type if exists public.%I cascade;', t.typname);
    end loop;
end $$;

-- Drop all functions
do $$
declare
    f record;
begin
    for f in (
        select proname, oid, proargtypes::regtype[]
        from pg_proc
        where pronamespace = 'public'::regnamespace
    )
    loop
        execute format('drop function if exists public.%I(%s) cascade;',
            f.proname,
            array_to_string(f.proargtypes, ', ')
        );
    end loop;
end $$;

-- Final cleanup to catch anything missed
do $$ 
declare
    r record;
begin
    -- Drop any remaining tables
    for r in (select tablename from pg_tables where schemaname = 'public') loop
        execute format('drop table if exists public.%I cascade;', r.tablename);
    end loop;
    
    -- Drop any remaining types
    for r in (select typname from pg_type t join pg_namespace n on t.typnamespace = n.oid 
              where n.nspname = 'public' and t.typtype = 'e') loop
        execute format('drop type if exists public.%I cascade;', r.typname);
    end loop;
end $$;

-- Drop all triggers
do $$
declare
    t record;
begin
    for t in (
        select tgname, relname
        from pg_trigger
        join pg_class on pg_trigger.tgrelid = pg_class.oid
        where relnamespace = 'public'::regnamespace
    )
    loop
        execute format('drop trigger if exists %I on public.%I;', t.tgname, t.relname);
    end loop;
end $$;

-- Remove any remaining policies
drop policy if exists "Users can view their own influencer profile" on public.influencer_profiles;
drop policy if exists "Users can create their own influencer profile" on public.influencer_profiles;
drop policy if exists "Users can update their own influencer profile" on public.influencer_profiles;
drop policy if exists "Users can view their own business profile" on public.business_profiles;
drop policy if exists "Users can create their own business profile" on public.business_profiles;
drop policy if exists "Users can update their own business profile" on public.business_profiles;

-- Verify and clean up any remaining objects
do $$ 
declare
    r record;
begin
    -- Drop all tables in public schema
    for r in (select tablename from pg_tables where schemaname = 'public') loop
        execute 'drop table if exists public.' || quote_ident(r.tablename) || ' cascade';
    end loop;
    
    -- Drop all types in public schema
    for r in (select typname from pg_type t join pg_namespace n on t.typnamespace = n.oid where n.nspname = 'public' and t.typtype = 'e') loop
        execute 'drop type if exists public.' || quote_ident(r.typname) || ' cascade';
    end loop;
end $$; 