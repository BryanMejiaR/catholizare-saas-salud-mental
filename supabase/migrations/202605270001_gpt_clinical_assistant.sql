create type public.ai_function_type as enum (
  'prellenado_paso',
  'conceptualizacion_caso',
  'plan_tratamiento',
  'planeacion_sesion',
  'sugerencia_intervencion',
  'resumen_terapeutico_paciente',
  'analisis_evaluacion_imagen',
  'actualizacion_conceptualizacion_tcc'
);

create type public.ai_session_decision as enum (
  'pendiente',
  'aceptado',
  'editado',
  'rechazado',
  'descartado'
);

create table public.ai_sessions (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles(id) on delete restrict,
  patient_id uuid references public.profiles(id) on delete restrict,
  expediente_id uuid references public.expedientes(id) on delete restrict,
  process_id uuid references public.procesos_terapeuticos(id) on delete restrict,
  step_id text,
  ai_function_type public.ai_function_type not null,
  clinical_context_package jsonb not null default '{}'::jsonb,
  professional_directives text,
  model_provider text not null default 'openai',
  model_name text not null,
  suggested_content text,
  professional_decision public.ai_session_decision not null default 'pendiente',
  published_to_patient_portal boolean not null default false,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_sessions_context_object check (jsonb_typeof(clinical_context_package) = 'object'),
  constraint ai_sessions_acceptance_metadata check (
    professional_decision not in ('aceptado', 'editado')
    or accepted_at is not null
  )
);

create index ai_sessions_professional_idx
on public.ai_sessions(professional_id, created_at desc);

create index ai_sessions_expediente_idx
on public.ai_sessions(expediente_id, created_at desc);

create index ai_sessions_process_idx
on public.ai_sessions(process_id, created_at desc);

create trigger ai_sessions_touch_updated_at
before update on public.ai_sessions
for each row execute function public.touch_updated_at();

alter table public.ai_sessions enable row level security;

create policy "Professionals can read own ai sessions"
on public.ai_sessions for select to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Professionals can create own ai sessions"
on public.ai_sessions for insert to authenticated
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

create policy "Professionals can update own ai decisions"
on public.ai_sessions for update to authenticated
using (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
)
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
);

revoke delete on public.ai_sessions from authenticated, anon;
