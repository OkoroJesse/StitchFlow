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
      profiles: {
        Row: {
          id: string
          business_name: string | null
          slug: string | null
          logo_url: string | null
          subscription_tier: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          business_name?: string | null
          slug?: string | null
          logo_url?: string | null
          subscription_tier?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string | null
          slug?: string | null
          logo_url?: string | null
          subscription_tier?: string
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          business_id: string
          full_name: string
          phone_number: string | null
          email: string | null
          address: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          full_name: string
          phone_number?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          full_name?: string
          phone_number?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      measurements: {
        Row: {
          id: string
          business_id: string
          customer_id: string
          label: string
          measurements: Json
          is_current: boolean
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          customer_id: string
          label?: string
          measurements: Json
          is_current?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          customer_id?: string
          label?: string
          measurements?: Json
          is_current?: boolean
          created_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          business_id: string
          customer_id: string
          measurement_id: string | null
          title: string
          description: string | null
          agreed_price: number
          delivery_date: string | null
          status: string
          fabric_image_url: string | null
          style_image_url: string | null
          review_token: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          customer_id: string
          measurement_id?: string | null
          title: string
          description?: string | null
          agreed_price?: number
          delivery_date?: string | null
          status?: string
          fabric_image_url?: string | null
          style_image_url?: string | null
          review_token?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          customer_id?: string
          measurement_id?: string | null
          title?: string
          description?: string | null
          agreed_price?: number
          delivery_date?: string | null
          status?: string
          fabric_image_url?: string | null
          style_image_url?: string | null
          review_token?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
