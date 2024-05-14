import { Box, Stack, TextField, Container, Button, Typography, Link } from '@mui/material';
import { useState } from 'react';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Page from '../../components/Page';
import { useNavigate } from 'react-router-dom'
import { recuperaSenha } from 'src/redux/slices/users';
import { useSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';
import { dispatch } from 'src/redux/store';

export default function EnviaEmail() {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [email, setEmail] = useState()
    const [error, setError] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    function isValidEmail(email) {
        return /\S+@\S+\.\S+/.test(email);
    }

    const enviaEmail = async () => {
        setIsSubmitting(true)
        if(isValidEmail(email)){
            const retorno = await dispatch(recuperaSenha(email))
            if(retorno){
                setIsSubmitting(false)
                navigate('/nova-senha');
            }else{
                enqueueSnackbar('O email inserido não consta no sistema.', {variant: "error"});
                setError(true)
                setIsSubmitting(false)
            }
        } else{
            setError(true)
            setIsSubmitting(false)
        }
    }

    return (
        <Page title="Recupere sua senha">
            <Box mt={28} />
            <Container maxWidth='xs'>
                <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    spacing={3}
                >
                    <LockOutlinedIcon sx={{ fontSize: 62 }}/>
                    <Typography variant="h3" textAlign='center'>Esqueceu sua senha?</Typography>
                    <Typography textAlign='center' variant='body1' sx={{color:'rgb(99, 115, 129)'}}>
                        Por favor, insira o endereço de e-mail associado à sua conta 
                        e nós lhe enviaremos um link para redefinir sua senha.
                    </Typography>
                    <TextField 
                        label="Endereço de e-mail" 
                        fullWidth 
                        value={email} 
                        onChange={(e) => {
                            setEmail(e.target.value)
                            setError(false)
                        }}
                        error={error}
                        helperText={error && "Endereço de email inválido"}
                    />
                    <LoadingButton onClick={() => enviaEmail()} sx={{width: '100%', height: '48px'}}variant="contained" loading={isSubmitting}>
                        Enviar
                    </LoadingButton>
                    <Link href="/login" variant="body2">{"<"} Retornar para login</Link>
                </Stack>
                </Container>
        </Page>
    )
}