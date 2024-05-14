import { Stack, Typography, Avatar, Alert, Skeleton, Grid } from '@mui/material'
import { useSelector } from 'src/redux/store';
import { useNavigate } from 'react-router-dom';
import { isMobile } from 'src/utils/isMobile';
import { styled } from '@mui/material/styles';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PaidIcon from '@mui/icons-material/Paid';
import EngineeringIcon from '@mui/icons-material/Engineering';
import AnnouncementIcon from '@mui/icons-material/Announcement';

const StackStyled = styled(Stack)(({ theme }) => ({
    border: `1px solid ${theme.palette.grey[500_32]}`,
    position: isMobile ? 'fixed' : 'relative', 
    width: isMobile ? '100%' : '320px',
    backgroundColor: theme.palette.grey[100], 
    height: '100%', 
    borderRadius: isMobile ? 0 : theme.shape.borderRadius ,
  }));

  const GridStyled = styled(Grid)(({ theme }) => ({
    cursor: 'pointer',
    '&:hover' : {
        background: theme.palette.grey[300]
    }
  }));

export default function SideBar(){
    const navigate = useNavigate();
    const { favoriteProjects, isLoading } = useSelector((state: any) => state.project)
    const QUICK_ACCESS = [
        {label: 'Facebook', link:'https://pt-br.facebook.com/dolphinengenharia/', icon: <FacebookIcon fontSize="large"/>},
        {label: 'Instagram', link:'https://www.instagram.com/dolphin_engenharia/?igshid=YmMyMTA2M2Y%3D', icon: <InstagramIcon fontSize="large"/>},
        {label: 'Linkedin', link:'https://br.linkedin.com/company/dolphinengenharia', icon: <LinkedInIcon fontSize="large"/>},
        {label: 'Contracheque', link:'http://rm.dse.com.br:8080/', icon: <PaidIcon fontSize="large"/>},
        {label: 'Vagas', link:'https://dse.com.br/vagas', icon: <EngineeringIcon fontSize="large"/>},
        {label: 'Transparência', link:'https://forms.gle/dg12CuNbmbxSyQTz6', icon: <AnnouncementIcon fontSize="large"/>},
    ];

    return(
        <StackStyled>
        {isLoading ?
            <Stack spacing={2} sx={{p:5, width: isMobile ?'100%' : '50%'}}>
                <Stack direction='row' spacing={2} alignItems='center' sx={{width: '100%'}}>
                    <Skeleton variant="circular" width={32} height={32} sx={{backgroundColor: (theme) => theme.palette.grey[400]}}/>
                    <Skeleton variant="circular" width={32} height={32} sx={{backgroundColor: (theme) => theme.palette.grey[400]}}/>
                    <Skeleton variant="circular" width={32} height={32} sx={{backgroundColor: (theme) => theme.palette.grey[400]}}/>
                </Stack>
                <Stack direction='row' spacing={2} alignItems='center' sx={{width: '100%'}}>
                    <Skeleton variant="circular" width={32} height={32} sx={{backgroundColor: (theme) => theme.palette.grey[400]}}/>
                    <Skeleton variant="circular" width={32} height={32} sx={{backgroundColor: (theme) => theme.palette.grey[400]}}/>
                    <Skeleton variant="circular" width={32} height={32} sx={{backgroundColor: (theme) => theme.palette.grey[400]}}/>
                </Stack>
                <Stack direction='row' spacing={2} alignItems='center' sx={{width: '100%'}}>
                    <Skeleton variant="circular" width={32} height={32} sx={{backgroundColor: (theme) => theme.palette.grey[400]}}/>
                    <Skeleton variant="text" width='100%' height={40} sx={{backgroundColor: (theme) => theme.palette.grey[400]}} />
                </Stack>
                <Stack direction='row' spacing={2} alignItems='center' sx={{width: '100%'}}>
                    <Skeleton variant="circular" width={32} height={32} sx={{backgroundColor: (theme) => theme.palette.grey[400]}}/>
                    <Skeleton variant="text" width='100%' height={40} sx={{backgroundColor: (theme) => theme.palette.grey[400]}} />
                </Stack>
            </Stack>
            :
            <Stack spacing={4} sx={{mb: 15, p: 2, overflow: 'auto', width: '100%'}}>
                <Stack spacing={2}>
                    <Typography variant='h6' fontWeight='bold'>
                        Acesso Rápido:
                    </Typography>
                    <Grid container direction="row" spacing={1}>
                        {QUICK_ACCESS.map((quick: any) =>
                            <GridStyled item xs={4} onClick={() => window.open(quick.link, '_blank')} >
                                <Stack direction='column' alignItems="center" justifyContent="center">
                                    <Avatar sx={{ width: 46, height: 46, backgroundColor: '#FFF', color: '#f7941e' }}>
                                        {quick.icon}
                                    </Avatar>
                                    <Typography sx={{marginTop: '2px', fontSize: '12px'}} variant='subtitle2'>
                                        {quick.label}
                                    </Typography>
                                </Stack>
                            </GridStyled>
                        )}
                    </Grid>
                </Stack>
                <Stack spacing={2}>
                    <Typography variant='h6' fontWeight='bold'>
                        Projetos Favoritos:
                    </Typography>
                    {favoriteProjects.length > 0 ? 
                        favoriteProjects.map((project: any) => 
                            <Stack onClick={() => navigate('/newdetalheprojeto/'+project.id)} direction='row' spacing={2} alignItems='center' sx={{p:1, '&:hover': {cursor: 'pointer', backgroundColor: (theme) => theme.palette.grey[300]}}}>
                                <Avatar src={project.imagem} variant="rounded" sx={{height:'32px', width:'32px'}} />
                                <Typography sx={{ fontSize: '12px' }} variant='subtitle2'>
                                    {project.nome}
                                </Typography>
                            </Stack>
                        )
                        :
                        <Alert severity='info' sx={{width: '100%'}}>
                            Você não possui projetos favoritados.
                        </Alert>
                    }
                </Stack>
            </Stack>
        }
        </StackStyled>
    )
}