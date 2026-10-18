export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          username: string | null;
          avatar_url: string | null;
          headline: string | null;
          bio: string | null;
          location: string | null;
          role: string;
          experience_level: string | null;
          education: string | null;
          company: string | null;
          website_url: string | null;
          linkedin_url: string | null;
          github_url: string | null;
          portfolio_url: string | null;
          onboarding_status: string;
          onboarding_completed: boolean;
          onboarding_step: number;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          username?: string | null;
          avatar_url?: string | null;
          headline?: string | null;
          bio?: string | null;
          location?: string | null;
          role?: string;
          experience_level?: string | null;
          education?: string | null;
          company?: string | null;
          website_url?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          portfolio_url?: string | null;
          onboarding_status?: string;
          onboarding_completed?: boolean;
          onboarding_step?: number;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          username?: string | null;
          avatar_url?: string | null;
          headline?: string | null;
          bio?: string | null;
          location?: string | null;
          role?: string;
          experience_level?: string | null;
          education?: string | null;
          company?: string | null;
          website_url?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          portfolio_url?: string | null;
          onboarding_status?: string;
          onboarding_completed?: boolean;
          onboarding_step?: number;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      skills: {
        Row: {
          id: string;
          name: string;
          slug: string | null;
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string | null;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string | null;
          category?: string | null;
          created_at?: string;
        };
      };
      user_skills: {
        Row: {
          id: string;
          user_id: string;
          skill_id: string;
          proficiency: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          skill_id: string;
          proficiency?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          skill_id?: string;
          proficiency?: string | null;
          created_at?: string;
        };
      };
      interests: {
        Row: {
          id: string;
          name: string;
          slug: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string | null;
          created_at?: string;
        };
      };
      user_interests: {
        Row: {
          id: string;
          user_id: string;
          interest_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          interest_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          interest_id?: string;
          created_at?: string;
        };
      };
      dots: {
        Row: {
          id: string;
          slug: string;
          name: string;
          role: string;
          description: string;
          avatar_url: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          role: string;
          description: string;
          avatar_url: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          role?: string;
          description?: string;
          avatar_url?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      dot_conversations: {
        Row: {
          id: string;
          user_id: string;
          dot_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          dot_id: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          dot_id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      dot_messages: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string;
          dot_id: string;
          role: string;
          content: string;
          sender_type: string;
          tool_action: string | null;
          tool_data: Json | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          user_id: string;
          dot_id: string;
          role: string;
          content: string;
          sender_type?: string;
          tool_action?: string | null;
          tool_data?: Json | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          user_id?: string;
          dot_id?: string;
          role?: string;
          content?: string;
          sender_type?: string;
          tool_action?: string | null;
          tool_data?: Json | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      dot_tasks: {
        Row: {
          id: string;
          user_id: string;
          dot_id: string;
          conversation_id: string | null;
          task_type: string;
          status: string;
          input: Json;
          result: Json | null;
          error_message: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          dot_id: string;
          conversation_id?: string | null;
          task_type: string;
          status?: string;
          input?: Json;
          result?: Json | null;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          dot_id?: string;
          conversation_id?: string | null;
          task_type?: string;
          status?: string;
          input?: Json;
          result?: Json | null;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      opportunities: {
        Row: {
          id: string;
          created_by: string;
          type: string;
          title: string;
          description: string;
          organization_name: string;
          location: string | null;
          remote: boolean;
          application_url: string | null;
          deadline: string | null;
          status: string;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          type?: string;
          title: string;
          description: string;
          organization_name: string;
          location?: string | null;
          remote?: boolean;
          application_url?: string | null;
          deadline?: string | null;
          status?: string;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string;
          type?: string;
          title?: string;
          description?: string;
          organization_name?: string;
          location?: string | null;
          remote?: boolean;
          application_url?: string | null;
          deadline?: string | null;
          status?: string;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_details: {
        Row: {
          id: string;
          opportunity_id: string;
          employment_type: string | null;
          salary_min: number | null;
          salary_max: number | null;
          currency: string | null;
          experience_level: string | null;
          company_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          opportunity_id: string;
          employment_type?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          currency?: string | null;
          experience_level?: string | null;
          company_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          opportunity_id?: string;
          employment_type?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          currency?: string | null;
          experience_level?: string | null;
          company_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      saved_opportunities: {
        Row: {
          id: string;
          user_id: string;
          opportunity_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          opportunity_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          opportunity_id?: string;
          created_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          opportunity_id: string;
          status: string;
          cover_note: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          opportunity_id: string;
          status?: string;
          cover_note?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          opportunity_id?: string;
          status?: string;
          cover_note?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          slug: string;
          description: string;
          status: string;
          visibility: string;
          cover_image_url: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          slug: string;
          description: string;
          status?: string;
          visibility?: string;
          cover_image_url?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          slug?: string;
          description?: string;
          status?: string;
          visibility?: string;
          cover_image_url?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          created_by: string;
          title: string;
          description: string;
          venue: string | null;
          address: string | null;
          city: string | null;
          country: string | null;
          latitude: number | null;
          longitude: number | null;
          starts_at: string;
          ends_at: string | null;
          registration_url: string | null;
          image_url: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          title: string;
          description: string;
          venue?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          starts_at: string;
          ends_at?: string | null;
          registration_url?: string | null;
          image_url?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string;
          title?: string;
          description?: string;
          venue?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          starts_at?: string;
          ends_at?: string | null;
          registration_url?: string | null;
          image_url?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_attendees: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          status?: string;
          created_at?: string;
        };
      };
      hackathons: {
        Row: {
          id: string;
          created_by: string;
          title: string;
          description: string;
          organizer: string;
          location: string | null;
          remote: boolean;
          starts_at: string;
          ends_at: string;
          registration_deadline: string | null;
          registration_url: string | null;
          website_url: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          title: string;
          description: string;
          organizer: string;
          location?: string | null;
          remote?: boolean;
          starts_at: string;
          ends_at: string;
          registration_deadline?: string | null;
          registration_url?: string | null;
          website_url?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string;
          title?: string;
          description?: string;
          organizer?: string;
          location?: string | null;
          remote?: boolean;
          starts_at?: string;
          ends_at?: string;
          registration_deadline?: string | null;
          registration_url?: string | null;
          website_url?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      communities: {
        Row: {
          id: string;
          created_by: string;
          name: string;
          slug: string;
          description: string;
          image_url: string | null;
          visibility: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          name: string;
          slug: string;
          description: string;
          image_url?: string | null;
          visibility?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string;
          name?: string;
          slug?: string;
          description?: string;
          image_url?: string | null;
          visibility?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          content: string;
          visibility: string;
          community_id: string | null;
          project_id: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          content: string;
          visibility?: string;
          community_id?: string | null;
          project_id?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          content?: string;
          visibility?: string;
          community_id?: string | null;
          project_id?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          parent_comment_id: string | null;
          content: string;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          parent_comment_id?: string | null;
          content: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string;
          parent_comment_id?: string | null;
          content?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      post_reactions: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          reaction_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          reaction_type?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          reaction_type?: string;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          type: string;
          name: string | null;
          avatar_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type?: string;
          name?: string | null;
          avatar_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          name?: string | null;
          avatar_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversation_participants: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          user_id?: string;
          joined_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          message_type: string;
          metadata: Json | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          message_type?: string;
          metadata?: Json | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          message_type?: string;
          metadata?: Json | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      message_reads: {
        Row: {
          id: string;
          message_id: string;
          user_id: string;
          read_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          user_id: string;
          read_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          user_id?: string;
          read_at?: string;
        };
      };
      outreach_leads: {
        Row: {
          id: string;
          user_id: string;
          dot_id: string;
          name: string;
          role: string | null;
          organization: string | null;
          email: string | null;
          profile_url: string | null;
          source: string | null;
          source_url: string | null;
          relevance_reason: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          dot_id: string;
          name: string;
          role?: string | null;
          organization?: string | null;
          email?: string | null;
          profile_url?: string | null;
          source?: string | null;
          source_url?: string | null;
          relevance_reason?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          dot_id?: string;
          name?: string;
          role?: string | null;
          organization?: string | null;
          email?: string | null;
          profile_url?: string | null;
          source?: string | null;
          source_url?: string | null;
          relevance_reason?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      outreach_drafts: {
        Row: {
          id: string;
          user_id: string;
          dot_id: string;
          lead_id: string | null;
          channel: string;
          subject: string | null;
          content: string;
          status: string;
          current_version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          dot_id: string;
          lead_id?: string | null;
          channel?: string;
          subject?: string | null;
          content: string;
          status?: string;
          current_version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          dot_id?: string;
          lead_id?: string | null;
          channel?: string;
          subject?: string | null;
          content?: string;
          status?: string;
          current_version?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      outreach_revisions: {
        Row: {
          id: string;
          draft_id: string;
          version: number;
          content: string;
          instruction: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          draft_id: string;
          version: number;
          content: string;
          instruction?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          draft_id?: string;
          version?: number;
          content?: string;
          instruction?: string | null;
          created_by?: string;
          created_at?: string;
        };
      };
      outreach_approvals: {
        Row: {
          id: string;
          draft_id: string;
          user_id: string;
          status: string;
          approved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          draft_id: string;
          user_id: string;
          status?: string;
          approved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          draft_id?: string;
          user_id?: string;
          status?: string;
          approved_at?: string | null;
          created_at?: string;
        };
      };
      outreach_messages: {
        Row: {
          id: string;
          draft_id: string | null;
          recipient: string;
          channel: string;
          status: string;
          provider_message_id: string | null;
          error_message: string | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          draft_id?: string | null;
          recipient: string;
          channel?: string;
          status?: string;
          provider_message_id?: string | null;
          error_message?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          draft_id?: string | null;
          recipient?: string;
          channel?: string;
          status?: string;
          provider_message_id?: string | null;
          error_message?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          link: string | null;
          metadata: Json | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          link?: string | null;
          metadata?: Json | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          body?: string;
          link?: string | null;
          metadata?: Json | null;
          read_at?: string | null;
          created_at?: string;
        };
      };
      user_connections: {
        Row: {
          id: string;
          requester_id: string;
          recipient_id: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          recipient_id: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          recipient_id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          metadata?: Json | null;
          created_at?: string;
        };
      };
    };
  };
};
