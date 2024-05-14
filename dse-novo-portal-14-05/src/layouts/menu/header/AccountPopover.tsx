import { useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { Box, Divider, MenuItem, Typography, Stack, CircularProgress } from '@mui/material';
import MenuPopover from '../../../components/MenuPopover';
import { IconButtonAnimate } from '../../../components/animate';
import { GetSession } from '../../../session';
import createAvatar from '../../../utils/createAvatar'
import MAvatar from '../../../components/MAvatar'
import AxiosService from 'src/api/axios_service';
import { useSnackbar } from 'notistack';
import { urlPainel } from 'src/config';
import { AxiosRequestHeaders } from 'axios';
import { unsubscribeFromTopic } from 'src/api/firebase_service';

export default function AccountPopover() {
  const anchorRef = useRef(null);
  const usuario = GetSession("@dse-usuario");
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  const MENU_OPTIONS = [
    {
      label: 'Meu perfil',
      linkTo: '/perfil',
    },
    {
      label: 'Home',
      linkTo: '/home',
    },
  ];

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const axiosService = new AxiosService();
      const refreshToken = localStorage.getItem('refreshToken');
      const headers: AxiosRequestHeaders = { 
        'authorization': `Bearer ${refreshToken}`, 
        'Content-Type': 'application/json'
      };
      await unsubscribeFromTopic(`user_${usuario.id}`);
      await axiosService.put('auth/logout', { userId: usuario.id},{headers: headers});
      axiosService.deleteTokens();
      localStorage.removeItem('@dse-usuario');
      window.open(`${urlPainel}login`, '_self');
    } catch (error) {
      enqueueSnackbar('Erro ao sair', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <IconButtonAnimate
        ref={anchorRef}
        onClick={() => handleOpen()}
        sx={{
          padding: 0,
          width: 44,
          height: 44,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
            },
          }),
        }}
      >
        <MAvatar
          alt={usuario?.nome}
          color={usuario?.photoURL ? 'default' : createAvatar(usuario?.nome).color}
          sx={{ width: 32, height: 32 }}
          src={usuario.avatar ? usuario.avatar : ''}
        >
          {createAvatar(usuario?.nome).name}
        </MAvatar>
      </IconButtonAnimate>
      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current}
        sx={{ width: 220 }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle1" noWrap>
            {usuario.nome}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {usuario.email}
          </Typography>
        </Box>
        <Divider />
        <Stack spacing={0.5} sx={{ p: 1 }}>
          {MENU_OPTIONS.map((option) => (
            <MenuItem
              key={option.label}
              to={option.linkTo}
              component={RouterLink}
              onClick={() => handleClose()}
              sx={{ typography: 'body2', py: 1, px: 2, borderRadius: 1 }}
            >
              {option.label}
            </MenuItem>
          ))}
        </Stack>
        <Divider />
        {isLoading
          ? <CircularProgress />
          : <MenuItem sx={{ typography: 'body2', py: 1, px: 2, borderRadius: 1, m: 1 }} onClick={() => logout()}>Logout</MenuItem>
        }
      </MenuPopover>
    </>
  );
}
