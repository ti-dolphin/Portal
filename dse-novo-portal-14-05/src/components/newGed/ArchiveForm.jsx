import { useCallback, useEffect, useState } from 'react'
import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
import { Grid, TextField, Switch, Typography, Box, MenuItem, Button, Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useDispatch, useSelector } from '../../redux/store'
import { getPasteAtrributes, getCategoriesAtributtesPaste, insertArchivePaste } from '../../redux/slices/paste'
import { notification } from '../notification/notiflix';

import UploadFile from '../UploadFile'
import CelField from '../fields/CelField'
import CepField from '../fields/CepField'
import CpfCnpjField from '../fields/CpfCnpjField'
import MoneyField from '../fields/MoneyField'
import DateField from '../fields/DateField'
import NumberField from '../fields/NumberField'
import SelectFieldObject from '../fields/SelectFieldObject'
import CustomTextField from '../fields/CustomTextField'

import ImageEditModal from '../fields/ImageEditModal'

export default function FolderForm({ GetPastesAndArchives, selectedPaste, idCategoria, idProjeto, isEdit, setOpen}){

    const dispatch = useDispatch();
    const { pasteAttributes } = useSelector((state) => state.paste)
    const { categories } = useSelector((state) => state.paste)
    const [shape, setShape] = useState({})
    const [initialValues, setInitialValues] = useState({})
    const [formAttributes, setFormAttributes] = useState([])
    const [formAttributesCategorie, setFormAttributesCategorie] = useState([])
    const [selectedCategorie, setSelectedCategorie] = useState()
    const [convertImageSwitch, setConvertImageSwitch] = useState(true)
    const [openImageEdit, setOpenImageEdit] = useState(false)
    const [ imageToEdit, setImageToEdit] = useState();
    const [ editIndex, setEditIndex ] = useState(null);
    const [ imagesAux, setImagesAux ] = useState([]);

    const close = () => {
        setOpen(false)
    }

    useEffect(()=>{
        dispatch(getPasteAtrributes(selectedPaste))
        dispatch(getCategoriesAtributtesPaste(selectedPaste))
    },[])

    useEffect(() => {
        setShapeAndInitialValues()
    },[pasteAttributes, categories])


    const setShapeAndInitialValues = () => {
        var formAttributes = []

        var shape = {
            archive: Yup.array().min(1, 'Selecione um arquivo'),
            categories: Yup.number()
        }

        var initialValues = {
            archive: [],
            categories: 0
        }

        pasteAttributes.map((attribute) => {
            if(!attribute.categoria_id){
                if(attribute.isnull === "Nao"){
                    shape[attribute.id] = Yup.string().required('Preencha este campo')
                } else{
                    shape[attribute.id] = Yup.string()
                }
            } else{
                shape[attribute.id] = Yup.string()
            }

            initialValues[attribute.id] = ""
            if(!attribute.categoria_id){
                formAttributes.push(attribute)
            }
        })
        setShape(shape)
        setInitialValues(initialValues)
        setFormAttributes(formAttributes)
    }

    const NewArchiveSchema = Yup.object().shape(shape);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: initialValues,
        validationSchema: NewArchiveSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {                
                if(isEdit){
                    
                } else{
                    if(selectedCategorie && selectedCategorie != 0){
                        values.categoria_id = parseInt(selectedCategorie)
                    }
                    var response = await dispatch(insertArchivePaste(selectedPaste, idProjeto, values, null, true, null, convertImageSwitch))
                    close()
                    GetPastesAndArchives()
                    resetForm();
                    setSubmitting(false);
                }

            } catch (error) {
                console.log('erro')
                console.log(error);
            }
        }
    });

    const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps, setValues, setFieldError } = formik;

    const handleDrop = useCallback(
        // (acceptedFiles) => {
        //     setFieldValue(
        //       'archive',
        //       acceptedFiles.map((file) =>
        //         Object.assign(file, {
        //           preview: URL.createObjectURL(file)
        //         })
        //       )
        //     );
        //   },
        //   [setFieldValue]

          async (acceptedFiles) => {
            if(acceptedFiles.length > 1 || !acceptedFiles[0].type.includes('image')){
                var aux = [];

                const map = acceptedFiles.map((file) => {
                    if((file.size/1024) <= 36000){
                        if(file.type.includes('image')){
                            aux.push(file);
                        }
                        return Object.assign(file, {
                            preview: URL.createObjectURL(file)
                        })
                    } else{
                        notification('warning','O documento selecionado supera o limite de 36mb.')
                    }
                })

                setImagesAux([...aux])
    
                const filterMap = map.filter(function (i) {
                    return i;
                });

                var images = [];
                var files = [];
                var size = 0;

                filterMap.forEach((file) =>{
                    if(file.type.includes('image')){
                        images.push(file)
                    }else{
                        files.push(file)
                    }
                })
    
                if(images.length > 0){
                    images.forEach((image) =>{
                        size = size + (image.size/1024)
                    })
                    if(size > 36000){
                        notification('warning','A soma dos documentos selecionados superam o limite de 36mb.')
                    }else{
                        setFieldValue(
                            'archive',
                            images
                        );
                    }
                }else if(files.length > 0){
                    files.forEach((file) =>{
                        size = size + (file.size/1024)
                    })
                    if(size > 36000){
                        notification('warning','A soma dos documentos selecionados superam o limite de 36mb.')
                    }else{
                        setFieldValue(
                            'archive',
                            files
                        );
                    }
                }
            }else{
                if((acceptedFiles[0].size/1024) <= 36000){
                    var aux = [...imagesAux];
                    aux.push(acceptedFiles[0]);
                    setImagesAux(aux)
                    setEditIndex(null);
                    setImageToEdit(acceptedFiles[0]);
                    setOpenImageEdit(true);
                }else{
                    notification('warning','O documento selecionado supera o limite de 36mb.')
                }
            }
          },
          [setFieldValue,imagesAux, setImagesAux, setFieldError, setEditIndex]
      );

    const handleRemoveAll = () => {
        setFieldValue('archive', []);
    };

    const handleRemove = (file) => {
        const filteredItems = values.archive.filter((_file) => _file !== file);
        setFieldValue('archive', filteredItems);
    };

    const onChangeCategorie = (value) => {
        var shapeAux = shape
        var formAttributesCategorie = []
        if(value !== 0){
            pasteAttributes.map((attribute) => {
                if(attribute.categoria_id === value){
                    if(attribute.isnull === "Nao"){
                        shapeAux[attribute.id] = Yup.string().required('Preencha este campo')
                    } else{
                        shapeAux[attribute.id] = Yup.string()
                    }
                    formAttributesCategorie.push(attribute)
                }
            })
            setShape(shapeAux)
            setFormAttributesCategorie(formAttributesCategorie)
        } else{
            var valuesAux = values
            valuesAux.categories = 0
            pasteAttributes.map((attribute) => {
                if(attribute.categoria_id){
                    shapeAux[attribute.id] = Yup.string()
                    values[attribute.id] = ''
                }
            })
            setShape(shapeAux)
            setFormAttributesCategorie([])
            setValues(valuesAux)
        }
        setSelectedCategorie(value)
    }

    const categoriesSelect = () => {

        if(categories.length > 0){
            
            const categorieProps = getFieldProps('categories')

            return (
                <Grid item xs={12} mb={2}>
                    <TextField
                        select
                        fullWidth
                        label="Tipo do arquivo"
                        placeholder="Tipo do arquivo"
                        name={categorieProps.name}
                        onBlur={categorieProps.onBlur}
                        onChange={(e)=> {
                            categorieProps.onChange(e);
                            onChangeCategorie(e.target.value)
                        }}
                        value={categorieProps.value}
                        error={Boolean(touched.herda_conf_nome && errors.herda_conf_nome)}
                        helperText={touched.herda_conf_nome && errors.herda_conf_nome}
                        >
                            {categories.map((categorie) => (
                                <MenuItem key={"categorie_"+categorie.categoria_id} value={categorie.categoria_id}>
                                    {categorie.categoria}
                                </MenuItem>
                            ))}
                    </TextField>
                </Grid>
            )
        }
    }

    const switchField = (attribute) => {

        switch (attribute.mask) {

            case 'Seleção':
                return(
                    <Grid item xs={12} mb={2}>
                        <SelectFieldObject
                            options={attribute.configSelect}
                            label={attribute.atributo}
                            placeholder={attribute.atributo}
                            fieldProps={getFieldProps(attribute.id)}
                            error={Boolean(touched[attribute.id] && errors[attribute.id])}
                            helperText={touched[attribute.id] && errors[attribute.id]}
                        />
                    </Grid>
                )

            case 'Data de vencimento':
                return(
                    <Grid item xs={12} mb={2}>
                        <DateField
                            label={attribute.atributo}
                            placeholder={attribute.atributo}
                            error={Boolean(touched[attribute.id] && errors[attribute.id])}
                            helperText={touched[attribute.id] && errors[attribute.id]}
                            fieldProps={getFieldProps(attribute.id)}
                        />
                    </Grid>
                )

            case 'Celular':
                return (
                    <Grid item xs={12} mb={2}>
                        <CelField
                            label={attribute.atributo}
                            placeholder={attribute.atributo}
                            error={Boolean(touched[attribute.id] && errors[attribute.id])}
                            helperText={touched[attribute.id] && errors[attribute.id]}
                            fieldProps={getFieldProps(attribute.id)}
                        />
                    </Grid>
                )

            case 'Cep':
                return (
                    <Grid item xs={12} mb={2}>
                        <CepField
                            label={attribute.atributo}
                            placeholder={attribute.atributo}
                            error={Boolean(touched[attribute.id] && errors[attribute.id])}
                            helperText={touched[attribute.id] && errors[attribute.id]}
                            fieldProps={getFieldProps(attribute.id)}
                        />
                    </Grid>
                )

            case 'CPF/CNPJ':
                return (
                    <Grid item xs={12} mb={2}>
                        <CpfCnpjField
                            label={attribute.atributo}
                            placeholder={attribute.atributo}
                            error={Boolean(touched[attribute.id] && errors[attribute.id])}
                            helperText={touched[attribute.id] && errors[attribute.id]}
                            fieldProps={getFieldProps(attribute.id)}
                        />
                    </Grid>
                )

            case 'Moeda':
                return (
                    <Grid item xs={12} mb={2}>
                        <MoneyField
                            label={attribute.atributo}
                            placeholder={attribute.atributo}
                            error={Boolean(touched[attribute.id] && errors[attribute.id])}
                            helperText={touched[attribute.id] && errors[attribute.id]}
                            fieldProps={getFieldProps(attribute.id)}
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
                                    error={Boolean(touched[attribute.id] && errors[attribute.id])}
                                    helperText={touched[attribute.id] && errors[attribute.id]}
                                    fieldProps={getFieldProps(attribute.id)}
                                />
                            </Grid>
                        )

                    case 'Data':
                        return (
                            <Grid item xs={12} mb={2}>
                                <DateField
                                    label={attribute.atributo}
                                    placeholder={attribute.atributo}
                                    error={Boolean(touched[attribute.id] && errors[attribute.id])}
                                    helperText={touched[attribute.id] && errors[attribute.id]}
                                    fieldProps={getFieldProps(attribute.id)}
                                />
                            </Grid>
                        )
                
                    default:
                        return (
                            <Grid item xs={12} mb={2}>
                                <CustomTextField
                                    label={attribute.atributo}
                                    placeholder={attribute.atributo}
                                    error={Boolean(touched[attribute.id] && errors[attribute.id])}
                                    helperText={touched[attribute.id] && errors[attribute.id]}
                                    fieldProps={getFieldProps(attribute.id)}
                                />
                            </Grid>
                        )
                }
        }
    }

    const callbackEditImage = (base64, name) =>{
        var arr = base64.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), 
            n = bstr.length, 
            u8arr = new Uint8Array(n);
            
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        var files = [...values.archive];
        var hasArchive = false;
        files.forEach((file) =>{
            if(!file.type.includes('image')){
                hasArchive = true;
            }
        })
        if(hasArchive){
            files = [];
        }
        var file = new File([u8arr], name, {type:mime});
        file = Object.assign(file, {
            preview: URL.createObjectURL(file),
            path: name
        })
        if(editIndex === 0 || editIndex ){
            files[editIndex] = file;
        }else{
            files.push(file)
        }
        var size=0;
        files.forEach((file) =>{
            size = size + (file.size/1024)
        })
        if(size > 36000){
            notification('warning','A soma dos documentos selecionados superam o limite de 36mb.')
        }else{
            setFieldValue(
                'archive',
                files
            );
        }
    }

    return(
        <FormikProvider value={formik}>
            <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                <Grid container spacing={2}>

                    <Grid item xs={12} md={6}>
                        <Stack spacing={2}>
                            <Typography variant="h4">Upload de arquivo</Typography>
                            <UploadFile
                                multiple={convertImageSwitch}
                                showPreview={convertImageSwitch}
                                files={values?.archive || []}
                                onDrop={handleDrop}
                                onRemove={handleRemove}
                                onRemoveAll={handleRemoveAll}
                                error={Boolean(touched.archive && errors.archive)}
                                editImage={(index) => {setEditIndex(index); setImageToEdit(imagesAux[index]); setOpenImageEdit(true)}}
                            />
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Stack spacing={2}>
                            <Typography variant="h4">Cadastro de atributos</Typography>
                            <Grid container >

                                <Grid item xs={12} mb={2}>
                                    <span>Converter imagem para PDF</span>
                                    <Switch
                                        checked={convertImageSwitch}
                                        onChange={() => setConvertImageSwitch(!convertImageSwitch)}
                                        name={"nome"}
                                        color={"primary"}
                                    />
                                </Grid>

                                {
                                    formAttributes.map((attribute) => (
                                        switchField(attribute)
                                    ))
                                }

                                {categoriesSelect()}

                                {
                                    formAttributesCategorie.map((attribute) => (
                                        switchField(attribute)
                                    ))
                                }
                            </Grid>
                        </Stack>
                    </Grid>

                    <Grid item xs={12} >
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>

                            <Button  variant="contained" color='error' sx={{boxShadow:'none'}} onClick={() => close()}>
                                Cancelar
                            </Button>

                            <Box mr={0.5}/>

                            <LoadingButton type="submit" color="primary" variant="contained" loading={isSubmitting}>
                                {!isEdit ? 'Criar' : 'Salvar'}
                            </LoadingButton>

                        </Box>
                        <Box mb={2}/>    
                    </Grid>

                </Grid>

                <ImageEditModal open={openImageEdit} handleClose={() => setOpenImageEdit(false)} image={imageToEdit} callback={callbackEditImage}/>

            </Form>
        </FormikProvider>
    )
}