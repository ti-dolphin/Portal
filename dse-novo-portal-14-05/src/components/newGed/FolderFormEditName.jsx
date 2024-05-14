import { useRef, useEffect, useState } from 'react'
import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
import { Grid, TextField, Typography, Box, MenuItem, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useDispatch, useSelector } from '../../redux/store';
import { setItems } from '../../redux/slices/paste';
import { notification } from '../notification/notiflix';
import DraggableHorizontalList from '../draggableHorizontalList/draggableHorizontalList'

export default function FolderFormEditName({ GetPastesAndArchives, folder, setOpen}){
    const [incluir, setIncluir] = useState(false);
    const [itens, setItens] = useState([])
    const draggableRef = useRef();
    const dispatch = useDispatch();
    const { parameters, pasteAttributes, items } = useSelector((state) => state.paste);
    const { project } = useSelector((state) => state.project);

    useEffect(() => {
        setItens(items);
        draggableRef.current.setaItems(items)
    },[])

    const close = () => {
        setOpen(false)
    }

    const NewUserSchema = Yup.object().shape({
        parametro: Yup.object().shape( {nome: Yup.string(), id: Yup.number()} ),
        atributo: Yup.object().shape( {atributo: Yup.string(), id: Yup.number()} ),
        textoLivre: Yup.string(),
        prefixo: Yup.string(),
      });

      const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            parametro: parameters[0],
            atributo: pasteAttributes[0],
            textoLivre: '',
            prefixo: project?.prefixo || '',
        },
        validationSchema: NewUserSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
          try { 
            // Fazer Requisição
            if(incluir){
                var item;
                switch (values.parametro.nome) {
                    case 'Prefixo de Projeto':
                        if(project.prefixo && project.prefixo !== ''){
                            item = {id: itens.length.toString(),valor: project.prefixo, pasta_documento_nome_tipo_id: 1, pasta_id: folder.id, projeto_id: project.id}
                        } else{
                            setErrors({prefixo:'O projeto não possui prefixo'})
                        }
                        break;
        
                    case 'Atributo':
                        if(values.atributo.atributo && values.atributo.atributo !== ''){
                            const valor = values.atributo.categoria && values.atributo.categoria !== '' ? values.atributo.atributo+" - "+values.atributo.categoria : values.atributo.atributo 
                            item = {id: itens.length.toString(),valor: valor, atributo_id: values.atributo.id, pasta_documento_nome_tipo_id: 2, pasta_id: folder.id, projeto_id: project.id}
                        } else{
                            setErrors({atributo:'A pasta não possui atributo.'})
                        }
                        break;
        
                    case 'Texto Livre':
                        if(!values.textoLivre || values.textoLivre === ''){
                            // errors.textoLivre='Você precisa preencher o campo de texto livre.';
                            setErrors({textoLivre:'Você precisa preencher o campo de texto livre.'})
                        }else {
                            item = {id: itens.length.toString(),valor: values.textoLivre, pasta_documento_nome_tipo_id: 3, pasta_id: folder.id, projeto_id: project.id}
                        }
                        break;
        
                    case 'Nome da pasta':
                            item = {id: itens.length.toString(),valor: 'Nome da Pasta', pasta_documento_nome_tipo_id: 4, pasta_id: folder.id, projeto_id: project.id}
                        break;
        
                    case 'Tipo do Arquivo':
                        item = {id: itens.length.toString(),valor: 'Tipo do Arquivo', pasta_documento_nome_tipo_id: 5, pasta_id: folder.id, projeto_id: project.id}
                    break;
            
                    default:
                        break;
                }
                if(item){
                    setItens([...itens, item])
                    draggableRef.current.addItem(item)
                }

            }else{
                //Fazer requisição api para salvar alterações
                var itensRetorno = draggableRef.current.retornaItems()
                if(itensRetorno[0]){
                    await dispatch(setItems(itensRetorno,folder.id));
                    close()
                    GetPastesAndArchives()
                    resetForm();
                    setSubmitting(false);
                } else{
                    notification('error','Você deve cadastrar ao menos um item.')
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
                <Typography variant='h4'>Padrão de Nomenclatura de Arquivos</Typography>
                <Box mb={2}/>
                <Grid container spacing={2}>

                    
                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            label="Selecione o Parâmetro"
                            {...getFieldProps('parametro')}
                            error={Boolean(touched.parametro && errors.parametro)}
                            helperText={touched.parametro && errors.parametro}
                        >
                            {parameters.map((option) => (
                                <MenuItem key={option.id} value={option} onClick={() => setFieldValue('parametro', option)}>
                                    {option.nome}
                                </MenuItem>
                            ))
                            }
                        </TextField>
                    </Grid>
                    
                    {values.parametro.nome === 'Atributo' &&
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Selecione o Atributo"
                                {...getFieldProps('atributo')}
                                error={Boolean(touched.atributo && errors.atributo)}
                                helperText={touched.atributo && errors.atributo}
                            >
                                {pasteAttributes.map((option) => (
                                    <MenuItem key={option.id} value={option} onClick={() => setFieldValue('atributo', option)}>
                                        {option.categoria && option.categoria != '' ? option.atributo+" - "+option.categoria : option.atributo}
                                    </MenuItem>
                                ))
                                }
                            </TextField>
                        </Grid>
                    }

                    {values.parametro.nome === 'Prefixo de Projeto' &&
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Prefixo do Projeto"
                                disabled
                                {...getFieldProps('prefixo')}
                                error={Boolean(touched.prefixo && errors.prefixo)}
                                helperText={touched.prefixo && errors.prefixo}
                            />
                        </Grid>
                    }

                    {values.parametro.nome === 'Texto Livre' &&
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Preencha o texto livre"
                                {...getFieldProps('textoLivre')}
                                error={Boolean(touched.textoLivre && errors.textoLivre)}
                                helperText={touched.textoLivre && errors.textoLivre}
                            />
                        </Grid>
                    }


                    <Grid item xs={12} >
                        <Box sx={{ mt: 1, mb:3 , display: 'flex', justifyContent: 'flex-start' }}>

                            <LoadingButton type="submit" color="primary" variant="contained" loading={isSubmitting} onClick={() => setIncluir(true)}>
                                Incluir
                            </LoadingButton>

                        </Box>  
                    </Grid>

                    <Grid item xs={12} >
                        <DraggableHorizontalList ref={draggableRef}/>
                    </Grid>

                    <Grid item xs={12} >
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>

                            <Button  variant="contained" color='error' sx={{boxShadow:'none'}} onClick={() => close()}>
                                Cancelar
                            </Button>

                            <Box mr={0.5}/>

                            <LoadingButton type="submit" color="primary" variant="contained" loading={isSubmitting} onClick={() => setIncluir(false)}>
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