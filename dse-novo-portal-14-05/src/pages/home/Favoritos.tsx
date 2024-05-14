// @mui
import { Card, Typography, Stack, CardContent, CardHeader, Box, CardActionArea, Badge, Tooltip, Skeleton } from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
//components
import Avatar from '../../components/Avatar';
import { useDispatch, useSelector } from '../../redux/store';
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFavorites } from '../../redux/slices/project'


const RootStyle = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(7),
}));

export default function Favoritos() {
    const navigate = useNavigate();
    const theme = useTheme();
    const dispatch = useDispatch();
    const { favoriteProjects, isLoading } = useSelector((state) => state.project);
    const cardsLoading = ['1','2','3']

    useEffect(()=>{
        dispatch(getFavorites())
    },[])
 
    return (
        <RootStyle>
            <Typography variant='h4'>
                Favoritos
            </Typography>
            
                <Stack 
                    direction='row' 
                    spacing={2}
                    sx={{
                        paddingBlock:2,
                        paddingInline:'5px',
                        overflow: 'auto',
                    }}
                >
                    {isLoading ?
                            <>
                                <Skeleton variant='rectangular' sx={{borderRadius: 0.625, boxShadow: theme.shadows[5], minWidth: '200px', minHeight: '156px',}}/>
                                <Skeleton variant='rectangular' sx={{borderRadius: 0.625, boxShadow: theme.shadows[5], minWidth: '200px', minHeight: '156px',}}/>
                                <Skeleton variant='rectangular' sx={{borderRadius: 0.625, boxShadow: theme.shadows[5], minWidth: '200px', minHeight: '156px',}}/>
                            </>
                        :
                        <>
                            {favoriteProjects.length > 0 ?
                                <>
                                {favoriteProjects.map((proj,index)=> 
                                        <Card
                                            sx={{
                                                maxWidth: '232px',
                                                minWidth: '200px',
                                                minHeight: '156px',
                                                boxShadow: theme.shadows[5],
                                                borderRadius: 0.625,
                                            }}
                                            key={index}
                                        >  
                                            <CardActionArea onClick={() => {
                                                    navigate('/newdetalheprojeto/'+proj.id)
                                                    document.location.reload(true)
                                                }
                                            }>
                                                <CardHeader
                                                    sx={{
                                                        background: theme.palette.grey[200],
                                                        height: '44px'
                                                    }}
                                                    action={
                                                        <>
                                                        {proj.qtd_processo !== 0 ?
                                                            <Badge color="success" overlap="circular" badgeContent={String(proj.qtd_processo)} sx={{position: 'absolute', top: '20px', right: '20px'}}/>
                                                            :
                                                            <></>
                                                        }
                                                        </>
                                                    }
                                                />


                                                <CardContent >
                                                    <Avatar src={proj.imagem} variant="rounded" sx={{position:'absolute', top:16, left: 16, height:'56px', width:'56px'}} />
                                                    <Box mb={2}/>
                                                    <Tooltip title={proj.nome}>
                                                        <Typography sx={{textOverflow: 'ellipsis', overflow:'hidden', wordWrap:'break-word', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', display: '-webkit-box', minHeight: '48px'}}>{proj.nome}</Typography>
                                                    </Tooltip>
                                                </CardContent>

                                            </CardActionArea>
                                        </Card>  
                                )}
                            </>
                            :
                            <Card>
                                <CardContent>
                                    <Typography variant='h5'>
                                        Você não tem projetos favoritados
                                    </Typography>
                                </CardContent>
                            </Card>

                            }
                        </>
                        
                    }
                </Stack>
            
        </RootStyle>
    );
  }