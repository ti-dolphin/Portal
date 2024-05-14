import { useState } from 'react';
import { Box, Button, Divider, ListItem, TextField, Typography, ListItemText, ListItemAvatar, IconButton, Stack, Tooltip } from '@mui/material';
import MAvatar from 'src/components/MAvatar';
import { Icon } from '@iconify/react';
import { fDateTime } from '../../../utils/formatTime';
import createAvatar from '../../../utils/createAvatar';
import { GetSession } from "src/session"

type Props = {
  tipo: string;
  name: string;
  message: string;
  postedAt: Date;
  hasReply?: boolean;
  postHook: any;
  commentId: number;
  userId: number;
  avatar?: string;
};

export default function BlogPostCommentItem({
  tipo,
  name,
  message,
  postedAt,
  hasReply,
  postHook,
  commentId,
  userId,
  avatar
}: Props) {
  const [openReply, setOpenReply] = useState(false);
  const [reply, setReply] = useState('');
  const usuario = GetSession("@dse-usuario")

  const sendReply = () => {
    postHook.handleReplyCommentPost(reply, commentId, userId)
    setReply('');
    setOpenReply(false)
  }

  return (
    <>
      <ListItem
        disableGutters
        sx={{
          alignItems: 'flex-start',
          py: 3,
          ...(hasReply && {
            ml: 'auto',
            width: (theme) => `calc(100% - ${theme.spacing(7)})`,
          }),
        }}
      >
        <ListItemAvatar>
          <MAvatar alt={name} src={avatar ? avatar : tipo === 'Administrador' ? process.env.PUBLIC_URL + "/img/DOLPHIN.png" : ''} color={createAvatar(name).color} sx={{ width: 48, height: 48 }}>{createAvatar(name).name}</MAvatar>
        </ListItemAvatar>

        <ListItemText
          primary={name}
          primaryTypographyProps={{ variant: 'subtitle1' }}
          secondary={
            <>
              <Typography
                gutterBottom
                variant="caption"
                sx={{
                  display: 'block',
                  color: 'text.disabled',
                }}
              >
                {fDateTime(postedAt)}
              </Typography>
              <Typography component="span" variant="body2">
                {message}
              </Typography>
            </>
          }
        />
        <Stack spacing={2} justifyContent='space-between' alignItems='flex-end'>
          {!hasReply && (
            <Button size="small" onClick={() => { setOpenReply(!openReply); setReply('') }} color={openReply ? 'error' : 'primary'}>
              {openReply ? 'Cancelar' : 'Responder'}
            </Button>
          )}
          {userId === usuario.id &&
            <Tooltip title='Deletar Comentário'>
              <IconButton color='error' onClick={() => postHook.handleRemoveComment(commentId)}>
                <Icon icon={'akar-icons:trash-can'} width={18} height={18} />
              </IconButton>
            </Tooltip>
          }
        </Stack>
      </ListItem>

      {!hasReply && openReply && (
        <Box
          sx={{
            mb: 3,
            ml: 'auto',
            width: (theme) => `calc(100% - ${theme.spacing(7)})`,
          }}
        >
          <TextField
            value={reply}
            fullWidth
            size="small"
            placeholder="Escreva um comentário"
            onChange={(e) => setReply(e.target.value)}
            InputProps={{
              sx: {
                border: (theme) => `solid 1px ${theme.palette.grey[500_32]} !important`,
              },
              endAdornment: <IconButton disabled={!reply || reply === ''} color='primary' onClick={() => sendReply()}>
                <Icon icon={'ant-design:send-outlined'} width={24} height={24} />
              </IconButton>
            }}

          />
        </Box>
      )}

      <Divider
        sx={{
          ml: 'auto',
          width: (theme) => `calc(100% - ${theme.spacing(7)})`,
        }}
      />
    </>
  );
}
