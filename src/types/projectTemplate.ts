
export interface ProjectTemplate {
  id: string;
  name: string;
  brief: string;
  milestones: {
    title: string;
    description: string;
    price: number;
    start_date: string;
    end_date: string;
  }[];
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}
