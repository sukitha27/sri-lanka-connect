export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      areas: {
        Row: {
          created_at: string
          district: string
          id: string
          name: string
          province: string
        }
        Insert: {
          created_at?: string
          district: string
          id?: string
          name: string
          province: string
        }
        Update: {
          created_at?: string
          district?: string
          id?: string
          name?: string
          province?: string
        }
        Relationships: []
      }
      help_offers: {
        Row: {
          area_id: string
          contact_info: string
          created_at: string
          description: string
          help_type: string
          id: string
          is_available: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          area_id: string
          contact_info: string
          created_at?: string
          description: string
          help_type: string
          id?: string
          is_available?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          area_id?: string
          contact_info?: string
          created_at?: string
          description?: string
          help_type?: string
          id?: string
          is_available?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_offers_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      help_requests: {
        Row: {
          action_notes: string | null
          action_taken: boolean | null
          action_taken_at: string | null
          alternate_phone: string | null
          area_id: string
          building_type: string | null
          contact_info: string
          created_at: string
          description: string
          emergency_type: string | null
          floor_level: string | null
          gps_latitude: number | null
          gps_longitude: number | null
          has_children: boolean | null
          has_disabled: boolean | null
          has_elderly: boolean | null
          has_medical_needs: boolean | null
          id: string
          is_verified: boolean | null
          landmark: string | null
          location_details: string | null
          needs_food: boolean | null
          needs_power: boolean | null
          needs_water: boolean | null
          number_of_people: number | null
          phone_battery_percent: number | null
          safe_for_hours: number | null
          status: Database["public"]["Enums"]["request_status"]
          title: string
          updated_at: string
          user_id: string
          verified_at: string | null
          water_level: string | null
        }
        Insert: {
          action_notes?: string | null
          action_taken?: boolean | null
          action_taken_at?: string | null
          alternate_phone?: string | null
          area_id: string
          building_type?: string | null
          contact_info: string
          created_at?: string
          description: string
          emergency_type?: string | null
          floor_level?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          has_children?: boolean | null
          has_disabled?: boolean | null
          has_elderly?: boolean | null
          has_medical_needs?: boolean | null
          id?: string
          is_verified?: boolean | null
          landmark?: string | null
          location_details?: string | null
          needs_food?: boolean | null
          needs_power?: boolean | null
          needs_water?: boolean | null
          number_of_people?: number | null
          phone_battery_percent?: number | null
          safe_for_hours?: number | null
          status?: Database["public"]["Enums"]["request_status"]
          title: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
          water_level?: string | null
        }
        Update: {
          action_notes?: string | null
          action_taken?: boolean | null
          action_taken_at?: string | null
          alternate_phone?: string | null
          area_id?: string
          building_type?: string | null
          contact_info?: string
          created_at?: string
          description?: string
          emergency_type?: string | null
          floor_level?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          has_children?: boolean | null
          has_disabled?: boolean | null
          has_elderly?: boolean | null
          has_medical_needs?: boolean | null
          id?: string
          is_verified?: boolean | null
          landmark?: string | null
          location_details?: string | null
          needs_food?: boolean | null
          needs_power?: boolean | null
          needs_water?: boolean | null
          number_of_people?: number | null
          phone_battery_percent?: number | null
          safe_for_hours?: number | null
          status?: Database["public"]["Enums"]["request_status"]
          title?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          water_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_requests_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      missing_persons: {
        Row: {
          age: number | null
          area_id: string
          clothing_description: string | null
          contact_info: string
          created_at: string
          description: string
          found_at: string | null
          full_name: string
          gender: string | null
          gps_latitude: number | null
          gps_longitude: number | null
          id: string
          is_found: boolean
          last_seen_date: string | null
          last_seen_location: string | null
          photo_url: string | null
          physical_description: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          area_id: string
          clothing_description?: string | null
          contact_info: string
          created_at?: string
          description: string
          found_at?: string | null
          full_name: string
          gender?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          is_found?: boolean
          last_seen_date?: string | null
          last_seen_location?: string | null
          photo_url?: string | null
          physical_description?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          area_id?: string
          clothing_description?: string | null
          contact_info?: string
          created_at?: string
          description?: string
          found_at?: string | null
          full_name?: string
          gender?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          is_found?: boolean
          last_seen_date?: string | null
          last_seen_location?: string | null
          photo_url?: string | null
          physical_description?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_missing_persons_area"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          area_id: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          area_id?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          area_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weather_alerts: {
        Row: {
          area_id: string
          created_at: string
          created_by: string
          description: string
          id: string
          is_active: boolean
          severity: Database["public"]["Enums"]["alert_severity"]
          title: string
          updated_at: string
        }
        Insert: {
          area_id: string
          created_at?: string
          created_by: string
          description: string
          id?: string
          is_active?: boolean
          severity?: Database["public"]["Enums"]["alert_severity"]
          title: string
          updated_at?: string
        }
        Update: {
          area_id?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          is_active?: boolean
          severity?: Database["public"]["Enums"]["alert_severity"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "weather_alerts_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      alert_severity: "info" | "warning" | "critical"
      app_role: "admin" | "moderator" | "user"
      request_status: "open" | "in_progress" | "fulfilled" | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_severity: ["info", "warning", "critical"],
      app_role: ["admin", "moderator", "user"],
      request_status: ["open", "in_progress", "fulfilled", "closed"],
    },
  },
} as const
