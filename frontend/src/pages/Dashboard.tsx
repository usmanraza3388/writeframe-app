// src/pages/Dashboard.tsx
import React from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import ContentDistributionChart from '../components/ContentDistributionChart';
import TopContentSection from '../hooks/TopContentSection';
import BottomNav from '../components/Navigation/BottomNav'; // ADDED: Import BottomNav

export default function Dashboard() {
  const { stats, isLoading, error } = useDashboardData();

  // Consistent with your 375px container pattern
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

  // Consistent with Profile page header
  const headerStyle: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif",
    fontSize: '28px',
    fontWeight: 700,
    color: '#1A1A1A',
    textAlign: 'center',
    margin: 0,
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

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF8F5 100%)',
        padding: '20px 0',
        paddingBottom: '100px', // ADDED: Space for bottom navigation
      }}>
        <div style={containerStyle}>
          <div style={{
            textAlign: 'center',
            padding: '60px 0',
            color: '#6B7280',
            fontSize: '16px',
            fontFamily: "'Cormorant', serif",
          }}>
            Loading dashboard...
          </div>
        </div>
        {/* ADDED: BottomNav */}
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF8F5 100%)',
        padding: '20px 0',
        paddingBottom: '100px', // ADDED: Space for bottom navigation
      }}>
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF8F5 100%)',
        padding: '20px 0',
        paddingBottom: '100px', // ADDED: Space for bottom navigation
      }}
    >
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