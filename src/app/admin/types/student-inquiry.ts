export type InquiryStatus = "new" | "contacted" | "in_progress" | "closed";

export type ServiceType =
  | "university_shortlisting"
  | "ept"
  | "scholarship"
  | "visa"
  | "loan"
  | "accommodation"
  | "general"
  | "contact";

export interface StudentInquiry {
  id: string;
  // Contact info
  name: string | null;
  email: string | null;
  phone_country_code: string | null;
  phone_number: string | null;
  // Service
  service_type: ServiceType;
  service_title: string | null;
  // University Shortlisting form fields
  destination_country: string | null;
  degree: string | null;
  field_of_study: string | null;
  marks_percentage: number | null;
  backlogs: number | null;
  intake_year: string | null;
  // Notes
  message: string | null;
  sticky_note: string | null;
  // Admin
  status: InquiryStatus;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  // joined
  assignee?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export type StudentInquiryInsert = Omit<StudentInquiry, "id" | "created_at" | "updated_at" | "status">;
