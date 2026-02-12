// ============================================
// Argoth TypeScript Types
// ============================================

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
      topics: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      debates: {
        Row: {
          id: string
          topic_id: string | null
          author_id: string
          title: string
          claim: string
          description: string | null
          side_a_label: string
          side_b_label: string
          created_at: string
          updated_at: string
          is_hidden: boolean
        }
        Insert: {
          id?: string
          topic_id?: string | null
          author_id: string
          title: string
          claim: string
          description?: string | null
          side_a_label?: string
          side_b_label?: string
          created_at?: string
          updated_at?: string
          is_hidden?: boolean
        }
        Update: {
          id?: string
          topic_id?: string | null
          author_id?: string
          title?: string
          claim?: string
          description?: string | null
          side_a_label?: string
          side_b_label?: string
          created_at?: string
          updated_at?: string
          is_hidden?: boolean
        }
      }
      comments: {
        Row: {
          id: string
          debate_id: string
          author_id: string
          body: string
          side: 'A' | 'B' | 'N'
          created_at: string
          updated_at: string
          is_hidden: boolean
        }
        Insert: {
          id?: string
          debate_id: string
          author_id: string
          body: string
          side?: 'A' | 'B' | 'N'
          created_at?: string
          updated_at?: string
          is_hidden?: boolean
        }
        Update: {
          id?: string
          debate_id?: string
          author_id?: string
          body?: string
          side?: 'A' | 'B' | 'N'
          created_at?: string
          updated_at?: string
          is_hidden?: boolean
        }
      }
      votes: {
        Row: {
          id: string
          user_id: string
          target_type: 'debate' | 'comment'
          target_id: string
          value: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          target_type: 'debate' | 'comment'
          target_id: string
          value: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          target_type?: 'debate' | 'comment'
          target_id?: string
          value?: number
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          target_type: 'debate' | 'comment'
          target_id: string
          reason: string
          status: 'open' | 'reviewed' | 'dismissed'
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          target_type: 'debate' | 'comment'
          target_id: string
          reason: string
          status?: 'open' | 'reviewed' | 'dismissed'
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          target_type?: 'debate' | 'comment'
          target_id?: string
          reason?: string
          status?: 'open' | 'reviewed' | 'dismissed'
          created_at?: string
        }
      }
    }
    Views: {
      debates_feed_new: {
        Row: {
          id: string
          topic_id: string | null
          author_id: string
          title: string
          claim: string
          description: string | null
          side_a_label: string
          side_b_label: string
          created_at: string
          updated_at: string
          author_username: string
          author_display_name: string | null
          topic_name: string | null
          topic_slug: string | null
          score: number
          agree_count: number
          disagree_count: number
          total_votes: number
          comment_count: number
        }
      }
      debates_feed_top_24h: {
        Row: {
          id: string
          topic_id: string | null
          author_id: string
          title: string
          claim: string
          description: string | null
          side_a_label: string
          side_b_label: string
          created_at: string
          updated_at: string
          author_username: string
          author_display_name: string | null
          topic_name: string | null
          topic_slug: string | null
          score: number
          agree_count: number
          disagree_count: number
          total_votes: number
          comment_count: number
        }
      }
      debates_feed_top_7d: {
        Row: {
          id: string
          topic_id: string | null
          author_id: string
          title: string
          claim: string
          description: string | null
          side_a_label: string
          side_b_label: string
          created_at: string
          updated_at: string
          author_username: string
          author_display_name: string | null
          topic_name: string | null
          topic_slug: string | null
          score: number
          agree_count: number
          disagree_count: number
          total_votes: number
          comment_count: number
        }
      }
      debates_feed_trending: {
        Row: {
          id: string
          topic_id: string | null
          author_id: string
          title: string
          claim: string
          description: string | null
          side_a_label: string
          side_b_label: string
          created_at: string
          updated_at: string
          author_username: string
          author_display_name: string | null
          topic_name: string | null
          topic_slug: string | null
          score: number
          agree_count: number
          disagree_count: number
          total_votes: number
          comment_count: number
          hot_score: number
        }
      }
    }
    Functions: {
      toggle_vote: {
        Args: {
          p_user_id: string
          p_target_type: string
          p_target_id: string
          p_new_value: number
        }
        Returns: {
          action: string
          new_value: number
        }[]
      }
    }
  }
}

export type Topic = Database['public']['Tables']['topics']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Debate = Database['public']['Tables']['debates']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']
export type Report = Database['public']['Tables']['reports']['Row']

export type DebateFeed = Database['public']['Views']['debates_feed_new']['Row']

export interface DebateWithDetails extends DebateFeed {
  user_vote?: number | null
}

export interface CommentWithDetails extends Comment {
  author_username: string
  author_display_name: string | null
  score: number
  upvote_count: number
  downvote_count: number
  user_vote?: number | null
}

export type SortOption = 'new' | 'top_24h' | 'top_7d' | 'trending'
