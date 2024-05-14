import { useState, useEffect } from 'react'
import { Box, Checkbox, AvatarGroup, FormControlLabel } from '@mui/material';
import MAvatar from 'src/components/MAvatar';
import { fShortenNumber } from '../../../utils/formatNumber';
import createAvatar from '../../../utils/createAvatar';
import Iconify from '../../../components/Iconify';
import Label from '../../../components/Label';
import { GetSession } from '../../../session';

type Props = {
  post: any;
  postHook: any;
};

export default function BlogPostTags({ post, postHook }: Props) {
  const usuario = GetSession("@dse-usuario")
  const [like, setLike] = useState(false);

  const handleChangeLike = (newValue: boolean | null) => {
    if (newValue) {
      postHook.handleLikePost(post.id)
      setLike(true)
    } else {
      postHook.handleRemoveLikePost(post.id)
      setLike(false)
    }
  }

  useEffect(() => {
    if (post.likes?.filter((like: any) => like.usuario_id === usuario.id).length > 0) {
      setLike(true)
    } else {
      setLike(false)
    }
  }, [post])

  return (
    <Box sx={{ py: 3 }}>
      {post.tags.map((tag: any) => (
        <Label key={tag.valeu + '_' + tag.label} color={tag.tipo === 'user' ? 'secondary' : 'info'} sx={{ m: 0.5, fontWeight: 'medium' }}>{tag.label}</Label>
      ))}

      <Label color='primary' sx={{ m: 0.5, fontWeight: 'medium' }} >{post.comunidade[0]?.label ? post.comunidade[0]?.label : 'Geral'}</Label>

      <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={like}
              size="small"
              color="error"
              onChange={(e) => handleChangeLike(e.target.checked)}
              icon={<Iconify icon="eva:heart-fill" />}
              checkedIcon={<Iconify icon="eva:heart-fill" />}
            />
          }
          label={fShortenNumber((post.likes?.filter((like: any) => like.usuario_id === usuario.id).length > 0 && !like) ?
            (post.likes?.length - 1)
            :
            (post.likes?.filter((like: any) => like.usuario_id === usuario.id).length === 0 && like) ?
              (post.likes?.length + 1)
              :
              post.likes?.length
          )}
        />
        <AvatarGroup
          max={4}
          sx={{
            '& .MuiAvatar-root': { width: 32, height: 32 },
          }}
        >
          {post.likes.map((like: any) => (
            <MAvatar src={like.avatar ? like.avatar : like.usuario_tipo === 'Administrador' ? process.env.PUBLIC_URL + "/img/DOLPHIN.png" : ''} key={like.id} alt={like.usuario_nome} color={createAvatar(like.usuario_nome).color} >{createAvatar(like.usuario_nome).name}</MAvatar>
          ))}
        </AvatarGroup>
      </Box>
    </Box>
  );
}
