// frame-types.ts
export interface Frame {
  id: string;
  user_id: string;
  scene_id?: string;
  image_url: string;
  notes?: string;
  mood_description?: string;
  image_urls: string[];
  title?: string;
  status: 'draft' | 'published';
  updated_at: string;
  share_count: number;
  like_count: number;
  comment_count: number;
  repost_count: number;
  created_at: string;
}

export interface FrameWithDetails extends Frame {
  // ADDED: Flat properties for consistency with other content types
  user_name?: string;
  user_genre_tag?: string;
  avatar_url?: string;
  
  // EXISTING: Nested user structure (keep for backward compatibility)
  user: {
    id: string;
    username: string;
    avatar_url?: string;
    genre_persona?: string;
    full_name?: string;
  };
  likes?: FrameLike[];
  comments?: FrameComment[];
  reposts?: FrameRepost[];
}

export interface FrameLike {
  id: string;
  user_id: string;
  frame_id: string;
  created_at: string;
}

export interface FrameComment {
  id: string;
  user_id: string;
  frame_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user: {
    username: string;
    avatar_url?: string;
  };
}

export interface FrameRepost {
  id: string;
  user_id: string;
  frame_id: string;
  created_at: string;
}

export interface FrameCardProps {
  frame: FrameWithDetails;
  currentUserId?: string;
  onAction?: (action: string, frameId: string) => void;
}

export interface FrameComposerData {
  image_urls: string[];
  mood_description: string;
  title?: string;
  notes?: string;
  status: 'draft' | 'published';
}