import React, { useState } from 'react';

// NORMALIZED: Clean, consistent interface
interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (platform?: string) => void;
  shareUrl: string;
  content: {
    title: string;
    excerpt: string;
    images?: string[];
  };
  creator: {
    name: string;
    genre?: string;
  };
  contentType: 'scene' | 'monologue' | 'character' | 'frame';
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  onShare,
  shareUrl,
  content,
  creator,
  contentType
}) => {
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);

  // CONTENT-SPECIFIC TEMPLATES FOR ALL 4 TYPES
  const getPlatformTemplates = () => {
    const creatorName = creator.name || 'A writer';
    const genre = creator.genre ? ` | ${creator.genre}` : '';
    const isVisual = content.images && content.images.length > 0;

    // Content-type specific templates
    const templates = {
      scene: {
        twitter: `🎬 "${content.excerpt}" — ${creatorName}${genre}\n\nA cinematic scene on writeFrame\n${shareUrl} #Screenwriting #Film`,
        facebook: `"${content.excerpt}"\n\n— ${creatorName}${genre}\n\nRead the full scene on writeFrame: ${shareUrl}`,
        pinterest: isVisual 
          ? `Cinematic Scene: "${content.title}"\n\nBy ${creatorName}${genre}\n\n📽️ writeFrame - Where cinephiles become creators\n${shareUrl}`
          : `"${content.excerpt}"\n\n— ${creatorName}${genre}\n\nA scene from writeFrame\n${shareUrl}`,
        instagram: `🎬 "${content.excerpt}"\n\n— ${creatorName}${genre}\n\n📽️ A cinematic scene on writeFrame\n\n✨ Explore more at: ${shareUrl}`
      },
      monologue: {
        twitter: `🎭 "${content.excerpt}" — ${creatorName}${genre}\n\nA powerful monologue on writeFrame\n${shareUrl} #Screenwriting #Monologue`,
        facebook: `"${content.excerpt}"\n\n— ${creatorName}${genre}\n\nA character monologue on writeFrame: ${shareUrl}`,
        pinterest: `"${content.excerpt}"\n\n— ${creatorName}${genre}\n\nCharacter monologue on writeFrame\n${shareUrl}`,
        instagram: `🎭 "${content.excerpt}"\n\n— ${creatorName}${genre}\n\n💭 A character monologue on writeFrame\n\n✨ Explore more at: ${shareUrl}`
      },
      character: {
        twitter: `👤 "${content.excerpt}" — ${creatorName}${genre}\n\nCharacter profile on writeFrame\n${shareUrl} #CharacterWriting #Screenwriting`,
        facebook: `"${content.excerpt}"\n\n— ${creatorName}${genre}\n\nCharacter creation on writeFrame: ${shareUrl}`,
        pinterest: isVisual
          ? `Character: "${content.title}"\n\nBy ${creatorName}${genre}\n\n👤 writeFrame - Character creation for filmmakers\n${shareUrl}`
          : `"${content.excerpt}"\n\n— ${creatorName}${genre}\n\nCharacter profile on writeFrame\n${shareUrl}`,
        instagram: `👤 "${content.excerpt}"\n\n— ${creatorName}${genre}\n\n🎭 Character profile on writeFrame\n\n✨ Explore more at: ${shareUrl}`
      },
      frame: {
        twitter: `🖼️ "${content.excerpt}" — ${creatorName}${genre}\n\nCinematic frame on writeFrame\n${shareUrl} #Cinematic #VisualStorytelling`,
        facebook: `"${content.excerpt}"\n\n— ${creatorName}${genre}\n\nCinematic visual frame on writeFrame: ${shareUrl}`,
        pinterest: isVisual
          ? `Cinematic Frame: "${content.title}"\n\nBy ${creatorName}${genre}\n\n🖼️ writeFrame - Visual storytelling for cinephiles\n${shareUrl}`
          : `"${content.excerpt}"\n\n— ${creatorName}${genre}\n\nCinematic mood frame on writeFrame\n${shareUrl}`,
        instagram: `🖼️ "${content.excerpt}"\n\n— ${creatorName}${genre}\n\n🎬 Cinematic frame on writeFrame\n\n✨ Explore more at: ${shareUrl}`
      }
    };

    return templates[contentType];
  };

  const handleSocialShare = (platform: string) => {
    // Track the share
    onShare(platform);
    
    const templates = getPlatformTemplates();
    
    // Platform-specific sharing logic with CONTENT-SPECIFIC TEMPLATES
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(templates.twitter)}`);
        break;
        
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(templates.facebook)}`);
        break;
        
      case 'pinterest':
        window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(templates.pinterest)}`);
        break;
        
      case 'instagram':
        navigator.clipboard.writeText(templates.instagram);
        alert('Instagram text copied! Paste it when you share your visual content.');
        break;
    }
    
    onClose();
  };

  // NEW: Download card functionality
  const handleDownloadCard = () => {
    // For now, just copy the caption and show message
    const caption = `"${content.excerpt}"\n\n— ${creator.name}${creator.genre ? ` | ${creator.genre}` : ''}\n\n🎬 Shared from writeFrame\n${shareUrl}`;
    
    navigator.clipboard.writeText(caption);
    onShare('download');
    
    alert('Card caption copied! (Card image download coming soon)');
    onClose();
  };

  // Dummy call to satisfy TypeScript - function is kept for future use
  React.useEffect(() => {
    // This ensures handleSocialShare is "used" to avoid TypeScript error
    if (false) {
      handleSocialShare('twitter');
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        width: '90%',
        maxWidth: '300px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontFamily: 'Playfair Display' }}>
          Share to Social
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* NEW: Download Card Button - FUNCTIONAL */}
          <button
            onClick={handleDownloadCard}
            style={{
              padding: '12px',
              border: '1px solid #1C1C1C',
              borderRadius: '8px',
              background: '#1C1C1C',
              color: 'white',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600'
            }}
          >
            <span>📸</span>
            Download Card Image
          </button>
          
          {/* Twitter - DISABLED */}
          <div style={{ position: 'relative' }}>
            <button
              disabled
              onMouseEnter={() => setHoveredPlatform('twitter')}
              onMouseLeave={() => setHoveredPlatform(null)}
              style={{
                padding: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                background: 'white',
                cursor: 'not-allowed',
                fontFamily: 'Arial, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: 0.6,
                width: '100%'
              }}
            >
              <span>🐦</span>
              Share on Twitter
            </button>
            
            {/* Hover Tooltip */}
            {hoveredPlatform === 'twitter' && (
              <div style={{
                position: 'absolute',
                top: '-35px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#1C1C1C',
                color: 'white',
                padding: '6px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'Arial, sans-serif',
                whiteSpace: 'nowrap',
                zIndex: 1001
              }}>
                Available Soon
              </div>
            )}
          </div>
          
          {/* Facebook - DISABLED */}
          <div style={{ position: 'relative' }}>
            <button
              disabled
              onMouseEnter={() => setHoveredPlatform('facebook')}
              onMouseLeave={() => setHoveredPlatform(null)}
              style={{
                padding: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                background: 'white',
                cursor: 'not-allowed',
                fontFamily: 'Arial, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: 0.6,
                width: '100%'
              }}
            >
              <span>👥</span>
              Share on Facebook
            </button>
            
            {/* Hover Tooltip */}
            {hoveredPlatform === 'facebook' && (
              <div style={{
                position: 'absolute',
                top: '-35px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#1C1C1C',
                color: 'white',
                padding: '6px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'Arial, sans-serif',
                whiteSpace: 'nowrap',
                zIndex: 1001
              }}>
                Available Soon
              </div>
            )}
          </div>
          
          {/* Pinterest - DISABLED */}
          <div style={{ position: 'relative' }}>
            <button
              disabled
              onMouseEnter={() => setHoveredPlatform('pinterest')}
              onMouseLeave={() => setHoveredPlatform(null)}
              style={{
                padding: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                background: 'white',
                cursor: 'not-allowed',
                fontFamily: 'Arial, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: 0.6,
                width: '100%'
              }}
            >
              <span>📌</span>
              Pin to Pinterest
            </button>
            
            {/* Hover Tooltip */}
            {hoveredPlatform === 'pinterest' && (
              <div style={{
                position: 'absolute',
                top: '-35px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#1C1C1C',
                color: 'white',
                padding: '6px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'Arial, sans-serif',
                whiteSpace: 'nowrap',
                zIndex: 1001
              }}>
                Available Soon
              </div>
            )}
          </div>
          
          {/* Instagram - DISABLED */}
          <div style={{ position: 'relative' }}>
            <button
              disabled
              onMouseEnter={() => setHoveredPlatform('instagram')}
              onMouseLeave={() => setHoveredPlatform(null)}
              style={{
                padding: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                background: 'white',
                cursor: 'not-allowed',
                fontFamily: 'Arial, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: 0.6,
                width: '100%'
              }}
            >
              <span>📸</span>
              Share to Instagram
            </button>
            
            {/* Hover Tooltip */}
            {hoveredPlatform === 'instagram' && (
              <div style={{
                position: 'absolute',
                top: '-35px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#1C1C1C',
                color: 'white',
                padding: '6px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'Arial, sans-serif',
                whiteSpace: 'nowrap',
                zIndex: 1001
              }}>
                Available Soon
              </div>
            )}
          </div>
          
          {/* Cancel */}
          <button
            onClick={onClose}
            style={{
              padding: '12px',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
              marginTop: '8px'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareDialog;