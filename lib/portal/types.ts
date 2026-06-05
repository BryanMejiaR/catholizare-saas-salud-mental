export const APPOINTMENT_REQUEST_TYPES = ["cancelacion", "reprogramacion"] as const;
export type AppointmentRequestType = (typeof APPOINTMENT_REQUEST_TYPES)[number];

export type PatientPortalSummary = {
  expediente_id: string;
  content: string;
  source: "manual" | "ia_asistida";
  published_at: string | null;
  professional: {
    full_name: string;
    email: string;
  };
};

export type PortalAppointment = {
  id: string;
  professional_id: string;
  scheduled_at: string;
  duration_minutes: number;
  type: "presencial" | "videollamada";
  status: "programada" | "completada" | "cancelada";
  cancellation_reason: string | null;
  can_join_zoom: boolean;
  can_request_change: boolean;
  can_review: boolean;
  has_review: boolean;
  professional: {
    full_name: string;
    email: string;
  };
};

export type PortalAppointmentRequest = {
  id: string;
  appointment_id: string;
  request_type: AppointmentRequestType;
  status: "recibida" | "revisada" | "resuelta" | "rechazada";
  created_at: string;
};

export type PortalDashboard = {
  summary: PatientPortalSummary | null;
  upcomingAppointments: PortalAppointment[];
  pastAppointments: PortalAppointment[];
  requests: PortalAppointmentRequest[];
};
