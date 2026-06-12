alter table public.consentimientos
  drop constraint if exists consentimientos_no_excepcion_justificada;

alter table public.expedientes
  drop constraint if exists expedientes_no_excepcion_justificada;

create or replace function public.enforce_nota_clinica_rules()
returns trigger
language plpgsql
as $$
declare
  expediente_row public.expedientes%rowtype;
  original_note_status public.nota_clinica_status;
begin
  select *
  into expediente_row
  from public.expedientes
  where id = new.expediente_id;

  if expediente_row.id is null then
    raise exception 'Clinical record not found';
  end if;

  if expediente_row.status <> 'activo' then
    raise exception 'Clinical record is not active';
  end if;

  if new.patient_id <> expediente_row.patient_id or new.professional_id <> expediente_row.professional_id then
    raise exception 'Clinical note ownership does not match clinical record';
  end if;

  if expediente_row.consent_status not in ('firmado_fisico', 'firmado_digital', 'excepcion_justificada') then
    raise exception 'Clinical notes require informed consent or justified exception';
  end if;

  if new.note_type = 'addendum' then
    select status
    into original_note_status
    from public.notas_clinicas
    where id = new.addendum_to_note_id
      and expediente_id = new.expediente_id
      and professional_id = new.professional_id;

    if original_note_status not in ('confirmada', 'con_addendum', 'exportada') then
      raise exception 'Addendum requires a confirmed original note';
    end if;
  end if;

  return new;
end;
$$;
