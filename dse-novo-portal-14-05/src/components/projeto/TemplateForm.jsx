import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
import { Grid, InputAdornment, Typography, Box, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LinkIcon from '@mui/icons-material/Link';
import { api } from '../../config'

import CustomTextField from '../fields/CustomTextField'


export default function TemplateForm({ callback, template, isEdit, setOpen }) {
    const STATUS = ['Ativo', 'Inativo'];

    const NewUserSchema = Yup.object().shape({
        nome: Yup.string().required('Insira um nome'),
        descricao: Yup.string().required('Insira uma descrição'),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            nome: template?.nome || '',
            descricao: template?.descricao || '',
            status: 'Ativo',
            empresa_id: 1,
            prefixo: 'Prefixo do Projeto',
            template: 1
        },
        validationSchema: NewUserSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                if (isEdit) {
                    //edita grupo
                    // await api.put('papel/',values)
                    resetForm();
                    setSubmitting(false);
                    setOpen(false);
                    callback();
                } else {
                    //cria template
                    api.post('projeto-cadastro/', values)
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


    return (
        <FormikProvider value={formik}>
            <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                <Typography variant='h4'>Template</Typography>
                <Box mb={2} />
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
                            label="Descrição"
                            placeholder='Descrição'
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LinkIcon />
                                    </InputAdornment>
                                )
                            }}
                            fieldProps={getFieldProps('descricao')}
                            error={Boolean(touched.descricao && errors.descricao)}
                            helperText={touched.descricao && errors.descricao}
                        />
                    </Grid>

                    <Grid item xs={12} >
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>

                            <Button variant="contained" color='error' sx={{ boxShadow: 'none' }} onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>

                            <Box mr={0.5} />

                            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                                {!isEdit ? 'Criar' : 'Salvar'}
                            </LoadingButton>

                        </Box>
                        <Box mb={2} />
                    </Grid>

                </Grid>

            </Form>
        </FormikProvider>
    )
}