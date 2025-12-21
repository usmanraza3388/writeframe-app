import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../assets/lib/supabaseClient';
import { useSavedItems } from '../hooks/useSavedItems';
import { useSaveItem } from '../hooks/useSaveItem';
import BottomNav from '../components/Navigation/BottomNav'; // ADDED: Import BottomNav

interface DraftItem {
  id: string;
  type: 'scene' | 'monologue' | 'character' | 'frame';
  title: string;
  subtitle?: string;
  updatedAt: string;
  engagement: number;
  status: 'draft' | 'published';
  originalUser?: {
    username: string;
    avatar_url: string;
    full_name: string;
  };
}

type ContentTab = 'all' | 'scenes' | 'monologues' | 'characters' | 'frames';
type MainTab = 'drafts' | 'saved';

// Helper function to map tab names to item types
const tabToTypeMap: Record<ContentTab, DraftItem['type'] | 'all'> = {
  'all': 'all',
  'scenes': 'scene',
  'monologues': 'monologue', 
  'characters': 'character',
  'frames': 'frame'
};

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
};

// ADDED: CSS for skeleton animation
const skeletonStyles = `
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
`;

// ADD: Main tabs container styles (MOVED ABOVE)
const mainTabsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  background: '#FAF8F2',
  borderRadius: 14,
  padding: 6,
  width: '100%',
  marginBottom: 16,
};

const mainTabButtonStyle: React.CSSProperties = {
  padding: '12px 16px',
  background: 'transparent',
  border: 'none',
  borderRadius: 10,
  fontSize: 14,
  cursor: 'pointer',
  flex: 1,
  fontFamily: "'Cormorant', serif",
  fontWeight: 500,
  transition: 'all 0.3s ease',
  color: '#6B7280',
};

// ADD TABS CONTAINER STYLES (MOVED ABOVE)
const tabsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: 4,
  background: '#FAF8F2',
  borderRadius: 14,
  padding: 6,
  width: '100%',
  minWidth: 0,
  overflowX: 'auto',
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

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const dividerStyle: React.CSSProperties = {
  height: 1,
  background: 'rgba(0,0,0,0.08)',
  width: '100%',
  margin: '8px 0',
};

const draftItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 0',
  cursor: 'pointer',
  borderBottom: '1px solid rgba(0,0,0,0.08)',
};

const draftContentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  flex: 1,
};

const engagementStyle: React.CSSProperties = {
  fontFamily: "'Cormorant', serif",
  fontSize: 14,
  fontWeight: 600,
  color: '#1A1A1A',
  minWidth: 20,
  textAlign: 'center',
};

const menuButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '8px',
  borderRadius: '4px',
  color: '#1A1A1A',
  fontSize: 18,
};

// ADDED: Skeleton Loading Component (NOW AFTER STYLE DEFINITIONS)
const DraftsSkeleton: React.FC = () => (
  <div style={containerStyle}>
    {/* Header Skeleton */}
    <div style={{
      width: '160px',
      height: '32px',
      backgroundColor: '#E5E5E5',
      borderRadius: '6px',
      margin: '0 auto 32px auto',
      animation: 'pulse 1.5s ease-in-out infinite'
    }} />

    {/* Main Tabs Skeleton */}
    <div style={mainTabsContainerStyle}>
      {[1, 2].map((item) => (
        <div key={item} style={{
          ...mainTabButtonStyle,
          backgroundColor: '#E5E5E5',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
      ))}
    </div>

    {/* Content Tabs Skeleton */}
    <div style={tabsContainerStyle}>
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} style={{
          ...tabButtonStyle,
          backgroundColor: '#E5E5E5',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
      ))}
    </div>

    {/* Draft Items Skeleton */}
    <div style={sectionStyle}>
      <div style={{
        width: '80px',
        height: '24px',
        backgroundColor: '#E5E5E5',
        borderRadius: '4px',
        marginBottom: '16px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
      
      <div style={dividerStyle} />
      
      {[1, 2, 3].map((item) => (
        <div key={item} style={draftItemStyle}>
          <div style={draftContentStyle}>
            <div style={{
              width: '200px',
              height: '18px',
              backgroundColor: '#E5E5E5',
              borderRadius: '4px',
              marginBottom: '8px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
            <div style={{
              width: '150px',
              height: '14px',
              backgroundColor: '#E5E5E5',
              borderRadius: '3px',
              marginBottom: '8px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
            <div style={{
              width: '120px',
              height: '12px',
              backgroundColor: '#E5E5E5',
              borderRadius: '3px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              ...engagementStyle,
              backgroundColor: '#E5E5E5',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
            
            <div style={{
              ...menuButtonStyle,
              backgroundColor: '#E5E5E5',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function Drafts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [savedScenes, setSavedScenes] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ContentTab>('all');
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('drafts');

  // ADD: Saved items hook
const { savedItems, loading: savedLoading } = useSavedItems();
  const { unsaveItem } = useSaveItem();

  // ADDED: Skeleton styles effect
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = skeletonStyles;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    loadDrafts();
  }, [user]);

  const loadDrafts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // UNIFIED APPROACH: Get ONLY drafts using status field for all content types
      const [scenesResult, monologuesResult, charactersResult, framesResult] = await Promise.all([
        // Scenes: Now using unified status field
        supabase
          .from('scenes')
          .select('id, title, description, updated_at, like_count, status, created_at')
          .eq('user_id', user.id)
          .eq('status', 'draft')
          .order('updated_at', { ascending: false }),

        // Monologues: Now using unified status field
        supabase
          .from('monologues')
          .select('id, title, content_text, updated_at, like_count, status, created_at')
          .eq('user_id', user.id)
          .eq('status', 'draft')
          .order('updated_at', { ascending: false }),

        // Characters: Using status field (unchanged)
        supabase
          .from('characters')
          .select('id, name, bio, updated_at, like_count, status')
          .eq('user_id', user.id)
          .eq('status', 'draft')
          .order('updated_at', { ascending: false }),

        // Frames: Using status field (unchanged)
        supabase
          .from('frames')
          .select('id, title, mood_description, updated_at, like_count, status')
          .eq('user_id', user.id)
          .eq('status', 'draft')
          .order('updated_at', { ascending: false })
      ]);

      // Transform data into consistent format
      const draftItems: DraftItem[] = [];

      // Process scenes - now using status field directly
      scenesResult.data?.forEach(scene => {
        draftItems.push({
          id: scene.id,
          type: 'scene',
          title: scene.title,
          subtitle: scene.description,
          updatedAt: scene.updated_at,
          engagement: scene.like_count || 0,
          status: scene.status as 'draft' | 'published'
        });
      });

      // Process monologues - now using status field directly
      monologuesResult.data?.forEach(monologue => {
        draftItems.push({
          id: monologue.id,
          type: 'monologue',
          title: monologue.title,
          subtitle: monologue.content_text?.substring(0, 50) + '...',
          updatedAt: monologue.updated_at,
          engagement: monologue.like_count || 0,
          status: monologue.status as 'draft' | 'published'
        });
      });

      // Process characters
      charactersResult.data?.forEach(character => {
        draftItems.push({
          id: character.id,
          type: 'character',
          title: character.name,
          subtitle: character.bio?.substring(0, 50) + '...',
          updatedAt: character.updated_at,
          engagement: character.like_count || 0,
          status: character.status as 'draft' | 'published'
        });
      });

      // Process frames
      framesResult.data?.forEach(frame => {
        draftItems.push({
          id: frame.id,
          type: 'frame',
          title: frame.title || frame.mood_description,
          subtitle: frame.mood_description,
          updatedAt: frame.updated_at,
          engagement: frame.like_count || 0,
          status: frame.status as 'draft' | 'published'
        });
      });

      // Separate drafts from saved published content
      const draftItemsList = draftItems.filter(item => item.status === 'draft');
      const savedItemsList = draftItems.filter(item => item.status === 'published');

      setDrafts(draftItemsList);
      setSavedScenes(savedItemsList);

    } catch (error) {
      console.error('Error loading drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  // ADD: Transform saved items to DraftItem format
  const transformSavedItems = (savedItems: any[]): DraftItem[] => {
    return savedItems.map(savedItem => {
      const content = savedItem[savedItem.content_type];
      const user = content?.user;
      
      return {
        id: savedItem.content_id,
        type: savedItem.content_type,
        title: content?.title || content?.name || 'Untitled',
        subtitle: content?.description || content?.bio || content?.content_text || content?.mood_description,
        updatedAt: savedItem.saved_at,
        engagement: content?.like_count || 0,
        status: 'published' as const,
        originalUser: user
      };
    });
  };

  // FIXED: Properly typed filtered data functions
  const getFilteredDrafts = () => {
    if (activeTab === 'all') return drafts;
    const targetType = tabToTypeMap[activeTab];
    return drafts.filter(item => item.type === targetType);
  };

  const getFilteredSavedScenes = () => {
    if (activeTab === 'all') return savedScenes;
    const targetType = tabToTypeMap[activeTab];
    return savedScenes.filter(item => item.type === targetType);
  };

  // ADD: Filter function for saved items
  const getFilteredSavedItems = () => {
    const transformed = transformSavedItems(savedItems);
    if (activeTab === 'all') return transformed;
    const targetType = tabToTypeMap[activeTab];
    return transformed.filter(item => item.type === targetType);
  };

  const handleEdit = (item: DraftItem) => {
    // Navigate to appropriate editor based on type
    const routes = {
      scene: '/compose-scene',
      monologue: '/compose-monologue', 
      character: '/compose-character',
      frame: '/compose-frame'
    };
    navigate(`${routes[item.type]}?id=${item.id}`);
  };

  const handleDelete = async (item: DraftItem) => {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;

    try {
      const tables = {
        scene: 'scenes',
        monologue: 'monologues',
        character: 'characters',
        frame: 'frames'
      };

      const { error } = await supabase
        .from(tables[item.type])
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      // Reload drafts
      loadDrafts();
    } catch (error) {
      console.error('Error deleting draft:', error);
      alert('Error deleting draft. Please try again.');
    }
  };

  const handlePublish = async (item: DraftItem) => {
    try {
      const tables = {
        scene: 'scenes',
        monologue: 'monologues',
        character: 'characters',
        frame: 'frames'
      };

      // UNIFIED: Now all content types use status field
      const updateData = { 
        status: 'published',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from(tables[item.type])
        .update(updateData)
        .eq('id', item.id);

      if (error) throw error;

      // Remove from drafts list immediately
      setDrafts(prev => prev.filter(draft => draft.id !== item.id));
      
    } catch (error) {
      console.error('Error publishing:', error);
      alert('Error publishing. Please try again.');
    }
  };

  // ADD: Handle unsave action
  const handleUnsave = async (item: DraftItem) => {
    if (!confirm(`Remove "${item.title}" from your saved items?`)) return;

    try {
      await unsaveItem({ 
        content_type: item.type, 
        content_id: item.id 
      });
      // The saved items will automatically refetch due to query invalidation
    } catch (error) {
      console.error('Error unsaving item:', error);
      alert('Error unsaving item. Please try again.');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Check if click is inside any menu
      const target = e.target as Element;
      const isClickInsideMenu = target.closest('[data-menu-container]');
      
      if (!isClickInsideMenu) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Additional Styles
  const headerStyle: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28,
    fontWeight: 700,
    color: '#1A1A1A',
    textAlign: 'center',
    margin: 0,
    letterSpacing: '-0.02em',
  };

  const activeMainTabButtonStyle: React.CSSProperties = {
    background: '#FFFFFF',
    color: '#1A1A1A',
    fontWeight: 600,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  };

  const activeTabButtonStyle: React.CSSProperties = {
    background: '#FFFFFF',
    color: '#1A1A1A',
    fontWeight: 600,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  };

  const sectionHeaderStyle: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif",
    fontSize: 20,
    fontWeight: 600,
    color: '#1A1A1A',
    margin: 0,
  };

  const draftTitleStyle: React.CSSProperties = {
    fontFamily: "'Cormorant', serif",
    fontSize: 18,
    fontWeight: 600,
    color: '#1A1A1A',
    margin: 0,
  };

  const draftSubtitleStyle: React.CSSProperties = {
    fontFamily: "'Cormorant', serif",
    fontSize: 14,
    color: '#6B7280',
    margin: 0,
    fontStyle: 'italic',
  };

  const draftMetaStyle: React.CSSProperties = {
    fontFamily: "'Cormorant', serif",
    fontSize: 12,
    color: '#9CA3AF',
    margin: 0,
  };

  const menuContainerStyle: React.CSSProperties = {
    position: 'relative',
  };

  const menuStyle: React.CSSProperties = {
    position: 'absolute',
    top: '35px',
    right: 0,
    background: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    padding: '8px 0',
    minWidth: '120px',
    zIndex: 1000,
    border: '1px solid rgba(0,0,0,0.08)',
  };

  const menuItemStyle: React.CSSProperties = {
    width: '100%',
    background: 'none',
    border: 'none',
    padding: '8px 16px',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: "'Cormorant', serif",
    color: '#1A1A1A',
    transition: 'background-color 0.2s',
  };

  // ADDED: Show skeleton loading while data is loading
  if (loading) {
    return (
      <div style={pageContainerStyle}>
        <DraftsSkeleton />
        <BottomNav />
      </div>
    );
  }

  const filteredDrafts = getFilteredDrafts();
  const filteredSavedScenes = getFilteredSavedScenes();
  const filteredSavedItems = getFilteredSavedItems();

  return (
    <div style={pageContainerStyle}>
      <div style={containerStyle}>
        <h1 style={headerStyle}>Drafts & Saved</h1>

        {/* ADD: Main Tabs (Drafts vs Saved) */}
        <div style={mainTabsContainerStyle}>
          <button
            onClick={() => setActiveMainTab('drafts')}
            style={{
              ...mainTabButtonStyle,
              ...(activeMainTab === 'drafts' ? activeMainTabButtonStyle : {})
            }}
          >
            Drafts
          </button>
          <button
            onClick={() => setActiveMainTab('saved')}
            style={{
              ...mainTabButtonStyle,
              ...(activeMainTab === 'saved' ? activeMainTabButtonStyle : {})
            }}
          >
            Saved
          </button>
        </div>

        {/* Content Tabs (All, Scenes, Monologues, Characters, Frames) */}
        <div style={tabsContainerStyle}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              ...tabButtonStyle,
              ...(activeTab === 'all' ? activeTabButtonStyle : {})
            }}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('scenes')}
            style={{
              ...tabButtonStyle,
              ...(activeTab === 'scenes' ? activeTabButtonStyle : {})
            }}
          >
            Scenes
          </button>
          <button
            onClick={() => setActiveTab('monologues')}
            style={{
              ...tabButtonStyle,
              ...(activeTab === 'monologues' ? activeTabButtonStyle : {})
            }}
          >
            Monologues
          </button>
          <button
            onClick={() => setActiveTab('characters')}
            style={{
              ...tabButtonStyle,
              ...(activeTab === 'characters' ? activeTabButtonStyle : {})
            }}
          >
            Characters
          </button>
          <button
            onClick={() => setActiveTab('frames')}
            style={{
              ...tabButtonStyle,
              ...(activeTab === 'frames' ? activeTabButtonStyle : {})
            }}
          >
            Frames
          </button>
        </div>

        {/* CONDITIONAL RENDERING: Drafts vs Saved */}
        {activeMainTab === 'drafts' ? (
          /* EXISTING DRAFTS CONTENT */
          <>
            {/* Drafts Section */}
            <div style={sectionStyle}>
              <h2 style={sectionHeaderStyle}>Drafts</h2>
              <div style={dividerStyle}></div>
              
              {filteredDrafts.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#9CA3AF',
                  fontFamily: "'Cormorant', serif",
                  fontStyle: 'italic'
                }}>
                  No {activeTab !== 'all' ? activeTab : ''} drafts yet
                </div>
              ) : (
                filteredDrafts.map((draft) => (
                  <div key={`${draft.type}-${draft.id}`} style={draftItemStyle}>
                    <div style={draftContentStyle}>
                      <div style={draftTitleStyle}>{draft.title}</div>
                      {draft.subtitle && (
                        <div style={draftSubtitleStyle}>{draft.subtitle}</div>
                      )}
                      <div style={draftMetaStyle}>
                        {formatTimeAgo(draft.updatedAt)} • {draft.type}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={engagementStyle}>{draft.engagement}</div>
                      
                      <div style={menuContainerStyle} data-menu-container="true">
                        <button 
                          style={menuButtonStyle}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === draft.id ? null : draft.id);
                          }}
                        >
                          ⋮
                        </button>
                        
                        {activeMenu === draft.id && (
                          <div style={menuStyle} data-menu-container="true">
                            <button 
                              style={menuItemStyle}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(draft);
                                setActiveMenu(null);
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#FAF8F2';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              Edit
                            </button>
                            {draft.status === 'draft' && (
                              <button 
                                style={menuItemStyle}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePublish(draft);
                                  setActiveMenu(null);
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#FAF8F2';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                Publish
                              </button>
                            )}
                            <button 
                              style={{
                                ...menuItemStyle,
                                color: '#DC2626'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(draft);
                                setActiveMenu(null);
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#FEF2F2';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Saved Scenes Section */}
            {filteredSavedScenes.length > 0 && (
              <div style={sectionStyle}>
                <h2 style={sectionHeaderStyle}>Published Work</h2>
                <div style={dividerStyle}></div>
                
                {filteredSavedScenes.map((saved) => (
                  <div key={`saved-${saved.type}-${saved.id}`} style={draftItemStyle}>
                    <div style={draftContentStyle}>
                      <div style={draftTitleStyle}>{saved.title}</div>
                      {saved.subtitle && (
                        <div style={draftSubtitleStyle}>{saved.subtitle}</div>
                      )}
                      <div style={draftMetaStyle}>
                        {formatTimeAgo(saved.updatedAt)} • {saved.type}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={engagementStyle}>{saved.engagement}</div>
                      
                      <div style={menuContainerStyle} data-menu-container="true">
                        <button 
                          style={menuButtonStyle}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === `saved-${saved.id}` ? null : `saved-${saved.id}`);
                          }}
                        >
                          ⋮
                        </button>
                        
                        {activeMenu === `saved-${saved.id}` && (
                          <div style={menuStyle} data-menu-container="true">
                            <button 
                              style={menuItemStyle}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(saved);
                                setActiveMenu(null);
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#FAF8F2';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              Reopen Scene
                            </button>
                            <button 
                              style={{
                                ...menuItemStyle,
                                color: '#DC2626'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(saved);
                                setActiveMenu(null);
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#FEF2F2';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* NEW SAVED CONTENT */
          <div style={sectionStyle}>
            <h2 style={sectionHeaderStyle}>Saved Items</h2>
            <div style={dividerStyle}></div>
            
            {savedLoading ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#9CA3AF',
                fontFamily: "'Cormorant', serif"
              }}>
                Loading saved items...
              </div>
            ) : filteredSavedItems.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#9CA3AF',
                fontFamily: "'Cormorant', serif",
                fontStyle: 'italic'
              }}>
                No {activeTab !== 'all' ? activeTab : ''} saved items yet
                <div style={{ fontSize: '13px', marginTop: '8px', color: '#6B7280' }}>
                  Save scenes, monologues, characters, or frames from other users to see them here
                </div>
              </div>
            ) : (
              filteredSavedItems.map((item) => (
                <div key={`saved-${item.type}-${item.id}`} style={draftItemStyle}>
                  <div style={draftContentStyle}>
                    <div style={draftTitleStyle}>{item.title}</div>
                    {item.subtitle && (
                      <div style={draftSubtitleStyle}>{item.subtitle}</div>
                    )}
                    <div style={draftMetaStyle}>
                      Saved {formatTimeAgo(item.updatedAt)} • {item.type}
                      {item.originalUser && ` • From @${item.originalUser.username}`}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={engagementStyle}>{item.engagement}</div>
                    
                    <div style={menuContainerStyle} data-menu-container="true">
                      <button 
                        style={menuButtonStyle}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === `saved-${item.id}` ? null : `saved-${item.id}`);
                        }}
                      >
                        ⋮
                      </button>
                      
                      {activeMenu === `saved-${item.id}` && (
                        <div style={menuStyle} data-menu-container="true">
                          <button 
                            style={menuItemStyle}
                            onClick={(e) => {
                              e.stopPropagation();
                              // FIXED: Navigate to home feed with hash for auto-scroll
                              navigate(`/home-feed#${item.type}-${item.id}`);
                              setActiveMenu(null);
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#FAF8F2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            View
                          </button>
                          <button 
                            style={{
                              ...menuItemStyle,
                              color: '#DC2626'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnsave(item);
                              setActiveMenu(null);
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#FEF2F2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            Unsave
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ADDED: Bottom Navigation */}
      <BottomNav />
    </div>
  );
}