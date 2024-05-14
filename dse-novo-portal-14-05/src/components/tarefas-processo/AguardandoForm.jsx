import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
import { Grid, InputAdornment, Typography, Box, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import LinkIcon from '@mui/icons-material/Link';
import CustomTextField from '../fields/CustomTextField'

export default function AguardandoForm({ callback, setOpen }){

    const NewUserSchema = Yup.object().shape({
        mensagem: Yup.string().required('Insira uma mensagem'),
      });

      const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
          mensagem: '',
        },
        validationSchema: NewUserSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
          try {
            callback(3, values.mensagem);
            resetForm();
            setSubmitting(false);
            setOpen(false);
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
                <Typography variant='h4'>Escreva o motivo de estar aguardando:</Typography>
                <Box mb={2}/>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <CustomTextField
                            label="Motivo"
                            placeholder='Motivo'
                            InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LinkIcon />
                                </InputAdornment>
                            )
                            }}
                            fieldProps={getFieldProps('mensagem')}
                            error={Boolean(touched.mensagem && errors.mensagem)}
                            helperText={touched.mensagem && errors.mensagem}
                        />
                    </Grid>

                    <Grid item xs={12} >
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>

                            <Button  variant="contained" color='error' sx={{boxShadow:'none'}} onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>

                            <Box mr={0.5}/>

                            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                                {'Salvar'}
                            </LoadingButton>

                        </Box>
                        <Box mb={2}/>    
                    </Grid>

                </Grid>

            </Form>
        </FormikProvider>
    )
}