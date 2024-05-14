import { forwardRef, useState, useEffect, useCallback, useImperativeHandle, useRef } from 'react';
import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
import { Grid, Stack } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useDispatch } from '../../redux/store'
import { getPasteAttributesWithCategory, insertArchivePaste, getPastasFilhas, getIdPastaByIdArquivo, newFolderByField, getPastaTemplate, getFileAndName } from '../../redux/slices/paste'
import { editAttributesArchive, deleteArchiveProcess } from '../../redux/slices/archives'
import { insertCampoArquivo, insertFile, getFileAttributes } from '../../redux/slices/step'
import { notification } from '../notification/notiflix';
import ArquivoField from './ArquivoField'
import CelField from '../fields/CelField'
import CepField from '../fields/CepField'
import CpfCnpjField from '../fields/CpfCnpjField'
import MoneyField from '../fields/MoneyField'
import DateField from '../fields/DateField'
import NumberField from '../fields/NumberField'
import CustomTextField from '../fields/CustomTextField'
import SelectFieldObject from '../fields/SelectFieldObject'
import SelectFieldObjectWithValue from '../fields/SelectFieldObjectWithValue'
import SelectFieldPastasFilhas from '../fields/SelectFieldPastasFilhas'
import ImageEditModal from '../fields/ImageEditModal'
import CircularProgress from '@mui/material/CircularProgress';

import { useSelector } from '../../redux/store'

const ArquivoForm = forwardRef(({ arquivo, status, campos }, ref) => {
    const params = useParams()
    const [pastaFilha, setPastaFilha] = useState({});
    const [pastasFilhas, setPastasFilhas] = useState([]);
    const dispatch = useDispatch();
    const [pasteAttributes, setPasteAttributes] = useState([])
    const [shape, setShape] = useState({})
    const [initialValues, setInitialValues] = useState({})
    const [formAttributes, setFormAttributes] = useState([])
    const [selectGed, setSelectGed] = useState(false)
    const [ openImageEdit, setOpenImageEdit ] = useState(false)
    const { process } = useSelector((state) => state.process)
    const [ imageToEdit, setImageToEdit ] = useState();
    const [ editIndex, setEditIndex ] = useState(null);
    const [ imagesAux, setImagesAux ] = useState([]);
    const [ error, setError ] = useState(false)
    const [ loading, setLoading] = useState(true);

    useEffect(() => {
        if(arquivo.arquivos && arquivo.arquivos.ged === 1){
            if(arquivo.obrigatoriedade === 1){
                setShape({archive: Yup.array().min(1, 'Selecione um arquivo')})
            } else{
                setShape({archive: Yup.array()})
            }
            setInitialValues({archive:[arquivo.arquivos.arquivo]})
            setFormAttributes([])
            setLoading(false)
        }else{
            getAtributos()
        }
    },[arquivo])

    const getAtributos = async () => {
        try {
            const data =  await dispatch(getFileAttributes(arquivo, process))
            if(arquivo.arquivos && arquivo.arquivos.arquivo){
                if(data.length > 0){
                    setPasteAttributes(data)
                    setLoading(false)
                } else{
                    setShapeAndInitialValues(data)
                    setLoading(false)
                }
    
            } else{
                if(arquivo.caminho.selecao_filha === 1){ 

                    setPastasFilhas(data)
    
                    if(data.length === 0){
                        setPasteAttributes(data)
                        setLoading(false)
                    }else {
                        setShape({archive: Yup.array().min(1, 'Selecione um arquivo'), pastaFilha: Yup.string().required('Selecione uma pasta')})
                        setInitialValues({archive: [], pastaFilha: ''})
                        setLoading(false)
                    }
                }else if(arquivo.caminho.cadastro_nova_pasta_campo_id && arquivo.caminho.cadastro_nova_pasta_campo_id !== 0){
                    setShapeAndInitialValuesForNewFolder(data)
                    setLoading(false)
                }else{
                    if(data.length > 0){
                        setPasteAttributes(data)
                        setLoading(false)
                    } else{
                        setShapeAndInitialValues(data)
                        setLoading(false)
                    }
                }
            }
            
        } catch (error) {
            console.log(error)
            return 0
        }

    }

    useEffect(() => {
        if(pasteAttributes.length > 0){
            setShapeAndInitialValues()
        }
    },[pasteAttributes])

    const setShapeAndInitialValues = (atr = null, file = null) => {
        var formAttributes = []
        if(arquivo.obrigatoriedade === 1){
            var shape = {
                archive: Yup.array().min(1, 'Selecione um arquivo')
            }
        }else{
            var shape = {
                archive: Yup.array()
            }
        }

        if(!atr){
            var initialValues = {
                archive: arquivo.arquivos && arquivo.arquivos.arquivo ? [arquivo.arquivos.arquivo] : []
            }
            pasteAttributes.map((attribute) => {
    
                if(attribute.isnull === "Nao"){
                    shape[attribute.atributo_id ? attribute.atributo_id: attribute.id] = Yup.string().required('Preencha este campo')
                } else{
                    shape[attribute.atributo_id ? attribute.atributo_id: attribute.id] = Yup.string()
                }
    
                if(attribute.valor){
                    initialValues[attribute.atributo_id ? attribute.atributo_id: attribute.id] = attribute.valor
                } else{
                    initialValues[attribute.atributo_id ? attribute.atributo_id: attribute.id] = ""
                }
                formAttributes.push(attribute)
    
            })
            setInitialValues(initialValues)
        } else{
            var archive = arquivo.arquivos && arquivo.arquivos.arquivo ? [arquivo.arquivos.arquivo] : []

            if(archive.length === 0){
                if(file){
                    console.log(file)
                    archive = [file]
                }
            }
            var initialValues = {
                archive: archive
            }
            setInitialValues(initialValues)
        }


        setShape(shape)
        setFormAttributes(formAttributes)
        setLoading(false)
    }
    
    const setShapeAndInitialValuesForNewFolder = (atributos) => {
        var formAttributes = []
        if(arquivo.obrigatoriedade === 1){
            var shape = {
                archive: Yup.array().min(1, 'Selecione um arquivo')
            }
        }else{
            var shape = {
                archive: Yup.array()
            }
        }

        var initialValues = {
            archive: []
        }

        atributos.map((attribute) => {

            if(attribute.isnull === "Nao"){
                shape[attribute.atributo] = Yup.string().required('Preencha este campo')
            } else{
                shape[attribute.atributo] = Yup.string()
            }
            initialValues[attribute.atributo] = ""
            attribute.atributo_id = attribute.atributo;
            attribute.id = attribute.atributo;
            formAttributes.push(attribute)

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
                // enviaArquivo()
            } catch (error) {
                console.log('erro')
                console.log(error);
            }
        }
    });

    const enviaArquivo = async (valuesForm) => {
        
        return new Promise(async function (resolve, reject) {
            try {

                if(values.archive.length > 0){
                    if(values.archive[0].preview || values.archive[0].ged === 1){
                        const {base64, fileName} = await getFileAndName(values, arquivo.caminho.converte_imagem === 1);
        
                        await dispatch(insertFile({
                            arquivo, values, valuesForm, campos, params, base64, fileName, process, formAttributes
                        }));
                        return resolve(true);
                    } else{
                        return resolve(true);
                    }
    
                } else{
                    if(arquivo.obrigatoriedade === 0){
                        return resolve(true)
                    } else{
                        return resolve(false)
                    }
                }

                
            } catch (error) {
                console.log(error)
                reject(false)
            }
        })

    }

    const { errors, values, touched, handleSubmit, validateForm, isSubmitting, setFieldValue, getFieldProps, setValues, setErrors, setFieldError } = formik;

    useEffect(() => {
        if(values.archive && !arquivo.arquivos){
            if(values.archive[0]?.ged && arquivo.caminho.selecao_filha && arquivo.caminho.selecao_filha !== 0 && arquivo.caminho.cadastro_nova_pasta_campo_id && arquivo.caminho.cadastro_nova_pasta_campo_id !== 0){
                if(arquivo.obrigatoriedade === 1){
                    setShape({archive: Yup.array().min(1, 'Selecione um arquivo')})
                } else{
                    setShape({archive: Yup.array()})
                }
                setFormAttributes([])
            }else{
                if(!selectGed){
                    getAtributos()
                }
            }
        }
    },[values.archive, selectGed])

    useImperativeHandle(ref, () => ({

        async validate(){
            handleSubmit()
            var res = await validateForm()
            if(Object.keys(res).length > 0){
                setError(true)
                return true
            } else {
                return false
            }
        },

        async save(valuesForm){
            return new Promise(async function (resolve, reject) {
                try {
                    const resp = await enviaArquivo(valuesForm)
                    resolve(resp)
                } catch (error) {
                    console.log(error)
                    reject(false)
                }
            })
        }

    }))

    const handleDrop = useCallback(
        async (acceptedFiles) => {
            setError(false)
            if(acceptedFiles && acceptedFiles.length > 0){
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
            }
          },
          [setFieldValue,imagesAux, setImagesAux, setFieldError, setEditIndex]
      );

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

    const handleRemoveAll = () => {
        setSelectGed(false)
        setFieldValue('archive', []);
    };

    const handleRemove = (index) => {
        setSelectGed(false)
        if(values.archive[index].type.includes('image')){
            imagesAux.splice(index,1)
            setImagesAux(imagesAux)
        }
        values.archive.splice(index,1);
        setFieldValue('archive', values.archive);
    };

    const setTreeView = (file) => {
        setSelectGed(true)
        setFieldValue('archive', [file]);
        setShapeAndInitialValues(true, file)
    };

    const switchField = (attribute) => {

        switch (attribute.mask) {

            case 'Seleção':
                return(
                    <Grid item xs={12} mb={2}>
                        {status === 'Concluído' ?
                            <SelectFieldObjectWithValue 
                                options={attribute.configSelect}
                                disabled={status === 'Concluído'}
                                label={attribute.atributo}
                                placeholder={attribute.atributo}
                                error={Boolean(touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id])}
                                helperText={touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id]}
                                fieldProps={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id)}
                            />
                        : 
                            <SelectFieldObject
                                options={attribute.configSelect}
                                disabled={status === 'Concluído'}
                                label={attribute.atributo}
                                placeholder={attribute.atributo}
                                error={Boolean(touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id])}
                                helperText={touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id]}
                                fieldProps={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id)}
                            />
                        }
                    </Grid>
                )

            case 'Data de vencimento':
                return(
                    <Grid item xs={12} mb={2}>
                        <DateField
                            disabled={status === 'Concluído'}
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
                            disabled={status === 'Concluído'}
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
                            disabled={status === 'Concluído'}
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
                            disabled={status === 'Concluído'}
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
                            disabled={status === 'Concluído'}
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
                                    disabled={status === 'Concluído'}
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
                                    disabled={status === 'Concluído'}
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
                                    disabled={status === 'Concluído'}
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

    const consultaAtributosPastaFilha = async (id) => {
        var retorno = await dispatch(getPasteAttributesWithCategory(id, arquivo.caminho.categoria_id))
        var formAtributesAux = [];
        var shapeAux = shape
        var initialAux = initialValues

        retorno.map((attribute) => {

            if(attribute.isnull === "Nao"){
                shapeAux[attribute.atributo_id] = Yup.string().required('Preencha este campo')
            } else{
                shapeAux[attribute.atributo_id] = Yup.string()
            }

            initialAux[attribute.atributo_id] = ""

            formAtributesAux.push(attribute)

        })

        setShape(shapeAux)
        setInitialValues(initialAux)
        setFormAttributes(formAtributesAux)

    }

    return(
        <FormikProvider value={formik} >
            <Form noValidate validateOnBlur autoComplete="off" onSubmit={handleSubmit}>
                <Grid container>

                    <Grid item xs={12} mb={2}>
                        <ArquivoField
                            status={status}
                            multiple={arquivo.caminho.converte_imagem == 1}
                            selectFromGED={arquivo.caminho.selecao_arquivo_ged === 1}
                            arquivo={arquivo}
                            error={error}
                            files={values?.archive || []}
                            onDrop={handleDrop}
                            onRemove={handleRemove}
                            onRemoveAll={handleRemoveAll}
                            setTreeView={setTreeView}
                            editImage={(index) => {setEditIndex(index); setImageToEdit(imagesAux[index]); setOpenImageEdit(true)}}
                        />
                    </Grid>

                    {pastasFilhas.length > 0 && 
                        <Grid item xs={12} mb={2}>
                            <SelectFieldPastasFilhas
                                onClick={(e) =>consultaAtributosPastaFilha(e)}
                                disabled={status === 'Concluído'}
                                options={pastasFilhas}
                                label={'Selecione a pasta filha'}
                                placeholder={'Selecione a pasta filha'}
                                error={Boolean(touched.pastaFilha && errors.pastaFilha)}
                                helperText={touched.pastaFilha && errors.pastaFilha}
                                fieldProps={getFieldProps('pastaFilha')}
                            />
                        </Grid>
                    }

                    {loading ?
                        <Stack
                            sx={{ width: '100%' }}
                            direction="row"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <CircularProgress color="primary" /> 
                        </Stack>
                        :
                        formAttributes.map((attribute) => (
                            switchField(attribute)
                        ))
                    }

                </Grid>

                <ImageEditModal open={openImageEdit} handleClose={() => setOpenImageEdit(false)} image={imageToEdit} callback={callbackEditImage}/>

            </Form>
        </FormikProvider>
    )

})

export default ArquivoForm