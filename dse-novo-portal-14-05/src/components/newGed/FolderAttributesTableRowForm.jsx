import * as Yup from 'yup';
import { FormikProvider, useFormik } from 'formik';
import { useEffect } from 'react'
import { 
    TableCell, 
    TextField,
    MenuItem
 } from '@mui/material';
import { useDispatch, useSelector } from '../../redux/store'
import { getCategories} from '../../redux/slices/paste'
import { getPasteAtrributes, insertPasteAtrribute, updatePasteAtrribute } from '../../redux/slices/paste'
import { notification } from '../notification/notiflix'
import CustomTextField from '../fields/CustomTextField'
import SelectField from '../fields/SelectField'


export default function FolderAttributesTableRowForm({ folder, isEdit, attribute, submitForm, setSubmitForm, setMode, tipoSelect, setTipoSelect, configSelect, setAddAttribute }){
    const dispatch = useDispatch();
    const { categories } = useSelector((state) => state.paste)
    const TIPO = ['Texto', 'Número', 'Seleção', 'Data', 'Data de vencimento', 'Celular', 'Cep', 'CPF/CNPJ', 'Moeda']
    const PREENCHIMENTO = ['Obrigatório', 'Opcional']
    const APLICAR_FILHAS = ['Sim', 'Não']

    useEffect(() => {
        dispatch(getCategories(true))
    },[])

    useEffect(()=>{
        if(submitForm){
            handleSubmit()
            setSubmitForm(false)
        }
    },[submitForm])

    const NewAttributeSchema = Yup.object().shape({
        nome: Yup.string().required('Preencha'),
        tipo: Yup.string().required('Selecione'),
        categoria: Yup.number(),
        preenchimento: Yup.string().required('Selecione'),
        aplicar_filhas: Yup.string().required('Selecione'),
    });

    var tipo
    if(attribute){
        if(attribute.mask && attribute.mask !== 'null'){
            tipo = attribute.mask
        } else{
            tipo = attribute.tipo
        }
    }

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            nome: attribute?.atributo || '',
            tipo: tipo ? tipo : '',
            categoria: attribute?.categoria_id || undefined,
            preenchimento: attribute?.isnull === 'Sim' ?  "Opcional" : "Obrigatório",
            aplicar_filhas: attribute?.flag_filha === 0 ?  "Não" : "Sim"
        },
        validationSchema: NewAttributeSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                values.pasta_id = folder.id
                values.projeto_id = folder.projeto_id

                if (tipoSelect && configSelect.length <= 0) {
                    notification('warning','O atributo do tipo seleção deve ter ao menos uma opção cadastrada.')
                } else{

                    if(tipoSelect){
                        values.configSelect = configSelect
                        setTipoSelect(false)
                    }

                    if(isEdit){
                        values.id = attribute.id
                        await dispatch(updatePasteAtrribute(values))
                        setSubmitting(false);
                        setMode(0)
                        await dispatch(getPasteAtrributes(folder.id))
                        resetForm();
                    } else{
                        await dispatch(insertPasteAtrribute(values))
                        setSubmitting(false);
                        setAddAttribute(false)
                        await dispatch(getPasteAtrributes(folder.id))
                        resetForm();
                    }
                }

            } catch (error) {
                console.log('erro')
                console.log(error);
            }
        }
    });

    const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps } = formik;

    useEffect(() => {
        if(values.tipo && values.tipo != ''){
            if(values.tipo === 'Seleção'){
                setTipoSelect(true)
            } else{
                setTipoSelect(false)
            }
        }
    },[values.tipo])

    return(
        <FormikProvider value={formik} >
            <TableCell>{attribute?.id}</TableCell>

            <TableCell>
                <CustomTextField
                    label="Nome"
                    placeholder='Nome'
                    fieldProps={getFieldProps('nome')}
                    error={Boolean(touched.nome && errors.nome)}
                    helperText={touched.nome && errors.nome}
                    sx={{minWidth: '140px'}}
                />
            </TableCell>

            <TableCell >
                <SelectField
                    options={TIPO}
                    label="Tipo"
                    placeholder='Tipo'
                    fieldProps={getFieldProps('tipo')}
                    error={Boolean(touched.tipo && errors.tipo)}
                    helperText={touched.tipo && errors.tipo}
                    sx={{minWidth: '96px'}}
                />
            </TableCell>

            <TableCell >
                <TextField
                    select
                    fullWidth
                    label="Categoria"
                    placeholder='Categoria'
                    {...getFieldProps('categoria')}
                    error={Boolean(touched.categoria && errors.categoria)}
                    helperText={touched.categoria && errors.categoria}
                    sx={{minWidth: '96px', maxWidth: '150px'}}
                >
                    {categories.map((option,index) => (
                        <MenuItem key={"categoria_"+index} value={option.id}>
                            {option.categoria}
                        </MenuItem>
                    ))}
                </TextField>
            </TableCell>

            <TableCell >
                <SelectField
                    options={PREENCHIMENTO}
                    label="Preenchimento"
                    placeholder='Preenchimento'
                    fieldProps={getFieldProps('preenchimento')}
                    error={Boolean(touched.preenchimento && errors.preenchimento)}
                    helperText={touched.preenchimento && errors.preenchimento}
                />
            </TableCell>

            <TableCell >
                <SelectField
                    options={APLICAR_FILHAS}
                    label="Aplicar a filhas"
                    placeholder='Aplicar a filhas'
                    fieldProps={getFieldProps('aplicar_filhas')}
                    error={Boolean(touched.aplicar_filhas && errors.aplicar_filhas)}
                    helperText={touched.aplicar_filhas && errors.aplicar_filhas}
                />
            </TableCell>

        </FormikProvider>
            
    )
}