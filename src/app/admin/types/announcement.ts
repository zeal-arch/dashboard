export interface Announcement {
  id: string;
  message: string;
  expires_at: string;
  created_at: string;
  image_url?: string;
  type?: string;
}

export type AnnouncementInsert = Omit<Announcement, 'id' | 'created_at'>;
export type AnnouncementUpdate = Partial<AnnouncementInsert>;
