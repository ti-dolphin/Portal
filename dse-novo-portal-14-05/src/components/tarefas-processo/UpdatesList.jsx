import { Typography, Stack, Card, CardContent, Box, Link } from '@mui/material';
import MAvatar from '../MAvatar'
import createAvatar from '../../utils/createAvatar'
import Scrollbar from '../Scrollbar';
import moment from 'moment';

export default function UpdatesList({data}){

    return (
        <Scrollbar>
            <Stack spacing={3} pt={1} sx={{maxHeight:'500px', overflow:'auto'}}>
                {data.map((item,index) =>
                    <Stack key={'UpdatesList_'+index} direction='row' spacing={2}>

                        <MAvatar
                            alt={item.ator}
                            color={createAvatar(item.ator).color}
                            sx={{ width: 32, height: 32 }}
                        >
                            {createAvatar(item.ator).name}
                        </MAvatar>

                        <Stack spacing={1}>

                            {item.tipo === 1 ?
                                <Typography variant='body2' fontWeight='bold' display='block' alignItems='center'>
                                    {item.ator}
                                    <Typography component="span" variant='body2'>
                                        &nbsp;  alterou o status da tarefa &nbsp;
                                    </Typography>
                                    <Link fontWeight='normal' sx={{textDecoration:'underline', color:(theme) => theme.palette.success.dark}}>
                                        {item.nome} 
                                    </Link>
                                    <Typography component="span" variant='body2'>
                                        &nbsp; para {item.status}&nbsp;
                                    </Typography>
                                </Typography>
                                :
                                item.tipo === 0 ?
                                    <Typography variant='body2' fontWeight='bold' display='block' alignItems='center'>
                                        {item.ator}
                                        <Typography component="span" variant='body2'>
                                            &nbsp;  concluiu a tarefa &nbsp;
                                        </Typography>
                                        <Link fontWeight='normal' sx={{textDecoration:'underline', color:(theme) => theme.palette.success.dark}}>
                                            {item.nome} 
                                        </Link>
                                    </Typography>
                                :
                                item.tipo === 7 ?
                                    <Typography variant='body2' fontWeight='bold' display='block' alignItems='center'>
                                        {item.ator}
                                        <Typography component="span" variant='body2'>
                                            &nbsp; alterou o prazo do processo &nbsp;
                                        </Typography>
                                        <Typography component="span" variant='body2'>
                                            {item.nome} 
                                        </Typography>
                                    </Typography>
                                :
                                    <Typography variant='body2' fontWeight='bold' display='block' alignItems='center'>
                                        {item.ator}
                                        <Typography component="span" variant='body2'>
                                            &nbsp;  iniciou o processo &nbsp;
                                        </Typography>
                                        <Link fontWeight='normal' sx={{textDecoration:'underline', color:(theme) => theme.palette.success.dark}}>
                                            {item.nome} 
                                        </Link>
                                    </Typography>
                            }

                            <Typography variant='caption' color={(theme) => theme.palette.grey[500]}>
                                {moment(item.data).format("DD/MM/YY - HH:mm")}
                            </Typography>   

                        </Stack>

                    </Stack>
                )}
            </Stack>
        </Scrollbar>
    )
}