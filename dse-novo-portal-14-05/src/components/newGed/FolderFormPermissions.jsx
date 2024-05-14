import { useEffect, useState, useRef } from 'react'
import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
import { Grid, TextField, InputAdornment, Typography, Box, MenuItem, Autocomplete, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import ListIcon from '@mui/icons-material/List';
import { useSelector, useDispatch } from '../../redux/store';
import FolderPermissionsTable from './FolderPermissionsTable'
import { insertPermissionPaste, getOptionsForm} from '../../redux/slices/paste'

import SelectField from '../fields/SelectField'


export default function ProjectForm({callback, folder, projeto, isEdit, setOpen}){
    const dispatch = useDispatch();
    const [alvo, setAlvo] = useState('Grupo');
    const ALVO = ['Grupo', 'Usuário'];
    const PERMISSAO = ['Sim', 'Não'];
    const [alvos, setAlvos] = useState([]);
    const { usuarios, grupos, permissoesPasta } = useSelector((state) => state.paste)

    const NewUserSchema = Yup.object().shape({
        alvo: Yup.string().required('Selecione uma opção'),
        alvos: Yup.array().of(Yup.object().shape({
                    id: Yup.number(),
                    nome: Yup.string(),
                }
                )).min(1, 'Selecione um alvo'),
        cadastro: Yup.string().required('Selecione uma opção'),
        consulta: Yup.string().required('Selecione uma opção'),
        edicao: Yup.string().required('Selecione uma opção'),
        remocao: Yup.string().required('Selecione uma opção'),
        pasta_filha: Yup.string().required('Selecione uma opção'),
      });

      const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            alvo: alvo,
            alvos: [],
            cadastro: 'Sim',
            consulta: 'Sim',
            edicao: 'Sim',
            remocao: 'Sim',
            pasta_filha: 'Não',
        },
        validationSchema: NewUserSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
          try {
                values.pasta_id = folder.id
                values.projeto_id = folder.projeto_id
                await dispatch(insertPermissionPaste(values))
                resetForm();
                setSubmitting(false);
                dispatch(getOptionsForm(folder.id))
                values.alvos.length = 0
          } catch (error) {
            console.log('erro')
            console.log(error);
          }
        }
      });

    const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps } = formik;

    useEffect(() => {
        if(alvo === 'Grupo'){
            setAlvos(grupos)
        }else{
            setAlvos(usuarios)
        } 
    },[alvo, usuarios, grupos])

    const onChangeAlvo = (option) => {
        if(option==='Grupo') {
            setAlvos(grupos) 
        } else{
            setAlvos(usuarios)
        }
        if(values.alvos){
            values.alvos.length = 0
        } 
    }

    return(
        <FormikProvider value={formik}>
            <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                <Typography variant='h4'>Permissão de Pasta</Typography>
                <Box mb={2}/>
                <Grid container spacing={2}>

                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            label="Alvo"
                            placeholder="Alvo"
                            InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <ListIcon />
                                </InputAdornment>
                            )
                            }}
                            {...getFieldProps('alvo')}
                            error={Boolean(touched.alvo && errors.alvo)}
                            helperText={touched.alvo && errors.alvo}
                        >
                            {ALVO.map((option) => (
                                <MenuItem key={option} value={option} onClick={() => onChangeAlvo(option)}>
                                    {option}
                                </MenuItem>
                            ))
                            }
                        </TextField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Autocomplete
                            multiple
                            fullWidth
                            options={alvos}
                            getOptionLabel={(option) => option.nome}
                            filterSelectedOptions
                            // defaultValue={values.alvos}
                            onChange={(event, newValue) => {
                                setFieldValue('alvos',newValue);
                              }}
                            onInputChange={(event, newInputValue) => {
                                setFieldValue('alvos',newInputValue);
                              }}
                            renderInput={(params) => (
                                <TextField
                                    error={Boolean(touched.alvos && errors.alvos)}
                                    helperText={touched.alvos && errors.alvos}
                                    {...getFieldProps('alvos')} 
                                    {...params} 
                                    label="Selecione o(s) Alvo(s)" 
                                    placeholder="Selecione o(s) Alvo(s)"
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <SelectField
                            options={PERMISSAO}
                            label="Cadastro"
                            placeholder="Cadastro"
                            fieldProps={getFieldProps('cadastro')}
                            error={Boolean(touched.cadastro && errors.cadastro)}
                            helperText={touched.cadastro && errors.cadastro}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <SelectField
                            options={PERMISSAO} 
                            label="Consulta"
                            placeholder="Consulta"
                            fieldProps={getFieldProps('consulta')}
                            error={Boolean(touched.consulta && errors.consulta)}
                            helperText={touched.consulta && errors.consulta}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <SelectField
                            options={PERMISSAO} 
                            label="Edição"
                            placeholder="Edição"
                            fieldProps={getFieldProps('edicao')}
                            error={Boolean(touched.edicao && errors.edicao)}
                            helperText={touched.edicao && errors.edicao}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <SelectField
                            options={PERMISSAO}
                            label="Remoção"
                            placeholder="Remoção"
                            fieldProps={getFieldProps('remocao')}
                            error={Boolean(touched.remocao && errors.remocao)}
                            helperText={touched.remocao && errors.remocao}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <SelectField
                            options={PERMISSAO}
                            label="Aplicar permissão a pastas filhas"
                            placeholder="Aplicar permissão a pastas filhas"
                            fieldProps={getFieldProps('pasta_filha')}
                            error={Boolean(touched.pasta_filha && errors.pasta_filha)}
                            helperText={touched.pasta_filha && errors.pasta_filha}
                        />
                    </Grid>

                    

                    <Grid item xs={12} >
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>

                            <Button  variant="contained" color='error' sx={{boxShadow:'none'}} onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>

                            <Box mr={0.5}/>

                            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                                Incluir Permissão
                            </LoadingButton>

                        </Box>
                        <Box mb={2}/>    
                    </Grid>

                    
                    <Grid item xs={12} >
                        <Typography variant='h4'>Tabela de Permissões</Typography>
                        <FolderPermissionsTable permissoesPasta={permissoesPasta}/>  
                    </Grid>

                </Grid>

            </Form>
        </FormikProvider>
    )
}