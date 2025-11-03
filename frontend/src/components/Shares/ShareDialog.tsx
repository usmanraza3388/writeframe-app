import React from 'react';

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
          {/* Twitter */}
          <button
            onClick={() => handleSocialShare('twitter')}
            style={{
              padding: '12px',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>🐦</span>
            Share on Twitter
          </button>
          
          {/* Facebook */}
          <button
            onClick={() => handleSocialShare('facebook')}
            style={{
              padding: '12px',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>👥</span>
            Share on Facebook
          </button>
          
          {/* Pinterest */}
          <button
            onClick={() => handleSocialShare('pinterest')}
            style={{
              padding: '12px',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>📌</span>
            Pin to Pinterest
          </button>
          
          {/* Instagram */}
          <button
            onClick={() => handleSocialShare('instagram')}
            style={{
              padding: '12px',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>📸</span>
            Share to Instagram
          </button>
          
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