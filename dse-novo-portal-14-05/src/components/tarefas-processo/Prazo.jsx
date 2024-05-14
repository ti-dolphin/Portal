import Label from '../Label'
import { useState, useEffect } from 'react';
import moment from 'moment';
import { Stack, Box, Grid, Button, TextField } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import { GetSession } from '../../session'
import { getPapeisDefinePrazoProcesso, editProcess } from '../../redux/slices/process';
import LoadingButton from '@mui/lab/LoadingButton';
import { useDispatch } from '../../redux/store'
import Modal from '../modal/modal'
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptLocale from 'date-fns/locale/pt-BR';
import {notification} from '../notification/notiflix'
import { getUsersToNotificate, sendNotification } from '../../redux/slices/notification'

export default function Prazo({reloadPage, prazo, processo = false, filled = false, icon = false}){ 
    const dispatch = useDispatch()
    const usuario = GetSession('@dse-usuario')
    const [color, setColor] = useState()
    const [showEdit, setShowEdit] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [date, setDate] = useState(prazo);
    const [isLoading, setIsLoading] = useState(false);
    const Dateformat = "DD/MM/YYYY-HH:mm"

    useEffect(() => {
        calculaPrazo()
        getPapeisDefinePrazo()
    },[prazo])

    const calculaPrazo = () => {
        if(prazo){
            const prazoDate = moment(new Date(prazo))
            const now = moment(new Date());
            const diference = prazoDate.diff(now);
    
            if(diference >= 0){
                setColor('success') // diferença positiva, o prazo é maior que a data atual, não está atrasado
            } else{
                setColor('error') // diferença negativa, o prazo é menor que a data atual, está atrasado
            }
        } else{
            setColor('default')
        }
    }

    const getPapeisDefinePrazo = async () => {
        if(processo){
            const papeis = await dispatch(getPapeisDefinePrazoProcesso(processo.processo_cadastro_id));
            papeis.map((p) => {
                if(usuario.papeis.indexOf(p.id) !== -1){
                    setShowEdit(true)        
                }

                if(p.id === 0 && usuario.id === processo.responsavel_id){
                    setShowEdit(true) 
                }
            })
        }
    }

    const handleChange = (newValue) => {
        setDate(newValue);
    };

    const editaProcesso = async () => {
        if(date != 'Invalid Date'){
            setIsLoading(true)
            let DateObj;
            let dataFormatada
            if(date){
                DateObj = new Date(date);
                dataFormatada = DateObj.getFullYear()+'-'+(DateObj.getMonth()+1)+'-'+DateObj.getDate()+' '+DateObj.getHours()+ ":" + DateObj.getMinutes()+ ":" + DateObj.getSeconds();
            } else{
                dataFormatada = null;
            }
            await dispatch(editProcess({ id: processo.id, prazo: dataFormatada }))

            const users = await getUsersToNotificate(processo.id, 0);
            const ids = users.map((user) => user.id);
            const emails = users.map((user) => user.email);

            await dispatch(sendNotification(
                'Atualização no processo: ',
                'Prazo Atualizado',
                processo.id,
                0,
                7,
                `de ${moment(prazo).format("DD/MM/YYYY-HH:mm")} para ${moment(DateObj).format("DD/MM/YYYY-HH:mm")}`,
                '',
                ids,
                emails
            ))
            setIsLoading(false)
            setShowModal(false)
            notification('success', "Prazo do processo alterado com sucesso!")
            reloadPage()
        }
    }

    return (
        <Stack direction='row' alignItems='center' spacing={1}>
            <Label variant={filled ? 'filled' : 'ghost'} color={color}> 
                {
                    icon ?
                        <Stack direction='row' alignItems='center' spacing={1}>
                            <AccessTimeIcon fontSize='small'/>
                            <Box mr={1}/>
                            {prazo ? moment(prazo).format(Dateformat) : 'Sem Prazo'}
                        </Stack>
                        :
                        prazo ? moment(prazo).format(Dateformat): 'Sem Prazo'
                }
            </Label>

            {showEdit &&
                <IconButton aria-label="delete" size="small" onClick={() => setShowModal(true)}>
                    <EditIcon fontSize='small'/>
                </IconButton>
            }

            <Modal 
                fechamodal={()=>{setShowModal(false)}} 
                title='Prazo do Processo' 
                show={showModal}
                maxWidth={'xs'}
            >
                <Box mb={2} />

                <Grid container spacing={2}>

                    <Grid item xs={12}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} locale={ptLocale}>    
                            <DateTimePicker
                                label="Prazo do Processo"
                                value={date}
                                onChange={handleChange}
                                renderInput={(params) => <TextField fullWidth {...params} />}
                            />
                        </LocalizationProvider>   
                    </Grid>

                    <Grid item xs={12} >
                        <Stack direction='row' spacing={1} justifyContent="flex-end">
                            <Button variant='contained' color="error" onClick={() => {setShowModal(false); setDate(prazo);}}>
                                Cancelar
                            </Button>
                            <LoadingButton loading={isLoading} variant='contained' onClick={() => editaProcesso()}>
                                Salvar
                            </LoadingButton>
                        </Stack>
                    </Grid>

                </Grid>

            </Modal>
        </Stack>
    )
}