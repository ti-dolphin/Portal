import * as Yup from 'yup';
import { useEffect } from 'react'
import { Form, FormikProvider, useFormik } from 'formik';
import { Grid, TextField, Typography, Box, Autocomplete, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { GetSession } from '../../session';
import { useDispatch, useSelector } from '../../redux/store';
import { setUsersObservadores, deletUsersObservadores } from '../../redux/slices/users';

export default function ObservadoresForm({callback, setOpen, processo_id}){
    const usuario = GetSession("@dse-usuario")
    const dispatch = useDispatch();
    const { users, usersObservadoresCadastro } = useSelector((state) => state.users)

    const NewUserSchema = Yup.object().shape({
        observadores: Yup.array().of( Yup.object().shape({
            nome: Yup.string(),
            id: Yup.number(),
        }
        )).min(1, 'Selecione um observador')
      });

      const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            observadores: usersObservadoresCadastro,
        },
        validationSchema: NewUserSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
          try {
            await dispatch(deletUsersObservadores(processo_id, 'Cadastro'));
            values.observadores.map((observador) =>{
                dispatch(setUsersObservadores(processo_id, observador.id, 'Cadastro'))
            })

            resetForm();
            setSubmitting(false);
            setOpen(false);

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
                <Typography variant='h4'>Observadores</Typography>
                <Box mb={2}/>
                <Grid container spacing={2}>

                    <Grid item xs={12} md={6}>
                        <Autocomplete
                            fullWidth
                            multiple
                            options={users}
                            getOptionLabel={(option) => option.nome}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            filterSelectedOptions
                            defaultValue={usersObservadoresCadastro}
                            onChange={(event, newValue) => {
                                setFieldValue('observadores',newValue);
                              }}
                            onInputChange={(event, newInputValue) => {
                                setFieldValue('observadores',newInputValue);
                              }}
                            renderInput={(params) => (
                                <TextField
                                    error={Boolean(touched.observadores && errors.observadores)}
                                    helperText={touched.observadores && errors.observadores}
                                    {...getFieldProps('observadores')} 
                                    {...params} 
                                    label="Observadores" 
                                    placeholder="Observadores"
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