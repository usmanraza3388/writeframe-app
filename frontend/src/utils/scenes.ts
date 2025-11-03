// types/scenes.ts
export interface Scene {
  id: string;
  user_id: string;
  user_name: string;        // "Mason Caldwell"
  user_avatar: string;      // URL to avatar image
  user_genre_tag: string;   // "Neo-Noir Wanderer"
  title: string;            // "Longing"
  description: string;      // "Weighted by bittersweet reflections..."
  image_path: string;       // URL to scene image
  like_count: number;
  comment_count: number;
  share_count: number;
  remake_count: number;
  repost_count: number;     // ADD: For repost functionality
  created_at: string;
  // For overflow menu - check if current user owns this scene
  is_owner?: boolean;
  // ADD: For remake functionality
  original_scene_id?: string; // If present, this scene is a remake of another scene
}

export interface SceneEngagement {
  likes: number;
  comments: number;
  shares: number;
  remakes: number;
  reposts: number;          // ADD: For repost functionality
}