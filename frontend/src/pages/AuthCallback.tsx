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
        console.log('🔄 AuthCallback: Starting OAuth callback handling');
        setLoading(true);
        
        // Get the session after OAuth redirect
        console.log('🔍 AuthCallback: Getting session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.log('❌ AuthCallback: Session error:', sessionError);
          throw new Error(`Session error: ${sessionError.message}`);
        }

        if (!session?.user) {
          console.log('❌ AuthCallback: No user session found');
          throw new Error('No user session found');
        }

        const user = session.user;
        console.log('✅ AuthCallback: User found:', user.id);
        console.log('📧 AuthCallback: User email:', user.email);

        // Check if profile already exists and get its completeness
        console.log('🔍 AuthCallback: Checking existing profile...');
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, full_name, genre_persona, expression')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 means no profile found, which is fine for new users
          console.log('❌ AuthCallback: Profile check error:', profileError);
          throw new Error(`Profile check error: ${profileError.message}`);
        }

        console.log('📊 AuthCallback: Existing profile:', existingProfile);

        // Determine if profile needs creation/update
        const needsProfileCreation = !existingProfile;
        const hasCriticalFields = existingProfile?.username && existingProfile?.full_name;

        if (needsProfileCreation || !hasCriticalFields) {
          console.log('📝 AuthCallback: Creating/updating profile...');
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

          console.log('📦 AuthCallback: Profile data to upsert:', profileData);

          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert(profileData, { 
              onConflict: 'id',
              ignoreDuplicates: false 
            });

          if (upsertError) {
            console.log('❌ AuthCallback: Profile upsert error:', upsertError);
            throw new Error(`Profile upsert error: ${upsertError.message}`);
          }

          console.log('✅ AuthCallback: Profile upsert successful');
        }

        // Check if user needs to complete onboarding
        console.log('🔍 AuthCallback: Checking onboarding status...');
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('genre_persona, expression')
          .eq('id', user.id)
          .single();

        console.log('📊 AuthCallback: Updated profile check:', updatedProfile);

        // ADDED: Check for pending prompt from OAuth flow
        const pendingPrompt = localStorage.getItem('oauth_pending_prompt');
        console.log('🔍 AuthCallback: Checking for oauth_pending_prompt:', pendingPrompt);

        if (!updatedProfile?.genre_persona || !updatedProfile?.expression) {
          // Redirect to onboarding if missing critical onboarding data
          console.log('➡️ AuthCallback: Profile incomplete, redirecting to welcome');
          
          // If there's a pending prompt, save it for after onboarding
          if (pendingPrompt) {
            console.log('💾 AuthCallback: Moving prompt to sessionStorage for after onboarding:', pendingPrompt);
            sessionStorage.setItem('pending_prompt', pendingPrompt);
            localStorage.removeItem('oauth_pending_prompt');
          }
          
          navigate('/welcome', { replace: true });
        } else {
          // Profile is complete
          if (pendingPrompt) {
            console.log('✅ AuthCallback: Found pending prompt, redirecting to composer with:', pendingPrompt);
            localStorage.removeItem('oauth_pending_prompt');
            navigate(`/compose-scene?prompt=${pendingPrompt}`, { replace: true });
          } else {
            console.log('➡️ AuthCallback: No pending prompt, going to home-feed');
            navigate('/home-feed', { replace: true });
          }
        }

      } catch (err: any) {
        console.error('💥 AuthCallback: Fatal error:', err);
        setError(err.message || 'Authentication failed');
        // Fallback - send to signin page after delay
        setTimeout(() => {
          console.log('⏱️ AuthCallback: Falling back to signin');
          navigate('/signin', { replace: true });
        }, 3000);
      } finally {
        console.log('🏁 AuthCallback: Finished handling');
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