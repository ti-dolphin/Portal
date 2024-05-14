import { useEffect, useState } from 'react';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Typography, Switch, FormControlLabel, Stack } from '@mui/material';
import MAvatar from 'src/components/MAvatar';
import { useDispatch } from 'src/redux/store';
// utils
import { fDate } from '../../../utils/formatTime';
import createAvatar from '../../../utils/createAvatar';
import { updatePost } from 'src/redux/slices/post';
import { useSnackbar } from 'notistack';
import { GetSession } from '../../../session';
import { dataAtual } from 'src/utils/utils';


// ----------------------------------------------------------------------

const OverlayStyle = styled('h1')(({ theme }) => ({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  zIndex: 9,
}));

const FooterStyle = styled('div')(({ theme }) => ({
  bottom: 0,
  zIndex: 10,
  width: '100%',
  display: 'flex',
  alignItems: 'flex-end',
  paddingRight: theme.spacing(2),
  paddingLeft: theme.spacing(3),
  paddingTop: theme.spacing(5),
  justifyContent: 'space-between',
  [theme.breakpoints.up('md')]: {
    alignItems: 'center',
    paddingLeft: theme.spacing(5),
  },
}));

// ----------------------------------------------------------------------

type Props = {
  post: any;
};

export default function BlogPostHero({ post }: Props) {
  const [showMural, setShowMural] = useState(post.mural === 1);
  const [showComentarios, setShowComentarios] = useState(post.permitir_comentarios === 1);
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const usuario = GetSession("@dse-usuario")

  useEffect(() =>{
    setShowMural(post.mural === 1)
    setShowComentarios(post.permitir_comentarios === 1)
  },[post])

  const changeShowMural = async (newValue: boolean) =>{
    setShowMural(newValue);
    var res = await dispatch(updatePost({id: post.id, mural: newValue ? 1 : 0, data_mural: newValue ? dataAtual() : null}))
    if(newValue){
      enqueueSnackbar('Post foi publicado no mural!');
    }else{
      enqueueSnackbar('Post foi removido do mural!');
    }
  }

  const changeShowComentarios = async (newValue: boolean) => {
    setShowComentarios(newValue);
    var res = await dispatch(updatePost({id: post.id, permitir_comentarios: newValue ? 1 : 0 }))
    if(newValue){
      enqueueSnackbar('Permitido comentários no post!');
    }else{
      enqueueSnackbar('Não permitido comentários no post!');
    }
    window.location.reload()
  }
 
  return (
    <Box>
      <FooterStyle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MAvatar src={ post.avatar ? post.avatar : post.usuario_tipo === 'Administrador' ? process.env.PUBLIC_URL+"/img/DOLPHIN.png" : ''} color={createAvatar(post.usuario_nome).color}  sx={{ width: 48, height: 48 }} >{createAvatar(post.usuario_nome).name}</MAvatar>
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'common.black' }}>
              {post.usuario_nome}
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.500' }}>
              {fDate(post.data)}
            </Typography>
          </Box>
        </Box>
        {usuario.tipo === "Administrador" &&
          <Stack direction="column">
              <FormControlLabel
                control={
                  <Switch checked={showComentarios} onChange={(e) => changeShowComentarios(e.target.checked)}/>
                }
                label="Permitir Comentários"
                labelPlacement="start"
              />

            <FormControlLabel
              control={
                <Switch checked={showMural} onChange={(e) => changeShowMural(e.target.checked)}/>
              }
              label="Publicar no mural"
              labelPlacement="start"
            />

          </Stack>
        }
      </FooterStyle>

      <OverlayStyle />
    </Box>
  );
}
