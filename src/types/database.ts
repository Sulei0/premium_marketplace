export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          role: "seller" | "buyer";
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          role: "seller" | "buyer";
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          role?: "seller" | "buyer";
          created_at?: string;
        };
      };
    };
  };
}
