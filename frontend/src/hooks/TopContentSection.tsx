// src/components/TopContentSection.tsx
import React from 'react';

interface TopContentSectionProps {
  scene: any | null;
  monologue: any | null;
  character: any | null;
  frame: any | null;
}

const TopContentSection: React.FC<TopContentSectionProps> = ({
  scene,
  monologue,
  character,
  frame
}) => {
  const hasContent = scene || monologue || character || frame;

  if (!hasContent) {
    return (
      <div style={{
        background: '#FAF8F2',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
        fontFamily: "'Cormorant', serif",
        color: '#6B7280',
        fontSize: '16px'
      }}>
        No content with engagement yet
      </div>
    );
  }

  const renderContentItem = (item: any, type: string, color: string) => {
    if (!item) return null;

    const getTitle = () => {
      switch (type) {
        case 'scene': return item.title;
        case 'monologue': return item.title;
        case 'character': return item.name;
        case 'frame': return item.title || item.mood_description || 'Untitled Frame';
        default: return 'Untitled';
      }
    };

    const getEngagement = () => {
      switch (type) {
        case 'scene': 
          return `♥️ ${item.like_count || 0} 💬 ${item.comment_count || 0} 🔄 ${item.remake_count || 0}`;
        case 'monologue':
          return `♥️ ${item.like_count || 0} 💬 ${item.comment_count || 0}`;
        case 'character':
          return `♥️ ${item.like_count || 0}`;
        case 'frame':
          return `♥️ ${item.like_count || 0} 💬 ${item.comment_count || 0} 🔁 ${item.repost_count || 0}`;
        default: return '';
      }
    };

    const getContentType = () => {
      switch (type) {
        case 'scene': return 'Scene';
        case 'monologue': return 'Monologue';
        case 'character': return 'Character';
        case 'frame': return 'Frame';
        default: return 'Content';
      }
    };

    return (
      <div key={type} style={{
        padding: '16px',
        marginBottom: '12px',
        background: 'white',
        borderRadius: '8px',
        borderLeft: `4px solid ${color}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '8px'
        }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '16px',
            fontWeight: 600,
            color: '#1A1A1A',
            lineHeight: '1.3'
          }}>
            {getTitle()}
          </div>
          <div style={{
            fontFamily: "'Cormorant', serif",
            fontSize: '12px',
            fontWeight: 600,
            color: color,
            background: `${color}15`,
            padding: '4px 8px',
            borderRadius: '12px',
            marginLeft: '8px'
          }}>
            {getContentType()}
          </div>
        </div>
        
        <div style={{
          fontFamily: "'Cormorant', serif",
          fontSize: '14px',
          color: '#6B7280'
        }}>
          {getEngagement()}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      background: '#FAF8F2',
      borderRadius: '12px',
      padding: '20px'
    }}>
      <h3 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '18px',
        fontWeight: 700,
        color: '#1A1A1A',
        margin: '0 0 16px 0',
        textAlign: 'center'
      }}>
        Top Performing Content
      </h3>
      
      {renderContentItem(scene, 'scene', '#D4AF37')}
      {renderContentItem(monologue, 'monologue', '#bc63ceff')}
      {renderContentItem(character, 'character', '#2F4F4F')}
      {renderContentItem(frame, 'frame', '#f0cacaff')}
    </div>
  );
};

export default TopContentSection;