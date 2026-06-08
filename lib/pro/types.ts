export const PRO_RESOURCE_TYPES = [
  "enlace_externo",
  "articulo",
  "ficha",
  "guia",
  "video",
  "descargable",
  "pagina_profesionales",
  "pagina_mentoria",
  "formulario_externo",
  "evento_relacionado"
] as const;

export const PRO_BANNER_TYPES = [
  "recurso_destacado",
  "evento_proximo",
  "mentoria_personalizada",
  "revision_casos",
  "contagio_fe",
  "reunion_clinica",
  "formacion",
  "anuncio_institucional",
  "actualizacion_plataforma",
  "buena_practica"
] as const;

export const PRO_CONTENT_STATUSES = ["activo", "inactivo"] as const;

export type ProResourceType = (typeof PRO_RESOURCE_TYPES)[number];
export type ProBannerType = (typeof PRO_BANNER_TYPES)[number];
export type ProContentStatus = (typeof PRO_CONTENT_STATUSES)[number];

export type ProResource = {
  id: string;
  title: string;
  description: string;
  resource_type: ProResourceType;
  category: string;
  url: string;
  image_url: string | null;
  tags: string[];
  status: ProContentStatus;
  featured: boolean;
  display_sections: string[];
  visible_from: string;
  visible_until: string | null;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProBanner = {
  id: string;
  title: string;
  body: string;
  banner_type: ProBannerType;
  cta_label: string | null;
  cta_url: string | null;
  image_url: string | null;
  display_sections: string[];
  status: ProContentStatus;
  priority: number;
  dismissible: boolean;
  visible_from: string;
  visible_until: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProEvent = {
  id: string;
  title: string;
  description: string;
  event_type: string;
  starts_at: string;
  ends_at: string | null;
  modality: string;
  info_url: string | null;
  registration_url: string | null;
  status: "programado" | "cancelado" | "finalizado";
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfessionalProDashboard = {
  resources: ProResource[];
  banners: ProBanner[];
  events: ProEvent[];
};
