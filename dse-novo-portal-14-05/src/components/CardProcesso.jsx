import { 
    Card,
    CardContent,
    Typography,
    CardActions,
    IconButton,
    Stack
} from '@mui/material'

import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom'
import moment from 'moment';


export default function CustomCard({ callbackCard, data, callbackDelete, callbackVolta }) {
    const navigate = useNavigate();
    const Dateformat = "DD/MM/YYYY"

  return (
    <Card>
        <CardContent sx={{textAlign: 'center'}}>
            <Typography >
                {data.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {moment(data.date).locale('pt-br').format(Dateformat)}
            </Typography>
        </CardContent>

        <hr />

        <CardActions sx={{justifyContent: 'space-evenly'}}>

            <Stack spacing={1} alignItems='center'>
                <IconButton aria-label="SettingsIcon" onClick={()=>navigate('/configura-processo/'+data.id) }>
                    <SettingsIcon />
                </IconButton>
                <Typography>
                    Configurar
                </Typography>
            </Stack>

            <Stack spacing={1} alignItems='center'>
                <IconButton aria-label="DeleteIcon" onClick={() => callbackDelete()}>
                    <DeleteIcon />
                </IconButton>
                <Typography>
                    Inativar
                </Typography>
            </Stack>

            <Stack spacing={1} alignItems='center'>
                <IconButton aria-label="ArrowBackIcon" onClick={() => callbackVolta()}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography>
                    Voltar Versão
                </Typography>
            </Stack>
            
        </CardActions>
    </Card>
  );
}