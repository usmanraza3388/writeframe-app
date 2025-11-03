// utils/frameDataMapper.ts
import type { Frame } from './frames';

export interface MappedFrameForCard {
  id: string;
  userName: string;
  userAvatar?: string;
  genre?: string;
  moodDescription?: string | null;
  frameImages: {
    main?: string;
    support?: string;
    mood?: string;
    style?: string;
  };
  likes: number;
  comments: number;
  shares: number;
  isOwner: boolean;
}

/**
 * Maps frame data from API/database format to FrameCard component format
 */
export const mapFrameForCard = (frame: Frame, currentUserId?: string): MappedFrameForCard => {
  // Handle both the frame data and joined profiles data
  const userData = (frame as any).profiles || {};
  
  return {
    id: frame.id,
    userName: userData.username || 'Unknown User',
    userAvatar: userData.avatar_url,
    genre: userData.genre_persona,
    moodDescription: frame.mood_description,
    frameImages: {
      main: frame.image_urls?.[0],
      support: frame.image_urls?.[1],
      mood: frame.image_urls?.[2],
      style: frame.image_urls?.[3]
    },
    likes: frame.like_count || 0,
    comments: frame.comment_count || 0,
    shares: frame.share_count || 0,
    isOwner: frame.user_id === currentUserId
  };
};