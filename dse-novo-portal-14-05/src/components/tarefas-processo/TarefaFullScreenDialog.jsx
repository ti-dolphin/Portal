import { Dialog, DialogContent, Typography, Stack, Box, IconButton, Grid } from '@mui/material';
import { useSelector } from '../../redux/store'
import CloseIcon from '@mui/icons-material/Close';
import TarefaDetalhes from './TarefaDetalhes'
import TarefaComents from './TarefaComents'
import TarefaForm from './TarefaForm'
import Loading from '../Loading'

export default function TarefaFullScreenDialog({open, onClose, onCloseIcon, fullScreen}){
    const { passo, isLoading } = useSelector((state) => state.step)

    return <Dialog  fullWidth maxWidth='lg' fullScreen={fullScreen} open={open} onClose={onClose}>
        {isLoading ? 
            <Loading open={isLoading}/>
            :
            <DialogContent>
                <Stack direction='row' spacing={2}>
                    <Typography variant='h4'>
                        {passo.nome}
                    </Typography>
                    <Box flexGrow={1}/>
                    <IconButton onClick={() => onCloseIcon()}>
                        <CloseIcon/>
                    </IconButton>
                </Stack>
                <Grid container mt={2}>
                    <Grid item xs={12} md={6.7} lg={8}>
                        <Box flexGrow={1}>
                            <TarefaForm tarefa={passo} onClose={onClose}/>
                        </Box>
                        <TarefaComents tarefa={passo}/>
                    </Grid>
                    <Grid item xs={12} md={0.3}>
                        <Box mt={5}/>
                    </Grid>
                    <Grid item xs={12} md={5} lg={3.7}>
                        <TarefaDetalhes tarefa={passo}/>
                    </Grid>
                </Grid>
            </DialogContent>
        }
    </Dialog>
}