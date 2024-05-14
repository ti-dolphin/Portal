import * as Yup from 'yup';
import { useEffect } from 'react'
import { Form, FormikProvider, useFormik } from 'formik';
import { Grid, TextField, InputAdornment, Typography, Box, MenuItem, Autocomplete, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { api } from '../../config'
import { GetSession } from '../../session';
import { XML } from '../../utils/processoXml'

import CustomTextField from '../fields/CustomTextField'


export default function ProcessosForm({callback, categorias, processo, isEdit, setOpen}){
    const usuario = GetSession("@dse-usuario")

    const pad = (number) => {
        if(number < 10){
          number = '0'+number
        }
        return number
      }

    const NewUserSchema = Yup.object().shape({
        nome: Yup.string().required('Insira um nome'),
        categoria: Yup.object().shape({
            id: Yup.number(),
            nome: Yup.string(),
        }
        ).required('Insira uma categoria'),
      });

      const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
          id: processo?.id || '',
          nome: processo?.nome || '',
          categoria: processo?.categoria || categorias[0],
        },
        validationSchema: NewUserSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
          try {
            if(isEdit){
                //edita processo
                
                resetForm();
                setSubmitting(false);
                setOpen(false);
                callback();
            } else{
                //cria processo
                var date = new Date()
                var data = date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate());
                var dados = {
                    nome: values.nome,
                    categoria_id: values.categoria.id,
                    status: 'Ativo',
                    usuario_id: usuario.id,
                    empresa_id: 1,
                    date: data,
                    versao: 1,
                    xml: XML,
                }
                await api.post('processo-cadastro', dados)
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

    useEffect(() => {
        setFieldValue('categoria', categorias[0])
    },[categorias])

    return(
        <FormikProvider value={formik}>
            <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                <Typography variant='h4'>Processo</Typography>
                <Box mb={2}/>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <CustomTextField
                            label="Nome do Processo"
                            placeholder='Nome do Processo'
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
                        <Autocomplete
                            fullWidth
                            options={categorias}
                            getOptionLabel={(option) => option.nome}
                            filterSelectedOptions
                            defaultValue={categorias[0]}
                            onChange={(event, newValue) => {
                                setFieldValue('categoria',newValue);
                              }}
                            onInputChange={(event, newInputValue) => {
                                setFieldValue('categoria',newInputValue);
                              }}
                            renderInput={(params) => (
                                <TextField
                                    error={Boolean(touched.categoria && errors.categoria)}
                                    helperText={touched.categoria && errors.categoria}
                                    {...getFieldProps('categoria')} 
                                    {...params} 
                                    label="Categoria" 
                                    placeholder="Categoria"
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