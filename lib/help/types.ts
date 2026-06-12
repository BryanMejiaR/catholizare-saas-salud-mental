export const HELP_ARTICLE_STATUSES = ["borrador", "activo", "inactivo"] as const;
export type HelpArticleStatus = (typeof HELP_ARTICLE_STATUSES)[number];

export const SUPPORT_TICKET_PRIORITIES = ["baja", "media", "alta"] as const;
export type SupportTicketPriority = (typeof SUPPORT_TICKET_PRIORITIES)[number];

export const SUPPORT_TICKET_STATUSES = ["abierto", "en_revision", "resuelto", "cerrado"] as const;
export type SupportTicketStatus = (typeof SUPPORT_TICKET_STATUSES)[number];

export const HELP_CONTENT_TYPES = ["articulo", "faq", "guia", "enlace", "asistente"] as const;
export type HelpContentType = (typeof HELP_CONTENT_TYPES)[number];

export type HelpArticle = {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  tags: string[];
  status: HelpArticleStatus;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type SupportTicket = {
  id: string;
  professional_id: string;
  category: string;
  subject: string;
  description: string;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  created_at: string;
  updated_at: string;
};

export type ProfessionalHelpDashboard = {
  articles: HelpArticle[];
  tickets: SupportTicket[];
};

export type AdminHelpDashboard = {
  articles: HelpArticle[];
  tickets: SupportTicket[];
};
