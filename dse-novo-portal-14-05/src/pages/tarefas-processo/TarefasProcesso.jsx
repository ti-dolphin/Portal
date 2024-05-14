import { useState, useEffect } from 'react';
import { Container, Stack, Grid, Typography, Box, Card, CardContent, CardActionArea, Button, TextField } from '@mui/material';
import { useDispatch, useSelector } from '../../redux/store'
import { getProcessExecution, getProcessResponsaveis } from '../../redux/slices/process';
import { GetSession } from '../../session'
import { setUsersObservadores, deletUserObservador } from '../../redux/slices/users';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { getPassosProcess, getPassoComents, getPasso, verifyPermission, getPassosErroCondicao, continuaProcesso } from '../../redux/slices/step'
import useResponsive from '../../hooks/useResponsive';
import Page from '../../components/Page';
import Header from '../../components/tarefas-processo/Header';
import Title from '../../components/tarefas-processo/Title';
import Infos from '../../components/tarefas-processo/Infos';
import TarefasTable from '../../components/tarefas-processo/TarefasTable';
import TarefaCard from '../../components/tarefas-processo/TarefaCard';
import Updates from '../../components/tarefas-processo/Updates';
import TarefaFullScreenDialog from '../../components/tarefas-processo/TarefaFullScreenDialog';
import Loading from '../../components/Loading'
import Modal from '../../components/modal/modal'
import { notification } from '../../components/notification/notiflix'

export default function TarefasProcesso() {
  const usuario = GetSession('@dse-usuario')
  const dispatch = useDispatch()
  const params = useParams()
  const [openModal, setOpenModal] = useState(false)
  const isDesktop = useResponsive('up', 'md');
  const { process, processResponsaveis } = useSelector((state) => state.process)
  const { passosProcesso, flagPassosAntigos, passosErroCondicao } = useSelector((state) => state.step)
  const [isLoading, setIsLoading] = useState(false);
  const [firsTime, setFirstTime] = useState(true)
  const [showModalConditionError, setShowModalConditionError] = useState(false)
  const [conditionErrorSelect, setConditionErrorSelect] = useState()
  const [pesquisarTarefa, setPesquisarTarefa] = useState('')

  useEffect(() => {
    reloadPage()
  },[flagPassosAntigos])

  useEffect(() => {
    abreTarefa()
  },[passosProcesso])

  const abreTarefa = async () => {
    if(passosProcesso.length > 0 && firsTime){
      for (let p of passosProcesso) {
        if((p.subprocesso_id && p.subprocesso_id != 0 && p.status != "Concluído") || p.status === "Não Iniciado" || p.status === "Não Concluído" || p.status === "Aguardando" || p.status === "Fazendo"){
          if(await dispatch(verifyPermission(p.id))){
            callbackClickTarefa({id: p.id})
            break;
          }
        }
      }
      setFirstTime(false)
    }
  }
   
  const callbackClickTarefa = async (tarefa) => {
    setIsLoading(true)
    dispatch(getPasso(tarefa.id, params.id))
    dispatch(getPassoComents(tarefa.id))
    setIsLoading(false)
    setOpenModal(true);
  }

  const callbackRating = async (data, newValue) => {
    if(newValue){
        await dispatch(setUsersObservadores(data.id, usuario.id, 'Execução')) // Insere usuário como acompanhante do processo
    } else{
        await dispatch(deletUserObservador(data.id, usuario.id, 'Execução')) // Remove usuário do acompanhamento do processo
    }
  }

  const reloadPage = async () => {
    setIsLoading(true)
    await dispatch(getProcessResponsaveis(params.id))
    await dispatch(getProcessExecution(params.id))
    await dispatch(getPassosProcess(params.id, flagPassosAntigos))
    setIsLoading(false)
  }

  const closeModal = async (newTarefa = null) => {
    setFirstTime(true)
    reloadPage();
    setOpenModal(false);
  }

  const onCloseIcon = () => {
    setFirstTime(false)
    reloadPage();
    setOpenModal(false);
  }

  const continuarProcesso = async () => {
    try {
      if(conditionErrorSelect){
        await dispatch(continuaProcesso({...conditionErrorSelect, processo_id: params.id, user: usuario.id }))
        setShowModalConditionError(false)
        reloadPage()
      } else{
        notification('error', "Selecione uma das possíveis tarefas para continuar")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const filtraTarefas = (e) => {
    setPesquisarTarefa(e.target.value)
  }

  return (
    
    <Page title="Processo">
    <Loading open={isLoading}/>
    {process.id &&
      <Container maxWidth={false}>
        <Stack spacing={2}>

            <Header process={process} callbackRating={callbackRating}/>
            <Title title={process.descricao} subtitle={process.nome}/>
            <Infos reloadPage={reloadPage} process={process}/>

            {process.data_fim &&
              <Stack alignItems='center'>
                <Card sx={{boxShadow:(theme) => theme.customShadows.z24 ,backgroundColor: (theme) => theme.palette.success.light, border:'solid 1px', borderColor: (theme) => theme.palette.success.dark}}>
                  <CardContent>
                    <Stack spacing={1} alignItems='center'>
                      <Typography variant='body1'>
                        Este processo já foi finalizado
                      </Typography>
                      <Typography variant='subtitle2'>
                        Data de finalização: {moment(process.data_fim).format("DD/MM/YYYY - HH:mm")}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            }

            {process.condition_error === '1' &&
              <Stack alignItems='center'>
                <Card sx={{boxShadow:(theme) => theme.customShadows.z24 ,backgroundColor: (theme) => theme.palette.warning.light, border:'solid 1px', borderColor: (theme) => theme.palette.warning.dark}}>
                  <CardContent>
                    <Stack spacing={1} alignItems='center'>
                      <Typography variant='body1'>
                        A condição do último passo não foi cumprida
                      </Typography>
                      <Typography variant='subtitle2'>
                        Contate um administrador ou o responsável pelo processo para dar segmento.
                      </Typography>
                      {(usuario.tipo === "Administrador") && 
                        <Button variant='outlined' color="primary" onClick={ async () => {
                          await dispatch(getPassosErroCondicao(params.id))
                          setShowModalConditionError(true) 
                        }
                        }>Continuar processo</Button>
                      }
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            }

            <Modal 
                fechamodal={() => { setShowModalConditionError(false) }} 
                title='Selecione a proxima tarefa do processo' 
                show={showModalConditionError}
            >
              <Stack direction="column" spacing={2} mt={2}>

                <TextField value={pesquisarTarefa} onChange={filtraTarefas} label="Pesquisar Tarefa"/>

                {passosErroCondicao.filter((passo) => passo.nome.toLowerCase().includes(pesquisarTarefa.toLowerCase())).map((p) => (
                  <Card sx={{ background: conditionErrorSelect?.id === p.id ? (theme) => theme.palette.grey[400] : null }}>
                    <CardActionArea onClick={ () => setConditionErrorSelect(p) }>
                      <CardContent>
                        <Typography variant="button">
                          {p.nome}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}

                <Box>
                  <Button variant='outlined' color="primary" sx={{ float: "right" }} onClick={() =>continuarProcesso()}>
                    Continuar processo
                  </Button>
                </Box>

              </Stack>

            </Modal>
            
            <Grid container sx={{xs:{pt:2}, md:{p:3}}}>

              <Grid item xs={12} md={8.7}>
                <Typography variant='h5'> Tarefas </Typography>

                <Box mt={2} />

                {(usuario.tipo === "Administrador") && 
                  <Button variant='outlined' color="primary" onClick={ async () => {
                    await dispatch(getPassosErroCondicao(params.id))
                    setShowModalConditionError(true) 
                  }
                  }>Dar segmento ao processo</Button>
                }

                {isDesktop ? 
                  <TarefasTable callback={callbackClickTarefa}/>
                  :
                  <Grid container spacing={3} mt={1}>
                    {passosProcesso.map((tarefa, index) =>
                      <Grid item xs={12} key={'tarefa_'+index}>
                        <TarefaCard tarefa={tarefa} callback={callbackClickTarefa}/>
                      </Grid>
                    )}
                  </Grid>
                }
              </Grid>

              <Grid item xs={12} md={0.3}>
                <Box mt={5}/>
              </Grid>

              <Grid item xs={12} md={3}>
                {/* <Typography variant='h5'> Atualizações </Typography> */}
                <Updates process_id={params.id}/>
              </Grid>

            </Grid>

        </Stack>
        <TarefaFullScreenDialog open={openModal} onClose={closeModal} onCloseIcon={onCloseIcon} fullScreen/> 
      </Container>
      
    }
    </Page>
  );
}
