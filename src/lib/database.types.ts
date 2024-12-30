export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          site_id: string
          status: string
          address: string | null
          gps_coordinates: string | null
          start_date: string
          end_date: string | null
          created_at: string
          updated_at: string
          description: string | null
        }
        Insert: {
          id?: string
          name: string
          site_id: string
          status: string
          address?: string | null
          gps_coordinates?: string | null
          start_date: string
          end_date?: string | null
          created_at?: string
          updated_at?: string
          description?: string | null
        }
        Update: {
          id?: string
          name?: string
          site_id?: string
          status?: string
          address?: string | null
          gps_coordinates?: string | null
          start_date?: string
          end_date?: string | null
          created_at?: string
          updated_at?: string
          description?: string | null
        }
      }
      project_statuses: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          icon: string
          color: string
          show_on_dashboard: boolean
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          icon: string
          color: string
          show_on_dashboard?: boolean
          position: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          icon?: string
          color?: string
          show_on_dashboard?: boolean
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
      project_status_steps: {
        Row: {
          id: string
          status_id: string
          name: string
          description: string | null
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          status_id: string
          name: string
          description?: string | null
          position: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          status_id?: string
          name?: string
          description?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
      // ... ostatní tabulky zůstávají stejné
    }
  }
}
