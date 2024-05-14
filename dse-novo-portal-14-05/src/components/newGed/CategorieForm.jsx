import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
import { Grid, InputAdornment, Typography, Box, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import LinkIcon from '@mui/icons-material/Link';
import { useDispatch, useSelector } from '../../redux/store'
import { createCategorie, getCategories } from '../../redux/slices/paste'
import CategoriesTable from './CategoriesTable'

import CustomTextField from '../fields/CustomTextField'


export default function FolderForm({ GetPastesAndArchives, setOpen}){
    const { categories } = useSelector((state) => state.paste)
    const dispatch = useDispatch();

    const close = () => {
        setOpen(false)
    }

    const NewUserSchema = Yup.object().shape({
        nome: Yup.string().required('Insira um nome'),
      });

      const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
          nome: '',
        },
        validationSchema: NewUserSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
          try {
                dispatch(createCategorie({categoria: values.nome}))
                dispatch(getCategories())
                GetPastesAndArchives()
                resetForm();
                setSubmitting(false);
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
                <Typography variant='h4'>Criar Categoria</Typography>
                <Box mb={2}/>
                <Grid container spacing={2}>

                    <Grid item xs={12} md={6}>
                        <CustomTextField
                            label="Nome da Categoria"
                            placeholder='Nome da Categoria'
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

                    <Grid item xs={12} >
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>

                            <Button  variant="contained" color='error' sx={{boxShadow:'none'}} onClick={() => close()}>
                                Cancelar
                            </Button>

                            <Box mr={0.5}/>

                            <LoadingButton type="submit" color="primary" variant="contained" loading={isSubmitting}>
                                Criar Categoria
                            </LoadingButton>

                        </Box>
                        <Box mb={2}/>    
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Typography variant='h4'>Tabela de Categorias</Typography>
                        <Box mb={2}/>
                        <CategoriesTable categories={categories}/>
                    </Grid>


                </Grid>

            </Form>
        </FormikProvider>
    )
}