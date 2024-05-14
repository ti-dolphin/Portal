import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
import { Grid, TextField, InputAdornment, Typography, Box, MenuItem, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import LinkIcon from '@mui/icons-material/Link';
import { insertPaste, updatePaste } from '../../redux/slices/paste'
import { useDispatch } from '../../redux/store'
import FolderAttributesTable from './FolderAttributesTable'

import CustomTextField from '../fields/CustomTextField'
import SelectField from '../fields/SelectField'



export default function FolderForm({ GetPastesAndArchives, selectedPaste, idCategoria, idProjeto, folder, isEdit, idPai, setOpen}){
    const STATUS = ['Ativo', 'Inativo'];
    const OPTIONS = ['Sim', 'Não'];
    const dispatch = useDispatch();

    const close = () => {
        setOpen(false)
    }

    const NewUserSchema = Yup.object().shape({
        nome: Yup.string().required('Insira um nome'),
        status: isEdit ? Yup.string().required('Selecione um status') : Yup.string(),
        herda_conf_nome: isEdit ? Yup.string().required('Selecione uma opção') : Yup.string(),
      });

      const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
          nome: folder?.nome || '',
          status: folder?.status || 'Ativo',
          herda_conf_nome: folder?.herda_conf_nome === 1 ? 'Sim' : 'Não'
        },
        validationSchema: NewUserSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
          try {
            if(isEdit){
                //edita folder
                var response = await dispatch(updatePaste({
                        id: folder.id,
                        nome: values.nome.toUpperCase(),
                        status: values.status,
                        herda_conf_nome: values.herda_conf_nome == 'Sim' ? 1 : 0
                      }))
                if(response.data.message == "sucesso!"){
                    close()
                    GetPastesAndArchives()
                    resetForm();
                    setSubmitting(false);
                }
            } else{
                //cria folder
                var response = await dispatch(insertPaste(selectedPaste, values.nome, idProjeto, idCategoria, 1))
                if(response.data.message === true){
                    close()
                    GetPastesAndArchives()
                    resetForm();
                    setSubmitting(false);
                } else{
                    setErrors({nome: response.data.message})
                    setSubmitting(false);
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
                <Typography variant='h4'>Pasta</Typography>
                <Box mb={2}/>
                <Grid container spacing={2}>

                    <Grid item xs={12} md={6}>
                        <CustomTextField
                            label="Nome da Pasta"
                            placeholder='Nome da Pasta'
                            InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LinkIcon />
                                </InputAdornment>
                            )
                            }}
                            fieldProps={getFieldProps('nome')}
                            error={Boolean(touched.nome && errors.nome)}
                            helperText={touched.nome && errors.nome}
                        />
                    </Grid>

                    {isEdit &&
                    <>
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
                                <SelectField
                                    options={OPTIONS}
                                    label="Pastas Filhas Herdam Configurações de Nome"
                                    placeholder="Pastas Filhas Herdam Configurações de Nome"
                                    InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LinkIcon />
                                        </InputAdornment>
                                    )
                                    }}
                                    fieldProps={getFieldProps('herda_conf_nome')}
                                    error={Boolean(touched.herda_conf_nome && errors.herda_conf_nome)}
                                    helperText={touched.herda_conf_nome && errors.herda_conf_nome}
                            />
                            </Grid>
                    </>
                    }


                    <Grid item xs={12} >
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>

                            <Button  variant="contained" color='error' sx={{boxShadow:'none'}} onClick={() => close()}>
                                Cancelar
                            </Button>

                            <Box mr={0.5}/>

                            <LoadingButton type="submit" color="primary" variant="contained" loading={isSubmitting}>
                                {!isEdit ? 'Criar' : 'Salvar'}
                            </LoadingButton>

                        </Box>
                        <Box mb={2}/>    
                    </Grid>

                    { isEdit ? <FolderAttributesTable folder={folder} />: null }


                </Grid>

            </Form>
        </FormikProvider>
    )
}