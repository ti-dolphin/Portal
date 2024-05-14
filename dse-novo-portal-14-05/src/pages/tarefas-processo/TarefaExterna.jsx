import { useState, useEffect } from 'react';
import { Container, Stack, Grid, Typography, Box, Dialog, DialogContent, IconButton, Card, CardContent } from '@mui/material';
import { useDispatch, useSelector } from '../../redux/store'
import { GetSession } from '../../session'
import { useParams } from 'react-router-dom';
import { getPassoExterno } from '../../redux/slices/step'
import { getProcessExecution } from '../../redux/slices/process'
import Page from '../../components/Page';
import Loading from '../../components/Loading'
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TarefaDetalhes from '../../components/tarefas-processo/TarefaDetalhes'
import TarefaForm from '../../components/tarefas-processo/TarefaForm'
import ErrorPage from '../ErrorPage'
import { useNavigate } from 'react-router-dom'
import moment from 'moment';

// ----------------------------------------------------------------------

export default function TarefasProcesso() {
  const usuario = GetSession('@dse-usuario')
  const dispatch = useDispatch();
  const params = useParams()
  const { passo } = useSelector((state) => state.step)
  const { process } = useSelector((state) => state.process)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    reloadPage()
  },[])

  const reloadPage = async () => {
    setIsLoading(true)
    await dispatch(getPassoExterno(params.id))
    await dispatch(getProcessExecution(params.id))
    setIsLoading(false)
  }

  return (
    
    <Page title="Tarefa Externa">
    {isLoading ? 
        <Loading open={isLoading}/>
        :
        (usuario?.id) ?
            <ErrorPage title={'Você está Logado.'} subtitle={'Apenas pessoas externas podem realizar esta tarefa utilizando este link.'}/>
        :
        (passo) ?
            <>
                <Dialog  fullWidth maxWidth='lg' fullScreen={true} open={true}>
    
                        <DialogContent>
        
                            <Stack direction='row' spacing={2}>
                                <Typography variant='h4'>
                                    {passo.nome}
                                </Typography>
                                <Box flexGrow={1}/>
        
                                <IconButton>
                                    <MoreVertIcon/>
                                </IconButton>
                            </Stack>
        
                            <Grid container mt={2}>
        
                                <Grid item xs={12} md={6.7} lg={8}>
                                    <Box flexGrow={1}>
                                        <TarefaForm tarefa={passo} tarefaExterna onClose={reloadPage}/>
                                    </Box>
                                </Grid>
        
                                <Grid item xs={12} md={0.3}>
                                    <Box mt={5}/>
                                </Grid>
                                
                                <Grid item xs={12} md={5} lg={3.7}>
                                    <TarefaDetalhes tarefa={passo}/>
                                </Grid>
        
                            </Grid>

                            {passo.status === "Concluído" &&
                                <Stack alignItems='center' >
                                    <Card sx={{boxShadow:(theme) => theme.customShadows.z24 ,backgroundColor: (theme) => theme.palette.success.light, border:'solid 1px', borderColor: (theme) => theme.palette.success.dark}}>
                                        <CardContent>
                                            <Stack spacing={1} alignItems='center'>
                                            <Typography variant='body1'>
                                                Etapa externa finalizada
                                            </Typography>
                                            <Typography variant='subtitle2'>
                                                Data de finalização: {moment(passo.data_conclusao).format("DD/MM/YYYY - HH:mm")}
                                            </Typography>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Stack>
                            }
        
                        </DialogContent>
                </Dialog>
            </>  
            :
                process && process.data_fim ?
                    <ErrorPage title={'Processo finalizado'} subtitle={'Este processo já foi finalizado.'}/>  
                :
                    <ErrorPage title={'Tarefa concluída com sucesso!'} subtitle={'Não há mais ações pendentes para esta atividade.'}/>
                
    }
    
    </Page>
  );
}
