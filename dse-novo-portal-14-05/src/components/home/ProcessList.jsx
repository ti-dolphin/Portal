import { Card, Grid } from '@mui/material';
import Table from '../Table'
import CustomCard from '../Card'
import { useNavigate } from 'react-router-dom'
import { GetSession } from '../../session';
import { useDispatch } from '../../redux/store';
import { setUsersObservadores, deletUserObservador } from '../../redux/slices/users'
import { getProcessHome } from '../../redux/slices/process'
import OfflinePinOutlinedIcon from '@mui/icons-material/OfflinePinOutlined';
import { getUsersToNotificate, pushNotificationModel, sendPushNotification } from 'src/redux/slices/notification';

export default function ProcessList({ data, acompanhando, view }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const usuario = GetSession('@dse-usuario')
    const HEAD = [
        { id: 'avatar', label: 'Cliente', alignRight: false },
        { id: 'pid', label: 'PID', alignRight: false },
        { id: 'title', label: 'Projeto', alignRight: false },
        { id: 'processo', label: 'Processo', alignRight: false },
        { id: 'titulo', label: 'Título', alignRight: false },
        { id: 'andamento', label: <OfflinePinOutlinedIcon color='transparent' />, alignRight: false },
        { id: 'tarefa_atual', label: 'Tarefa', alignRight: false },
        { id: 'prazo_tarefa', label: 'Prazo Tarefa', alignRight: false },
        { id: 'prazo_processo', label: 'Prazo Processo', alignRight: false },
        { id: 'responsavel', label: 'Responsável', alignRight: false },
        { id: 'status', label: 'Status', alignRight: false },
        { id: 'comentario', label: '', alignRight: false },
        { id: 'acompanhando', label: '', alignRight: false },
    ];

    const callBack = (process) => {
        navigate('/processo/' + process.pid);
        document.location.reload(true)
    }

    const callbackRating = async (data, newValue) => {
        if (newValue) {
            const users = await getUsersToNotificate(data.pid, 1);
            const ids = users.map((user) => user.id);
            // // ENVIA PUSH ACOMPANHANDO PROCESSO PARA O PRÓPRIO USER
            // await sendPushNotification({ 
            //     title: pushNotificationModel.userFollowProcess.title, 
            //     body: pushNotificationModel.userFollowProcess.body(data.processo),  
            //     ids: [usuario.id]
            // });
            // // ENVIA PUSH ACOMPANHANDO PROCESSO PARA OS DEMAIS
            // await sendPushNotification({ 
            //     title: pushNotificationModel.otherUserFollowProcess.title, 
            //     body: pushNotificationModel.otherUserFollowProcess.body(usuario.nome, data.processo),  
            //     ids: ids
            // });
            await dispatch(setUsersObservadores(data.pid, usuario.id, 'Execução')) // Insere usuário como acompanhante do processo
        } else {
            await dispatch(deletUserObservador(data.pid, usuario.id, 'Execução')) // Remove usuário do acompanhamento do processo
        }
        dispatch(getProcessHome())
    }

    return (
        <>
            {view === 'List' ?
                <Card>
                    <Table header={HEAD} data={data} acompanhando={acompanhando} callbackRating={callbackRating} />
                </Card>
                :
                <Grid container spacing={2}>
                    {data.map((cardData, index) => (
                        <Grid key={'cardAndamento_' + index} item xs={12} md={6} lg={4}>
                            <CustomCard data={cardData} callbackCard={callBack} acompanhando={acompanhando} callbackRating={callbackRating} />
                        </Grid>
                    ))
                    }
                </Grid>
            }
        </>
    );
}