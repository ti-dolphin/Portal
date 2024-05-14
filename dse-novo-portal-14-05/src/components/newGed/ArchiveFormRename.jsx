import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
import { Grid, InputAdornment, Typography, Box, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import LinkIcon from '@mui/icons-material/Link';
import { renameArchive } from '../../redux/slices/archives'
import { useDispatch } from '../../redux/store'

import CustomTextField from '../fields/CustomTextField'

export default function ArchiveFormRename({ GetPastesAndArchives, archive, setOpen}){
    const dispatch = useDispatch();
    
    const close = () => {
        setOpen(false)
    }

    const NewUserSchema = Yup.object().shape({
        nome: Yup.string().required('Insira um complemento'),
      });

      const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            nome: archive?.complemento || '',
        },
        validationSchema: NewUserSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
          try { 
            var array = archive.titulo.split('.') 
            array.pop()

            if(archive.complemento){
                var nomeArq = array.join('').replace(archive.complemento, values.nome)
            } else{
                var nomeArq = array.join('')+values.nome
            }

            await(dispatch(renameArchive({
                id: archive.id,
                nome: nomeArq.replaceAll("'",""),
                complemento: values.nome,
            })))

            close();
            GetPastesAndArchives()
            resetForm();
            setSubmitting(false);

          } catch (error) {
            console.log('erro')
            console.log(error);
          }
        }
      });

    const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps } = formik;

    return(
        <FormikProvider value={formik}>
            <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                <Typography variant='h4'>Renomear Documento</Typography>
                <Box mb={2}/>
                <Grid container spacing={2}>

                    
                    <Grid item xs={12} md={6}>
                        <CustomTextField
                            label="Complemento do Nome"
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
                                Salvar
                            </LoadingButton>

                        </Box>
                        <Box mb={2}/>    
                    </Grid>
                </Grid>

            </Form>
        </FormikProvider>
    )
}