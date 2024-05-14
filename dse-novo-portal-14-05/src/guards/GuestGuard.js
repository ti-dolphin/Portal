import { Navigate } from 'react-router-dom';
import { GetSession } from '../session';

export default function GuestGuard({ children }) {

  if (GetSession("@dse-usuario")) {
    return <Navigate to="/rede-social" replace />;
  }

  return <>{children}</>;
}