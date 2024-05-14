import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
import { Grid, TextField, InputAdornment, Typography, Box, MenuItem, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import LinkIcon from '@mui/icons-material/Link';
import { useDispatch, useSelector } from '../../redux/store'
import { moveFolder } from '../../redux/slices/paste'
import { getProject, getCategories } from '../../redux/slices/project'
import { useNavigate } from 'react-router-dom';

export default function FolderFormMove({ GetPastesAndArchives, folder, setOpen}){
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { allCategories } = useSelector((state) => state.paste)

    const close = () => {
        setOpen(false)
    }

    const NewUserSchema = Yup.object().shape({
        categoria: Yup.object().shape({
            id: Yup.number(),
            nome: Yup.string()
        }).required('Selecione uma categoria'),
      });

      const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            categoria: allCategories[0],
        },
        validationSchema: NewUserSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
          try { 

            var response = await dispatch(moveFolder(folder.id,values.categoria.id))
            if(response.data){
                close()
                resetForm();
                setSubmitting(false);
                dispatch(getProject(folder.projeto_id))
                dispatch(getCategories(folder.projeto_id))
                GetPastesAndArchives()
            }
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
                <Typography variant='h4'>Mover Pasta</Typography>
                <Box mb={2}/>
                <Grid container spacing={2}>

                    
                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            label="Selecione a Nova Categoria"
                            InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LinkIcon />
                                </InputAdornment>
                            )
                            }}
                            {...getFieldProps('categoria')}
                            error={Boolean(touched.categoria && errors.categoria)}
                            helperText={touched.categoria && errors.categoria}
                        >
                            {allCategories.map((option) => (
                                <MenuItem key={option.id} value={option}>
                                    {option.nome}
                                </MenuItem>
                            ))
                            }
                        </TextField>
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