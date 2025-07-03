import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface RedirectWithParamsProps {
  from: string;
  to: string;
}

export function RedirectWithParams({ from, to }: RedirectWithParamsProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath.startsWith(from)) {
      const remainingPath = currentPath.replace(from, '');
      const newPath = to + remainingPath;
      navigate(newPath, { replace: true });
    }
  }, [location.pathname, from, to, navigate]);

  return null;
}