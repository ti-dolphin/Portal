import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
import { Icon } from '@iconify/react';
import downloadOutline from '@iconify/icons-eva/download-outline';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Grid, InputAdornment, Typography, Box, Button, Stack, Tooltip, IconButton, ListItem, ListItemText, ListItemSecondaryAction, List } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import LinkIcon from '@mui/icons-material/Link';
import Loading from '../Loading'
import { getPasteAttributesWithCategory, getIdPastaByIdArquivo } from '../../redux/slices/paste'
import { editAttributesArchive } from '../../redux/slices/archives'
import { useDispatch } from '../../redux/store'
import { fData } from '../../utils/formatNumber';
import { MIconButton } from '../@material-extend';

import CelField from '../fields/CelField'
import CepField from '../fields/CepField'
import CpfCnpjField from '../fields/CpfCnpjField'
import MoneyField from '../fields/MoneyField'
import DateField from '../fields/DateField'
import NumberField from '../fields/NumberField'
import SelectFieldObjectWithValue from '../fields/SelectFieldObjectWithValue'
import CustomTextField from '../fields/CustomTextField'
import Label from '../Label';

const CampoCopiaArchiveAttributes = forwardRef(({arquivo, diretorio, categoria, disabled, editavel}, ref) => {
    const [ attributes, setAttributes ] = useState([]);
    const [shape, setShape] = useState({})
    const [initialValues, setInitialValues] = useState({})
    const [formAttributes, setFormAttributes] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const dispatch = useDispatch();
    
    useEffect(() =>{
        getAttributes();
    },[arquivo])

    const getAttributes = async () =>{
      if(arquivo && arquivo.id_arquivo){
        var response = await dispatch(getIdPastaByIdArquivo(arquivo.id_arquivo))
        var retorno = await dispatch(getPasteAttributesWithCategory(response, categoria, arquivo.id_arquivo))
        setAttributes(retorno)
      }
      setIsLoading(false)
    }

    useEffect(() => {
        if(attributes.length > 0){
            setShapeAndInitialValues()
        }
    },[attributes])

    const setShapeAndInitialValues = () => {
        var formAttributes = []
        var shape = {}
        var initialValues={};


        attributes.map((attribute) => {

            if(attribute.isnull === "Nao" && editavel){
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

        setShape(shape)
        setInitialValues(initialValues)
        setFormAttributes(formAttributes)
    }

      const formik = useFormik({
        enableReinitialize: true,
        initialValues: initialValues,
        validationSchema: Yup.object().shape(shape),
        onSubmit: async (values, { setSubmitting, resetForm }) => {
          try {
            if(!disabled){
              var response = await dispatch(getIdPastaByIdArquivo(arquivo.id_arquivo))
              await dispatch(editAttributesArchive(arquivo.id_arquivo, response, values))
              resetForm();
              setSubmitting(false);
            }
          } catch (error) {
            console.log('erro')
            console.log(error);
          }
        }
      });

    const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps, validateForm } = formik;

    const saveAttributes = async () =>{
      return new Promise(async function (resolve) { 
        var response = await dispatch(getIdPastaByIdArquivo(arquivo.id_arquivo))
        const resp2 = await dispatch(editAttributesArchive(arquivo.id, response, values))
        resolve(resp2)
      })
    }

    useImperativeHandle(ref, () => ({
        async validate(){
            handleSubmit()
            var res = await validateForm()
            if(Object.keys(res).length > 0){
                return true
            } else {
                return false
            }
        },
        async save(){
          return new Promise(async function (resolve) {
            if(!disabled){
              const resp = await saveAttributes()
              resolve(resp)
            } else {
              resolve(true)
            }
          })
        }
    }))


    const switchField = (attribute) => {

        switch (attribute.mask) {

            case 'Seleção':
                return(
                    <Stack spacing={2} direction='row' alignItems='center'>
                      <SelectFieldObjectWithValue
                        disabled={disabled}
                        options={attribute.configSelect}
                        label={attribute.atributo}
                        placeholder={attribute.atributo}
                        error={Boolean(touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id])}
                        helperText={touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id]}
                        fieldProps={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id)}
                      />
                      <Label color={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value ? getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value !== initialValues[attribute.atributo_id ? attribute.atributo_id: attribute.id] ? 'success' : 'default' : 'default'}>
                          Ref
                      </Label>
                    </Stack>
                )

            case 'Data de vencimento':
                return(
                    <Stack spacing={2} direction='row' alignItems='center'>
                        <DateField
                            disabled={disabled}
                            label={attribute.atributo}
                            placeholder={attribute.atributo}
                            error={Boolean(touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id])}
                            helperText={touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id]}
                            fieldProps={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id)}
                            InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <CopyToClipboard text={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value}>
                                      <Tooltip title="Copiar">
                                        <IconButton>
                                          <Icon icon={'fluent:copy-24-regular'} width={24} height={24} />
                                        </IconButton>
                                      </Tooltip>
                                    </CopyToClipboard>
                                  </InputAdornment>
                                )
                              }}
                        />
                        <Label color={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value ? getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value !== initialValues[attribute.atributo_id ? attribute.atributo_id: attribute.id] ? 'success' : 'default' : 'default'}>
                            Ref
                        </Label>
                    </Stack>
                )

            case 'Celular':
                return (
                    <Stack spacing={2} direction='row' alignItems='center'>
                        <CelField
                            disabled={disabled}
                            label={attribute.atributo}
                            placeholder={attribute.atributo}
                            error={Boolean(touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id])}
                            helperText={touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id]}
                            fieldProps={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id)}
                            InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <CopyToClipboard text={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value}>
                                      <Tooltip title="Copiar">
                                        <IconButton>
                                          <Icon icon={'fluent:copy-24-regular'} width={24} height={24} />
                                        </IconButton>
                                      </Tooltip>
                                    </CopyToClipboard>
                                  </InputAdornment>
                                )
                              }}
                        />
                        <Label color={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value ? getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value !== initialValues[attribute.atributo_id ? attribute.atributo_id: attribute.id] ? 'success' : 'default' : 'default'}>
                            Ref
                        </Label>
                    </Stack>
                )

            case 'Cep':
                return (
                    <Stack spacing={2} direction='row' alignItems='center'>
                        <CepField
                            disabled={disabled}
                            label={attribute.atributo}
                            placeholder={attribute.atributo}
                            error={Boolean(touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id])}
                            helperText={touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id]}
                            fieldProps={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id)}
                            InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <CopyToClipboard text={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value}>
                                      <Tooltip title="Copiar">
                                        <IconButton>
                                          <Icon icon={'fluent:copy-24-regular'} width={24} height={24} />
                                        </IconButton>
                                      </Tooltip>
                                    </CopyToClipboard>
                                  </InputAdornment>
                                )
                              }}
                        />
                        <Label color={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value ? getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value !== initialValues[attribute.atributo_id ? attribute.atributo_id: attribute.id] ? 'success' : 'default' : 'default'}>
                            Ref
                        </Label>
                    </Stack>
                )

            case 'CPF/CNPJ':
                return (
                    <Stack spacing={2} direction='row' alignItems='center'>
                        <CpfCnpjField
                            disabled={disabled}
                            label={attribute.atributo}
                            placeholder={attribute.atributo}
                            error={Boolean(touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id])}
                            helperText={touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id]}
                            fieldProps={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id)}
                            InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <CopyToClipboard text={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value}>
                                      <Tooltip title="Copiar">
                                        <IconButton>
                                          <Icon icon={'fluent:copy-24-regular'} width={24} height={24} />
                                        </IconButton>
                                      </Tooltip>
                                    </CopyToClipboard>
                                  </InputAdornment>
                                )
                              }}
                        />
                        <Label color={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value ? getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value !== initialValues[attribute.atributo_id ? attribute.atributo_id: attribute.id] ? 'success' : 'default' : 'default'}>
                            Ref
                        </Label>
                    </Stack>
                )

            case 'Moeda':
                return (
                    <Stack spacing={2} direction='row' alignItems='center'>
                        <MoneyField
                            disabled={disabled}
                            label={attribute.atributo}
                            placeholder={attribute.atributo}
                            error={Boolean(touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id])}
                            helperText={touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id]}
                            fieldProps={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id)}
                            InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <CopyToClipboard text={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value}>
                                      <Tooltip title="Copiar">
                                        <IconButton>
                                          <Icon icon={'fluent:copy-24-regular'} width={24} height={24} />
                                        </IconButton>
                                      </Tooltip>
                                    </CopyToClipboard>
                                  </InputAdornment>
                                )
                              }}
                        />
                        <Label color={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value ? getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value !== initialValues[attribute.atributo_id ? attribute.atributo_id: attribute.id] ? 'success' : 'default' : 'default'}>
                            Ref
                        </Label>
                    </Stack>
                )

            default:
                switch (attribute.tipo) {
                    case 'Número':
                        return (
                            <Stack spacing={2} direction='row' alignItems='center'>
                                <NumberField
                                    disabled={disabled}
                                    label={attribute.atributo}
                                    placeholder={attribute.atributo}
                                    error={Boolean(touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id])}
                                    helperText={touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id]}
                                    fieldProps={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id)}
                                    InputProps={{
                                        endAdornment: (
                                          <InputAdornment position="end">
                                            <CopyToClipboard text={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value}>
                                              <Tooltip title="Copiar">
                                                <IconButton>
                                                  <Icon icon={'fluent:copy-24-regular'} width={24} height={24} />
                                                </IconButton>
                                              </Tooltip>
                                            </CopyToClipboard>
                                          </InputAdornment>
                                        )
                                      }}
                                />
                                <Label color={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value ? getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value !== initialValues[attribute.atributo_id ? attribute.atributo_id: attribute.id] ? 'success' : 'default' : 'default'}>
                                    Ref
                                </Label>
                            </Stack>
                        )

                    case 'Data':
                        return (
                            <Stack spacing={2} direction='row' alignItems='center'>
                                <DateField
                                    disabled={disabled}
                                    label={attribute.atributo}
                                    placeholder={attribute.atributo}
                                    error={Boolean(touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id])}
                                    helperText={touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id]}
                                    fieldProps={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id)}
                                    InputProps={{
                                        endAdornment: (
                                          <InputAdornment position="end">
                                            <CopyToClipboard text={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value}>
                                              <Tooltip title="Copiar">
                                                <IconButton>
                                                  <Icon icon={'fluent:copy-24-regular'} width={24} height={24} />
                                                </IconButton>
                                              </Tooltip>
                                            </CopyToClipboard>
                                          </InputAdornment>
                                        )
                                      }}
                                />
                                <Label color={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value ? getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value !== initialValues[attribute.atributo_id ? attribute.atributo_id: attribute.id] ? 'success' : 'default' : 'default'}>
                                    Ref
                                </Label>
                            </Stack>
                        )
                
                    default:
                        return (
                            <Stack spacing={2} direction='row' alignItems='center'>
                                <CustomTextField
                                    disabled={disabled}
                                    label={attribute.atributo}
                                    placeholder={attribute.atributo}
                                    error={Boolean(touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id])}
                                    helperText={touched[attribute.atributo_id ? attribute.atributo_id: attribute.id] && errors[attribute.atributo_id ? attribute.atributo_id: attribute.id]}
                                    fieldProps={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id)}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                            <CopyToClipboard text={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value}>
                                                <Tooltip title="Copiar">
                                                <IconButton>
                                                    <Icon icon={'fluent:copy-24-regular'} width={24} height={24} />
                                                </IconButton>
                                                </Tooltip>
                                            </CopyToClipboard>
                                            </InputAdornment>
                                        )
                                        }}
                                />
                                <Label color={getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value ? getFieldProps(attribute.atributo_id ? attribute.atributo_id: attribute.id).value !== initialValues[attribute.atributo_id ? attribute.atributo_id: attribute.id] ? 'success' : 'default' : 'default'}>
                                    Ref
                                </Label>
                            </Stack>
                        )
                }
        }
    }

    const openArchive = (url) => {
      window.open(url,'_blank');
    }

    return(
        <>
        {isLoading ?
            <Loading open={true}/>
            :
            <FormikProvider value={formik}>
                <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                      {arquivo?.arquivo &&
                        <List disablePadding>
                          <ListItem
                            sx={{
                              my: 1,
                              py: 0.75,
                              px: 2,
                              borderRadius: 1,
                              border: (theme) => `solid 1px ${theme.palette.divider}`,
                              bgcolor: 'background.paper',
                            }}
                          >
                            <ListItemText
                              primary={arquivo.arquivo.name}
                              secondary={fData(arquivo.arquivo.size)}
                              primaryTypographyProps={{ variant: 'subtitle2' }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                            <ListItemSecondaryAction>
                              <MIconButton edge="end" size="small" onClick={() => openArchive(arquivo.arquivo.url)}>
                                  <Icon icon={downloadOutline} />
                              </MIconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        </List>
                      }
                      {formAttributes.map((attribute) =>
                          switchField(attribute)
                      )}
                    </Stack> 
                </Form>
            </FormikProvider>
        }
        </>
    )
})

export default CampoCopiaArchiveAttributes