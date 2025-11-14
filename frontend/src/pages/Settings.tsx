// src/pages/Settings.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfileData } from '../hooks/useProfileData';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../assets/lib/supabaseClient';
// ADDED: Import BottomNav
import BottomNav from '../components/Navigation/BottomNav';
import type { Theme } from '../contexts/ThemeContext';

// ADDED: Style definitions at the top
const pageContainerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF8F5 100%)',
  padding: '20px 0',
  paddingBottom: '100px',
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

const menuContainerStyle: React.CSSProperties = {
  position: 'absolute',
  top: '32px',
  right: '32px'
};

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const settingItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 0',
  borderBottom: '1px solid rgba(0,0,0,0.08)',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
};

const creativeFocusOptionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 0',
  borderBottom: '1px solid rgba(0,0,0,0.08)',
};

const themeOptionsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  marginTop: 8,
};

const socialLinkItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 0',
  borderBottom: '1px solid rgba(0,0,0,0.08)',
};

const toggleContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 0',
  borderBottom: '1px solid rgba(0,0,0,0.08)',
};

// ADDED: CSS for skeleton animation
const skeletonStyles = `
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
`;

// ADDED: Skeleton Loading Component
const SettingsSkeleton: React.FC = () => (
  <div style={containerStyle}>
    {/* Header Skeleton */}
    <div style={menuContainerStyle}>
      <div style={{
        width: '32px',
        height: '32px',
        backgroundColor: '#E5E5E5',
        borderRadius: '4px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
    </div>

    <div style={{
      width: '120px',
      height: '32px',
      backgroundColor: '#E5E5E5',
      borderRadius: '6px',
      margin: '0 auto 32px auto',
      animation: 'pulse 1.5s ease-in-out infinite'
    }} />

    {/* Profile Settings Skeleton */}
    <div style={sectionStyle}>
      <div style={{
        width: '140px',
        height: '24px',
        backgroundColor: '#E5E5E5',
        borderRadius: '4px',
        marginBottom: '16px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
      
      {[1, 2].map((item) => (
        <div key={item} style={settingItemStyle}>
          <div style={{
            width: '100px',
            height: '16px',
            backgroundColor: '#E5E5E5',
            borderRadius: '4px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
          <div style={{
            width: '60px',
            height: '16px',
            backgroundColor: '#E5E5E5',
            borderRadius: '4px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
        </div>
      ))}
    </div>

    {/* Creative Focus Skeleton */}
    <div style={sectionStyle}>
      <div style={{
        width: '140px',
        height: '24px',
        backgroundColor: '#E5E5E5',
        borderRadius: '4px',
        marginBottom: '16px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
      
      {[1, 2, 3, 4].map((item) => (
        <div key={item} style={creativeFocusOptionStyle}>
          <div style={{
            width: '120px',
            height: '16px',
            backgroundColor: '#E5E5E5',
            borderRadius: '4px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
          <div style={{
            width: '44px',
            height: '24px',
            backgroundColor: '#E5E5E5',
            borderRadius: '12px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
        </div>
      ))}
    </div>

    {/* Theme Skeleton */}
    <div style={sectionStyle}>
      <div style={{
        width: '80px',
        height: '24px',
        backgroundColor: '#E5E5E5',
        borderRadius: '4px',
        marginBottom: '16px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
      
      <div style={themeOptionsContainerStyle}>
        {[1, 2, 3].map((item) => (
          <div key={item} style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: '#E5E5E5',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
        ))}
      </div>
    </div>

    {/* Social Links Skeleton */}
    <div style={sectionStyle}>
      <div style={{
        width: '120px',
        height: '24px',
        backgroundColor: '#E5E5E5',
        borderRadius: '4px',
        marginBottom: '16px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
      
      {[1, 2, 3].map((item) => (
        <div key={item} style={socialLinkItemStyle}>
          <div style={{
            width: '80px',
            height: '16px',
            backgroundColor: '#E5E5E5',
            borderRadius: '4px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
          <div style={{
            width: '100px',
            height: '16px',
            backgroundColor: '#E5E5E5',
            borderRadius: '4px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
        </div>
      ))}
    </div>

    {/* Notifications Skeleton */}
    <div style={sectionStyle}>
      <div style={{
        width: '120px',
        height: '24px',
        backgroundColor: '#E5E5E5',
        borderRadius: '4px',
        marginBottom: '16px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
      
      {[1, 2].map((item) => (
        <div key={item} style={toggleContainerStyle}>
          <div style={{
            width: '120px',
            height: '16px',
            backgroundColor: '#E5E5E5',
            borderRadius: '4px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
          <div style={{
            width: '44px',
            height: '24px',
            backgroundColor: '#E5E5E5',
            borderRadius: '12px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
        </div>
      ))}
    </div>

    {/* Save Button Skeleton */}
    <div style={{
      width: '100%',
      height: '48px',
      backgroundColor: '#E5E5E5',
      borderRadius: '12px',
      animation: 'pulse 1.5s ease-in-out infinite'
    }} />
  </div>
);

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfileData(user?.id || '');
  const { setTheme } = useTheme();
  
  // Initialize state with user's existing settings or defaults
  const [publicStats, setPublicStats] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<Theme>('default');
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    pinterest: ''
  });
  const [socialLinksVisible, setSocialLinksVisible] = useState({
    facebook: true,
    instagram: true,
    pinterest: true
  });
  const [editingSocialLink, setEditingSocialLink] = useState<string | null>(null);
  const [notifications, setNotifications] = useState({
    echoesRemakes: true,
    promptEmails: false
  });
  const [creativeFocus, setCreativeFocus] = useState({
    scenes: true,
    monologues: true, 
    characters: true,
    frames: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ADDED: Skeleton styles effect
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = skeletonStyles;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Load user settings on component mount
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Get user profile with settings
        const { data: userProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // If user has existing settings, load them
        if (userProfile?.settings) {
          const settings = userProfile.settings;
          setPublicStats(settings.public_stats ?? true);
          setSelectedTheme(settings.theme ?? 'default');
          setSocialLinks(settings.social_links || {
            facebook: '',
            instagram: '',
            pinterest: ''
          });
          setSocialLinksVisible(settings.social_links_visible || {
            facebook: true,
            instagram: true,
            pinterest: true
          });
          setNotifications(settings.notifications || {
            echoesRemakes: true,
            promptEmails: false
          });
          setCreativeFocus(settings.creative_focus || {
            scenes: true, monologues: true, characters: true, frames: true
          });
        }
        
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserSettings();
  }, [user]);

  // Enhanced save function with immediate theme application
  const handleSaveChanges = async () => {
    if (!user) {
      alert('Please sign in to save settings');
      return;
    }

    try {
      setIsSaving(true);
      
      const settingsData = {
        public_stats: publicStats,
        theme: selectedTheme,
        social_links: socialLinks,
        social_links_visible: socialLinksVisible,
        notifications: notifications,
        creative_focus: creativeFocus
      };

      console.log('🔄 Attempting to save settings...');
      console.log('User ID:', user.id);
      console.log('Settings data:', settingsData);

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          settings: settingsData
        })
        .eq('id', user.id)
        .select();

      if (error) {
        console.error('❌ Supabase error:', error);
        console.error('Error details:', error.details, error.hint, error.message);
        throw error;
      }

      console.log('✅ Save successful! Response:', data);
      
      // Apply theme immediately after save
      setTheme(selectedTheme);
      alert('Settings saved successfully!');
      
    } catch (error) {
      console.error('💥 Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Social Links Handlers
  const handleAddSocialLink = (platform: string) => {
    setEditingSocialLink(platform);
    // Initialize with empty string if not already set
    if (!socialLinks[platform as keyof typeof socialLinks]) {
      setSocialLinks(prev => ({
        ...prev,
        [platform]: ''
      }));
    }
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    // Remove any URL prefixes and extract just the username
    let cleanedValue = value.trim();
    
    // Remove common URL prefixes to store only the username
    cleanedValue = cleanedValue
      .replace(/https?:\/\/(www\.)?(facebook|instagram|pinterest)\.com\//, '')
      .replace(/@/, '')
      .trim();

    setSocialLinks(prev => ({
      ...prev,
      [platform]: cleanedValue
    }));
  };

  const handleSocialLinkSave = (platform: string) => {
    if (socialLinks[platform as keyof typeof socialLinks].trim() === '') {
      // If empty, remove the link
      setSocialLinks(prev => ({
        ...prev,
        [platform]: ''
      }));
    }
    setEditingSocialLink(null);
  };

  const handleSocialLinkCancel = (platform: string) => {
    if (socialLinks[platform as keyof typeof socialLinks].trim() === '') {
      // If empty after cancel, remove the link
      setSocialLinks(prev => ({
        ...prev,
        [platform]: ''
      }));
    }
    setEditingSocialLink(null);
  };

  const handleSocialLinkToggle = (platform: string) => {
    setSocialLinksVisible(prev => ({
      ...prev,
      [platform]: !prev[platform as keyof typeof socialLinksVisible]
    }));
  };

  const handleNotificationToggle = (type: string) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type as keyof typeof notifications]
    }));
  };

  // Navigation Menu Component - Exact copy from Profile.tsx
  const NavigationMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
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
      { label: 'Profile', path: '/profile' }
    ];

    const handleMenuItemClick = (path: string) => {
      navigate(path);
      closeMenu();
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
          </div>
        )}
      </div>
    );
  };

  // Additional Styles (for the main component)
  const headerStyle: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28,
    fontWeight: 700,
    color: '#1A1A1A',
    textAlign: 'center',
    margin: 0,
    letterSpacing: '-0.02em',
  };

  const sectionHeaderStyle: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif",
    fontSize: 20,
    fontWeight: 600,
    color: '#1A1A1A',
    margin: 0,
  };

  const settingLabelStyle: React.CSSProperties = {
    fontFamily: "'Cormorant', serif",
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: 500,
  };

  const settingValueStyle: React.CSSProperties = {
    fontFamily: "'Cormorant', serif",
    fontSize: 16,
    color: '#6B7280',
    fontStyle: 'italic',
  };

  const chevronStyle: React.CSSProperties = {
    fontFamily: "'Cormorant', serif",
    fontSize: 18,
    color: '#6B7280',
    fontWeight: 'bold',
  };

  // Toggle Styles
  const toggleStyle = (isOn: boolean): React.CSSProperties => ({
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: isOn ? '#1A1A1A' : '#E5E5E5',
    position: 'relative',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  });

  const toggleKnobStyle = (isOn: boolean): React.CSSProperties => ({
    width: 18,
    height: 18,
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 3,
    left: isOn ? 23 : 3,
    transition: 'left 0.2s',
  });

  // Theme Selection Styles
  const themeOptionStyle = (theme: string): React.CSSProperties => ({
    flex: 1,
    padding: '12px 16px',
    borderRadius: 12,
    border: selectedTheme === theme ? '2px solid #1A1A1A' : '1px solid rgba(0,0,0,0.12)',
    backgroundColor: selectedTheme === theme ? '#FAF8F2' : '#FFFFFF',
    cursor: 'pointer',
    textAlign: 'center',
    fontFamily: "'Cormorant', serif",
    fontSize: 14,
    fontWeight: selectedTheme === theme ? 600 : 400,
    color: '#1A1A1A',
    transition: 'all 0.2s ease',
  });

  // Social Links Styles
  const socialLinkLabelStyle: React.CSSProperties = {
    fontFamily: "'Cormorant', serif",
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: 500,
    minWidth: 80,
  };

  const socialLinkInputStyle: React.CSSProperties = {
    flex: 1,
    border: '1px solid rgba(0,0,0,0.12)',
    background: '#FAF8F2',
    outline: 'none',
    fontFamily: "'Cormorant', serif",
    fontSize: 14,
    color: '#1A1A1A',
    padding: '8px 12px',
    borderRadius: 8,
    marginRight: 8,
    maxWidth: '120px',
    boxSizing: 'border-box',
  };

  const socialLinkActionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: 8,
  };

  const socialLinkButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontFamily: "'Cormorant', serif",
    fontSize: 12,
    color: '#6B7280',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 4,
  };

  const addLinkButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontFamily: "'Cormorant', serif",
    fontSize: 14,
    color: '#6B7280',
    cursor: 'pointer',
    fontStyle: 'italic',
  };

  const socialLinkDisplayStyle: React.CSSProperties = {
    flex: 1,
    textAlign: 'right',
    fontFamily: "'Cormorant', serif",
    fontSize: 14,
    color: '#6B7280',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100px',
  };

  // Creative Focus Styles
  const creativeFocusContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginTop: 8,
  };

  const creativeFocusLabelStyle: React.CSSProperties = {
    fontFamily: "'Cormorant', serif",
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: 500,
  };

  // Save Button Styles
  const saveButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px 20px',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 12,
    fontFamily: "'Cormorant', serif",
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: 8,
  };

  // ADDED: Show skeleton loading while data is loading
  if (isLoading) {
    return (
      <div style={pageContainerStyle}>
        <SettingsSkeleton />
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={pageContainerStyle}>
      <div style={containerStyle}>
        {/* Navigation Menu - Same as Profile.tsx */}
        <div style={menuContainerStyle}>
          <NavigationMenu />
        </div>

        {/* Header - Consistent with Profile page */}
        <h1 style={headerStyle}>Settings</h1>
        
        {/* Profile Settings Section */}
        <div style={sectionStyle}>
          <h2 style={sectionHeaderStyle}>Profile Settings</h2>
          
          {/* Genre Identity - Using actual user data */}
          <div style={settingItemStyle}>
            <div style={settingLabelStyle}>Genre Identity</div>
            <div style={settingValueStyle}>
              {profile?.genre_persona || 'Not set'}
            </div>
            <div style={chevronStyle}>›</div>
          </div>

          {/* Public Stats Toggle */}
          <div style={toggleContainerStyle}>
            <div style={settingLabelStyle}>Public Stats</div>
            <div 
              style={toggleStyle(publicStats)}
              onClick={() => setPublicStats(!publicStats)}
            >
              <div style={toggleKnobStyle(publicStats)} />
            </div>
          </div>
        </div>

        {/* Creative Focus Section */}
        <div style={sectionStyle}>
          <h2 style={sectionHeaderStyle}>Creative Focus</h2>
          <div style={creativeFocusContainerStyle}>
            {/* Scene Cards */}
            <div style={creativeFocusOptionStyle}>
              <div style={creativeFocusLabelStyle}>Scene Cards</div>
              <div 
                style={toggleStyle(creativeFocus.scenes)}
                onClick={() => setCreativeFocus(prev => ({...prev, scenes: !prev.scenes}))}
              >
                <div style={toggleKnobStyle(creativeFocus.scenes)} />
              </div>
            </div>

            {/* Monologues */}
            <div style={creativeFocusOptionStyle}>
              <div style={creativeFocusLabelStyle}>Monologues</div>
              <div 
                style={toggleStyle(creativeFocus.monologues)}
                onClick={() => setCreativeFocus(prev => ({...prev, monologues: !prev.monologues}))}
              >
                <div style={toggleKnobStyle(creativeFocus.monologues)} />
              </div>
            </div>

            {/* Character Writing */}
            <div style={creativeFocusOptionStyle}>
              <div style={creativeFocusLabelStyle}>Character Writing</div>
              <div 
                style={toggleStyle(creativeFocus.characters)}
                onClick={() => setCreativeFocus(prev => ({...prev, characters: !prev.characters}))}
              >
                <div style={toggleKnobStyle(creativeFocus.characters)} />
              </div>
            </div>

            {/* Frames */}
            <div style={creativeFocusOptionStyle}>
              <div style={creativeFocusLabelStyle}>Cinematic Frames</div>
              <div 
                style={toggleStyle(creativeFocus.frames)}
                onClick={() => setCreativeFocus(prev => ({...prev, frames: !prev.frames}))}
              >
                <div style={toggleKnobStyle(creativeFocus.frames)} />
              </div>
            </div>
          </div>
          
          {/* Helper text */}
          <div style={{
            fontFamily: "'Cormorant', serif",
            fontSize: 13,
            color: '#6B7280',
            fontStyle: 'italic',
            textAlign: 'center',
            marginTop: 8
          }}>
            Choose which creative features to showcase in your profile
          </div>
        </div>

        {/* Theme Section */}
        <div style={sectionStyle}>
          <h2 style={sectionHeaderStyle}>Theme</h2>
          <div style={themeOptionsContainerStyle}>
            <div 
              style={themeOptionStyle('default')}
              onClick={() => setSelectedTheme('default')}
            >
              Default
            </div>
            <div 
              style={themeOptionStyle('dim')}
              onClick={() => setSelectedTheme('dim')}
            >
              Dim
            </div>
            <div 
              style={themeOptionStyle('sepia')}
              onClick={() => setSelectedTheme('sepia')}
            >
              Sepia
            </div>
          </div>
        </div>

        {/* Social Links Section - FIXED with toggles */}
        <div style={sectionStyle}>
          <h2 style={sectionHeaderStyle}>Social Links</h2>
          
          {/* Facebook */}
          <div style={socialLinkItemStyle}>
            <div style={socialLinkLabelStyle}>Facebook</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'flex-end' }}>
              {editingSocialLink === 'facebook' ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={socialLinks.facebook}
                    onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                    placeholder="username"
                    style={socialLinkInputStyle}
                    autoFocus
                  />
                  <div style={socialLinkActionsStyle}>
                    <button 
                      style={socialLinkButtonStyle}
                      onClick={() => handleSocialLinkSave('facebook')}
                    >
                      Save
                    </button>
                    <button 
                      style={socialLinkButtonStyle}
                      onClick={() => handleSocialLinkCancel('facebook')}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : socialLinks.facebook ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={socialLinkDisplayStyle}>
                    {socialLinks.facebook}
                  </span>
                  <button 
                    style={socialLinkButtonStyle}
                    onClick={() => handleAddSocialLink('facebook')}
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <button 
                  style={addLinkButtonStyle}
                  onClick={() => handleAddSocialLink('facebook')}
                >
                  Add link
                </button>
              )}
              <div 
                style={toggleStyle(socialLinksVisible.facebook)}
                onClick={() => handleSocialLinkToggle('facebook')}
              >
                <div style={toggleKnobStyle(socialLinksVisible.facebook)} />
              </div>
            </div>
          </div>

          {/* Instagram */}
          <div style={socialLinkItemStyle}>
            <div style={socialLinkLabelStyle}>Instagram</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'flex-end' }}>
              {editingSocialLink === 'instagram' ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={socialLinks.instagram}
                    onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                    placeholder="username"
                    style={socialLinkInputStyle}
                    autoFocus
                  />
                  <div style={socialLinkActionsStyle}>
                    <button 
                      style={socialLinkButtonStyle}
                      onClick={() => handleSocialLinkSave('instagram')}
                    >
                      Save
                    </button>
                    <button 
                      style={socialLinkButtonStyle}
                      onClick={() => handleSocialLinkCancel('instagram')}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : socialLinks.instagram ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={socialLinkDisplayStyle}>
                    {socialLinks.instagram}
                  </span>
                  <button 
                    style={socialLinkButtonStyle}
                    onClick={() => handleAddSocialLink('instagram')}
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <button 
                  style={addLinkButtonStyle}
                  onClick={() => handleAddSocialLink('instagram')}
                >
                  Add link
                </button>
              )}
              <div 
                style={toggleStyle(socialLinksVisible.instagram)}
                onClick={() => handleSocialLinkToggle('instagram')}
              >
                <div style={toggleKnobStyle(socialLinksVisible.instagram)} />
              </div>
            </div>
          </div>

          {/* Pinterest */}
          <div style={socialLinkItemStyle}>
            <div style={socialLinkLabelStyle}>Pinterest</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'flex-end' }}>
              {editingSocialLink === 'pinterest' ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={socialLinks.pinterest}
                    onChange={(e) => handleSocialLinkChange('pinterest', e.target.value)}
                    placeholder="username"
                    style={socialLinkInputStyle}
                    autoFocus
                  />
                  <div style={socialLinkActionsStyle}>
                    <button 
                      style={socialLinkButtonStyle}
                      onClick={() => handleSocialLinkSave('pinterest')}
                    >
                      Save
                    </button>
                    <button 
                      style={socialLinkButtonStyle}
                      onClick={() => handleSocialLinkCancel('pinterest')}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : socialLinks.pinterest ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={socialLinkDisplayStyle}>
                    {socialLinks.pinterest}
                  </span>
                  <button 
                    style={socialLinkButtonStyle}
                    onClick={() => handleAddSocialLink('pinterest')}
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <button 
                  style={addLinkButtonStyle}
                  onClick={() => handleAddSocialLink('pinterest')}
                >
                  Add link
                </button>
              )}
              <div 
                style={toggleStyle(socialLinksVisible.pinterest)}
                onClick={() => handleSocialLinkToggle('pinterest')}
              >
                <div style={toggleKnobStyle(socialLinksVisible.pinterest)} />
              </div>
            </div>
          </div>

          {/* Helper text */}
          <div style={{
            fontFamily: "'Cormorant', serif",
            fontSize: 13,
            color: '#6B7280',
            fontStyle: 'italic',
            textAlign: 'center',
            marginTop: 8
          }}>
            Toggle to show/hide social links on your profile
          </div>
        </div>

        {/* Notifications Section */}
        <div style={sectionStyle}>
          <h2 style={sectionHeaderStyle}>Notifications</h2>
          
          {/* Echoes & Remakes */}
          <div style={toggleContainerStyle}>
            <div style={settingLabelStyle}>Echoes, remakes</div>
            <div 
              style={toggleStyle(notifications.echoesRemakes)}
              onClick={() => handleNotificationToggle('echoesRemakes')}
            >
              <div style={toggleKnobStyle(notifications.echoesRemakes)} />
            </div>
          </div>

          {/* Prompt Emails */}
          <div style={toggleContainerStyle}>
            <div style={settingLabelStyle}>Prompt emails</div>
            <div 
              style={toggleStyle(notifications.promptEmails)}
              onClick={() => handleNotificationToggle('promptEmails')}
            >
              <div style={toggleKnobStyle(notifications.promptEmails)} />
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <button 
          style={{
            ...saveButtonStyle,
            opacity: isSaving ? 0.7 : 1,
            cursor: isSaving ? 'default' : 'pointer'
          }}
          onClick={handleSaveChanges}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* ADDED: Bottom Navigation */}
      <BottomNav />
    </div>
  );
}