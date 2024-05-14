import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
import { Grid, TextField, InputAdornment, Typography, Box, MenuItem, Autocomplete, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LinkIcon from '@mui/icons-material/Link';
import { api } from '../../config'
import { GetSession, SetSession } from '../../session';

import CustomTextField from '../fields/CustomTextField'
import SelectField from '../fields/SelectField'


export default function GroupForm({callback, grupo, usuarios, isEdit, setOpen}){
    const STATUS = ['Ativo', 'Inativo'];

    const NewUserSchema = Yup.object().shape({
        nome: Yup.string().required('Insira um nome'),
        descricao: Yup.string().required('Insira uma descrição'),
        status: Yup.string().required('Selecione um status'),
        usuarios: Yup.array().of(Yup.object().shape({
            id: Yup.number(),
            nome: Yup.string(),
        }
        ))
      });

      const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
          id: grupo?.id || '',
          nome: grupo?.nome || '',
          descricao: grupo?.descricao || '',
          status: grupo?.status || 'Ativo',
          usuarios: grupo?.usuarios || [],
        },
        validationSchema: NewUserSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
          try {
            if(isEdit){
                //edita grupo
                await api.put('papel/',values)
                await AtualizaSessao();
                resetForm();
                setSubmitting(false);
                setOpen(false);
                callback();
            } else{
                //cria grupo
                await api.post('papel/',values)
                await AtualizaSessao();
                resetForm();
                setSubmitting(false);
                setOpen(false);
                callback();
                
            }

          } catch (error) {
            console.log('erro')
            console.log(error);
          }
        }
      });

    const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps } = formik;

    const usuario = GetSession("@dse-usuario")

    const AtualizaSessao = async () => {
        console.log('AtualizaSessao')
        var usuarioAux = usuario

        var papeis = await api.get('usuario-papel?target[]=usuario_id&target_value[]='+usuarioAux.id+'&target[]=empresa_id&target_value[]='+usuarioAux.empresa_id);

        papeis.data.map((papel) => {
            usuarioAux.papeis.push(papel.papel_id)
        })

        SetSession("@dse-usuario", usuarioAux);
    }

    return(
        <FormikProvider value={formik}>
            <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                <Typography variant='h4'>Grupo</Typography>
                <Box mb={2}/>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <CustomTextField
                            label="Nome do Papel"
                            placeholder='Nome do Papel'
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
                            label="Descrição"
                            placeholder='Descrição'
                            InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <AccountCircleIcon />
                                </InputAdornment>
                            )
                            }}
                            fieldProps={getFieldProps('descricao')}
                            error={Boolean(touched.descricao && errors.descricao)}
                            helperText={touched.descricao && errors.descricao}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <SelectField
                            options={STATUS}
                            label="Status"
                            placeholder="Status"
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
                            options={usuarios}
                            getOptionLabel={(option) => option.nome}
                            filterSelectedOptions
                            defaultValue={values.usuarios}
                            onChange={(event, newValue) => {
                                setFieldValue('usuarios',newValue);
                              }}
                            onInputChange={(event, newInputValue) => {
                                setFieldValue('usuarios',newInputValue);
                              }}
                            renderInput={(params) => (
                                <TextField
                                    error={Boolean(touched.usuarios && errors.usuarios)}
                                    helperText={touched.usuarios && errors.usuarios}
                                    {...getFieldProps('usuarios')} 
                                    {...params} 
                                    label="Usuários Vinculados" 
                                    placeholder="Usuários Vinculados"
                                />
                            )}
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