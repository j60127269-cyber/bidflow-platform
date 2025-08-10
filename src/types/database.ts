export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          company: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          company: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          company?: string
          created_at?: string
          updated_at?: string
        }
      }
      contracts: {
        Row: {
          id: string
          title: string
          client: string
          location: string
          value: number
          deadline: string
          category: string
          description: string
          status: 'open' | 'closed' | 'awarded'
          posted_date: string
          requirements: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          client: string
          location: string
          value: number
          deadline: string
          category: string
          description: string
          status?: 'open' | 'closed' | 'awarded'
          posted_date?: string
          requirements?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          client?: string
          location?: string
          value?: number
          deadline?: string
          category?: string
          description?: string
          status?: 'open' | 'closed' | 'awarded'
          posted_date?: string
          requirements?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      bids: {
        Row: {
          id: string
          user_id: string
          contract_id: string
          status: 'active' | 'submitted' | 'won' | 'lost'
          progress: number
          submitted_date: string
          priority: 'high' | 'medium' | 'low'
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contract_id: string
          status?: 'active' | 'submitted' | 'won' | 'lost'
          progress?: number
          submitted_date?: string
          priority?: 'high' | 'medium' | 'low'
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contract_id?: string
          status?: 'active' | 'submitted' | 'won' | 'lost'
          progress?: number
          submitted_date?: string
          priority?: 'high' | 'medium' | 'low'
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      bid_tracking: {
        Row: {
          id: string
          user_id: string
          contract_id: string
          email_alerts: boolean
          sms_alerts: boolean
          push_alerts: boolean
          tracking_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contract_id: string
          email_alerts?: boolean
          sms_alerts?: boolean
          push_alerts?: boolean
          tracking_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contract_id?: string
          email_alerts?: boolean
          sms_alerts?: boolean
          push_alerts?: boolean
          tracking_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'warning' | 'success' | 'error'
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'info' | 'warning' | 'success' | 'error'
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'info' | 'warning' | 'success' | 'error'
          read?: boolean
          created_at?: string
        }
      }
    }
  }
} 