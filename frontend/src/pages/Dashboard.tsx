// src/pages/Dashboard.tsx
import React from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import ContentDistributionChart from '../components/ContentDistributionChart';
import TopContentSection from '../hooks/TopContentSection';
import BottomNav from '../components/Navigation/BottomNav'; // ADDED: Import BottomNav

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
  width: '375px',
  minHeight: '812px',
  background: '#FFFFFF',
  borderRadius: '18px',
  padding: '32px',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: '28px',
  margin: '0 auto',
};

// Consistent with Profile stats container
const statsContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  background: '#FAF8F2',
  borderRadius: '16px',
  padding: '8px',
  gap: '8px',
};

const statItemStyle: React.CSSProperties = {
  textAlign: 'center',
  flex: 1,
  padding: '12px 8px',
};

const statValueStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#1A1A1A',
  marginBottom: '4px',
  fontFamily: "'Cormorant', serif",
};

const statLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#6B7280',
  fontFamily: "'Cormorant', serif",
  fontWeight: 500,
};

const statDividerStyle: React.CSSProperties = {
  width: '1px',
  height: '40px',
  background: 'rgba(0, 0, 0, 0.08)',
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
const DashboardSkeleton: React.FC = () => (
  <div style={containerStyle}>
    {/* Header Skeleton */}
    <div style={{
      width: '200px',
      height: '32px',
      backgroundColor: '#E5E5E5',
      borderRadius: '6px',
      margin: '0 auto',
      animation: 'pulse 1.5s ease-in-out infinite'
    }} />

    {/* Stats Container Skeleton */}
    <div style={statsContainerStyle}>
      {[1, 2, 3].map((item, index) => (
        <React.Fragment key={item}>
          <div style={statItemStyle}>
            <div style={{
              ...statValueStyle,
              backgroundColor: '#E5E5E5',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
            <div style={{
              ...statLabelStyle,
              backgroundColor: '#E5E5E5',
              animation: 'pulse 1.5s ease-in-out infinite',
              width: '60px',
              height: '12px',
              margin: '4px auto 0 auto'
            }} />
          </div>
          {index < 2 && <div style={statDividerStyle} />}
        </React.Fragment>
      ))}
    </div>

    {/* Content Distribution Chart Skeleton */}
    <div style={{
      background: '#FAF8F2',
      borderRadius: '16px',
      padding: '20px',
      height: '200px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{
        width: '160px',
        height: '20px',
        backgroundColor: '#E5E5E5',
        borderRadius: '4px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
      <div style={{
        flex: 1,
        backgroundColor: '#E5E5E5',
        borderRadius: '8px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
    </div>

    {/* Top Content Section Skeleton */}
    <div style={{
      background: '#FAF8F2',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{
        width: '120px',
        height: '20px',
        backgroundColor: '#E5E5E5',
        borderRadius: '4px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
      
      {[1, 2, 3, 4].map((item) => (
        <div key={item} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 0'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#E5E5E5',
            borderRadius: '8px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
          <div style={{ flex: 1 }}>
            <div style={{
              width: '120px',
              height: '16px',
              backgroundColor: '#E5E5E5',
              borderRadius: '4px',
              marginBottom: '6px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
            <div style={{
              width: '80px',
              height: '12px',
              backgroundColor: '#E5E5E5',
              borderRadius: '3px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
          </div>
        </div>
      ))}
    </div>

    {/* Coming Soon Message Skeleton */}
    <div style={{
      width: '180px',
      height: '14px',
      backgroundColor: '#E5E5E5',
      borderRadius: '3px',
      margin: '20px auto 0 auto',
      animation: 'pulse 1.5s ease-in-out infinite'
    }} />
  </div>
);

export default function Dashboard() {
  const { stats, isLoading, error } = useDashboardData();

  // ADDED: Skeleton styles effect
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = skeletonStyles;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Additional Styles
  const headerStyle: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif",
    fontSize: '28px',
    fontWeight: 700,
    color: '#1A1A1A',
    textAlign: 'center',
    margin: 0,
  };

  // ADDED: Show skeleton loading while data is loading
  if (isLoading) {
    return (
      <div style={pageContainerStyle}>
        <DashboardSkeleton />
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageContainerStyle}>
        <div style={containerStyle}>
          <div style={{
            textAlign: 'center',
            padding: '60px 0',
            color: '#DC2626',
            fontSize: '16px',
            fontFamily: "'Cormorant', serif",
          }}>
            Error loading dashboard: {error}
          </div>
        </div>
        {/* ADDED: BottomNav */}
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={pageContainerStyle}>
      <div style={containerStyle}>
        {/* Header - Consistent with Profile page */}
        <h1 style={headerStyle}>Creator Dashboard</h1>

        {/* Stats Overview - Now with REAL DATA */}
        <div style={statsContainerStyle}>
          <div style={statItemStyle}>
            <div style={statValueStyle}>{stats.streak}</div>
            <div style={statLabelStyle}>Day Streak</div>
          </div>
          <div style={statDividerStyle}></div>
          <div style={statItemStyle}>
            <div style={statValueStyle}>{stats.totalCreations}</div>
            <div style={statLabelStyle}>Creations</div>
          </div>
          <div style={statDividerStyle}></div>
          <div style={statItemStyle}>
            <div style={statValueStyle}>{stats.totalEngagement}</div>
            <div style={statLabelStyle}>Engagement</div>
          </div>
        </div>

        {/* Content Distribution - NOW WITH REAL CHART */}
        <ContentDistributionChart 
          scenes={stats.contentDistribution.scenes}
          monologues={stats.contentDistribution.monologues}
          characters={stats.contentDistribution.characters}
          frames={stats.contentDistribution.frames}
        />

        {/* Top Content - NOW WITH REAL DATA */}
        <TopContentSection
          scene={stats.topContent.scene}
          monologue={stats.topContent.monologue}
          character={stats.topContent.character}
          frame={stats.topContent.frame}
        />

        {/* Coming Soon Message */}
        <div style={{
          textAlign: 'center',
          fontFamily: "'Cormorant', serif",
          color: '#9CA3AF',
          fontSize: '14px',
          fontStyle: 'italic',
          marginTop: '20px'
        }}>
          More analytics features coming soon
        </div>
      </div>

      {/* ADDED: Bottom Navigation */}
      <BottomNav />
    </div>
  );
}