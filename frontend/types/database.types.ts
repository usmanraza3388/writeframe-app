// Database types for TypeScript
export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  full_name: string | null;
  genre_persona: string | null;
  expression: string | null;
  email: string | null;
  created_at: string;
}

export interface Scene {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  content_text: string | null;
  image_path: string | null;
  soundtrack_id: string | null;
  share_count: number;
  like_count: number;
  comment_count: number;
  remake_count: number;
  published: boolean;
  is_draft: boolean;
  created_at: string;
}

export interface Soundtrack {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  mood: string;
  duration_seconds: number;
  is_available: boolean;
  created_at: string;
}

export interface SceneMood {
  id: string;
  scene_id: string;
  mood: 'Longing' | 'Nostalgie' | 'Hopeful';
  created_at: string;
}

export interface Like {
  id: string;
  user_id: string;
  scene_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  scene_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface SceneWithRelations extends Scene {
  profiles: Profile;
  soundtracks: Soundtrack | null;
  scene_moods: SceneMood[];
  likes: Like[];
  comments: Comment[];
  user_has_liked: boolean;
}

export interface CreateSceneData {
  title: string;
  content_text: string;
  image_file?: File;
  soundtrack_id?: string;
  moods: string[];
  is_draft: boolean;
}

export interface Monologue {
  id: string;
  user_id: string;
  scene_id: string | null;
  title: string;
  content_text: string;
  published: boolean;
  is_draft: boolean;
  created_at: string;
  soundtrack_id: string | null;
  share_count: number;
  like_count: number;
  comment_count: number;
  repost_count: number; // ADDED: Repost count
  status: string; // ADDED: Status field
}

export interface MonologueEmotionalTag {
  id: string;
  monologue_id: string;
  emotional_tone: string;
  created_at: string;
}

export interface MonologueLike {
  id: string;
  user_id: string;
  monologue_id: string;
  created_at: string;
}

export interface MonologueComment {
  id: string;
  user_id: string;
  monologue_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface MonologueWithRelations extends Monologue {
  profiles: Profile;
  soundtracks: Soundtrack | null;
  monologue_emotional_tags: MonologueEmotionalTag[];
  monologue_likes: MonologueLike[];
  monologue_comments: MonologueComment[];
  user_has_liked: boolean;
  user_has_reposted: boolean; // ADDED: User repost state
}

export interface CreateMonologueData {
  title: string;
  content_text: string;
  emotional_tone?: string;
  soundtrack_id?: string;
  is_draft: boolean;
}