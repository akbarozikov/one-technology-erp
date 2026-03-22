/** User row shape safe to return from the API (no password hash). */
export type UserPublicRow = {
  id: number;
  email: string | null;
  phone: string | null;
  status: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};
