// src/pages/Profile.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// @ts-ignore
import { useFollowUser } from '../hooks/useUserProfile';
// @ts-ignore
import { useEchoStatus } from '../hooks/useEchoStatus';
// @ts-ignore
import { useProfileData } from '../hooks/useProfileData';
// @ts-ignore
import EditProfileModal from '../components/EditProfileModal';
// @ts-ignore
import CropModal from '../components/CropModal'; // ADDED: Import CropModal
// @ts-ignore
import { supabase } from '../assets/lib/supabaseClient';
// @ts-ignore
import useNotifications from '../hooks/useNotifications';
// @ts-ignore
import NotificationBell from '../components/NotificationBell/NotificationBell';
// ADDED: Import BottomNav and useAuth
// @ts-ignore
import BottomNav from '../components/Navigation/BottomNav';
// @ts-ignore
import { useAuth } from '../contexts/AuthContext';
// ADDED: Import enhanced GridItem
// @ts-ignore
import GridItem from '../components/GridItem';
// ADDED: Import Follow Modals
// @ts-ignore
import FollowersModal from '../components/Follow/FollowersModal';
// @ts-ignore
import FollowingModal from '../components/Follow/FollowingModal';

// ADDED: Skeleton Loading Components
const ProfileSkeleton: React.FC = () => (
  <div style={containerStyle}>
    {/* Header Skeleton */}
    <div style={headerStyle}>
      <div style={{
        ...avatarContainerStyle,
        backgroundColor: '#E5E5E5',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
      
      <div style={nameContainerStyle}>
        <div style={{
          width: '160px',
          height: '32px',
          backgroundColor: '#E5E5E5',
          borderRadius: '6px',
          marginBottom: '8px',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
        <div style={{
          width: '120px',
          height: '20px',
          backgroundColor: '#E5E5E5',
          borderRadius: '4px',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
      </div>

      <div style={{
        width: '140px',
        height: '32px',
        backgroundColor: '#E5E5E5',
        borderRadius: '20px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />

      <div style={bioContainerStyle}>
        <div style={{
          width: '280px',
          height: '16px',
          backgroundColor: '#E5E5E5',
          borderRadius: '4px',
          marginBottom: '8px',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
        <div style={{
          width: '240px',
          height: '16px',
          backgroundColor: '#E5E5E5',
          borderRadius: '4px',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
      </div>

      <div style={{
        width: '120px',
        height: '40px',
        backgroundColor: '#E5E5E5',
        borderRadius: '12px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
    </div>

    {/* Stats Skeleton */}
    <div style={statsContainerStyle}>
      {[1, 2, 3].map((item) => (
        <div key={item} style={statItemStyle}>
          <div style={{
            width: '40px',
            height: '24px',
            backgroundColor: '#E5E5E5',
            borderRadius: '4px',
            margin: '0 auto 8px auto',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
          <div style={{
            width: '50px',
            height: '14px',
            backgroundColor: '#E5E5E5',
            borderRadius: '3px',
            margin: '0 auto',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
        </div>
      ))}
    </div>

    {/* Action Buttons Skeleton */}
    <div style={actionsContainerStyle}>
      <div style={{
        flex: 1,
        height: '48px',
        backgroundColor: '#E5E5E5',
        borderRadius: '12px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
      <div style={{
        flex: 1,
        height: '48px',
        backgroundColor: '#E5E5E5',
        borderRadius: '12px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
    </div>

    {/* Tabs Skeleton */}
    <div style={tabsContainerStyle}>
      {[1, 2, 3, 4].map((tab) => (
        <div
          key={tab}
          style={{
            ...tabButtonStyle,
            backgroundColor: '#E5E5E5',
            animation: 'pulse 1.5s ease-in-out infinite',
            height: '36px'
          }}
        />
      ))}
    </div>

    {/* Grid Skeleton */}
    <div style={gridStyle}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          style={{
            aspectRatio: '1',
            backgroundColor: '#E5E5E5',
            borderRadius: '8px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}
        />
      ))}
    </div>
  </div>
);

// ADDED: CSS for skeleton animation
const skeletonStyles = `
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
`;

// ADDED: CSS for avatar hover effects
const avatarHoverStyles = `
  .avatar-container:hover .avatar-overlay {
    opacity: 1 !important;
  }
`;

// Social Media Icon Components (keep existing)
const FacebookIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const PinterestIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.001 12.017 24.001c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
  </svg>
);

// ADDED: Personal Site Icon (Globe icon)
const PersonalSiteIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
);

// ADDED: Helper function to get avatar URL with local storage fallback
const getAvatarUrl = (profile: any, currentUser: any) => {
  if (!profile) return '/placeholder-avatar.png';
  
  // First check local storage for current user's own profile
  if (currentUser && currentUser.id === profile.id) {
    const localAvatar = localStorage.getItem(`user_avatar_${currentUser.id}`);
    if (localAvatar) {
      return localAvatar;
    }
  }
  
  // Fall back to avatar_url from database
  return profile.avatar_url || '/placeholder-avatar.png';
};

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('scenes');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false); // ADDED: Crop modal state
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // FIXED: Type for image URL
  const [currentUser, setCurrentUser] = useState<any>(null);
  // ADDED: Pagination state
  const [visibleItems, setVisibleItems] = useState(8);
  const ITEMS_PER_PAGE = 8;
  // ADDED: Modal state
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  // ADDED: Tooltip state
  const [showAvatarTooltip, setShowAvatarTooltip] = useState(false);
  
  // UPDATED: Added refresh to destructuring
  const { profile, stats, tabContent, isLoading, error, refresh } = useProfileData(id || '');
  const followMutation = useFollowUser(id);
  const { data: echoStatus, isLoading: echoStatusLoading } = useEchoStatus(id || '');
  const { notifyEcho } = useNotifications();
  // ADDED: Use auth context for signOut
  const { signOut } = useAuth();

  // FIXED: Move isOwnProfile declaration before any useEffects that use it
  const isOwnProfile = currentUser?.id === id;
  const shouldShowStats = isOwnProfile || profile?.settings?.public_stats !== false;

  // ADDED: Skeleton styles effect
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = skeletonStyles + avatarHoverStyles;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // ADDED: Check if user is new and show tooltip
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('has_seen_avatar_tooltip');
    if (!hasSeenTooltip && isOwnProfile) {
      setShowAvatarTooltip(true);
      localStorage.setItem('has_seen_avatar_tooltip', 'true');
    }
  }, [isOwnProfile]);

  // ADDED: Reset pagination whenever activeTab changes
  useEffect(() => {
    setVisibleItems(ITEMS_PER_PAGE);
  }, [activeTab]);

  // ADDED: Get the actual avatar URL to display
  const displayAvatarUrl = getAvatarUrl(profile, currentUser);

  // ADDED: Click handler for grid cards
  const handleCardClick = (item: any, type: 'scenes' | 'characters' | 'monologues' | 'frames') => {
    navigate(`/home-feed#${type}-${item.id}`);
  };

  // ADDED: Function to remove profile picture
  const handleRemoveProfilePicture = async () => {
    try {
      if (!currentUser) return;

      // Clear from local storage
      localStorage.removeItem(`user_avatar_${currentUser.id}`);

      // Update profile with null avatar
      await handleSaveProfile({
        ...profile,
        avatar_url: null
      });

      // Refresh to show placeholder
      refresh();
      
    } catch (error) {
      alert('Failed to remove profile picture. Please try again.');
    }
  };

  // Filter tabs based on creative_focus settings
  const availableTabs = ['scenes', 'characters', 'monologues', 'frames'].filter(tab => 
    profile?.settings?.creative_focus?.[tab] !== false
  );

  // Set active tab to first available tab if current active tab is not available
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0]);
      // ADDED: Reset pagination when tab changes
      setVisibleItems(ITEMS_PER_PAGE);
    }
  }, [availableTabs, activeTab]);

  // UPDATED: Check if user has any links (including personal site)
  const hasLinks = profile?.settings?.social_links && (
    profile.settings.social_links.facebook ||
    profile.settings.social_links.instagram ||
    profile.settings.social_links.pinterest ||
    profile.settings.social_links.personal_site
  );

  // ADDED: Show skeleton loading while data is loading
  if (isLoading) {
    return (
      <div style={pageContainerStyle}>
        <ProfileSkeleton />
        <BottomNav />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={pageContainerStyle}>
        <div style={containerStyle}>
          <div style={errorStyle}>User not found</div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Navigation Menu Component - Moved inside main component to fix scope issues
  const NavigationMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleMenu = () => setIsOpen(prev => !prev);
    const closeMenu = () => setIsOpen(false);

    // Close menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          closeMenu();
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const menuItems = [
      { label: 'Stats & Dashboard', path: '/dashboard' },
      { label: 'Drafts', path: '/drafts' },
      { label: 'Settings', path: '/settings' }
    ];

    const handleMenuItemClick = (path: string) => {
      navigate(path);
      closeMenu();
    };

    // ADDED: Handle logout function
    const handleLogout = async () => {
      try {
        setIsLoggingOut(true);
        await signOut();
        // User will be redirected automatically via auth state change
        closeMenu();
      } catch (error) {
        alert('Error signing out. Please try again.');
      } finally {
        setIsLoggingOut(false);
      }
    };

    return (
      <div style={{ position: 'relative' }} ref={menuRef}>
        {/* Three Parallel Lines Icon (Instagram style) */}
        <button
          onClick={toggleMenu}
          aria-label="Navigation menu"
          aria-expanded={isOpen}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {/* Three parallel lines - Instagram style */}
          <div style={{ width: '18px', height: '2px', backgroundColor: '#1A1A1A' }}></div>
          <div style={{ width: '18px', height: '2px', backgroundColor: '#1A1A1A' }}></div>
          <div style={{ width: '18px', height: '2px', backgroundColor: '#1A1A1A' }}></div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '40px',
              right: 0,
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              padding: '8px 0',
              minWidth: '180px',
              zIndex: 1000,
              border: '1px solid rgba(0,0,0,0.08)'
            }}
          >
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleMenuItemClick(item.path)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '12px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: "'Cormorant', serif",
                  fontWeight: 500,
                  color: '#1A1A1A',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FAF8F2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {item.label}
              </button>
            ))}
            
            {/* ADDED: Log Out button with divider */}
            <div style={{
              height: '1px',
              backgroundColor: 'rgba(0,0,0,0.08)',
              margin: '4px 0'
            }}></div>
            
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                padding: '12px 16px',
                textAlign: 'left',
                cursor: isLoggingOut ? 'default' : 'pointer',
                fontSize: '14px',
                fontFamily: "'Cormorant', serif",
                fontWeight: 500,
                color: isLoggingOut ? '#9CA3AF' : '#DC2626',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!isLoggingOut) {
                  e.currentTarget.style.backgroundColor = '#FEF2F2';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {isLoggingOut ? (
                <>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    border: '2px solid transparent',
                    borderTop: '2px solid #9CA3AF',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Signing out...
                </>
              ) : (
                'Log Out'
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  const handleEcho = async () => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    try {
      await followMutation.mutateAsync();
      refresh(); // ADDED: Force refresh profile data to update counts
      
      // UPDATED: Only send notification if user started echoing (was not echoing before)
      if (profile && currentUser && !echoStatus?.isEchoing) {
        notifyEcho(
          profile.id, // The user being echoed (profile owner)
          currentUser.id
        );
      }
    } catch (err) {
    }
  };

  // UPDATED: Enhanced handleWhisper function
  const handleWhisper = () => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    // NAVIGATE to whisper composer with recipient ID
    navigate(`/whisper/${profile.id}`);
  };

  // UPDATED: Complete handleSaveProfile function with Supabase integration and local storage support
  const handleSaveProfile = async (updatedData: any) => {
    try {
      if (!currentUser) {
        alert('You must be logged in to update your profile');
        return;
      }

      // ACTUAL SUPABASE UPDATE
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updatedData.full_name,
          username: updatedData.username, // 👈 ADDED: Save username
          bio: updatedData.bio,
          avatar_url: updatedData.avatar_url, // Keep for database sync
          genre_persona: updatedData.genre_persona,
          expression: updatedData.expression,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      setShowEditModal(false);
      refresh(); // AUTO-REFRESH UI
      
    } catch (err) {
      alert('Failed to update profile. Please try again.');
    }
  };

  // ADDED: Function to handle image selection and open crop modal
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Create URL for the selected image and open crop modal
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setShowCropModal(true);

    } catch (error) {
      alert('Failed to select image. Please try again.');
    }
  };

  // ADDED: Function to handle cropped image save
  const handleCroppedImageSave = async (croppedImageDataUrl: string) => {
    try {
      if (!currentUser) return;

      // Store in local storage
      localStorage.setItem(`user_avatar_${currentUser.id}`, croppedImageDataUrl);

      // Update the profile with the new image (save to database too)
      await handleSaveProfile({
        ...profile,
        avatar_url: croppedImageDataUrl
      });

      // Close crop modal and cleanup
      setShowCropModal(false);
      setSelectedImage(null);
      
      // Revoke the object URL to free memory
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }

    } catch (error) {
      alert('Failed to save image. Please try again.');
    }
  };

  // ADDED: Function to handle crop modal close
  const handleCropModalClose = () => {
    setShowCropModal(false);
    setSelectedImage(null);
    
    // Revoke the object URL to free memory
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
  };

  const getTabDisplayName = (tab: string) => {
    const abbreviations = {
      scenes: 'Scenes',
      characters: 'Chars',
      monologues: 'Monos',
      frames: 'Frames'
    };
    return abbreviations[tab as keyof typeof abbreviations] || tab.charAt(0).toUpperCase() + tab.slice(1);
  };

  // ADDED: Helper function for empty state icons
  const getEmptyStateIcon = () => {
    const icons = {
      scenes: '🎬',
      monologues: '🎭',
      characters: '👤',
      frames: '🖼️'
    };
    return icons[activeTab as keyof typeof icons] || '📝';
  };

  // ADDED: Route mapping function to fix navigation issue
  const getComposerRoute = (tab: string) => {
    const routeMap = {
      scenes: '/compose-scene',
      characters: '/compose-character',
      monologues: '/compose-monologue',
      frames: '/compose-frame'
    };
    return routeMap[tab as keyof typeof routeMap] || '/compose-scene';
  };

  // FIXED: Use the isolated _id from useProfileData to prevent duplicate keys
  const generateUniqueKey = (item: any) => {
    // Use the guaranteed unique _id from useProfileData
    return item._id || `${item._contentType}-${item.id}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // UPDATED: Enhanced renderGridContent function with proper data isolation
  const renderGridContent = () => {
    // Create a fresh copy of the current tab's content to prevent mutation
    const content = [...(tabContent[activeTab as keyof typeof tabContent] || [])];
    const displayedContent = content.slice(0, visibleItems);
    const hasMoreItems = visibleItems < content.length;

    if (content.length === 0) {
      return (
        <div style={emptyStateContainerStyle}>
          <div style={emptyStateIconStyle}>
            {getEmptyStateIcon()}
          </div>
          <div style={emptyStateStyle}>
            No {activeTab} yet
          </div>
          <div style={emptyStateSubtextStyle}>
            {isOwnProfile ? 'Create your first piece to get started' : 'User hasn\'t created any content yet'}
          </div>
          {/* FIXED: Creation CTA Button with correct route mapping */}
          {isOwnProfile && (
            <button
              onClick={() => navigate(getComposerRoute(activeTab))}
              style={createButtonStyle}
            >
              Create Your First {getTabDisplayName(activeTab)}
            </button>
          )}
        </div>
      );
    }
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={gridStyle}>
          {displayedContent.map((item: any) => (
            <GridItem 
              key={generateUniqueKey(item)} // FIXED: Use new key generation without activeTab parameter
              item={item} 
              type={activeTab}
              onCardClick={handleCardClick} // ADDED: Pass click handler
            />
          ))}
        </div>
        
        {/* Load More Button */}
        {hasMoreItems && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            <button
              onClick={() => setVisibleItems(prev => prev + ITEMS_PER_PAGE)}
              style={loadMoreButtonStyle}
            >
              Load More ({content.length - visibleItems} remaining)
            </button>
          </div>
        )}
        
        {/* Show total count when all items loaded */}
        {!hasMoreItems && content.length > 0 && (
          <div style={allItemsLoadedStyle}>
            Showing all {content.length} {activeTab}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={pageContainerStyle}>
      <div style={containerStyle}>
        {/* Header Section */}
        <div style={headerStyle}>
          {/* TOUR ATTRIBUTE ADDED: data-tour="profile-avatar" */}
          <div 
            style={avatarContainerStyle} 
            className="avatar-container"
            data-tour="profile-avatar" // TOUR ATTRIBUTE ADDED
          >
            {displayAvatarUrl === '/placeholder-avatar.png' ? ( // FIXED: Removed && isOwnProfile
              <div style={emptyAvatarStyle}>
                <div style={emptyAvatarIconStyle}>👤</div>
                <div style={emptyAvatarTextStyle}>
                  {isOwnProfile ? 'Add Photo' : 'No Photo'}  {/* FIXED: Conditional text */}
                </div>
              </div>
            ) : (
              <img 
                src={displayAvatarUrl} 
                alt="" 
                style={avatarStyle}
              />
            )}
            
            {/* ADDED: Enhanced image upload overlay for own profile */}
            {isOwnProfile && (
              <div style={avatarOverlayStyle} className="avatar-overlay">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={fileInputStyle}
                  id="avatar-upload"
                />
                <div style={avatarOverlayContentStyle}>
                  <label htmlFor="avatar-upload" style={avatarUploadLabelStyle}>
                    📷 Change
                  </label>
                  {displayAvatarUrl !== '/placeholder-avatar.png' && (
                    <button 
                      onClick={handleRemoveProfilePicture}
                      style={removeAvatarButtonStyle}
                    >
                      🗑️ Remove
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ADDED: Avatar Tooltip for new users */}
          {showAvatarTooltip && (
            <div style={avatarTooltipStyle}>
              <div style={tooltipArrowStyle}></div>
              <p style={tooltipTextStyle}>Tap here to add your profile picture!</p>
              <button 
                onClick={() => setShowAvatarTooltip(false)}
                style={tooltipCloseStyle}
              >
                ×
              </button>
            </div>
          )}
          
          <div style={nameContainerStyle}>
            <h1 style={nameStyle}>{profile.full_name || 'Anonymous'}</h1>
            <div style={usernameStyle}>@{profile.username || 'user'}</div>
          </div>

          <div style={genreBadgeStyle}>
            {profile.genre_persona || 'No genre set'}
          </div>

          {/* FIXED: Only show NotificationBell and NavigationMenu for own profile */}
          {isOwnProfile && (
            <div style={menuContainerStyle}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <NotificationBell profileId={profile?.id} />
                <NavigationMenu />
              </div>
            </div>
          )}

          <div style={bioContainerStyle}>
            <p style={bioStyle}>{profile.bio || 'No bio yet'}</p>
          </div>

          {/* UPDATED: Links Section - Now includes Personal Site */}
          {hasLinks && (
            <div style={socialLinksContainerStyle}>
              {profile.settings.social_links.facebook && (
                <a 
                  href={`https://facebook.com/${profile.settings.social_links.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={socialLinkStyle}
                  aria-label="Facebook"
                >
                  <FacebookIcon />
                </a>
              )}
              {profile.settings.social_links.instagram && (
                <a 
                  href={`https://instagram.com/${profile.settings.social_links.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={socialLinkStyle}
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </a>
              )}
              {profile.settings.social_links.pinterest && (
                <a 
                  href={`https://pinterest.com/${profile.settings.social_links.pinterest}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={socialLinkStyle}
                  aria-label="Pinterest"
                >
                  <PinterestIcon />
                </a>
              )}
              {/* ADDED: Personal Site Link */}
              {profile.settings.social_links.personal_site && (
                <a 
                  href={`https://${profile.settings.social_links.personal_site}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={socialLinkStyle}
                  aria-label="Personal Website"
                >
                  <PersonalSiteIcon />
                </a>
              )}
            </div>
          )}

          {/* FIXED: Wrap Edit Profile button in unconditional container for tour */}
          <div data-tour="profile-edit"> {/* ✅ ALWAYS PRESENT CONTAINER */}
            {isOwnProfile && (
              <button 
                onClick={() => setShowEditModal(true)}
                style={editButtonStyle}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Stats Section - Conditionally Rendered - UPDATED: Completely separate designs */}
        {shouldShowStats ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Row 1: Minimal Social Buttons - Followers & Following */}
            <div style={socialButtonsContainerStyle}>
              <button 
                style={socialButtonStyle}
                onClick={() => setShowFollowersModal(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8F6F0';
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                }}
              >
                <div style={socialButtonContentStyle}>
                  <div style={socialButtonValueStyle}>{stats.followers || 0}</div>
                  <div style={socialButtonLabelStyle}>Followers</div>
                </div>
              </button>
              
              <div style={socialButtonDividerStyle}></div>
              
              <button 
                style={socialButtonStyle}
                onClick={() => setShowFollowingModal(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8F6F0';
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                }}
              >
                <div style={socialButtonContentStyle}>
                  <div style={socialButtonValueStyle}>{stats.following || 0}</div>
                  <div style={socialButtonLabelStyle}>Following</div>
                </div>
              </button>
            </div>

            {/* Row 2: Content Stats - All Content Types */}
            {/* TOUR ATTRIBUTE ADDED: data-tour="profile-stats" */}
            <div 
              style={statsContainerStyle}
              data-tour="profile-stats" // TOUR ATTRIBUTE ADDED
            >
              {/* Scenes & Remakes Container */}
              <div style={combinedStatItemStyle}>
                <div style={combinedStatValueStyle}>
                  <span style={mainStatValueStyle}>{stats.scenes || 0}</span>
                  <span style={secondaryStatValueStyle}>/{stats.remakes || 0}</span>
                </div>
                <div style={combinedStatLabelStyle}>
                  <span>Scenes</span>
                  <span style={secondaryStatLabelStyle}>Remakes</span>
                </div>
              </div>
              <div style={statDividerStyle}></div>

              {/* Characters */}
              <div style={statItemStyle}>
                <div style={statValueStyle}>{stats.characters || 0}</div>
                <div style={statLabelStyle}>Chars</div>
              </div>
              <div style={statDividerStyle}></div>

              {/* Monologues */}
              <div style={statItemStyle}>
                <div style={statValueStyle}>{stats.monologues || 0}</div>
                <div style={statLabelStyle}>Monos</div>
              </div>
              <div style={statDividerStyle}></div>

              {/* Frames */}
              <div style={statItemStyle}>
                <div style={statValueStyle}>{stats.frames || 0}</div>
                <div style={statLabelStyle}>Frames</div>
              </div>
            </div>
          </div>
        ) : (
          <div style={privateStatsContainerStyle}>
            <div style={privateStatsIconStyle}>🔒</div>
            <div style={privateStatsTextStyle}>
              Stats are private
            </div>
            <div style={privateStatsSubtextStyle}>
              This user has chosen to keep their stats private
            </div>
          </div>
        )}

        {/* UPDATED: Action Buttons - Only show for other users' profiles */}
        {!isOwnProfile && (
          <div style={actionsContainerStyle}>
            <button 
              onClick={handleEcho}
              disabled={followMutation.isLoading || echoStatusLoading}
              style={{
                ...echoButtonStyle,
                ...(echoStatus?.isEchoing ? echoButtonActiveStyle : {}),
                ...(followMutation.isLoading ? echoButtonLoadingStyle : {})
              }}
            >
              {followMutation.isLoading ? (
                <div style={loadingSpinnerStyle}></div>
              ) : echoStatus?.isEchoing ? (
                'Following'
              ) : (
                'Follow'
              )}
            </button>
            <button 
              onClick={handleWhisper}
              style={whisperButtonStyle}
            >
              Whisper
            </button>
          </div>
        )}

        {/* Divider */}
        <div style={dividerStyle}>
          <div style={dividerInnerStyle}></div>
        </div>

        {/* Tabs - Filtered by Creative Focus */}
        {availableTabs.length > 0 ? (
          /* TOUR ATTRIBUTE ADDED: data-tour="profile-tabs" */
          <div 
            style={tabsContainerStyle}
            data-tour="profile-tabs" // TOUR ATTRIBUTE ADDED
          >
            {availableTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  ...tabButtonStyle,
                  ...(activeTab === tab ? activeTabButtonStyle : {})
                }}
              >
                {getTabDisplayName(tab)}
              </button>
            ))}
          </div>
        ) : (
          <div style={emptyStateContainerStyle}>
            <div style={emptyStateStyle}>
              No content types enabled
            </div>
            <div style={emptyStateSubtextStyle}>
              {isOwnProfile ? 'Enable content types in Settings to showcase your work' : 'User hasn\'t enabled any content types'}
            </div>
          </div>
        )}

        {/* Content Grid - UPDATED: Uses enhanced GridItem with pagination */}
        {availableTabs.length > 0 && renderGridContent()}

        {/* ADDED: Follow Modals */}
        <FollowersModal
          open={showFollowersModal}
          onClose={() => setShowFollowersModal(false)}
          profileId={id || ''}
        />

        <FollowingModal
          open={showFollowingModal}
          onClose={() => setShowFollowingModal(false)}
          profileId={id || ''}
        />

        {/* ADDED: Crop Modal */}
        <CropModal
          open={showCropModal}
          imageSrc={selectedImage}
          onSave={handleCroppedImageSave}
          onClose={handleCropModalClose}
        />

        <EditProfileModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
          initial={profile}
        />
      </div>

      {/* ADDED: Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

// STYLES - ALL REMAIN EXACTLY THE SAME (keep all your existing styles)
const pageContainerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF8F5 100%)',
  padding: '20px 0',
  paddingBottom: '100px', // ADDED: Space for bottom navigation
};

const containerStyle: React.CSSProperties = {
  width: 375,
  background: '#FFFFFF',
  borderRadius: 20,
  padding: 32,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: 28,
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  margin: '0 auto',
  position: 'relative',
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 16,
  position: 'relative',
};

// Add this new style for the menu container
const menuContainerStyle: React.CSSProperties = {
  position: 'absolute',
  top: '0',
  right: '0'
};

// NEW: Minimal Social Buttons Styles (completely different from stats)
const socialButtonsContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  background: 'transparent',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  borderRadius: 12,
  padding: 0,
  gap: 0,
  width: 'fit-content',
  margin: '0 auto',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
};

const socialButtonStyle: React.CSSProperties = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  borderRadius: 11,
  padding: '12px 20px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '100px',
  fontFamily: "'Cormorant', serif",
};

const socialButtonContentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 2,
};

const socialButtonValueStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: '600',
  color: '#1A1A1A',
  fontFamily: "'Cormorant', serif",
  lineHeight: 1,
};

const socialButtonLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#6B7280',
  fontFamily: "'Cormorant', serif",
  fontWeight: 500,
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
  lineHeight: 1,
};

const socialButtonDividerStyle: React.CSSProperties = {
  width: 1,
  height: 24,
  background: 'rgba(0, 0, 0, 0.08)',
  flexShrink: 0,
};

// NEW: Combined stat styles for Scenes/Remakes
const combinedStatItemStyle: React.CSSProperties = {
  textAlign: 'center',
  flex: 1,
  padding: '12px 8px',
};

const combinedStatValueStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: '700',
  color: '#1A1A1A',
  marginBottom: 4,
  fontFamily: "'Cormorant', serif",
  lineHeight: 1,
};

const mainStatValueStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: '700',
  color: '#1A1A1A',
};

const secondaryStatValueStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: '600',
  color: '#6B7280',
  marginLeft: '2px',
};

const combinedStatLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#6B7280',
  fontFamily: "'Cormorant', serif",
  fontWeight: 500,
  letterSpacing: '0.02em',
  lineHeight: 1.2,
};

const secondaryStatLabelStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#9CA3AF',
  marginLeft: '4px',
};

// NEW: Private Stats Styles
const privateStatsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#FAF8F2',
  borderRadius: 16,
  padding: '24px 16px',
  gap: 12,
  textAlign: 'center',
};

const privateStatsIconStyle: React.CSSProperties = {
  fontSize: '24px',
  marginBottom: '4px',
};

const privateStatsTextStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: '600',
  color: '#6B7280',
  fontFamily: "'Cormorant', serif",
};

const privateStatsSubtextStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#9CA3AF',
  fontFamily: "'Cormorant', serif",
  fontStyle: 'italic',
  lineHeight: 1.4,
};

// Social Links Styles
const socialLinksContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 8,
};

const socialLinkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: '50%',
  color: '#1A1A1A',
  transition: 'all 0.2s ease',
  textDecoration: 'none',
};

const avatarContainerStyle: React.CSSProperties = {
  width: 120,
  height: 120,
  borderRadius: '50%',
  overflow: 'hidden',
  border: '3px solid #FFFFFF',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  position: 'relative',
  cursor: 'pointer', // ADDED: Pointer cursor for better UX
};

const avatarStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

// ADDED: Enhanced styles for avatar upload functionality
const avatarOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.2s ease',
  cursor: 'pointer',
};

const avatarOverlayContentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
};

const fileInputStyle: React.CSSProperties = {
  display: 'none',
};

const avatarUploadLabelStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'white',
  cursor: 'pointer',
  padding: '6px 12px',
  borderRadius: '6px',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  fontFamily: "'Cormorant', serif",
  fontWeight: '500',
};

const removeAvatarButtonStyle: React.CSSProperties = {
  background: 'rgba(220, 38, 38, 0.9)',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  padding: '6px 12px',
  fontSize: '12px',
  cursor: 'pointer',
  fontFamily: "'Cormorant', serif",
  fontWeight: '500',
};

// ADDED: New styles for empty avatar state
const emptyAvatarStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  backgroundColor: '#F3F4F6',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  border: '2px dashed #D1D5DB',
};

const emptyAvatarIconStyle: React.CSSProperties = {
  fontSize: '32px',
  marginBottom: '4px',
  opacity: 0.5,
};

const emptyAvatarTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#6B7280',
  fontFamily: "'Cormorant', serif",
  fontWeight: '500',
};

// ADDED: Tooltip styles
const avatarTooltipStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-80px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: '#1A1A1A',
  color: 'white',
  padding: '12px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: "'Cormorant', serif",
  zIndex: 1000,
  minWidth: '200px',
  textAlign: 'center',
};

const tooltipArrowStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '-8px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 0,
  height: 0,
  borderLeft: '8px solid transparent',
  borderRight: '8px solid transparent',
  borderTop: '8px solid #1A1A1A',
};

const tooltipTextStyle: React.CSSProperties = {
  margin: 0,
  marginBottom: '8px',
};

const tooltipCloseStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'white',
  fontSize: '18px',
  cursor: 'pointer',
  position: 'absolute',
  top: '4px',
  right: '8px',
};

const nameContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const nameStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  fontSize: 28,
  fontWeight: 700,
  color: '#1A1A1A',
  margin: 0,
  letterSpacing: '-0.02em',
};

const usernameStyle: React.CSSProperties = {
  fontFamily: "'Cormorant', serif",
  fontSize: 16,
  color: '#6B7280',
  fontStyle: 'italic',
  opacity: 0.8,
};

const genreBadgeStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #FAF8F2 0%, #F5F3EB 100%)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  borderRadius: 20,
  padding: '8px 20px',
  fontFamily: "'Cormorant', serif",
  fontSize: 15,
  fontWeight: 600,
  color: '#2D2D2A',
  fontStyle: 'italic',
};

const bioContainerStyle: React.CSSProperties = {
  maxWidth: 280,
};

const bioStyle: React.CSSProperties = {
  fontSize: 15,
  color: '#5D5D5A',
  fontStyle: 'italic',
  margin: 0,
  lineHeight: 1.5,
  textAlign: 'center',
  fontFamily: "'Cormorant', serif",
};

const editButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  background: 'transparent',
  border: '1px solid rgba(0,0,0,0.15)',
  borderRadius: 12,
  color: '#4B5563',
  fontSize: 14,
  cursor: 'pointer',
  fontFamily: "'Cormorant', serif",
  fontWeight: 500,
  transition: 'all 0.2s ease',
};

const statsContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  background: '#FAF8F2',
  borderRadius: 16,
  padding: 8,
  gap: 8,
};

const statItemStyle: React.CSSProperties = {
  textAlign: 'center',
  flex: 1,
  padding: '12px 8px',
};

const statValueStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: '700',
  color: '#1A1A1A',
  marginBottom: 4,
  fontFamily: "'Cormorant', serif",
};

const statLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#6B7280',
  fontFamily: "'Cormorant', serif",
  fontWeight: 500,
  letterSpacing: '0.02em',
};

const statDividerStyle: React.CSSProperties = {
  width: 1,
  height: 40,
  background: 'rgba(0, 0, 0, 0.08)',
};

const actionsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  width: '100%',
};

const echoButtonStyle: React.CSSProperties = {
  padding: '14px 20px',
  background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: 12,
  fontSize: 15,
  cursor: 'pointer',
  flex: 1,
  fontFamily: "'Cormorant', serif",
  fontWeight: 600,
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
};

const echoButtonActiveStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  color: '#FFFFFF',
};

const echoButtonLoadingStyle: React.CSSProperties = {
  opacity: 0.7,
};

const whisperButtonStyle: React.CSSProperties = {
  padding: '14px 20px',
  background: '#FFFFFF',
  color: '#1A1A1A',
  border: '1.5px solid rgba(0,0,0,0.2)',
  borderRadius: 12,
  fontSize: 15,
  cursor: 'pointer',
  flex: 1,
  fontFamily: "'Cormorant', serif",
  fontWeight: 600,
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
};

const loadingSpinnerStyle: React.CSSProperties = {
  width: 16,
  height: 16,
  border: '2px solid transparent',
  borderTop: '2px solid #FFFFFF',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const dividerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  padding: '8px 0',
};

const dividerInnerStyle: React.CSSProperties = {
  height: 1,
  width: '60%',
  background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
};

const tabsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: 4,
  background: '#FAF8F2',
  borderRadius: 14,
  padding: 6,
  width: '100%',
  minWidth: 0,
};

const tabButtonStyle: React.CSSProperties = {
  padding: '10px 8px',
  background: 'transparent',
  border: 'none',
  borderRadius: 10,
  fontSize: 12,
  cursor: 'pointer',
  flex: 1,
  fontFamily: "'Cormorant', serif",
  fontWeight: 500,
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#6B7280',
  minWidth: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const activeTabButtonStyle: React.CSSProperties = {
  background: '#FFFFFF',
  color: '#1A1A1A',
  fontWeight: 600,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
};

// UPDATED: Grid styles for enhanced GridItem
const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '16px',
  width: '100%',
};

// NEW: Styles for pagination and enhanced empty states
const emptyStateIconStyle: React.CSSProperties = {
  fontSize: '48px',
  marginBottom: '16px',
  opacity: 0.5
};

// ADDED: Create button style for empty states
const createButtonStyle: React.CSSProperties = {
  padding: '14px 24px',
  background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '12px',
  fontSize: '15px',
  fontFamily: "'Cormorant', serif",
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  marginTop: '16px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
};

const loadMoreButtonStyle: React.CSSProperties = {
  padding: '12px 24px',
  background: '#FAF8F2',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  borderRadius: '8px',
  color: '#1A1A1A',
  fontSize: '14px',
  fontFamily: "'Cormorant', serif",
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const allItemsLoadedStyle: React.CSSProperties = {
  textAlign: 'center',
  fontSize: '12px',
  color: '#9CA3AF',
  fontFamily: "'Cormorant', serif",
  fontStyle: 'italic',
  marginTop: '8px'
};

const emptyStateContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  padding: '60px 20px',
  textAlign: 'center',
};

const emptyStateStyle: React.CSSProperties = {
  color: '#6B7280',
  fontSize: '16px',
  fontFamily: "'Cormorant', serif",
  fontWeight: 500,
};

const emptyStateSubtextStyle: React.CSSProperties = {
  color: '#9CA3AF',
  fontSize: '13px',
  fontFamily: "'Cormorant', serif",
  fontStyle: 'italic',
  lineHeight: 1.4,
};

const errorStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '60px 0',
  color: '#DC2626',
  fontSize: '16px',
  fontFamily: "'Cormorant', serif",
};