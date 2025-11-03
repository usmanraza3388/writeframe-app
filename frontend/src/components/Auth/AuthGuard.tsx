import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);

  // Pages where authentication should NOT redirect
  const noRedirectPaths = ['/signin', '/signup', '/forgot-password', '/reset-password'];
  
  useEffect(() => {
    if (isLoading) return;

    const shouldRedirect = !noRedirectPaths.includes(location.pathname);
    
    // Only redirect if we're NOT on an auth page
    if (!user && shouldRedirect) {
      navigate('/signin', { replace: true });
    }
    
    setChecked(true);
  }, [user, isLoading, location.pathname, navigate]);

  if (isLoading || !checked) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}