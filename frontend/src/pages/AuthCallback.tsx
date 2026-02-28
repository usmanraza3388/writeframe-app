import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../assets/lib/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to generate username from email
  const generateUsername = (email: string): string => {
    const baseUsername = email.split('@')[0];
    // Remove special characters and limit length
    const cleanUsername = baseUsername.replace(/[^a-zA-Z0-9]/g, '').substring(0, 15);
    const randomSuffix = Math.floor(Math.random() * 1000);
    return `${cleanUsername}${randomSuffix}`;
  };

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        setLoading(true);
        
        // Get the session after OAuth redirect
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Session error: ${sessionError.message}`);
        }

        if (!session?.user) {
          throw new Error('No user session found');
        }

        const user = session.user;

        // Check if profile already exists and get its completeness
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, full_name, genre_persona, expression')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 means no profile found, which is fine for new users
          throw new Error(`Profile check error: ${profileError.message}`);
        }

        // Determine if profile needs creation/update
        const needsProfileCreation = !existingProfile;
        const hasCriticalFields = existingProfile?.username && existingProfile?.full_name;

        if (needsProfileCreation || !hasCriticalFields) {
          // Create or update profile with required fields
          const profileData = {
            id: user.id,
            email: user.email,
            full_name: existingProfile?.full_name || 
                      user.user_metadata?.full_name || 
                      user.user_metadata?.name || 
                      'New User',
            username: existingProfile?.username || 
                     user.user_metadata?.preferred_username || 
                     user.user_metadata?.user_name || 
                     generateUsername(user.email!),
            // Preserve existing onboarding progress if any
            genre_persona: existingProfile?.genre_persona || null,
            expression: existingProfile?.expression || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert(profileData, { 
              onConflict: 'id',
              ignoreDuplicates: false 
            });

          if (upsertError) {
            throw new Error(`Profile upsert error: ${upsertError.message}`);
          }
        }

        // Check if user needs to complete onboarding
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('genre_persona, expression')
          .eq('id', user.id)
          .single();

        // Check for pending prompt from OAuth flow
        const pendingPrompt = localStorage.getItem('oauth_pending_prompt');
        const pendingPath = localStorage.getItem('oauth_pending_path') || 'scene';

        if (!updatedProfile?.genre_persona || !updatedProfile?.expression) {
          // Redirect to onboarding if missing critical onboarding data
          
          // If there's a pending prompt, save it for after onboarding
          if (pendingPrompt) {
            sessionStorage.setItem('pending_prompt', pendingPrompt);
            sessionStorage.setItem('pending_path', pendingPath);
            localStorage.removeItem('oauth_pending_prompt');
            localStorage.removeItem('oauth_pending_path');
          }
          
          navigate('/welcome', { replace: true });
        } else {
          // Profile is complete
          if (pendingPrompt) {
            localStorage.removeItem('oauth_pending_prompt');
            localStorage.removeItem('oauth_pending_path');
            navigate(`/compose-${pendingPath}?prompt=${pendingPrompt}`, { replace: true });
          } else {
            navigate('/home-feed', { replace: true });
          }
        }

      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        // Fallback - send to signin page after delay
        setTimeout(() => {
          navigate('/signin', { replace: true });
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: '16px',
        background: '#FAF8F2'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #1A1A1A',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div style={{
          fontFamily: "'Cormorant', serif",
          fontSize: '16px',
          color: '#1A1A1A'
        }}>
          Completing your sign in...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: '16px',
        background: '#FAF8F2',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '20px',
          color: '#DC2626',
          marginBottom: '8px'
        }}>
          Authentication Error
        </div>
        <div style={{
          fontFamily: "'Cormorant', serif",
          fontSize: '16px',
          color: '#6B7280',
          marginBottom: '20px'
        }}>
          {error}
        </div>
        <button 
          onClick={() => navigate('/signin')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#1A1A1A',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: "'Cormorant', serif",
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return null;
}

// Add spin animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);