import { useState, useEffect } from 'react'
import { Breadcrumbs, Link, Typography, Stack, Box, Rating, IconButton, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import useResponsive from '../../hooks/useResponsive';
import moment from 'moment';

export default function Header({process, callbackRating}){
    const [rating, setRating] = useState(process.acompanhando ? 1 : 0)
    const isDesktop = useResponsive('up', 'md');
    const calculaTempo = () => {
        const prazoDate = moment(new Date(process.prazo))
        const now = moment(new Date());
        var tempoRestante = Math.round(moment.duration(prazoDate.diff(now)).asDays())

        if(tempoRestante > 0){
            return tempoRestante + ' dias restantes';
        } else{
            return '0 dias restantes'
        }
    }

    const relogio = () => {
        return(
            <Stack spacing={2}>
                <Typography variant='body2'>
                    Inicio: {moment(process.data_inicio).format("DD/MM/YYYY - HH:mm")}
                </Typography>
                {process.prazo &&
                    <Typography variant='body2'>
                        Fim: {moment(process.prazo).format("DD/MM/YYYY - HH:mm")}
                    </Typography>
                }
            </Stack>
        )
        
    }

    useEffect(()=>{
        setRating(process.acompanhando ? 1 : 0)
    },[process.acompanhando])

    return (
        <Stack direction='row' spacing={2} alignItems='center'>
            {isDesktop ?
                <>
                    <Breadcrumbs separator={<PlayArrowIcon sx={{width:'12px'}}/>}>
                        <Link href="/projetos">
                            <Typography variant='body2' color={(theme) => theme.palette.grey[900]}>
                                Projetos
                            </Typography>
                        </Link>
                        <Link href={"/newdetalheprojeto/"+process.projeto_id} target="_blank">
                            <Typography variant='body2' color={(theme) => theme.palette.grey[900]}>
                                {process.projeto}
                            </Typography>
                        </Link>
                    </Breadcrumbs>

                    <Box flexGrow={1}/>

                    <Tooltip title={relogio()}>
                        <Stack direction='row' spacing={2} alignItems='center'>
                            <AccessTimeIcon sx={{color:(theme) => theme.palette.grey[500]}}/>
                            <Typography variant='body2' color={(theme) => theme.palette.grey[500]}>
                                {calculaTempo()}
                            </Typography>
                        </Stack>
                    </Tooltip>

                    <Box mr={1}/>

                    <Rating max={1}
                        value={rating}
                        onChange={(event, newValue) => {
                            setRating(newValue)
                            callbackRating(process, newValue)
                        }}
                    />

                    {/* <Box mr={1}/>

                    <IconButton>
                        <MoreVertIcon/>
                    </IconButton> */}
                </> 
                :
                
                <Link href="/home">
                    <Stack direction='row' spacing={1.5} alignItems='center'>
                        <PlayArrowIcon sx={{width:'12px', transform:'scaleX(-1)'}}/>
                        <Typography variant='body2' color={(theme) => theme.palette.grey[900]}>
                            Voltar para os Projetos
                        </Typography>
                    </Stack>
                </Link>
            }
        </Stack>
    )
}