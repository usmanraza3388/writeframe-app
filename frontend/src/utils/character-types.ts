// Character base types matching your database schema
export interface Character {
  id: string;
  user_id: string;
  scene_id: string | null;
  name: string;
  traits: any | null; // JSONB field
  bio: string | null;
  tagline: string | null; // Added in Step 1
  status: 'draft' | 'published'; // Added in Step 1
  created_at: string;
  updated_at: string;
  like_count: number; // ADDED: From database schema
  repost_count: number; // ADDED: From database schema
}

export interface CharacterInsert {
  user_id: string;
  scene_id?: string | null;
  name: string;
  traits?: any | null;
  bio?: string | null;
  tagline?: string | null;
  status?: 'draft' | 'published';
}

export interface CharacterVisualReference {
  id: string;
  character_id: string;
  image_url: string;
  created_at: string;
}

export interface CharacterVisualReferenceInsert {
  character_id: string;
  image_url: string;
}

// ADDED FOR CHARACTER CARD - Display properties from joined queries
export interface CharacterWithDetails extends Character {
  // From profiles table join
  user_name: string;
  user_genre_tag: string;
  avatar_url?: string;
  
  // From character_visual_references table join
  visual_references?: CharacterVisualReference[];
  
  // Engagement counts (will come from character_likes, character_comments tables)
  like_count: number;
  comment_count: number;
  share_count: number;
  // ADDED: Repost engagement
  user_has_reposted?: boolean; // ADDED: User repost state
}

export interface CharacterCardProps {
  character: CharacterWithDetails;
  currentUserId?: string;
  onAction?: (action: string, characterId: string) => void;
}

// ADDED: Repost interfaces matching monologue pattern
export interface CharacterRepost {
  id: string;
  user_id: string;
  character_id: string;
  created_at: string;
}

// ADDED: Feed item interface for HomeFeed integration
export interface CharacterFeedItem {
  id: string;
  user_id: string;
  user_name: string;
  user_genre_tag: string;
  name: string;
  description?: string; // For future use
  personality_traits?: string[]; // For future use
  background_story?: string; // For future use
  appearance?: string; // For future use
  motivations?: string[]; // For future use
  like_count: number;
  comment_count: number;
  share_count: number;
  repost_count: number;
  created_at: string;
  user_has_liked: boolean;
  user_has_reposted: boolean;
  // Character-specific fields
  bio?: string | null;
  tagline?: string | null;
  traits?: any | null;
  visual_references?: CharacterVisualReference[];
  avatar_url?: string;
}

// ADDED: Reposted character interface for RepostedCharacterCard
export interface RepostedCharacterData {
  id: string;
  user_id: string;
  user_name: string;
  user_genre_tag: string;
  created_at: string;
  // Repost-specific engagement
  like_count: number;
  comment_count: number;
  share_count: number;
  original_character: CharacterFeedItem | null;
}