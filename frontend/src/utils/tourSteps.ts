export interface TourStep {
  id: string;
  target: string; // CSS selector or data-tour attribute
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  route: string; // Which route this step should be shown on
  action?: 'click' | 'none'; // Optional: if user should interact with the element
}

// This will be populated with actual selectors once we add data-tour attributes
export const tourSteps: TourStep[] = [
  // Home Feed Introduction
  {
    id: 'home-feed-intro',
    target: '[data-tour="home-feed-header"]',
    title: 'Home Feed',
    content: 'Welcome to your creative hub. See scenes, monologues, characters, and frames from creators you follow.',
    position: 'bottom',
    route: '/home-feed'
  },
  
  // Bottom Navigation Tour
  {
    id: 'bottom-nav-home',
    target: '[data-tour="bottom-nav-home"]',
    title: 'Home Button',
    content: 'Tap to return to your home feed anytime. Double-tap to refresh content.',
    position: 'top',
    route: '/home-feed'
  },
  {
    id: 'bottom-nav-whispers',
    target: '[data-tour="bottom-nav-whispers"]',
    title: 'Whispers',
    content: 'Private messages from other creators. Send and receive feedback here.',
    position: 'top',
    route: '/home-feed'
  },
  {
    id: 'bottom-nav-create',
    target: '[data-tour="bottom-nav-create"]',
    title: 'Create Menu',
    content: 'Create scenes, monologues, characters, or frames. Tap to explore all creation options.',
    position: 'top',
    route: '/home-feed',
    action: 'click' // Encourage user to open the menu
  },
  {
    id: 'bottom-nav-profile',
    target: '[data-tour="bottom-nav-profile"]',
    title: 'Your Profile',
    content: 'View your portfolio, stats, and edit your profile.',
    position: 'top',
    route: '/home-feed'
  },
  
  // Profile Page Tour
  {
    id: 'profile-avatar',
    target: '[data-tour="profile-avatar"]',
    title: 'Profile Picture',
    content: 'Add a profile picture to personalize your account. Tap to upload or change.',
    position: 'bottom',
    route: '/profile/:userId' // Will be replaced with actual user ID
  },
  {
    id: 'profile-stats',
    target: '[data-tour="profile-stats"]',
    title: 'Your Creative Stats',
    content: 'Track your scenes, characters, monologues, and frames. Followers can see these if you make them public.',
    position: 'top',
    route: '/profile/:userId'
  },
  {
    id: 'profile-tabs',
    target: '[data-tour="profile-tabs"]',
    title: 'Your Content Tabs',
    content: 'Switch between your scenes, characters, monologues, and frames. Customize which tabs are visible in settings.',
    position: 'bottom',
    route: '/profile/:userId'
  },
  {
    id: 'profile-edit',
    target: '[data-tour="profile-edit"]',
    title: 'Edit Profile',
    content: 'Update your name, bio, genre, expression, and social links.',
    position: 'left',
    route: '/profile/:userId'
  }
];

// Helper function to get steps for current user
export const getTourStepsForUser = (userId?: string): TourStep[] => {
  return tourSteps.map(step => ({
    ...step,
    route: step.route.replace(':userId', userId || 'current')
  }));
};