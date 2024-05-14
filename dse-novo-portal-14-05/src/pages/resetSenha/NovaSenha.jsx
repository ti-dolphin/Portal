import { Box, Stack, TextField, Container, Typography, Link, InputAdornment, IconButton } from '@mui/material';
import { useState, useEffect, createRef } from 'react';
import Page from '../../components/Page';
import Iconify from '../../components/Iconify';
import { dispatch, useSelector } from "src/redux/store"
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack';
import { atualizaSenha } from 'src/redux/slices/users';
import { LoadingButton } from '@mui/lab';

export default function NovaSenha() {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const { codigoSenha } = useSelector((state) => state.users)
    const [codigo, setCodigo] = useState(Array(6).fill(''))
    const [errors, setErrors] = useState(Array(6).fill(false))
    const [senha, setSenha] = useState('')
    const [confirmaSenha, setConfirmaSenha] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [errorSenha, setErrorSenha] = useState(false);
    const [errorConfirmaSenha, setErrorConfirmaSenha] = useState(false);
    const [helperSenha, setHelperSenha] = useState()
    const [helperConfirmaSenha, setHelperConfirmaSenha] = useState()
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (!codigoSenha) {
            navigate('/recupera-senha')
        }
    }, [])

    const utilizeFocus = () => {
        const ref = createRef()
        const setFocus = () => { ref.current && ref.current.focus() }
        return { setFocus, ref }
    }

    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    const refArray = [utilizeFocus(), utilizeFocus(), utilizeFocus(), utilizeFocus(), utilizeFocus(), utilizeFocus()]

    const atualizaCodigo = (value, index) => {
        const tempErrors = Array(6).fill(false)
        const tempCodigo = [...codigo];
        tempCodigo[index] = value[value.length - 1]
        setCodigo(tempCodigo);
        setErrors(tempErrors)
    }

    const focusInput = (e, index) => {
        if (e.keyCode === 8) {
            if (index > 0) {
                refArray[index - 1].setFocus()
            }
        } else if (index < 5) {
            if (isNumber(codigo[index])) {
                refArray[index + 1].setFocus()
            }
        }
    }

    const RenderCodigo = () => {
        const retorno = []
        for (let index = 0; index < 6; index++) {
            retorno.push(
                <TextField
                    inputRef={refArray[index].ref}
                    type="number"
                    value={codigo[index]}
                    error={errors[index]}
                    onChange={(e) => atualizaCodigo(e.target.value, index)}
                    onKeyUp={(e) => focusInput(e, index)}
                    placeholder='-'
                    inputProps={{ style: { textAlign: 'center' } }}
                />
            )
        }
        return retorno
    }

    const SendAtualizaSenha = async () => {
        setIsSubmitting(true)
        const tempErrors = Array(6).fill(false)
        setErrors(tempErrors)
        let verify = true

        if (senha.length < 8) {
            setHelperSenha('A senha precisa ter ao menos 8 caracteres.')
            setErrorSenha(true)
            verify = false
        } else {
            setErrorSenha(false)
        }

        if (confirmaSenha.length < 8) {
            setHelperConfirmaSenha('A senha precisa ter ao menos 8 caracteres.')
            setErrorConfirmaSenha(true)
            verify = false
        } else {
            setErrorConfirmaSenha(false)
        }

        if (confirmaSenha.length >= 8 && senha.length >= 8 && senha !== confirmaSenha) {
            setHelperSenha('As senhas precisam ser iguais.')
            setHelperConfirmaSenha('As senhas precisam ser iguais.')
            setErrorSenha(true)
            setErrorConfirmaSenha(true)
            verify = false
        }

        if (verify && codigo.join('').length === 6) {
            if (codigo.join('') === codigoSenha.code) {
                var response = await dispatch(atualizaSenha({ id: codigoSenha.id, senha: senha }))
                if (response) {
                    setIsSubmitting(false)
                    enqueueSnackbar('Senha atualizada com sucesso');
                    navigate('/login')
                }
            } else {
                enqueueSnackbar('O código inserido não está correto.', { variant: "error" });
                const tempErrors = Array(6).fill(true)
                setErrors(tempErrors)
                setIsSubmitting(false)
            }
        } else {
            const tempErrors = [...errors];
            codigo.map((c, index) => {
                if (c === '') {
                    tempErrors[index] = true
                } else {
                    tempErrors[index] = false
                }
            })
            setErrors(tempErrors)
            setIsSubmitting(false)
        }
    }

    return (
        <Page title="Recupere sua senha">
            <Box mt={18} />
            <Container maxWidth='xs'>
                <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    spacing={3}
                >
                    <Iconify icon={'eva:paper-plane-outline'} sx={{ fontSize: 62 }} />
                    <Typography variant="h3" textAlign='center'>Requisição enviada com sucesso!</Typography>
                    <Typography textAlign='center' variant='body1' sx={{ color: 'rgb(99, 115, 129)' }}>
                        Enviamos um e-mail de confirmação de 6 dígitos para o seu e-mail.
                        Por favor, insira o código na caixa abaixo para verificar seu e-mail.
                    </Typography>
                    <TextField
                        label="Endereço de e-mail"
                        fullWidth
                        value={codigoSenha?.email}
                        disabled
                    />
                    <Stack direction="row" spacing={2}>
                        {RenderCodigo()}
                    </Stack>
                    {errors.indexOf(true) !== -1 &&
                        <Stack direction="row" justifyContent="flex-start" alignItems="center" sx={{ width: '100%' }}>
                            <Typography variant='body2' color={"#FF4842"} paddingLeft="16px" fontSize={"0.75rem"}>Código requerido</Typography>
                        </Stack>
                    }
                    <TextField
                        label="Senha"
                        type={showPassword ? 'text' : 'password'}
                        value={senha}
                        error={errorSenha}
                        helperText={errorSenha && helperSenha}
                        onChange={(e) => {
                            setErrorSenha(false)
                            setSenha(e.target.value)
                        }}
                        fullWidth
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                        <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        label="Confirme a Senha"
                        type={showPassword2 ? 'text' : 'password'}
                        value={confirmaSenha}
                        error={errorConfirmaSenha}
                        helperText={errorConfirmaSenha && helperConfirmaSenha}
                        onChange={(e) => {
                            setConfirmaSenha(e.target.value)
                            setErrorConfirmaSenha(false)
                        }}
                        fullWidth
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword2(!showPassword2)} edge="end">
                                        <Iconify icon={showPassword2 ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <LoadingButton onClick={() => SendAtualizaSenha()} sx={{ width: '100%', height: '48px' }} variant="contained" loading={isSubmitting}>
                        Enviar
                    </LoadingButton>
                    <Link href="/login" variant="body2">{"<"} Retornar para login</Link>
                </Stack>
            </Container>
        </Page>
    )
}