import { Stack, Typography } from '@mui/material';
import useResponsive from '../../hooks/useResponsive';
import Prazo from './Prazo'
import Responsaveis from './Responsaveis'
import moment from 'moment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { SetFlagPassosAntigos } from '../../redux/slices/step'
import { useDispatch, useSelector } from '../../redux/store'

export default function Infos({reloadPage, process}){
    const isDesktop = useResponsive('up', 'md');
    const Dateformat = "DD/MM/YYYY-HH:mm"
    const dispatch = useDispatch()
    const { flagPassosAntigos } = useSelector((state) => state.step)

    const handleChange = async (event) => {
        await dispatch(SetFlagPassosAntigos(event.target.checked))
    };

    return (
        <Stack direction= {isDesktop ? 'row' : 'column'} spacing={isDesktop ? 4 : 2} alignItems={isDesktop ? 'center' : 'flex-start'} sx={{pt:1}}>

            <Responsaveis/>

            <Stack spacing={0.5} direction='row'>
                <Typography variant='body2' color={(theme) => theme.palette.grey[500]}>
                    Iniciado em
                </Typography>
                <Typography variant='body2' fontWeight='bold' color={(theme) => theme.palette.grey[600]}> 
                    {moment(process.data_inicio).format(Dateformat)}
                </Typography>
            </Stack>

            <Stack spacing={0.5} direction='row' alignItems='center'>
                <Typography variant='body2' color={(theme) => theme.palette.grey[500]}>
                    Prazo
                </Typography>
                <Prazo
                    reloadPage={reloadPage}
                    prazo={process.prazo} 
                    processo={{
                        id: process.id, 
                        processo_cadastro_id: process.processo_cadastro_id, 
                        responsavel_id: process.responsavel_id
                    }} 
                    filled 
                />
            </Stack>

            <Stack spacing={0.5} direction='row' alignItems='center'>
                <FormControlLabel
                    control={
                        <Switch checked={flagPassosAntigos} onChange={handleChange}/>
                    }
                    label="Exibir tarefas antigas"
                />
            </Stack>

        </Stack> 
    )
}