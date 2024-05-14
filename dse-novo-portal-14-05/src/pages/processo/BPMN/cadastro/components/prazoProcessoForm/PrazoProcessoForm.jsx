import * as Yup from 'yup';
import { useEffect, useState } from 'react'
import { Form, FormikProvider, useFormik } from 'formik';
import { Grid, TextField, Typography, Box, Autocomplete, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { api } from '../../../../../../config'

export default function PrazoProcessoForm({getProcessoPapeisPrazo, setOpen, processo_id, processoPapeisPrazo}){
    const [papel, setPapel] = useState([])

    useEffect(()=>{
        api.get('/papel/processo/'+processo_id).then((papel) => {
            setPapel(papel.data)
        })
    },[])

    const NewUserSchema = Yup.object().shape({
        papel: Yup.array().of( Yup.object().shape({
            id: Yup.number(),
            nome: Yup.string(),
        }
        ))
      });

      const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            papel: papel,
        },
        validationSchema: NewUserSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
          try {
            await api.delete('/define-prazo-processo/processo/'+processo_id);
            const map = values.papel.map(async (p) => {
                await api.post('/define-prazo-processo',{
                    papel_id: p.id,
                    processo_cadastro_id: processo_id
                })
            })

            await Promise.all(map)

            resetForm();
            setSubmitting(false);
            setOpen(false);
            getProcessoPapeisPrazo();

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
                <Typography variant='h4'>Prazo do Processo</Typography>
                <Box mb={2}/>
                <Grid container spacing={2}>

                    <Grid item xs={12} md={6}>
                        <Autocomplete
                            fullWidth
                            multiple
                            options={papel}
                            getOptionLabel={(option) => option.nome}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            filterSelectedOptions
                            defaultValue={processoPapeisPrazo}
                            onChange={(event, newValue) => {
                                setFieldValue('papel',newValue);
                              }}
                            onInputChange={(event, newInputValue) => {
                                setFieldValue('papel',newInputValue);
                              }}
                            renderInput={(params) => (
                                <TextField
                                    error={Boolean(touched.papel && errors.papel)}
                                    helperText={touched.papel && errors.papel}
                                    {...getFieldProps('papel')} 
                                    {...params} 
                                    label="Papéis com autorização" 
                                    placeholder="Papéis com autorização"
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