/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useState, useEffect } from 'react';
import { Box, Badge, Button, Stack, Typography } from '@mui/material';
import NotificationItem from './NotificationItem'
import { getUserNotifications, markNotificatiosAsRead } from '../../../redux/slices/notification'
import { dispatch, useSelector } from '../../../redux/store'
import Iconify from '../../../components/Iconify';
import Scrollbar from '../../../components/Scrollbar';
import MenuPopover from '../../../components/MenuPopover';
import { IconButtonAnimate } from '../../../components/animate';
import { GetSession } from 'src/session';
import { db } from 'src/api/firebase_service';

export default function NotificationsPopover() {
  const { userNotifications, unreadUserNotificationsQuantity } = useSelector((state) => state.notification);
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [max, setMax] = useState(20);
  const usuario = GetSession("@dse-usuario");

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    dispatch(markNotificatiosAsRead(usuario.notificationCollectionId));
    setOpen(false);
    setMax(20)
  };

  useEffect(() => {
    if (usuario) {
      db.collection("notifications").doc(usuario!.notificationCollectionId).onSnapshot(() => { 
        dispatch(getUserNotifications(usuario!.notificationCollectionId));
        console.log('BUSCANDO NOTIFICACOES');
      });
    }  
  }, []);

  return (
    <>
      <IconButtonAnimate
        ref={anchorRef}
        size="large"
        color={open ? 'primary' : 'default'}
        onClick={() => handleOpen()}
      >
        <Badge badgeContent={unreadUserNotificationsQuantity} color="error">
          <Iconify icon="eva:bell-fill" width={20} height={20} />
        </Badge>
      </IconButtonAnimate>
      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current}
        sx={{ width: 360, maxHeight: 300, overflow: 'auto' }}
      >
        <Scrollbar>
          {userNotifications.length > 0 ?
            <>
              {userNotifications.map((notification, index) =>
                index < max &&
                <NotificationItem key={`Notifications_${index}`} callback={handleClose} notification={notification} />
              )}
              {userNotifications.length > max &&
                <Stack direction='row' sx={{ width: '100%' }} justifyContent='center'>
                  <Button sx={{ width: '100%' }} onClick={() => setMax(max + 10)}> Ver mais... </Button>
                </Stack>
              }
            </>
            :
            <Box p={2}>
              <Typography variant='subtitle2'>
                Nada para mostrar.
              </Typography>
            </Box>
          }
        </Scrollbar>
      </MenuPopover>
    </>
  );
}