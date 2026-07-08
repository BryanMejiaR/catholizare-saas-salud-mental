alter table public.plantillas_nota_clinica
  add column if not exists name text;

update public.plantillas_nota_clinica
set name = case
  when model_type = 'tcc' then 'Nota clinica TCC'
  else 'Nota clinica general'
end
where name is null;

alter table public.plantillas_nota_clinica
  alter column name set not null;

do $$
begin
  alter table public.plantillas_nota_clinica
    add constraint plantillas_nota_clinica_name_check
    check (char_length(trim(name)) between 1 and 120);
exception
  when duplicate_object then null;
end $$;
