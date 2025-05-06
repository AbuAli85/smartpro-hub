export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          first_name: string | null
          last_name: string | null
          role: "admin" | "client" | "provider"
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          role: "admin" | "client" | "provider"
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          role?: "admin" | "client" | "provider"
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          target_table: string
          target_id: string
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          target_table: string
          target_id: string
          details: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          target_table?: string
          target_id?: string
          details?: Json
          created_at?: string
        }
      }
      // Include other tables as needed
    }
    Functions: {
      check_if_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      check_if_provider: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      check_if_client: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {}
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T]
export type UserRole = "admin" | "client" | "provider"
