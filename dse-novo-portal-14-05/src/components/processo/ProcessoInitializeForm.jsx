import * as Yup from 'yup';
import { useState } from 'react'
import { Form, FormikProvider, useFormik } from 'formik';
import { Grid, TextField, InputAdornment, Typography, Box, MenuItem, Autocomplete, Button, Chip } from '@mui/material';
import { LoadingButton} from '@mui/lab';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers'
import ptLocale from 'date-fns/locale/pt-BR';
// import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LinkIcon from '@mui/icons-material/Link';
import { GetSession } from '../../session';
import { useSelector, useDispatch } from '../../redux/store'
import { setUsersObservadores } from '../../redux/slices/users';
import { iniciaProcess } from '../../redux/slices/process';
import { findOrCreateProccessCollection, getUsersToNotificate, pushNotificationModel, sendNotification, sendPushNotification, sendNotificationToUser } from '../../redux/slices/notification';
import { useNavigate } from 'react-router-dom'
import CustomTextField from '../fields/CustomTextField'

export default function ProcessoInitializeForm({callback, processo_id, categoria_id, isEdit, setOpen, process}){
    const [date, setDate] = useState(null);
    const dispatch = useDispatch();
    const usuario = GetSession("@dse-usuario")
    const { users, usersObservadoresCadastro } = useSelector((state) => state.users)
    const { project } = useSelector((state) => state.project)
    const navigate = useNavigate();

    const NewUserSchema = Yup.object().shape({
        descricao: Yup.string().required('Insira uma descrição'),
        responsavel: Yup.object().shape({
            nome: Yup.string(),
            id: Yup.number(),
        }
        ).required('Selecione um responsável'),
        observadores: Yup.array().of( Yup.object().shape({
            nome: Yup.string(),
            id: Yup.number(),
        }
        )),
        prazo: Yup.string().nullable(),
      });

      const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            descricao: '',
            responsavel: users.filter((user) => user.id === usuario.id)[0],
            observadores: usersObservadoresCadastro,
            prazo: null,
        },
        validationSchema: NewUserSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
          try {
                var result = await dispatch(iniciaProcess(values, categoria_id, project.id, processo_id));
                
                if(project.responsavel_id){
                    dispatch(setUsersObservadores(result[0], project.responsavel_id, 'Execução'))
                }

                if(values.observadores !== '' && values.observadores.length > 0){
                    values.observadores.forEach((observador) => {
                        dispatch(setUsersObservadores(result[0], observador.id, 'Execução'))
                    });
                }

                const users = await getUsersToNotificate(result[0], result[1]);
                const ids = users.map((user) => user.id);
                const emails = users.map((user) => user.email);

                // ENVIA PUSH INICIO PROCESSO
                await sendPushNotification({
                    title: pushNotificationModel.initializedProcess.title,
                    body: pushNotificationModel.initializedProcess.body(process.nome, process.descricao ? process.descricao  : '', process.id, new Date(), process.projeto),
                    ids: ids
                });

                await dispatch(findOrCreateProccessCollection(String(result[0])));

                await dispatch(sendNotificationToUser(
                    `${pushNotificationModel.initializedProcess.title}`,
                    `${pushNotificationModel.initializedProcess.body(process.nome, process.descricao ? process.descricao  : '', process.id, new Date(), project.nome)}`,
                    result[0], // id do processo
                    result[1], // id do papel
                    2, // identfica a inicialização de um processo
                    process.nome,
                    '',
                    ids,
                    emails
                ));

                await dispatch(sendNotification(
                    'Processo Inicializado',
                    `Novo processo inicializado: ${process.nome}`,
                    result[0], // id do processo
                    result[1], // id do papel
                    2, // identfica a inicialização de um processo
                    process.nome,
                    '', 
                    ids, 
                    emails
                )); 
                
                // resetForm();
                // setSubmitting(false);
                // setOpen(false);
                navigate('/processo/'+result[0]);
                // document.location.reload(true)
                // callback();

          } catch (error) {
            console.log('erro')
            console.log(error);
          }
        }
      });

    const changeDate = (newValue) => {
        if(newValue && newValue != 'Invalid Date'){
            var dataFormatada = newValue.getFullYear()+'-'+(newValue.getMonth()+1)+'-'+newValue.getDate()+' '+newValue.getHours()+ ":" + newValue.getMinutes()+ ":" + newValue.getSeconds();
            setFieldValue('prazo', dataFormatada)
            setDate(newValue)
        }else{
            setFieldValue('prazo', null)
        }
    }

    const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps, setErrors } = formik;


    return(
        <FormikProvider value={formik}>
            <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                <Typography variant='h4'>Processo</Typography>
                <Box mb={2}/>
                <Grid container spacing={2}>

                    <Grid item xs={12} md={6}>
                        <CustomTextField
                            label="Descrição do Processo"
                            placeholder='Descrição do Processo'
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

                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            label="Responsável"
                            placeholder="Responsável"
                            InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <AccountCircleIcon />
                                </InputAdornment>
                            )
                            }}
                            {...getFieldProps('responsavel')}
                            error={Boolean(touched.responsavel && errors.responsavel)}
                            helperText={touched.responsavel && errors.responsavel}
                        >
                            {users.map((option) => (
                                <MenuItem key={option.id} value={option}>
                                    {option.nome}
                                </MenuItem>
                            ))
                            }
                        </TextField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Autocomplete
                            fullWidth
                            multiple
                            options={users}
                            getOptionLabel={(option) => option.nome}
                            disableClearable={true}
                            filterSelectedOptions
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            defaultValue={values.observadores}
                            onChange={(event, newValue) => {
                                setFieldValue('observadores',newValue);
                              }}
                            onInputChange={(event, newInputValue) => {
                                setFieldValue('observadores',newInputValue);
                              }}
                            renderTags={(tagValue, getTagProps) =>
                                tagValue.map((option, index) => (
                                  <Chip
                                    label={option.nome}
                                    {...getTagProps({ index })}
                                    disabled={usersObservadoresCadastro.indexOf(option) !== -1}
                                  />
                                ))
                              }
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
                    
                    <Grid item xs={12} md={6}>
                         <LocalizationProvider dateAdapter={AdapterDateFns} locale={ptLocale}>    
                            <DateTimePicker
                                value={date}
                                onChange={changeDate}
                                error={Boolean(touched.prazo && errors.prazo)}
                                helperText={touched.prazo && errors.prazo}
                                renderInput={(params) => (
                                    <TextField
                                        fullWidth
                                        
                                        {...getFieldProps('prazo')} 
                                        {...params} 
                                        label="Prazo" 
                                        placeholder="Prazo"
                                    />
                                )}
                            />
                            </LocalizationProvider>   
                        
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