/**
 * Database types for the digital business card app.
 * Follows the exact structure that @supabase/supabase-js expects.
 */

export type Database = {
  public: {
    Tables: {
      cards: {
        Row: {
          id: string
          user_id: string
          slug: string
          first_name: string
          last_name: string
          title: string | null
          organization: string | null
          email: string | null
          phone: string | null
          mobile: string | null
          street: string | null
          city: string | null
          zip: string | null
          country: string | null
          website: string | null
          linkedin: string | null
          xing: string | null
          photo_path: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          slug: string
          first_name: string
          last_name: string
          title?: string | null
          organization?: string | null
          email?: string | null
          phone?: string | null
          mobile?: string | null
          street?: string | null
          city?: string | null
          zip?: string | null
          country?: string | null
          website?: string | null
          linkedin?: string | null
          xing?: string | null
          photo_path?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          slug?: string
          first_name?: string
          last_name?: string
          title?: string | null
          organization?: string | null
          email?: string | null
          phone?: string | null
          mobile?: string | null
          street?: string | null
          city?: string | null
          zip?: string | null
          country?: string | null
          website?: string | null
          linkedin?: string | null
          xing?: string | null
          photo_path?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

/** Convenience alias for a full card row */
export type CardRow = Database['public']['Tables']['cards']['Row']

/** Convenience alias for card insert */
export type CardInsert = Database['public']['Tables']['cards']['Insert']

/** Convenience alias for card update */
export type CardUpdate = Database['public']['Tables']['cards']['Update']
