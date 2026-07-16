export const PRO_RESOURCE_TYPES = [
  "articulo",
  "guia",
  "video",
  "descargable",
  "formulario"
] as const;

export const PRO_BANNER_TYPES = [
  "recurso",
  "evento",
  "informativo",
  "cambios"
] as const;

export const PRO_CONTENT_STATUSES = ["activo", "inactivo"] as const;

export type ProResourceType = (typeof PRO_RESOURCE_TYPES)[number];
export type ProBannerType = (typeof PRO_BANNER_TYPES)[number];
export type ProContentStatus = (typeof PRO_CONTENT_STATUSES)[number];

export const PRO_RESOURCE_TYPE_LABEL: Record<string, string> = {
  articulo: "Articulo",
  guia: "Guia",
  video: "Video",
  descargable: "Descargable",
  formulario: "Formulario",
  formulario_externo: "Formulario",
  enlace_externo: "Enlace externo",
  ficha: "Ficha",
  pagina_profesionales: "Pagina de profesionales",
  pagina_mentoria: "Pagina de mentoria",
  evento_relacionado: "Evento relacionado"
};

export const PRO_BANNER_TYPE_LABEL: Record<string, string> = {
  recurso: "Recurso",
  evento: "Evento",
  informativo: "Informativo",
  cambios: "Cambios",
  recurso_destacado: "Recurso",
  evento_proximo: "Evento",
  anuncio_institucional: "Informativo",
  actualizacion_plataforma: "Cambios",
  mentoria_personalizada: "Mentoria personalizada",
  revision_casos: "Revision de casos",
  contagio_fe: "Contagio de Fe",
  reunion_clinica: "Reunion clinica",
  formacion: "Formacion",
  buena_practica: "Buena practica"
};

export type ProResource = {
  id: string;
  title: string;
  description: string;
  resource_type: ProResourceType;
  category: string;
  url: string;
  image_url: string | null;
  image_storage_path: string | null;
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
  image_storage_path: string | null;
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
  image_url: string | null;
  image_storage_path: string | null;
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

export type PatientAnnouncementResource = Omit<ProResource, "resource_type"> & {
  resource_type: string;
};

export type PatientAnnouncementBanner = Omit<ProBanner, "banner_type"> & {
  banner_type: string;
};

export type PatientAnnouncementEvent = ProEvent;

export type PatientAnnouncementsDashboard = {
  resources: PatientAnnouncementResource[];
  banners: PatientAnnouncementBanner[];
  events: PatientAnnouncementEvent[];
};
