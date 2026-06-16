insert into public.pro_resources (
  id,
  title,
  description,
  resource_type,
  category,
  url,
  tags,
  status,
  featured,
  display_sections,
  sort_order
)
values
  (
    '11111111-1001-4000-9000-000000000001',
    'Mentoria de casos',
    'Revision individual de casos con un mentor de la red Catholizare Pro.',
    'pagina_mentoria',
    'Revision de casos',
    'https://catholizare.com/mentoria-personalizada/',
    array['mentoria', 'supervision', 'casos'],
    'activo',
    true,
    array['dashboard', 'resources'],
    10
  ),
  (
    '11111111-1001-4000-9000-000000000002',
    'Reuniones clinicas',
    'Espacio mensual para plantear dudas clinicas y recibir retroalimentacion de colegas.',
    'evento_relacionado',
    'Revision de casos',
    'https://profesionales.catholizare.com/discusion-de-casos/',
    array['reuniones', 'casos', 'comunidad'],
    'activo',
    true,
    array['dashboard', 'resources'],
    20
  ),
  (
    '11111111-1001-4000-9000-000000000003',
    'Haz una pregunta',
    'Canal para plantear una pregunta a profesionales de la red Catholizare.',
    'formulario_externo',
    'Recursos clinicos',
    'https://profesionales.catholizare.com/haz-una-pregunta/',
    array['preguntas', 'orientacion', 'red'],
    'activo',
    false,
    array['resources'],
    30
  ),
  (
    '11111111-1001-4000-9000-000000000004',
    'Recursos psicologicos',
    'Respuestas, articulos y recursos para consulta profesional.',
    'pagina_profesionales',
    'Recursos clinicos',
    'https://profesionales.catholizare.com/recursos-psicologicos/',
    array['recursos', 'articulos', 'consulta'],
    'activo',
    true,
    array['dashboard', 'resources'],
    40
  ),
  (
    '11111111-1001-4000-9000-000000000005',
    'Precios Catholizare Pro',
    'Consulta costos y modalidades disponibles para servicios profesionales.',
    'pagina_profesionales',
    'Informacion',
    'https://profesionales.catholizare.com/precios/',
    array['precios', 'servicios', 'informacion'],
    'activo',
    false,
    array['resources'],
    50
  )
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  resource_type = excluded.resource_type,
  category = excluded.category,
  url = excluded.url,
  tags = excluded.tags,
  status = excluded.status,
  featured = excluded.featured,
  display_sections = excluded.display_sections,
  sort_order = excluded.sort_order;

insert into public.pro_banners (
  id,
  title,
  body,
  banner_type,
  cta_label,
  cta_url,
  display_sections,
  status,
  priority,
  dismissible
)
values
  (
    '11111111-2001-4000-9000-000000000001',
    'Revisa tus casos con Catholizare Pro',
    'Programa una revision de casos con mentores de la red para recibir retroalimentacion clinica.',
    'revision_casos',
    'Ver mentoria',
    'https://catholizare.com/mentoria-personalizada/',
    array['dashboard'],
    'activo',
    100,
    true
  ),
  (
    '11111111-2001-4000-9000-000000000002',
    'Reuniones clinicas para profesionales',
    'Consulta las reuniones clinicas disponibles para compartir dudas y revisar casos.',
    'reunion_clinica',
    'Ver reuniones',
    'https://profesionales.catholizare.com/discusion-de-casos/',
    array['dashboard'],
    'activo',
    90,
    true
  ),
  (
    '11111111-2001-4000-9000-000000000003',
    'Recursos clinicos Catholizare',
    'Accede a recursos, respuestas y articulos de apoyo para tu practica profesional.',
    'recurso_destacado',
    'Abrir recursos',
    'https://profesionales.catholizare.com/recursos-psicologicos/',
    array['resources'],
    'activo',
    80,
    true
  )
on conflict (id) do update
set
  title = excluded.title,
  body = excluded.body,
  banner_type = excluded.banner_type,
  cta_label = excluded.cta_label,
  cta_url = excluded.cta_url,
  display_sections = excluded.display_sections,
  status = excluded.status,
  priority = excluded.priority,
  dismissible = excluded.dismissible;
