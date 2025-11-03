// src/components/ContentDistributionChart.tsx
import React from 'react';

interface ContentDistributionProps {
  scenes: number;
  monologues: number;
  characters: number;
  frames: number;
}

const ContentDistributionChart: React.FC<ContentDistributionProps> = ({
  scenes,
  monologues,
  characters,
  frames
}) => {
  const total = scenes + monologues + characters + frames;
  
  if (total === 0) {
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
        No content created yet
      </div>
    );
  }

  const scenesPercent = Math.round((scenes / total) * 100);
  const monologuesPercent = Math.round((monologues / total) * 100);
  const charactersPercent = Math.round((characters / total) * 100);
  const framesPercent = Math.round((frames / total) * 100);

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
        Content Distribution
      </h3>
      
      {/* Content Type Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Scenes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '4px',
            backgroundColor: '#D4AF37',
            flexShrink: 0
          }}></div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Cormorant', serif",
              fontSize: '14px',
              fontWeight: 600,
              color: '#1A1A1A',
              marginBottom: '2px'
            }}>
              Scenes
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#E5E5E5',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${scenesPercent}%`,
                height: '100%',
                backgroundColor: '#D4AF37',
                borderRadius: '3px'
              }}></div>
            </div>
          </div>
          <div style={{
            fontFamily: "'Cormorant', serif",
            fontSize: '14px',
            fontWeight: 600,
            color: '#1A1A1A',
            minWidth: '40px',
            textAlign: 'right'
          }}>
            {scenes} ({scenesPercent}%)
          </div>
        </div>

        {/* Monologues */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '4px',
            backgroundColor: '#bc63ceff',
            flexShrink: 0
          }}></div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Cormorant', serif",
              fontSize: '14px',
              fontWeight: 600,
              color: '#1A1A1A',
              marginBottom: '2px'
            }}>
              Monologues
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#E5E5E5',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${monologuesPercent}%`,
                height: '100%',
                backgroundColor: '#bc63ceff',
                borderRadius: '3px'
              }}></div>
            </div>
          </div>
          <div style={{
            fontFamily: "'Cormorant', serif",
            fontSize: '14px',
            fontWeight: 600,
            color: '#1A1A1A',
            minWidth: '40px',
            textAlign: 'right'
          }}>
            {monologues} ({monologuesPercent}%)
          </div>
        </div>

        {/* Characters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '4px',
            backgroundColor: '#2F4F4F',
            flexShrink: 0
          }}></div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Cormorant', serif",
              fontSize: '14px',
              fontWeight: 600,
              color: '#1A1A1A',
              marginBottom: '2px'
            }}>
              Characters
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#E5E5E5',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${charactersPercent}%`,
                height: '100%',
                backgroundColor: '#2F4F4F',
                borderRadius: '3px'
              }}></div>
            </div>
          </div>
          <div style={{
            fontFamily: "'Cormorant', serif",
            fontSize: '14px',
            fontWeight: 600,
            color: '#1A1A1A',
            minWidth: '40px',
            textAlign: 'right'
          }}>
            {characters} ({charactersPercent}%)
          </div>
        </div>

        {/* Frames */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '4px',
            backgroundColor: '#f0cacaff',
            flexShrink: 0
          }}></div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Cormorant', serif",
              fontSize: '14px',
              fontWeight: 600,
              color: '#1A1A1A',
              marginBottom: '2px'
            }}>
              Frames
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#E5E5E5',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${framesPercent}%`,
                height: '100%',
                backgroundColor: '#f0cacaff',
                borderRadius: '3px'
              }}></div>
            </div>
          </div>
          <div style={{
            fontFamily: "'Cormorant', serif",
            fontSize: '14px',
            fontWeight: 600,
            color: '#1A1A1A',
            minWidth: '40px',
            textAlign: 'right'
          }}>
            {frames} ({framesPercent}%)
          </div>
        </div>
      </div>

      {/* Total Summary */}
      <div style={{
        textAlign: 'center',
        paddingTop: '16px',
        marginTop: '16px',
        borderTop: '1px solid rgba(0,0,0,0.1)'
      }}>
        <span style={{
          fontFamily: "'Cormorant', serif",
          fontSize: '14px',
          color: '#6B7280',
          fontStyle: 'italic'
        }}>
          Total: {total} creations
        </span>
      </div>
    </div>
  );
};

export default ContentDistributionChart;