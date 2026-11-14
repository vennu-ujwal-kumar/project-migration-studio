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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      bookmarks: {
        Row: {
          created_at: string
          problem_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          problem_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          problem_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_activity: {
        Row: {
          accepted_count: number
          activity_date: string
          submission_count: number
          user_id: string
        }
        Insert: {
          accepted_count?: number
          activity_date: string
          submission_count?: number
          user_id: string
        }
        Update: {
          accepted_count?: number
          activity_date?: string
          submission_count?: number
          user_id?: string
        }
        Relationships: []
      }
      problem_topics: {
        Row: {
          is_primary: boolean
          problem_id: string
          topic_id: string
        }
        Insert: {
          is_primary?: boolean
          problem_id: string
          topic_id: string
        }
        Update: {
          is_primary?: boolean
          problem_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "problem_topics_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "problem_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      problems: {
        Row: {
          checker_config: Json
          checker_type: string
          constraints: string[]
          created_at: string
          created_by: string | null
          deleted_at: string | null
          difficulty: Database["public"]["Enums"]["problem_difficulty"]
          id: string
          input_format: string
          maximum_score: number
          memory_limit_mb: number
          output_format: string
          primary_topic_id: string | null
          problem_code: string
          schema_version: number
          slug: string
          statement: string
          status: Database["public"]["Enums"]["problem_status"]
          subcategory: string | null
          test_set_version: number
          time_limit_ms: number
          title: string
          updated_at: string
        }
        Insert: {
          checker_config?: Json
          checker_type?: string
          constraints?: string[]
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          difficulty: Database["public"]["Enums"]["problem_difficulty"]
          id?: string
          input_format: string
          maximum_score?: number
          memory_limit_mb: number
          output_format: string
          primary_topic_id?: string | null
          problem_code: string
          schema_version?: number
          slug: string
          statement: string
          status?: Database["public"]["Enums"]["problem_status"]
          subcategory?: string | null
          test_set_version?: number
          time_limit_ms: number
          title: string
          updated_at?: string
        }
        Update: {
          checker_config?: Json
          checker_type?: string
          constraints?: string[]
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          difficulty?: Database["public"]["Enums"]["problem_difficulty"]
          id?: string
          input_format?: string
          maximum_score?: number
          memory_limit_mb?: number
          output_format?: string
          primary_topic_id?: string | null
          problem_code?: string
          schema_version?: number
          slug?: string
          statement?: string
          status?: Database["public"]["Enums"]["problem_status"]
          subcategory?: string | null
          test_set_version?: number
          time_limit_ms?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "problems_primary_topic_id_fkey"
            columns: ["primary_topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          username?: string
        }
        Relationships: []
      }
      public_test_cases: {
        Row: {
          display_order: number
          expected_output: string
          explanation: string | null
          id: string
          input: string
          problem_id: string
        }
        Insert: {
          display_order?: number
          expected_output: string
          explanation?: string | null
          id?: string
          input: string
          problem_id: string
        }
        Update: {
          display_order?: number
          expected_output?: string
          explanation?: string | null
          id?: string
          input?: string
          problem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_test_cases_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          created_at: string
          execution_time_ms: number | null
          failed_tests: number | null
          finished_at: string | null
          first_failure_type: string | null
          id: string
          language: string
          memory_kb: number | null
          passed_tests: number | null
          problem_id: string
          score: number | null
          source_code: string
          status: Database["public"]["Enums"]["submission_status"]
          test_set_version: number
          total_tests: number | null
          user_id: string
          verdict: string | null
        }
        Insert: {
          created_at?: string
          execution_time_ms?: number | null
          failed_tests?: number | null
          finished_at?: string | null
          first_failure_type?: string | null
          id?: string
          language: string
          memory_kb?: number | null
          passed_tests?: number | null
          problem_id: string
          score?: number | null
          source_code: string
          status?: Database["public"]["Enums"]["submission_status"]
          test_set_version?: number
          total_tests?: number | null
          user_id: string
          verdict?: string | null
        }
        Update: {
          created_at?: string
          execution_time_ms?: number | null
          failed_tests?: number | null
          finished_at?: string | null
          first_failure_type?: string | null
          id?: string
          language?: string
          memory_kb?: number | null
          passed_tests?: number | null
          problem_id?: string
          score?: number | null
          source_code?: string
          status?: Database["public"]["Enums"]["submission_status"]
          test_set_version?: number
          total_tests?: number | null
          user_id?: string
          verdict?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_problem_progress: {
        Row: {
          best_score: number
          last_submission_at: string | null
          problem_id: string
          solved_at: string | null
          solved_test_set_version: number | null
          status: Database["public"]["Enums"]["problem_progress_status"]
          user_id: string
        }
        Insert: {
          best_score?: number
          last_submission_at?: string | null
          problem_id: string
          solved_at?: string | null
          solved_test_set_version?: number | null
          status?: Database["public"]["Enums"]["problem_progress_status"]
          user_id: string
        }
        Update: {
          best_score?: number
          last_submission_at?: string | null
          problem_id?: string
          solved_at?: string | null
          solved_test_set_version?: number | null
          status?: Database["public"]["Enums"]["problem_progress_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_problem_progress_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
      app_role: "admin" | "user"
      problem_difficulty: "easy" | "medium" | "hard" | "very_hard"
      problem_progress_status: "attempted" | "solved"
      problem_status: "draft" | "published" | "archived"
      submission_status: "queued" | "running" | "done" | "system_error"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
      problem_difficulty: ["easy", "medium", "hard", "very_hard"],
      problem_progress_status: ["attempted", "solved"],
      problem_status: ["draft", "published", "archived"],
      submission_status: ["queued", "running", "done", "system_error"],
    },
  },
} as const
