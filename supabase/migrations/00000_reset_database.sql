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

-- Drop all triggers
do $$
declare
    _trigger record;
begin
    for _trigger in (
        select tgname, relname
        from pg_trigger
        join pg_class on pg_trigger.tgrelid = pg_class.oid
        where relnamespace = 'public'::regnamespace
    )
    loop
        execute format('drop trigger if exists %I on public.%I;', _trigger.tgname, _trigger.relname);
    end loop;
end $$;

-- Drop custom types
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

-- Drop all functions
do $$
declare
    _func record;
begin
    for _func in (
        select proname, oid, proargtypes::regtype[]
        from pg_proc
        where pronamespace = 'public'::regnamespace
    )
    loop
        execute format('drop function if exists public.%I(%s) cascade;',
            _func.proname,
            array_to_string(_func.proargtypes, ', ')
        );
    end loop;
end $$; 