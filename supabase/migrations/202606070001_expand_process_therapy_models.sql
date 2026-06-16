alter table public.plantillas_proceso
  drop constraint if exists plantillas_proceso_model_type_check;

alter table public.procesos_terapeuticos
  drop constraint if exists procesos_terapeuticos_model_type_check;

alter table public.plantillas_proceso
  add constraint plantillas_proceso_model_type_check
  check (
    model_type in (
      'general',
      'tcc',
      'gestalt',
      'third_wave',
      'psychodynamic',
      'humanistic',
      'systemic',
      'brief_systemic',
      'neuropsychological',
      'gestalt_humanistic',
      'rebt',
      'emdr',
      'psychological_consulting',
      'schema_therapy',
      'dbt',
      'act',
      'sfbt',
      'mbct',
      'logotherapy',
      'narrative',
      'gottman'
    )
  );

alter table public.procesos_terapeuticos
  add constraint procesos_terapeuticos_model_type_check
  check (
    model_type in (
      'general',
      'tcc',
      'gestalt',
      'third_wave',
      'psychodynamic',
      'humanistic',
      'systemic',
      'brief_systemic',
      'neuropsychological',
      'gestalt_humanistic',
      'rebt',
      'emdr',
      'psychological_consulting',
      'schema_therapy',
      'dbt',
      'act',
      'sfbt',
      'mbct',
      'logotherapy',
      'narrative',
      'gottman'
    )
  );
