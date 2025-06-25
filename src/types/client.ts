
export interface DatabaseClient {
  id: string;
  user_id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface ClientWithProjectCount extends DatabaseClient {
  project_count: number;
}

export interface CreateClientData {
  name: string;
  email: string;
}

export interface UpdateClientData {
  name?: string;
  email?: string;
}
