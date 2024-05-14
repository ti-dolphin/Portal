import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
import { Grid, InputAdornment, Typography, Box, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import LinkIcon from '@mui/icons-material/Link';
import Loading from '../Loading'
import { getPasteAttributesWithCategory } from '../../redux/slices/paste'
import { editAttributesArchive } from '../../redux/slices/archives'
import { useDispatch } from '../../redux/store'

import CelField from '../fields/CelField'
import CepField from '../fields/CepField'
import CpfCnpjField from '../fields/CpfCnpjField'
import MoneyField from '../fields/MoneyField'
import DateField from '../fields/DateField'
import NumberField from '../fields/NumberField'
import SelectFieldObjectWithValue from '../fields/SelectFieldObjectWithValue'
import CustomTextField from '../fields/CustomTextField'
import { getAttributeWithValues } from '../../redux/slices/paste';

export default function ArchiveAttributes({ GetPastesAndArchives, archive, setOpen}){
    const [ attributes, setAttributes ] = useState([]);
    const [shape, setShape] = useState({})
    const [initialValues, setInitialValues] = useState({})
    const [formAttributes, setFormAttributes] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const dispatch = useDispatch();
    
    useEffect(() =>{
        getAttributes();
    },[archive])

    const getAttributes = async () =>{
        var retorno = await dispatch(getAttributeWithValues(archive.projeto_diretorio_id, archive.categoria_id, archive.id))
        setAttributes(retorno)
        setIsLoading(false)
    }

    useEffect(() => {
        if(attributes.length > 0){
            setShapeAndInitialValues()
        }
    },[attributes])

    const close = () => {
        setOpen(false)
    }
    
    const setShapeAndInitialValues = () => {
        var formAttributes = [];
        var initialValues = {};
        var validationShape = {};
    
        attributes.forEach((attribute) => {
            if (attribute.isnull === "Nao") {
                validationShape[attribute.atributo_id ? attribute.atributo_id : attribute.id] = Yup.string().required('Preencha este campo');
            } else {
                validationShape[attribute.atributo_id ? attribute.atributo_id : attribute.id] = Yup.string();
            }
    
            if (attribute.valor) {
                initialValues[attribute.atributo_id ? attribute.atributo_id : attribute.id] = attribute.valor;
            } else {
                initialValues[attribute.atributo_id ? attribute.atributo_id : attribute.id] = "";
            }
    
            formAttributes.push(attribute);
        });
    
        setShape(validationShape);
        setInitialValues(initialValues);
        setFormAttributes(formAttributes);
    }
    


    const formik = useFormik({
        enableReinitialize: true,
        initialValues: initialValues,
        validationSchema: Yup.object().shape(shape),
        onSubmit: async (values, { setSubmitting, resetForm }) => {
          try { 
            await dispatch(editAttributesArchive(archive.id, archive.projeto_diretorio_id, values))
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


    const switchField = (attribute) => {

        switch (attribute.mask) {

            case 'Seleção':
                return(
                    <Grid item xs={12} mb={2}>
                        <SelectFieldObjectWithValue
                            options={attribute.configSelect}
                            label={attribute.atributo}
                            placeholder={attribute.atributo}
                            error={Boolean(touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id])}
                            helperText={touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id]}
                            fieldProps={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id)}
                        />
                    </Grid>
                )

            case 'Data de vencimento':
                return(
                    <Grid item xs={12} mb={2}>
                        <DateField
                            label={attribute.atributo}
                            placeholder={attribute.atributo}
                            error={Boolean(touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id])}
                            helperText={touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id]}
                            fieldProps={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id)}
                        />
                    </Grid>
                )

            case 'Celular':
                return (
                    <Grid item xs={12} mb={2}>
                        <CelField
                            label={attribute.atributo}
                            placeholder={attribute.atributo}
                            error={Boolean(touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id])}
                            helperText={touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id]}
                            fieldProps={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id)}
                        />
                    </Grid>
                )

            case 'Cep':
                return (
                    <Grid item xs={12} mb={2}>
                        <CepField
                            label={attribute.atributo}
                            placeholder={attribute.atributo}
                            error={Boolean(touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id])}
                            helperText={touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id]}
                            fieldProps={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id)}
                        />
                    </Grid>
                )

            case 'CPF/CNPJ':
                return (
                    <Grid item xs={12} mb={2}>
                        <CpfCnpjField
                            label={attribute.atributo}
                            placeholder={attribute.atributo}
                            error={Boolean(touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id])}
                            helperText={touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id]}
                            fieldProps={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id)}
                        />
                    </Grid>
                )

            case 'Moeda':
                return (
                    <Grid item xs={12} mb={2}>
                        <MoneyField
                            label={attribute.atributo}
                            placeholder={attribute.atributo}
                            error={Boolean(touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id])}
                            helperText={touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id]}
                            fieldProps={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id)}
                        />
                    </Grid>
                )

            default:
                switch (attribute.tipo) {
                    case 'Número':
                        return (
                            <Grid item xs={12} mb={2}>
                                <NumberField
                                    label={attribute.atributo}
                                    placeholder={attribute.atributo}
                                    error={Boolean(touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id])}
                                    helperText={touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id]}
                                    fieldProps={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id)}
                                />
                            </Grid>
                        )

                    case 'Data':
                        return (
                            <Grid item xs={12} mb={2}>
                                <DateField
                                    label={attribute.atributo}
                                    placeholder={attribute.atributo}
                                    error={Boolean(touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id])}
                                    helperText={touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id]}
                                    fieldProps={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id)}
                                />
                            </Grid>
                        )
                
                    default:
                        return (
                            <Grid item xs={12} mb={2}>
                                <CustomTextField
                                    label={attribute.atributo}
                                    placeholder={attribute.atributo}
                                    error={Boolean(touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id])}
                                    helperText={touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id]}
                                    fieldProps={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id)}
                                />
                            </Grid>
                        )
                }
        }
    }

    return(
        <>
        {isLoading ?
            <Loading open={true}/>
            :
            <FormikProvider value={formik}>
                <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                    <Typography variant='h4'>Atributos do Documento</Typography>
                    <Box mb={2}/>
                    <Grid container spacing={2}>

                        
                        {formAttributes.map((attribute) => (
                            switchField(attribute)
                        ))}


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
        }
        </>
    )
}