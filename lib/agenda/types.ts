export const APPOINTMENT_TYPES = ["presencial", "videollamada"] as const;
export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];

export const APPOINTMENT_STATUSES = ["programada", "completada", "cancelada"] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export type Appointment = {
  id: string;
  professional_id: string;
  patient_id: string;
  process_id: string | null;
  tcc_process_id: string | null;
  tcc_session_plan_item_id: string | null;
  scheduled_at: string;
  duration_minutes: number;
  type: AppointmentType;
  status: AppointmentStatus;
  zoom_meeting_id: string | null;
  zoom_join_url: string | null;
  zoom_start_url: string | null;
  google_calendar_event_id: string | null;
  cancellation_reason: string | null;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
  cancelled_by_user_id: string | null;
};

export type AppointmentListItem = Appointment & {
  patient: {
    full_name: string;
    email: string;
  };
};

export type AgendaPatientOption = {
  id: string;
  full_name: string;
  email: string;
};
