import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
import { Grid, TextField, InputAdornment, Typography, Box, MenuItem, Autocomplete, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LinkIcon from '@mui/icons-material/Link';
import LoginIcon from '@mui/icons-material/Login';
import KeyIcon from '@mui/icons-material/Key';
import { api } from '../../config'

import CustomTextField from '../fields/CustomTextField'
import SelectField from '../fields/SelectField'



export default function UserForm({callback, grupos, user, isEdit, setOpen}){
    const STATUS = ['Ativo', 'Inativo'];
    const TIPOS = ['Administrador', 'Geral']

    const NewUserSchema = Yup.object().shape({
        nome: Yup.string().required('Insira um nome'),
        email: Yup.string().required('Insira um email').email('Insira um email válido'),
        status: Yup.string().required('Escolha um status'),
        grupos: Yup.array().of( Yup.object().shape({
            id: Yup.number(),
            nome: Yup.string(),
            descricao: Yup.string(),
            status: Yup.string(),
            empresa_id: Yup.number(),
        }
        )).min(1, 'Escolha um grupo'),
        login: Yup.string().required('Insira um login'),
        senha: isEdit ? Yup.string() : Yup.string().required('Insira uma senha'),
        tipo: Yup.string().required('Escolha um tipo'),
      });

      const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
          id: user?.id || '',
          nome: user?.nome || '',
          email: user?.email || '',
          status: user?.status || 'Ativo',
          grupos: user?.grupos || [],
          login: user?.login || '',
          senha: user?.senha || '',
          tipo: user?.tipo || '',
        },
        validationSchema: NewUserSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
          try {
            if(isEdit){
                //edita usuario
                await api.put('usuario/',values)
                resetForm();
                setSubmitting(false);
                setOpen(false);
                callback();
            } else{
                //cria novo usuario
                var loginTeste = await api.get('usuario?target[]=login&target_value[]='+values.login);
                if(loginTeste.data.length <= 0){
                    await api.post('usuario/',values)

                    resetForm();
                    setSubmitting(false);
                    setOpen(false);
                    callback();
                } else{
                    setErrors({login:"Login de Usuário já existente, favor inserir outro."})
                }
            }

          } catch (error) {
            console.log('erro')
            console.log(error);
          }
        }
      });

    const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps, setErrors } = formik;


    return(
        <FormikProvider value={formik}>
            <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                <Typography variant='h4'>Usuário</Typography>
                <Box mb={2}/>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <CustomTextField
                            label="Nome"
                            placeholder='Nome'
                            InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <AccountCircleIcon />
                                </InputAdornment>
                            )
                            }}
                            fieldProps={getFieldProps('nome')}
                            error={Boolean(touched.nome && errors.nome)}
                            helperText={touched.nome && errors.nome}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <CustomTextField
                            label="Email"
                            placeholder='Email'
                            InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <AlternateEmailIcon />
                                </InputAdornment>
                            )
                            }}
                            fieldProps={getFieldProps('email')}
                            error={Boolean(touched.email && errors.email)}
                            helperText={touched.email && errors.email}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <SelectField
                            options={STATUS}
                            label="Status"
                            placeholder='Status'
                            InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LinkIcon />
                                </InputAdornment>
                            )
                            }}
                            fieldProps={getFieldProps('status')}
                            error={Boolean(touched.status && errors.status)}
                            helperText={touched.status && errors.status}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Autocomplete
                            multiple
                            fullWidth
                            options={grupos}
                            getOptionLabel={(option) => option.nome}
                            filterSelectedOptions
                            defaultValue={values.grupos}
                            onChange={(event, newValue) => {
                                setFieldValue('grupos',newValue);
                              }}
                            onInputChange={(event, newInputValue) => {
                                setFieldValue('grupos',newInputValue);
                              }}
                            renderInput={(params) => (
                                <TextField
                                    error={Boolean(touched.grupos && errors.grupos)}
                                    helperText={touched.grupos && errors.grupos}
                                    {...getFieldProps('grupos')} 
                                    {...params} 
                                    label="Grupos Vinculados" 
                                    placeholder="Grupos Vinculados"
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <CustomTextField
                            label="Login"
                            placeholder='Login'
                            InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LoginIcon />
                                </InputAdornment>
                            )
                            }}
                            fieldProps={getFieldProps('login')}
                            error={Boolean(touched.login && errors.login)}
                            helperText={touched.login && errors.login}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <CustomTextField
                            label="Senha"
                            placeholder='Senha'
                            type="password"
                            InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <KeyIcon />
                                </InputAdornment>
                            )
                            }}
                            fieldProps={getFieldProps('senha')}
                            error={Boolean(touched.senha && errors.senha)}
                            helperText={touched.senha && errors.senha}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <SelectField
                            options={TIPOS}
                            label="Tipo"
                            placeholder='Tipo'
                            InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <KeyIcon />
                                </InputAdornment>
                            )
                            }}
                            fieldProps={getFieldProps('tipo')}
                            error={Boolean(touched.tipo && errors.tipo)}
                            helperText={touched.tipo && errors.tipo}
                        />
                    </Grid>

                    <Grid item xs={12} >
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>

                            <Button  variant="contained" color='error' sx={{boxShadow:'none'}} onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>

                            <Box mr={0.5}/>

                            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                                {!isEdit ? 'Criar' : 'Salvar'}
                            </LoadingButton>

                        </Box>
                        <Box mb={2}/>    
                    </Grid>

                </Grid>

            </Form>
        </FormikProvider>
    )
}