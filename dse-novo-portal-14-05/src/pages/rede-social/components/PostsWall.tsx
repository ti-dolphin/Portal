import { Card, Stack, Typography, Box } from '@mui/material'
import moment from 'moment'
import Iconify from 'src/components/Iconify'
import { GetSession } from '../../../session';
import Scrollbar from 'src/components/Scrollbar';
import TextMaxLine from 'src/components/TextMaxLine';
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'src/redux/store';
import { styled } from '@mui/material/styles';
import Markdown from '../../../components/Markdown';
import Image from '../../../components/Image'


type Props = {
    redeSocialHook: any;
}

const CardStyled = styled(Card)(({ theme }) => ({
    boxShadow: theme.customShadows.z8,
    maxWidth:'300px',
    minWidth:'300px',
    minHeight: '170px',
    maxHeight: '170px',
    borderRadius: theme.shape.borderRadius, 
    backgroundColor: theme.palette.grey[0],
    border: `3px solid #D6DDF9`, 
    "&:hover":{cursor:"pointer", backgroundColor: theme.palette.grey[100]}
  }));

export default function PostsWall({redeSocialHook}: Props){
    const { postsMural } = useSelector((state: any) => state.post)
    const navigate = useNavigate()
    const usuario = GetSession("@dse-usuario")

    const isVideo = (archive: any) => {
        if(!archive.titulo.toLowerCase().includes('.mp4') && 
            !archive.titulo.toLowerCase().includes('.webm') && 
            !archive.titulo.toLowerCase().includes('.ogg')){
            return false
        } else{
            return true
        }
    }

    return(
        postsMural.length > 0 &&
        <Stack>
            <Scrollbar>
                <Stack direction='row' spacing={2} width='100%' sx={{overflow:'auto',p: 3}}>
                    {postsMural.map((post: any) =>
                        <Box position='relative' key={'PostWall_'+post.id}>
                            {usuario.tipo === 'Administrador' &&
                                <Iconify onClick={() => redeSocialHook.removePostWall(post.id)} icon={'icon-park-outline:close-one'} position='absolute' width={24} height={24} color='error.main' sx={{right: '-10px', top: '-10px', zIndex: 2,  "&:hover":{cursor:"pointer"} }}/>
                            }
                            <CardStyled onClick={() => navigate(`/rede-social/post/${post.id}`)} key={post.id}>
                                {post.arquivos && post.arquivos.length > 0 && !isVideo(post.arquivos[0]) ?
                                    <Image src={post.arquivos[0].url} ratio='16/9' sx={{ borderRadius: 1 }}/>
                                    :
                                    <Stack spacing={1} sx={{p:2, minHeight: '170px'}}>
                                        <TextMaxLine line={3} persistent variant='body2'>
                                            <Markdown simple={true} children={post.conteudo} linkable/>
                                        </TextMaxLine>
                                        <Box flexGrow={1} height='100%'/>
                                        <Stack direction='row' alignItems='center'>
                                            <Typography variant='caption' sx={{color: (theme) => theme.palette.text.disabled}}>
                                                {post.usuario_nome}
                                            </Typography> 
                                            <Box flexGrow={1}/>
                                            <Typography variant='caption' sx={{color: (theme) => theme.palette.text.disabled}}>
                                                {moment(post.data).format('DD/MM/YY - HH:mm')}
                                            </Typography> 
                                        </Stack>
                                    </Stack>
                                }
                            </CardStyled>
                        </Box>
                    )}
                </Stack>
            </Scrollbar>
        </Stack>
    )
}