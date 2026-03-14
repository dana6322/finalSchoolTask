import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const navigate = useNavigate();

  if (!token) {
    navigate('/login');
    return null;
  }

  return <>{children}</>;
}
