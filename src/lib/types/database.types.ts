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
    PostgrestVersion: "10.2.0 (e07807d)"
  }
  public: {
    Tables: {
      _migration_fix_customer_owner_log: {
        Row: {
          fixed_at: string
          old_role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          fixed_at?: string
          old_role: string
          tenant_id: string
          user_id: string
        }
        Update: {
          fixed_at?: string
          old_role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: []
      }
      allergens: {
        Row: {
          created_at: string | null
          describe: string | null
          id: number
          name: string
          number: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          describe?: string | null
          id?: number
          name: string
          number?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          describe?: string | null
          id?: number
          name?: string
          number?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fakturoid_tokens: {
        Row: {
          access_token: string
          account_currency: string | null
          account_email: string | null
          account_id: string | null
          account_name: string | null
          account_plan: string | null
          account_slug: string | null
          account_subdomain: string | null
          created_at: string | null
          expires_at: string
          id: string
          last_used_at: string | null
          refresh_attempts: number | null
          refresh_token: string
          status: string | null
          tenant_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          account_currency?: string | null
          account_email?: string | null
          account_id?: string | null
          account_name?: string | null
          account_plan?: string | null
          account_slug?: string | null
          account_subdomain?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          last_used_at?: string | null
          refresh_attempts?: number | null
          refresh_token: string
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          account_currency?: string | null
          account_email?: string | null
          account_id?: string | null
          account_name?: string | null
          account_plan?: string | null
          account_slug?: string | null
          account_subdomain?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          last_used_at?: string | null
          refresh_attempts?: number | null
          refresh_token?: string
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fakturoid_tokens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          created_at: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      loyalty_tiers: {
        Row: {
          bonus_percent: number
          color: string
          created_at: string | null
          description: string | null
          discount_percent: number
          icon: string
          id: number
          min_orders: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bonus_percent: number
          color: string
          created_at?: string | null
          description?: string | null
          discount_percent: number
          icon: string
          id?: number
          min_orders: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bonus_percent?: number
          color?: string
          created_at?: string | null
          description?: string | null
          discount_percent?: number
          icon?: string
          id?: number
          min_orders?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      menu_allergens: {
        Row: {
          allergen_id: number
          created_at: string | null
          menu_id: string
          updated_at: string | null
        }
        Insert: {
          allergen_id: number
          created_at?: string | null
          menu_id: string
          updated_at?: string | null
        }
        Update: {
          allergen_id?: number
          created_at?: string | null
          menu_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_allergens_allergen_id_fkey"
            columns: ["allergen_id"]
            isOneToOne: false
            referencedRelation: "allergens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_allergens_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_ingredients: {
        Row: {
          created_at: string | null
          ingredient_id: number
          menu_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          ingredient_id: number
          menu_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          ingredient_id?: number
          menu_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_ingredients_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_soups: {
        Row: {
          created_at: string | null
          id: string
          menu_id: string
          menu_version_id: string | null
          name: string
          price: number | null
          soup_number: string
          updated_at: string | null
          vegetarian: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_id: string
          menu_version_id?: string | null
          name: string
          price?: number | null
          soup_number: string
          updated_at?: string | null
          vegetarian?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_id?: string
          menu_version_id?: string | null
          name?: string
          price?: number | null
          soup_number?: string
          updated_at?: string | null
          vegetarian?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_soups_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_soups_menu_version_id_fkey"
            columns: ["menu_version_id"]
            isOneToOne: false
            referencedRelation: "menu_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_variants: {
        Row: {
          created_at: string | null
          description: string
          id: string
          menu_id: string
          menu_version_id: string | null
          price: number | null
          updated_at: string | null
          variant_number: string
          vegetarian: boolean | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          menu_id: string
          menu_version_id?: string | null
          price?: number | null
          updated_at?: string | null
          variant_number: string
          vegetarian?: boolean | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          menu_id?: string
          menu_version_id?: string | null
          price?: number | null
          updated_at?: string | null
          variant_number?: string
          vegetarian?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_variants_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_variants_menu_version_id_fkey"
            columns: ["menu_version_id"]
            isOneToOne: false
            referencedRelation: "menu_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_versions: {
        Row: {
          active: boolean | null
          created_at: string | null
          date: string | null
          id: string
          menu_id: string
          notes: string | null
          nutri: string | null
          soup: string | null
          type: string | null
          updated_at: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          date?: string | null
          id?: string
          menu_id: string
          notes?: string | null
          nutri?: string | null
          soup?: string | null
          type?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          date?: string | null
          id?: string
          menu_id?: string
          notes?: string | null
          nutri?: string | null
          soup?: string | null
          type?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_versions_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          active: boolean | null
          created_at: string | null
          date: string | null
          deleted: boolean
          id: string
          notes: string | null
          nutri: string | null
          soup: string | null
          tenant_id: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          date?: string | null
          deleted?: boolean
          id?: string
          notes?: string | null
          nutri?: string | null
          soup?: string | null
          tenant_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          date?: string | null
          deleted?: boolean
          id?: string
          notes?: string | null
          nutri?: string | null
          soup?: string | null
          tenant_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menus_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          price: number | null
          quantity: number | null
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price?: number | null
          quantity?: number | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price?: number | null
          quantity?: number | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "menu_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          currency: string | null
          customer_city: string | null
          customer_email: string | null
          customer_first_name: string | null
          customer_last_name: string | null
          customer_street: string | null
          customer_street_number: string | null
          customer_telephone: string | null
          customer_zip_code: string | null
          date: string | null
          deleted: boolean
          delivery_city: string | null
          delivery_first_name: string | null
          delivery_last_name: string | null
          delivery_street: string | null
          delivery_street_number: string | null
          delivery_telephone: string | null
          delivery_zip_code: string | null
          fakturoid_data: Json | null
          id: string
          note: string | null
          order_number: string
          pay_method: string | null
          pay_state: boolean | null
          shipping_method: string | null
          state: string | null
          tenant_id: string | null
          total_pieces: number | null
          total_price: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          customer_city?: string | null
          customer_email?: string | null
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_street?: string | null
          customer_street_number?: string | null
          customer_telephone?: string | null
          customer_zip_code?: string | null
          date?: string | null
          deleted?: boolean
          delivery_city?: string | null
          delivery_first_name?: string | null
          delivery_last_name?: string | null
          delivery_street?: string | null
          delivery_street_number?: string | null
          delivery_telephone?: string | null
          delivery_zip_code?: string | null
          fakturoid_data?: Json | null
          id?: string
          note?: string | null
          order_number: string
          pay_method?: string | null
          pay_state?: boolean | null
          shipping_method?: string | null
          state?: string | null
          tenant_id?: string | null
          total_pieces?: number | null
          total_price?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          customer_city?: string | null
          customer_email?: string | null
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_street?: string | null
          customer_street_number?: string | null
          customer_telephone?: string | null
          customer_zip_code?: string | null
          date?: string | null
          deleted?: boolean
          delivery_city?: string | null
          delivery_first_name?: string | null
          delivery_last_name?: string | null
          delivery_street?: string | null
          delivery_street_number?: string | null
          delivery_telephone?: string | null
          delivery_zip_code?: string | null
          fakturoid_data?: Json | null
          id?: string
          note?: string | null
          order_number?: string
          pay_method?: string | null
          pay_state?: boolean | null
          shipping_method?: string | null
          state?: string | null
          tenant_id?: string | null
          total_pieces?: number | null
          total_price?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_suspended: boolean | null
          allergies: boolean | null
          allergies_description: string | null
          avatar_url: string | null
          city: string | null
          company: string | null
          company_email: string | null
          created_at: string | null
          data_deletion_date: string | null
          data_deletion_requested: boolean | null
          data_deletion_scheduled: string | null
          data_deletion_token: string | null
          delivery_method: string | null
          dic: string | null
          email: string | null
          first_name: string | null
          gdpr_consent: boolean | null
          gdpr_consent_date: string | null
          ico: string | null
          id: string
          last_name: string | null
          marketing_consent: boolean | null
          marketing_consent_date: string | null
          newsletter_consent: boolean | null
          newsletter_consent_date: string | null
          payment_method: string | null
          registration_status: string | null
          street: string | null
          street_number: string | null
          table_settings_customers: Json | null
          table_settings_menus: Json | null
          table_settings_orders: Json | null
          telephone: string | null
          tenant_id: string | null
          updated_at: string | null
          user_role: string | null
          username: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          account_suspended?: boolean | null
          allergies?: boolean | null
          allergies_description?: string | null
          avatar_url?: string | null
          city?: string | null
          company?: string | null
          company_email?: string | null
          created_at?: string | null
          data_deletion_date?: string | null
          data_deletion_requested?: boolean | null
          data_deletion_scheduled?: string | null
          data_deletion_token?: string | null
          delivery_method?: string | null
          dic?: string | null
          email?: string | null
          first_name?: string | null
          gdpr_consent?: boolean | null
          gdpr_consent_date?: string | null
          ico?: string | null
          id: string
          last_name?: string | null
          marketing_consent?: boolean | null
          marketing_consent_date?: string | null
          newsletter_consent?: boolean | null
          newsletter_consent_date?: string | null
          payment_method?: string | null
          registration_status?: string | null
          street?: string | null
          street_number?: string | null
          table_settings_customers?: Json | null
          table_settings_menus?: Json | null
          table_settings_orders?: Json | null
          telephone?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_role?: string | null
          username?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          account_suspended?: boolean | null
          allergies?: boolean | null
          allergies_description?: string | null
          avatar_url?: string | null
          city?: string | null
          company?: string | null
          company_email?: string | null
          created_at?: string | null
          data_deletion_date?: string | null
          data_deletion_requested?: boolean | null
          data_deletion_scheduled?: string | null
          data_deletion_token?: string | null
          delivery_method?: string | null
          dic?: string | null
          email?: string | null
          first_name?: string | null
          gdpr_consent?: boolean | null
          gdpr_consent_date?: string | null
          ico?: string | null
          id?: string
          last_name?: string | null
          marketing_consent?: boolean | null
          marketing_consent_date?: string | null
          newsletter_consent?: boolean | null
          newsletter_consent_date?: string | null
          payment_method?: string | null
          registration_status?: string | null
          street?: string | null
          street_number?: string | null
          table_settings_customers?: Json | null
          table_settings_menus?: Json | null
          table_settings_orders?: Json | null
          telephone?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_role?: string | null
          username?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      signup_tokens: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          purpose: string
          tenant_slug: string | null
          token_hash: string
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          purpose: string
          tenant_slug?: string | null
          token_hash: string
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          purpose?: string
          tenant_slug?: string | null
          token_hash?: string
          used_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: number
          key: string
          tenant_id: string | null
          updated_at: string | null
          updated_by: string
          user_id: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: number
          key: string
          tenant_id?: string | null
          updated_at?: string | null
          updated_by: string
          user_id: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: number
          key?: string
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string
          user_id?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings_backup_20260614: {
        Row: {
          created_at: string | null
          id: number | null
          key: string | null
          tenant_id: string | null
          updated_at: string | null
          updated_by: string | null
          user_id: string | null
          value: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: number | null
          key?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
          value?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: number | null
          key?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      soup_allergens: {
        Row: {
          allergen_id: number
          created_at: string | null
          soup_id: string
          updated_at: string | null
        }
        Insert: {
          allergen_id: number
          created_at?: string | null
          soup_id: string
          updated_at?: string | null
        }
        Update: {
          allergen_id?: number
          created_at?: string | null
          soup_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "soup_allergens_allergen_id_fkey"
            columns: ["allergen_id"]
            isOneToOne: false
            referencedRelation: "allergens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soup_allergens_soup_id_fkey"
            columns: ["soup_id"]
            isOneToOne: false
            referencedRelation: "menu_soups"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_members: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          permissions: Json | null
          role: string
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          permissions?: Json | null
          role: string
          tenant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          permissions?: Json | null
          role?: string
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          domain: string
          features: Json | null
          id: string
          name: string
          settings: Json | null
          slug: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          features?: Json | null
          id?: string
          name: string
          settings?: Json | null
          slug: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          features?: Json | null
          id?: string
          name?: string
          settings?: Json | null
          slug?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      texts: {
        Row: {
          created_at: string
          id: number
          page: string | null
          position: string | null
          tenant_id: string | null
          text: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          page?: string | null
          position?: string | null
          tenant_id?: string | null
          text?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          page?: string | null
          position?: string | null
          tenant_id?: string | null
          text?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "texts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      variant_allergens: {
        Row: {
          allergen_id: number
          created_at: string | null
          updated_at: string | null
          variant_id: string
        }
        Insert: {
          allergen_id: number
          created_at?: string | null
          updated_at?: string | null
          variant_id: string
        }
        Update: {
          allergen_id?: number
          created_at?: string | null
          updated_at?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "variant_allergens_allergen_id_fkey"
            columns: ["allergen_id"]
            isOneToOne: false
            referencedRelation: "allergens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variant_allergens_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "menu_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      variant_ingredients: {
        Row: {
          created_at: string | null
          ingredient_id: number
          updated_at: string | null
          variant_id: string
        }
        Insert: {
          created_at?: string | null
          ingredient_id: number
          updated_at?: string | null
          variant_id: string
        }
        Update: {
          created_at?: string | null
          ingredient_id?: number
          updated_at?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "variant_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variant_ingredients_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "menu_variants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_timestamp_columns_and_triggers: { Args: never; Returns: undefined }
      app_admin_tenant_ids: { Args: never; Returns: string[] }
      app_current_user_tenants: { Args: never; Returns: string[] }
      app_customer_tenant_ids: { Args: never; Returns: string[] }
      app_is_platform_super_admin: { Args: never; Returns: boolean }
      cleanup_expired_customer_data: { Args: never; Returns: undefined }
      create_menu_version: {
        Args: {
          p_active: boolean
          p_date: string
          p_menu_id: string
          p_notes: string
          p_nutri: string
          p_soup: string
          p_type: string
        }
        Returns: string
      }
      create_order_with_items: {
        Args: {
          p_created_at: string
          p_currency: string
          p_customer_city: string
          p_customer_email: string
          p_customer_first_name: string
          p_customer_last_name: string
          p_customer_street: string
          p_customer_street_number: string
          p_customer_telephone: string
          p_customer_zip_code: string
          p_date: string
          p_note: string
          p_order_items: Database["public"]["CompositeTypes"]["order_item_input"][]
          p_pay_state: boolean
          p_shipping_method: string
          p_tenant_id: string
          p_total_pieces: number
          p_total_price: number
          p_user_id: string
        }
        Returns: {
          created_at: string
          currency: string
          customer_city: string
          customer_email: string
          customer_first_name: string
          customer_last_name: string
          customer_street: string
          customer_street_number: string
          customer_telephone: string
          customer_zip_code: string
          date: string
          delivery_city: string
          delivery_first_name: string
          delivery_last_name: string
          delivery_street: string
          delivery_street_number: string
          delivery_telephone: string
          delivery_zip_code: string
          fakturoid_data: Json
          id: string
          note: string
          order_number: string
          pay_method: string
          pay_state: boolean
          shipping_method: string
          state: string
          tenant_id: string
          total_pieces: number
          total_price: number
          updated_at: string
          user_id: string
        }[]
      }
      create_order_with_items1: {
        Args: {
          p_created_at: string
          p_currency: string
          p_customer_city: string
          p_customer_email: string
          p_customer_first_name: string
          p_customer_last_name: string
          p_customer_street: string
          p_customer_street_number: string
          p_customer_telephone: string
          p_customer_zip_code: string
          p_date: string
          p_note: string
          p_order_items: Database["public"]["CompositeTypes"]["order_item_input"][]
          p_pay_state: boolean
          p_shipping_method: string
          p_tenant_id: string
          p_total_pieces: number
          p_total_price: number
          p_user_id: string
        }
        Returns: {
          created_at: string
          currency: string
          customer_city: string
          customer_email: string
          customer_first_name: string
          customer_last_name: string
          customer_street: string
          customer_street_number: string
          customer_telephone: string
          customer_zip_code: string
          date: string
          delivery_city: string
          delivery_first_name: string
          delivery_last_name: string
          delivery_street: string
          delivery_street_number: string
          delivery_telephone: string
          delivery_zip_code: string
          fakturoid_data: Json
          id: string
          note: string
          order_number: string
          pay_method: string
          pay_state: boolean
          shipping_method: string
          state: string
          tenant_id: string
          total_pieces: number
          total_price: number
          updated_at: string
          user_id: string
        }[]
      }
      delete_menu:
        | { Args: { p_menu_id: string }; Returns: undefined }
        | {
            Args: { p_menu_id: string; p_tenant_id: string }
            Returns: undefined
          }
      generate_order_number: { Args: never; Returns: string }
      generate_order_number1: { Args: { p_tenant_id: string }; Returns: string }
      get_current_menu_version: { Args: { p_menu_id: string }; Returns: string }
      get_current_tenant_id: { Args: never; Returns: string }
      get_dashboard_stats: {
        Args: { p_from: string; p_tenant_id: string; p_to: string }
        Returns: {
          customers_count: number
          orders_count: number
          orders_total: number
        }[]
      }
      get_menu_version_at_date:
        | { Args: { p_date: string; p_menu_id: string }; Returns: string }
        | {
            Args: { p_date: string; p_menu_id: string; p_tenant_id: string }
            Returns: string
          }
      process_scheduled_data_deletions: { Args: never; Returns: undefined }
      purge_soft_deleted_tenant_members: {
        Args: { p_retention_days?: number }
        Returns: number
      }
      save_menu_version_content: {
        Args: {
          p_menu_allergens?: number[]
          p_menu_id: string
          p_soups?: Json
          p_tenant_id: string
          p_variants: Json
          p_version: Json
        }
        Returns: string
      }
      set_tenant_context: { Args: { tenant_id: string }; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      soft_delete_menu:
        | { Args: { p_menu_id: string }; Returns: undefined }
        | {
            Args: { p_menu_id: string; p_tenant_id: string }
            Returns: undefined
          }
      unaccent: { Args: { "": string }; Returns: string }
      update_order_items: {
        Args: {
          p_items: Database["public"]["CompositeTypes"]["order_item_input_v2"][]
          p_order_id: string
          p_tenant_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      order_item_input: {
        variant_id: string | null
        price: number | null
        quantity: number | null
      }
      order_item_input_v2: {
        id: string | null
        variant_id: string | null
        price: number | null
        quantity: number | null
      }
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
    Enums: {},
  },
} as const
