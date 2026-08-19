export interface Faq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type FaqInsert = Omit<Faq, "id" | "created_at" | "updated_at">;
export type FaqUpdate = Partial<FaqInsert>;
