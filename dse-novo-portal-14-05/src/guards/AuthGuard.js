import { Box, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AxiosService from 'src/api/axios_service';
import { findOrCreateUserCollection } from 'src/redux/slices/notification';
import { dispatch } from 'src/redux/store';
import { SetSession } from 'src/session';

export default function AuthGuard({ children }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  const accessToken = searchParams.get('accessToken');
  const refreshToken = searchParams.get('refreshToken');

  const getUserData = async () => {
    try {
      const axiosService = new AxiosService();
      const usuario = await axiosService.get(`usuario/getUserData`);
      return usuario;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  const start = async () => {
    try {
      let userData = await getUserData();
      const notificationCollectionId = await dispatch(findOrCreateUserCollection(userData.id));
      userData.notificationCollectionId = notificationCollectionId;
      if (userData.status === 'Inativo') {
        localStorage.removeItem('@dse-usuario');
        navigate('/login', { replace: true });
      }
      SetSession("@dse-usuario", userData);
    } catch (error) {
      console.error(error);
      localStorage.removeItem('@dse-usuario');
      navigate('/login', { replace: true });
    } finally {
      setIsLoading(false);
    }
  }

  const startFromApp = async () => {
    try {
      const axiosService = new AxiosService();
      axiosService.setTokens(accessToken, refreshToken);
      let userData = await getUserData();
      const notificationCollectionId = await dispatch(findOrCreateUserCollection(userData.id));
      userData.notificationCollectionId = notificationCollectionId;
      SetSession("@dse-usuario", userData);
      navigate('/rede-social', { replace: true });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  if (accessToken !== null && refreshToken !== null) {
    startFromApp();
  } else {
    start();
  }

  return isLoading 
  ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress /> 
  </Box>
  : <>{children}</>;
}
