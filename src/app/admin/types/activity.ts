export type ActivityActionType = 
  | "login"
  | "logout"
  | "create_event"
  | "update_event"
  | "delete_event"
  | "create_gallery"
  | "update_gallery"
  | "delete_gallery"
  | "publish_gallery"
  | "unpublish_gallery"
  | "feature_gallery"
  | "unfeature_gallery"
  | "bulk_upload_gallery"
  | "sync_gallery"
  | "update_profile"
  | "create_fundraiser"
  | "update_fundraiser"
  | "delete_fundraiser"
  | "create_blog"
  | "update_blog"
  | "delete_blog"
  | "publish_blog"
  | "unpublish_blog"
  | "update_student_inquiry"
  | "delete_student_inquiry"
  | "create_admin_user"
  | "update_admin_user"
  | "delete_admin_user"
  | "create_faq"
  | "update_faq"
  | "delete_faq"
  | "reorder_faq"
  | "create_announcement"
  | "update_announcement"
  | "delete_announcement";

export interface ActivityLog {
  id: string;
  user_id: string;
  action_type: ActivityActionType;
  resource_type: string | null;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  device_info: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  created_at: string;
  // Joined user data
  user_email?: string;
  user_name?: string;
}

export type ActivityInsert = Omit<ActivityLog, "id" | "created_at" | "user_email" | "user_name">;
