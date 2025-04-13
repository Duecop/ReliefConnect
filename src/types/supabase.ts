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
      incidents: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          location: {
            lat: number
            lng: number
            address?: string
          }
          status: string
          severity: string
          type: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          location: {
            lat: number
            lng: number
            address?: string
          }
          status?: string
          severity: string
          type: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          location?: {
            lat: number
            lng: number
            address?: string
          }
          status?: string
          severity?: string
          type?: string
        }
      }
      resources: {
        Row: {
          id: string
          created_at: string
          type: string
          name: string
          quantity: number
          location: {
            lat: number
            lng: number
            address?: string
          }
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          type: string
          name: string
          quantity?: number
          location: {
            lat: number
            lng: number
            address?: string
          }
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          type?: string
          name?: string
          quantity?: number
          location?: {
            lat: number
            lng: number
            address?: string
          }
          status?: string
        }
      }
      skills: {
        Row: {
          id: string
          created_at: string
          name: string
          category: string
          description: string | null
          icon: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          category: string
          description?: string | null
          icon?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          category?: string
          description?: string | null
          icon?: string | null
        }
      }
      certifications: {
        Row: {
          id: string
          created_at: string
          name: string
          issuing_organization: string
          description: string | null
          valid_years: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          issuing_organization: string
          description?: string | null
          valid_years?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          issuing_organization?: string
          description?: string | null
          valid_years?: number | null
        }
      }
      volunteers: {
        Row: {
          id: string
          user_id: string
          created_at: string
          name: string
          contact_info: {
            email: string
            phone: string
            address: string
          }
          skills: string[]
          skill_details: Json[]
          certifications: Json[]
          location: {
            lat: number
            lng: number
            address?: string
          }
          status: string
          current_task: string | null
          availability: {
            weekdays: string[]
            hours: {
              start: string
              end: string
            }
            notes: string
          }
          emergency_contact: {
            name: string
            relationship: string
            phone: string
          }
          experience_level: string
          joined_date: string
          profile_photo: string | null
          contribution_points: number
          badges: string[]
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          name: string
          contact_info?: {
            email: string
            phone: string
            address: string
          }
          skills?: string[]
          skill_details?: Json[]
          certifications?: Json[]
          location: {
            lat: number
            lng: number
            address?: string
          }
          status?: string
          current_task?: string | null
          availability?: {
            weekdays: string[]
            hours: {
              start: string
              end: string
            }
            notes: string
          }
          emergency_contact?: {
            name: string
            relationship: string
            phone: string
          }
          experience_level?: string
          joined_date?: string
          profile_photo?: string | null
          contribution_points?: number
          badges?: string[]
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          name?: string
          contact_info?: {
            email: string
            phone: string
            address: string
          }
          skills?: string[]
          skill_details?: Json[]
          certifications?: Json[]
          location?: {
            lat: number
            lng: number
            address?: string
          }
          status?: string
          current_task?: string | null
          availability?: {
            weekdays: string[]
            hours: {
              start: string
              end: string
            }
            notes: string
          }
          emergency_contact?: {
            name: string
            relationship: string
            phone: string
          }
          experience_level?: string
          joined_date?: string
          profile_photo?: string | null
          contribution_points?: number
          badges?: string[]
        }
      }
      teams: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          leader_id: string | null
          members: string[]
          skills_required: string[]
          active: boolean
          incident_id: string | null
          location: {
            lat: number
            lng: number
            address?: string
          } | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          leader_id?: string | null
          members?: string[]
          skills_required?: string[]
          active?: boolean
          incident_id?: string | null
          location?: {
            lat: number
            lng: number
            address?: string
          } | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          leader_id?: string | null
          members?: string[]
          skills_required?: string[]
          active?: boolean
          incident_id?: string | null
          location?: {
            lat: number
            lng: number
            address?: string
          } | null
        }
      }
      tasks: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          status: string
          priority: string
          skills_required: string[]
          assigned_volunteers: string[]
          assigned_team: string | null
          location: {
            lat: number
            lng: number
            address?: string
          } | null
          estimated_duration: number | null
          start_time: string | null
          end_time: string | null
          incident_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          status?: string
          priority?: string
          skills_required?: string[]
          assigned_volunteers?: string[]
          assigned_team?: string | null
          location?: {
            lat: number
            lng: number
            address?: string
          } | null
          estimated_duration?: number | null
          start_time?: string | null
          end_time?: string | null
          incident_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          skills_required?: string[]
          assigned_volunteers?: string[]
          assigned_team?: string | null
          location?: {
            lat: number
            lng: number
            address?: string
          } | null
          estimated_duration?: number | null
          start_time?: string | null
          end_time?: string | null
          incident_id?: string | null
        }
      }
      shifts: {
        Row: {
          id: string
          created_at: string
          volunteer_id: string
          task_id: string | null
          start_time: string
          end_time: string
          status: string
          check_in_time: string | null
          check_out_time: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          volunteer_id: string
          task_id?: string | null
          start_time: string
          end_time: string
          status?: string
          check_in_time?: string | null
          check_out_time?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          volunteer_id?: string
          task_id?: string | null
          start_time?: string
          end_time?: string
          status?: string
          check_in_time?: string | null
          check_out_time?: string | null
          notes?: string | null
        }
      }
      training_materials: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          content_type: string
          content_url: string
          skills_related: string[]
          difficulty_level: string
          estimated_duration: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          content_type: string
          content_url: string
          skills_related?: string[]
          difficulty_level?: string
          estimated_duration?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          content_type?: string
          content_url?: string
          skills_related?: string[]
          difficulty_level?: string
          estimated_duration?: number | null
        }
      }
      volunteer_recognition: {
        Row: {
          id: string
          created_at: string
          volunteer_id: string
          type: string
          title: string
          description: string | null
          issued_by: string
          issued_date: string
          points: number
        }
        Insert: {
          id?: string
          created_at?: string
          volunteer_id: string
          type: string
          title: string
          description?: string | null
          issued_by: string
          issued_date?: string
          points?: number
        }
        Update: {
          id?: string
          created_at?: string
          volunteer_id?: string
          type?: string
          title?: string
          description?: string | null
          issued_by?: string
          issued_date?: string
          points?: number
        }
      }
    }
  }
}