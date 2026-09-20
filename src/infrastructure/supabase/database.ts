export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          organization_id: string
          user_id: string
          role_id: string
          created_at: string
        }
        Insert: {
          organization_id: string
          user_id: string
          role_id: string
          created_at?: string
        }
        Update: {
          organization_id?: string
          user_id?: string
          role_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          is_system: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_system?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_system?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          id: string
          key: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          key: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          key?: string
          name?: string
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          role_id: string
          permission_id: string
          created_at: string
        }
        Insert: {
          role_id: string
          permission_id: string
          created_at?: string
        }
        Update: {
          role_id?: string
          permission_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          id: string
          created_at: string
          actor_id: string | null
          organization_id: string | null
          action: string
          resource_type: string | null
          resource_id: string | null
          status: "success" | "failed"
          metadata: Record<string, string | number | boolean | null>
        }
        Insert: {
          id?: string
          created_at?: string
          actor_id?: string | null
          organization_id?: string | null
          action: string
          resource_type?: string | null
          resource_id?: string | null
          status?: "success" | "failed"
          metadata?: Record<string, string | number | boolean | null>
        }
        Update: {
          id?: string
          created_at?: string
          actor_id?: string | null
          organization_id?: string | null
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          status?: "success" | "failed"
          metadata?: Record<string, string | number | boolean | null>
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          id: string
          organization_id: string
          plan_id: string
          status: string
          start_date: string
          end_date: string | null
          renewal_date: string | null
          canceled_at: string | null
          provider_reference: string | null
          metadata: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          plan_id: string
          status?: string
          start_date?: string
          end_date?: string | null
          renewal_date?: string | null
          canceled_at?: string | null
          provider_reference?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          plan_id?: string
          status?: string
          start_date?: string
          end_date?: string | null
          renewal_date?: string | null
          canceled_at?: string | null
          provider_reference?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          id: string
          organization_id: string
          subscription_id: string | null
          provider: string
          provider_payment_reference: string | null
          status: string
          currency: string
          amount: number | null
          payment_method_type: string | null
          metadata: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          subscription_id?: string | null
          provider: string
          provider_payment_reference?: string | null
          status?: string
          currency: string
          amount?: number | null
          payment_method_type?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          subscription_id?: string | null
          provider?: string
          provider_payment_reference?: string | null
          status?: string
          currency?: string
          amount?: number | null
          payment_method_type?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          id: string
          key: string
          name: string
          description: string | null
          enabled: boolean
          scope: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          name: string
          description?: string | null
          enabled?: boolean
          scope?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          name?: string
          description?: string | null
          enabled?: boolean
          scope?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          organization_id: string | null
          recipient_id: string
          type: string
          title: string
          message: string
          channel: string
          status: string
          metadata: Record<string, unknown>
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          recipient_id: string
          type?: string
          title: string
          message: string
          channel?: string
          status?: string
          metadata?: Record<string, unknown>
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          recipient_id?: string
          type?: string
          title?: string
          message?: string
          channel?: string
          status?: string
          metadata?: Record<string, unknown>
          read_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          id: string
          organization_id: string
          source: string
          event_type: string
          endpoint: string
          status: string
          delivery_status: string
          attempts: number
          last_delivered_at: string | null
          next_retry_at: string | null
          error_category: string | null
          correlation_id: string | null
          metadata: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          source: string
          event_type: string
          endpoint: string
          status?: string
          delivery_status?: string
          attempts?: number
          last_delivered_at?: string | null
          next_retry_at?: string | null
          error_category?: string | null
          correlation_id?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          source?: string
          event_type?: string
          endpoint?: string
          status?: string
          delivery_status?: string
          attempts?: number
          last_delivered_at?: string | null
          next_retry_at?: string | null
          error_category?: string | null
          correlation_id?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          id: string
          organization_id: string
          name: string
          key_prefix: string | null
          key_hash: string
          status: string
          environment: string
          scopes: unknown
          last_used_at: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          key_prefix?: string | null
          key_hash: string
          status?: string
          environment?: string
          scopes?: unknown
          last_used_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          key_prefix?: string | null
          key_hash?: string
          status?: string
          environment?: string
          scopes?: unknown
          last_used_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      background_jobs: {
        Row: {
          id: string
          organization_id: string | null
          type: string
          status: string
          priority: string
          payload: Record<string, unknown>
          result: Record<string, unknown> | null
          attempts: number
          max_attempts: number
          last_error: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          type: string
          status?: string
          priority?: string
          payload?: Record<string, unknown>
          result?: Record<string, unknown> | null
          attempts?: number
          max_attempts?: number
          last_error?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          type?: string
          status?: string
          priority?: string
          payload?: Record<string, unknown>
          result?: Record<string, unknown> | null
          attempts?: number
          max_attempts?: number
          last_error?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "background_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      is_org_member: {
        Args: {
          org_id: string
        }
        Returns: boolean
      }
      has_org_permission: {
        Args: {
          org_id: string
          perm_key: string
        }
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}