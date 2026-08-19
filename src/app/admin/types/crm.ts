export interface Pipeline {
  id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

export interface LeadStage {
  id: string;
  pipeline_id: string;
  name: string;
  order_index: number;
  probability: number;
  color_hex: string;
  is_terminal: boolean;
  sla_hours: number | null;
}

export interface AllowedStageTransition {
  from_stage_id: string;
  to_stage_id: string;
}

export type CrmLeadSource =
  | "organic"
  | "facebook_ad"
  | "google_ad"
  | "youtube_ad"
  | "referral"
  | "walk_in"
  | "webhook"
  | string;

export type LeadEventType =
  | "form_submit"
  | "stage_change"
  | "call_log"
  | "note_added"
  | "email_sent"
  | "whatsapp_sent"
  | "sms_sent"
  | "doc_uploaded"
  | "score_change"
  | "assignment_change"
  | "appointment_booked"
  | "appointment_attended"
  | "opt_out"
  | "duplicate_attempt"
  | "lead_merged"
  | "csv_imported"
  | "task_completed"
  | "application_added"
  | "application_updated"
  | "document_verified"
  | "loan_initialized"
  | "loan_updated"
  | "loan_status_changed";

export interface LeadEvent {
  id: string;
  lead_id: string;
  actor_id: string | null;
  event_type: LeadEventType;
  metadata: Record<string, unknown>;
  created_at: string;
  // joined
  actor?: { full_name: string | null; email: string } | null;
}

export interface CrmLead {
  id: string;
  name: string | null;
  email: string | null;
  phone_country_code: string | null;
  phone_number: string | null;
  // existing service fields
  service_type: string;
  service_title: string | null;
  destination_country: string | null;
  degree: string | null;
  field_of_study: string | null;
  marks_percentage: number | null;
  backlogs: number | null;
  intake_year: string | null;
  // CRM fields
  source: CrmLeadSource;
  source_campaign: string | null;
  target_country: string | null;
  course_interest: string | null;
  current_stage_id: string | null;
  pipeline_id: string | null;
  assigned_to: string | null;
  lead_score: number;
  is_hot: boolean;
  metadata: Record<string, unknown>;
  sticky_note: string | null;
  tags: string[];
  opted_out: boolean;
  consent_given_at: string | null;
  first_response_at: string | null;
  last_contacted_at: string | null;
  last_assigned_at: string | null;
  merged_into_id: string | null;
  status: string;
  is_archived: boolean;
  visited_stage_ids: string[];
  created_at: string;
  updated_at: string;
  // joined data
  stage?: LeadStage | null;
  assignee?: { id: string; full_name: string | null; email: string } | null;
}

export interface CrmUser {
  id: string;
  email: string;
  full_name: string | null;
  role: "super_admin" | "manager" | "counselor";
  is_active: boolean;
  max_leads: number;
  skills: string[];
  last_assigned_at: string | null;
}

// ─── Phase 2 Types ────────────────────────────────────────────────

export type TaskType = "call" | "follow_up" | "send_email" | "review_docs" | "appointment";
export type TaskStatus = "pending" | "done" | "canceled" | "overdue";

export interface LeadTask {
  id: string;
  lead_id: string;
  assigned_to: string;
  created_by: string;
  task_type: TaskType;
  notes: string | null;
  due_at: string;
  completed_at: string | null;
  status: TaskStatus;
  escalation_level: number;
  created_at: string;
  assignee?: { full_name: string | null; email: string } | null;
  lead?: CrmLead | null;
}

export type AppointmentMedium = "video_call" | "phone" | "in_person";
export type AppointmentStatus = "scheduled" | "attended" | "no_show" | "rescheduled" | "canceled";

export interface Appointment {
  id: string;
  lead_id: string;
  counselor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  medium: AppointmentMedium;
  status: AppointmentStatus;
  meeting_link: string | null;
  notes: string | null;
  created_at: string;
  lead?: CrmLead | null;
  counselor?: { full_name: string | null; email: string } | null;
}

export type ApplicationStatus = "applied" | "wait_listed" | "admitted" | "rejected";

export interface LeadApplication {
  id: string;
  lead_id: string;
  university_name: string;
  course_name: string;
  intake: string | null;
  status: ApplicationStatus;
  offer_letter_url: string | null;
  offer_type: "unconditional" | "conditional" | "awaiting" | "rejected";
  tuition_fee_amount: number | null;
  fee_currency: string | null;
  scholarship_name: string | null;
  scholarship_amount: number | null;
  deposit_amount: number | null;
  deposit_deadline: string | null;
  application_portal_url: string | null;
  ielts_requirement: string | null;
  priority_rank: number | null;
  difficulty: "easy" | "moderate" | "competitive" | "reach" | null;
  application_opens_at: string | null;
  deadline: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  lead?: CrmLead | null;
}

export type DocumentFileType = 
  | "passport" 
  | "transcript" 
  | "ielts" 
  | "sop" 
  | "lor" 
  | "visa_copy" 
  | "bank_statement" 
  | "salary_slip" 
  | "it_return" 
  | "property_doc" 
  | "resume"
  | "offer_letter"
  | "pan_card"
  | "aadhaar_card"
  | "other";
export type DocumentVerificationStatus = "pending" | "verified" | "rejected";

export interface LeadDocument {
  id: string;
  lead_id: string;
  uploaded_by: string;
  file_type: DocumentFileType;
  file_url: string;
  file_name: string;
  verification_status: DocumentVerificationStatus;
  rejection_reason: string | null;
  uploaded_at: string;
  uploader?: { full_name: string | null; email: string } | null;
}

export type NotificationType = "new_lead" | "task_due" | "sla_breach" | "assignment" | "meeting_reminder";

export interface CrmNotification {
  id: string;
  user_id: string;
  lead_id: string | null;
  type: NotificationType;
  message: string;
  is_read: boolean;
  created_at: string;
  lead?: { name: string | null; assignee_name?: string | null } | null;
}

export type EducationLoanStatus = "draft" | "documentation" | "bank_submission" | "sanctioned" | "disbursed" | "rejected";

export interface EducationLoanProfile {
  id: string;
  lead_id: string;
  status: EducationLoanStatus;
  
  // Student Details
  full_name: string | null;
  dob: string | null;
  contact_number: string | null;
  email: string | null;
  passport_number: string | null;
  passport_expiry: string | null;
  passport_url: string | null;
  current_address: string | null;
  
  // Academic Details
  highest_qualification: string | null;
  score_10th: number | null;
  score_12th: number | null;
  score_degree: number | null;
  backlogs: number;
  english_test_type: string | null;
  english_test_score: number | null;
  work_experience_years: number;
  resume_url: string | null;
  
  // University Details
  country_applying: string | null;
  university_name: string | null;
  course_name: string | null;
  offer_letter_url: string | null;
  course_duration: string | null;
  
  // Financial Details
  loan_type: "secured" | "unsecured";
  preferred_bank: string | null;
  tuition_fees: number | null;
  living_expenses: number | null;
  scholarship_details: string | null;
  existing_loans_emi: string | null;
  
  // Co-Applicant Details
  co_applicant_name: string | null;
  co_applicant_relationship: string | null;
  co_applicant_occupation: string | null;
  co_applicant_monthly_income: number | null;
  co_applicant_annual_income: number | null;
  salary_slips_url: string | null;
  it_returns_url: string | null;
  bank_statements_url: string | null;
  pan_number: string | null;
  pan_card_url: string | null;
  aadhaar_number: string | null;
  aadhaar_card_url: string | null;
  
  // Property Details
  property_type: string | null;
  property_documents_url: string | null;
  property_value_estimate: number | null;
  mortgage_details: string | null;
  
  created_at: string;
  updated_at: string;
  lead?: { name: string | null; assignee_name?: string | null } | null;
}

export type AccommodationStatus = "gathering_requirements" | "options_shared" | "shortlisted" | "application_initiated" | "contract_sent" | "booked" | "cancelled";

export interface AccommodationProfile {
  id: string;
  lead_id: string;
  status: AccommodationStatus;
  
  // Preferences
  target_city: string | null;
  target_university: string | null;
  budget_per_week: number | null;
  currency: string;
  room_type_preference: string | null;
  move_in_date: string | null;
  tenancy_length_weeks: number | null;
  
  // Booking Details
  property_name: string | null;
  provider: string | null;
  distance_to_university: string | null;
  
  // Guarantor & Financials
  requires_guarantor: boolean;
  guarantor_name: string | null;
  guarantor_contact: string | null;
  guarantor_service_used: string | null;
  deposit_paid: number | null;
  
  created_at: string;
  updated_at: string;
  lead?: { name: string | null; assignee_name?: string | null } | null;
}
