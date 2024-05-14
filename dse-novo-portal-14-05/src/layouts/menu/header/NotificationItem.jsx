import { Stack, Typography, Link, Divider } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import MAvatar from '../../../components/MAvatar'
import createAvatar from '../../../utils/createAvatar'

export default function NotificationItem({ notification, callback }) {
    const navigate = useNavigate();
    let splittedText = notification.nome.split('\n');

    const onClickNotification = () => {
        callback()
        if (notification.tipo !== 3 && notification.tipo !== 4) {
            navigate(`/processo/${notification.processo_id}`);
        } else {
            navigate(`/rede-social/post/${notification.post_id}`);
        }
        document.location.reload(true)
    }

    const switchNotification = () => {
        let retorno

        switch (notification.tipo) {
            case 0:
                retorno = <Typography variant='body2' fontWeight='bold' display='block' alignItems='center'>
                    {notification.ator}
                    <Typography component="span" variant='body2'>
                        &nbsp;  concluiu a tarefa &nbsp;
                    </Typography>
                    <Link fontWeight='normal' sx={{ textDecoration: 'underline', color: (theme) => theme.palette.success.dark }}>
                        {notification.nome}
                    </Link>
                </Typography>
                break;

            case 1:
                retorno = <Typography variant='body2' fontWeight='bold' display='block' alignItems='center'>
                    {notification.ator}
                    <Typography component="span" variant='body2'>
                        &nbsp;  alterou o status da tarefa &nbsp;
                    </Typography>
                    <Link fontWeight='normal' sx={{ textDecoration: 'underline', color: (theme) => theme.palette.success.dark }}>
                        {notification.nome}
                    </Link>
                    <Typography component="span" variant='body2'>
                        &nbsp; para {notification.status}&nbsp;
                    </Typography>
                </Typography>

                break;

            case 3:
                retorno = <Typography variant='body2' fontWeight='bold' display='block' alignItems='center'>
                    {notification.ator}
                    <Typography component="span" variant='body2'>
                        &nbsp; Realizou o post &nbsp;
                    </Typography>
                    <Link fontWeight='normal' sx={{ textDecoration: 'underline', color: (theme) => theme.palette.success.dark }}>
                        {notification.nome}
                    </Link>
                </Typography>

                break;

            case 4:
                retorno = <Typography variant='body2' fontWeight='bold' display='block' alignItems='center'>
                    {notification.ator}
                    <Typography component="span" variant='body2'>
                        &nbsp; Curtiu o seu post &nbsp;
                    </Typography>
                    <Link fontWeight='normal' sx={{ textDecoration: 'underline', color: (theme) => theme.palette.success.dark }}>
                        {notification.nome}
                    </Link>
                </Typography>

                break;

            case 5:
                retorno = <Typography variant='body2' fontWeight='bold' display='block' alignItems='center'>
                    {notification.ator}
                    <Typography component="span" variant='body2'>
                        &nbsp; Comentou no seu post &nbsp;
                    </Typography>
                    <Link fontWeight='normal' sx={{ textDecoration: 'underline', color: (theme) => theme.palette.success.dark }}>
                        {notification.nome}
                    </Link>
                </Typography>

                break;

            case 6:
                retorno = <Typography variant='body2' fontWeight='bold' display='block' alignItems='center'>
                    {notification.ator}
                    <Typography component="span" variant='body2'>
                        &nbsp; Respondeu seu comentário no post &nbsp;
                    </Typography>
                    <Link fontWeight='normal' sx={{ textDecoration: 'underline', color: (theme) => theme.palette.success.dark }}>
                        {notification.nome}
                    </Link>
                </Typography>

                break;

            default:
                retorno = <Typography variant='body2' fontWeight='bold' display='block' alignItems='center'>
                    {notification.ator}
                    <Typography component="span" variant='body2'>
                        &nbsp;  iniciou o processo &nbsp;
                    </Typography>
                    <Link fontWeight='normal' sx={{ textDecoration: 'underline', color: (theme) => theme.palette.success.dark }}>
                        {notification.nome}
                    </Link>
                </Typography>
                break;
        }
        return retorno
    }

    return (
        <>
            <Stack
                direction='row'
                alignItems='center'
                onClick={() => onClickNotification()}
                spacing={2}
                p={2}
                sx={{
                    backgroundColor: (theme) => notification.read === false ? theme.palette.grey[200] : theme.palette.grey[0],
                    '&:hover': {
                        cursor: 'pointer',
                        backgroundColor: (theme) => theme.palette.grey[300]
                    }
                }}
            >
                {/* <MAvatar
                    alt={notification.ator}
                    color={createAvatar(notification.ator).color}
                    sx={{ width: 32, height: 32 }}
                >
                    {createAvatar(notification.ator).name}
                </MAvatar> */}
                <Stack spacing={1}>
                    <Typography variant='body2' fontWeight='bold' display='block' alignItems='center'>
                        {notification.ator}<br />
                        {splittedText.map((text, index) => {
                            return (index == splittedText.length - 1 ?
                                <Link fontWeight='normal' sx={{ textDecoration: 'underline', color: (theme) => theme.palette.success.dark }}>
                                    {text}
                                </Link>
                                :
                                <Typography component="span" variant='body2'>
                                    {text}<br/>
                                </Typography>
                            )
                        })}
                    </Typography>
                </Stack>
            </Stack>
            <Divider />
        </>
    )
}