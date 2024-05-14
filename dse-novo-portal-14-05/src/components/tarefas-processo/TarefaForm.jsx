import React, { useState, useEffect } from 'react'
import { Grid, Typography, Stack, Alert, Box } from '@mui/material'
import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
import { useDispatch, useSelector } from '../../redux/store'
import { saveFields, salvaCampos, atualizaStatus, goToNextPasso, updateResponsavel } from '../../redux/slices/step'
import { getProcessNotifications, getUsersToNotificate, pushNotificationModel, sendNotification, sendPushNotification, sendNotificationToUser } from '../../redux/slices/notification'
import { notification } from '../notification/notiflix'
import { GetSession } from '../../session'
import { urlPainel } from '../../config'
import CopyClipboard from '../CopyClipboard'
import TarefaButtons from './TarefaButtons'
import ArquivoForm from '../fields/ArquivoForm'
import CustomMaskField from '../fields/CustomMaskField'
import SelectFieldTarefa from '../fields/SelectFieldTarefa'
import CelField from '../fields/CelField'
import CepField from '../fields/CepField'
import CpfCnpjField from '../fields/CpfCnpjField'
import DateField from '../fields/DateField'
import NumberField from '../fields/NumberField'
import CustomTextField from '../fields/CustomTextField'
import TextAreaField from '../fields/TextAreaField'
import CampoCopia from '../fields/CampoCopia'
import { validaCPF, validarCNPJ } from '../../utils/utils'
import { getProcessResponsaveis } from 'src/redux/slices/process';

export default function TarefaForm({ tarefa, onClose, tarefaExterna }) {
    const dispatch = useDispatch();
    const usuario = GetSession("@dse-usuario")
    const { process } = useSelector((state) => state.process)
    const [shape, setShape] = useState({})
    const [initialValues, setInitialValues] = useState({});
    const [responsavel, setResponsavel] = useState(tarefa.responsavel_id ? {
        id: tarefa.responsavel_id,
        nome: tarefa.responsavel_nome,
        avatar: tarefa.avatar ? tarefa.avatar : false
    } : {
        id: tarefa.papel_id,
        nome: tarefa.papel_nome,
        avatar: tarefa.avatar ? tarefa.avatar : false
    });

    const refArray = []

    useEffect(() => {
        setShapeAndInitialValues();
    }, [tarefa])

    const setShapeAndInitialValues = () => {
        var initialValuesAux = {}
        var shapeAux = {}
        if (tarefa && tarefa.campos) {
            tarefa.campos.forEach((field) => {
                if (field.tipo !== 'Arquivo') {
                    if (field.tipo !== 'Campo Cópia') {
                        if (field.tipo === 'CPF/CNPJ') {

                            shapeAux[field.id_cadastro] = Yup.mixed().test("cpf", "CPF/CNPJ inválido", (val) => {
                                if (val && val.length > 0) {
                                    if (val.length > 14) {
                                        return validarCNPJ(val)
                                    } else {
                                        return validaCPF(val)
                                    }
                                } else if (field.obrigatoriedade === 1) {
                                    return false
                                } else {
                                    return true
                                }
                            })

                        } else if (field.obrigatoriedade === 1) {
                            shapeAux[field.id_cadastro] = Yup.mixed().required('Preencha este campo')
                        } else {
                            shapeAux[field.id_cadastro] = Yup.mixed();
                        }

                        if (field.valor) {
                            if (field.tipo === 'Seleção' || field.tipo === 'Multi-Seleção') {
                                initialValuesAux[field.id_cadastro] = field.valor ? field.valor : '';
                            } else {
                                initialValuesAux[field.id_cadastro] = field.valor;
                            }
                        } else {
                            initialValuesAux[field.id_cadastro] = '';
                        }
                    } else {
                        if (field.campo_copia.tipo !== 'Arquivo') {
                            if (field.campo_copia.tipo === 'CPF/CNPJ') {

                                shapeAux[field.id_cadastro] = Yup.mixed().test("cpf", "CPF/CNPJ inválido", (val) => {
                                    if (val && val.length > 0) {
                                        if (val.length > 14) {
                                            return validarCNPJ(val)
                                        } else {
                                            return validaCPF(val)
                                        }
                                    } else if (field.obrigatoriedade === 1 && field.campo_copia.editavel) {
                                        return false
                                    } else {
                                        return true
                                    }
                                })

                            } else if (field.obrigatoriedade === 1 && field.campo_copia.editavel) {
                                shapeAux[field.id_cadastro] = Yup.mixed().required('Preencha este campo')
                            } else {
                                shapeAux[field.id_cadastro] = Yup.mixed();
                            }

                            if (field.valor) {
                                if (field.tipo === 'Seleção' || field.tipo === 'Multi-Seleção') {
                                    initialValuesAux[field.id_cadastro] = field.valor ? field.valor : '';
                                } else {
                                    initialValuesAux[field.id_cadastro] = field.valor;
                                }
                            } else {
                                initialValuesAux[field.id_cadastro] = field.campo_copia.valor;
                            }
                        }
                    }
                }
            })
            setShape(shapeAux)
            setInitialValues(initialValuesAux)
        }
    }

    const setUserResponsavel = async (id, nome, avatar) => {
        if (responsavel) {
            var response = await dispatch(updateResponsavel({
                id: tarefa.id,
                responsavel_id: id,
            }));
            if (response) {
                await dispatch(getProcessResponsaveis(tarefa.processo_id));
                setResponsavel({ id, nome, avatar });
            }
        }
    };

    const NewATarefaSchema = Yup.object().shape(shape);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: initialValues,
        validationSchema: NewATarefaSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                var err = false
                const map = refArray.map(async (r) => {
                    var res = await r?.current?.validate()
                    if (res) err = true
                })
                await Promise.all(map)

                if (err) {
                    console.log('erro geral')
                } else {
                    var errArquivo = false
                    for (const r of refArray) {
                        if (r && r.current) {
                            const resp = await r?.current?.save(values)
                            if (!resp) errArquivo = true
                        }
                    }
                    if (!errArquivo) {
                        var r = await dispatch(saveFields({
                            campos: values, 
                            id: tarefa.id,
                            processo_id: tarefa.processo_id,
                            tarefa_id:tarefa.id
                        }))
                        if (r) {
                            notification('success', 'Tarefa concluída com sucesso.')
                            if (usuario) {
                                await setUserResponsavel(usuario?.id, usuario?.nome, usuario?.avatar);
                            }
                            if (r === 'fim') {
                                // ENVIA PUSH FIM DE PROCESSO
                                await sendPushNotification({
                                    title: pushNotificationModel.finishedProcess.title,
                                    body: pushNotificationModel.finishedProcess.body(process.nome, process.descricao ? process.descricao  : '', process.id, new Date(), process.projeto),
                                    ids: [process.responsavel_id]
                                });
                                await dispatch(sendNotificationToUser(
                                    `${pushNotificationModel.finishedProcess.title}`,
                                    `${pushNotificationModel.finishedProcess.body(process.nome, process.descricao ? process.descricao  : '', process.id, new Date(), process.projeto)}`,
                                    process.id,
                                    0,
                                    0,
                                    process.nome,
                                    '',
                                    [process.responsavel_id],
                                    [process.responsavel_email]
                                ));
                                dispatch(getProcessNotifications(String(process.id)));
                            } else {
                                if(r?.data?.passo && r?.data.passo_cadastro){
                                    const users = await getUsersToNotificate(process.id, r.data.passo.papel_id);
                                    const ids = users.map((user) => user.id);
                                    const emails = users.map((user) => user.email);
                                // ENVIA PUSH ATUALIZAÇÃO DE TAREFA

                                    await sendPushNotification({
                                        title: pushNotificationModel.taskUpdates.title(process.nome, process.descricao),
                                        body: pushNotificationModel.taskUpdates.body(process.id, r.data.passo.data_inicio, r.data.passo_cadastro.nome, process.projeto),
                                        ids: ids
                                    });
                                    await dispatch(sendNotificationToUser(
                                        `${pushNotificationModel.taskUpdates.title(process.nome, process.descricao)}`,
                                        `${pushNotificationModel.taskUpdates.body(process.id, r.data.passo.data_inicio, r.data.passo_cadastro.nome, process.projeto)}`,
                                        process.id,
                                        r.data.passo.papel_id,
                                        0,
                                        r.data.passo_cadastro.nome,
                                        '',
                                        ids,
                                        emails
                                    ))
                                    await dispatch(sendNotification(
                                        `Atualização no processo: ${process.nome}`,
                                        'Nova tarefa disponível',
                                        process.id,
                                        r?.data?.passo?.papel_id,
                                        0,
                                        r?.data?.passo_cadastro?.nome,
                                        '',
                                        ids,
                                        emails
                                    ));

                                    dispatch(getProcessNotifications(String(process.id)));
                                }
                            }
                            await dispatch(atualizaStatus(tarefa.id, 1))
                        } else{
                            notification('error', 'Erro ao dar segmento ao processo, favor tente novamente.')
                        }
                        onClose(r)
                    } else {
                        notification('error', 'Ocorreu um erro ao enviar os arquivos, favor tente novamente.')
                    }
                }
            } catch (error) {
                console.error(values);
                console.error('erro');
                console.error(error);
            }
        }
    });

    const { errors, values, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

    const salvarComoRascunho = async (status_id, mensagem) => {
        const status = (status_id === 2 && 'Fazendo') || (status_id === 4 && 'Não Concluída') || (status_id === 3 && 'Aguardando');
        await dispatch(salvaCampos(values, tarefa.id, tarefa.processo_id))
        await dispatch(atualizaStatus(tarefa.id, status_id, mensagem))
        await setUserResponsavel(usuario.id, usuario.nome, usuario.avatar);

        const users = await getUsersToNotificate(process.id, tarefa.papel_id);
        const ids = users.map((user) => user.id);
        const emails = users.map((user) => user.email);

        // // ENVIA PUSH AGUARDANDO SE STATUS_ID = 3
        // if (status_id === 3) {
        //     await sendPushNotification({
        //         title: pushNotificationModel.waitingProcess.title,
        //         body: pushNotificationModel.waitingProcess.body(process.nome, responsavel.nome, usuario.nome),
        //         ids: ids
        //     });
        // }

        // // ENVIA PUSH FAZENDO SE STATUS_ID = 2
        // if (status_id === 2) {
        //     await sendPushNotification({
        //         title: pushNotificationModel.doingProcess.title,
        //         body: pushNotificationModel.waitingProcess.body(process.nome, responsavel.nome, usuario.nome),
        //         ids: ids
        //     });
        // }

        await dispatch(sendNotification(
            `Atualização no processo: ${process.nome}`,
            usuario?.nome ? usuario.nome : `Externo alterou o status da tarefa ${tarefa.nome} para ${status}`,
            process.id,
            tarefa.papel_id,
            1,
            tarefa.nome,
            status,
            ids,
            emails
        ));
        onClose()
    }

    const SwitchField = (field) => {
        switch (field.tipo) {
            case 'Data de vencimento':
                return <Grid item xs={12} mb={2}>
                    <DateField
                        disabled={tarefa.status === 'Concluído'}
                        label={field.nome}
                        placeholder={field.nome}
                        error={Boolean(touched[field.id_cadastro] && errors[field.id_cadastro])}
                        helperText={touched[field.id_cadastro] && errors[field.id_cadastro]}
                        fieldProps={getFieldProps(field.id_cadastro)}
                    />
                </Grid>
            case 'Área de texto':
                return <Grid item xs={12} mb={2}>
                    <TextAreaField
                        disabled={tarefa.status === 'Concluído'}
                        label={field.nome}
                        placeholder={field.nome}
                        error={Boolean(touched[field.id_cadastro] && errors[field.id_cadastro])}
                        helperText={touched[field.id_cadastro] && errors[field.id_cadastro]}
                        fieldProps={getFieldProps(field.id_cadastro)}
                    />
                </Grid>
            case 'Celular':
                return <Grid item xs={12} mb={2}>
                    <CelField
                        disabled={tarefa.status === 'Concluído'}
                        label={field.nome}
                        placeholder={field.nome}
                        error={Boolean(touched[field.id_cadastro] && errors[field.id_cadastro])}
                        helperText={touched[field.id_cadastro] && errors[field.id_cadastro]}
                        fieldProps={getFieldProps(field.id_cadastro)}
                    />
                </Grid>
            case 'Cep':
                return <Grid item xs={12} mb={2}>
                    <CepField
                        disabled={tarefa.status === 'Concluído'}
                        label={field.nome}
                        placeholder={field.nome}
                        error={Boolean(touched[field.id_cadastro] && errors[field.id_cadastro])}
                        helperText={touched[field.id_cadastro] && errors[field.id_cadastro]}
                        fieldProps={getFieldProps(field.id_cadastro)}
                    />
                </Grid>
            case 'CPF/CNPJ':
                return <Grid item xs={12} mb={2}>
                    <CpfCnpjField
                        disabled={tarefa.status === 'Concluído'}
                        label={field.nome}
                        placeholder={field.nome}
                        error={Boolean(touched[field.id_cadastro] && errors[field.id_cadastro])}
                        helperText={touched[field.id_cadastro] && errors[field.id_cadastro]}
                        fieldProps={getFieldProps(field.id_cadastro)}
                    />
                </Grid>
            case 'Moeda':
                return <Grid item xs={12} mb={2}>
                    <NumberField
                        disabled={tarefa.status === 'Concluído'}
                        label={field.nome}
                        placeholder={field.nome}
                        error={Boolean(touched[field.id_cadastro] && errors[field.id_cadastro])}
                        helperText={touched[field.id_cadastro] && errors[field.id_cadastro]}
                        fieldProps={getFieldProps(field.id_cadastro)}
                    />
                </Grid>
            case 'Número':
                return <Grid item xs={12} mb={2}>
                    <NumberField
                        disabled={tarefa.status === 'Concluído'}
                        label={field.nome}
                        placeholder={field.nome}
                        error={Boolean(touched[field.id_cadastro] && errors[field.id_cadastro])}
                        helperText={touched[field.id_cadastro] && errors[field.id_cadastro]}
                        fieldProps={getFieldProps(field.id_cadastro)}
                    />
                </Grid>
            case 'Data':
                return <Grid item xs={12} mb={2}>
                    <DateField
                        disabled={tarefa.status === 'Concluído'}
                        label={field.nome}
                        placeholder={field.nome}
                        error={Boolean(touched[field.id_cadastro] && errors[field.id_cadastro])}
                        helperText={touched[field.id_cadastro] && errors[field.id_cadastro]}
                        fieldProps={getFieldProps(field.id_cadastro)}
                    />
                </Grid>
            case 'Seleção':
                return <Grid item xs={12} mb={2}>
                    <SelectFieldTarefa
                        disabled={tarefa.status === 'Concluído'}
                        options={field.opcoes}
                        label={field.nome}
                        placeholder={field.nome}
                        error={Boolean(touched[field.id_cadastro] && errors[field.id_cadastro])}
                        helperText={touched[field.id_cadastro] && errors[field.id_cadastro]}
                        fieldProps={getFieldProps(field.id_cadastro)}
                    />
                </Grid>
            case 'Texto com máscara personalizada':
                return <Grid item xs={12} mb={2}>
                    <CustomMaskField
                        disabled={tarefa.status === 'Concluído'}
                        mask={field.mascara.mascara}
                        label={field.nome}
                        placeholder={field.nome}
                        error={Boolean(touched[field.id_cadastro] && errors[field.id_cadastro])}
                        helperText={touched[field.id_cadastro] && errors[field.id_cadastro]}
                        fieldProps={getFieldProps(field.id_cadastro)}
                    />
                </Grid>
            case 'Arquivo':
                var ref = React.createRef();
                refArray.push(ref)
                return <Grid item xs={12} mb={2}>
                    <Typography variant='overline'>
                        {field.nome}
                    </Typography>
                    <Box mb={1} />
                    <ArquivoForm
                        ref={ref}
                        status={tarefa.status}
                        arquivo={field}
                        campos={tarefa.campos}
                    />
                </Grid>

            case 'Multi-Seleção':
                return <Grid item xs={12} mb={2}>
                    <SelectFieldTarefa
                        disabled={tarefa.status === 'Concluído'}
                        options={field.opcoes}
                        label={field.nome}
                        placeholder={field.nome}
                        error={Boolean(touched[field.id_cadastro] && errors[field.id_cadastro])}
                        helperText={touched[field.id_cadastro] && errors[field.id_cadastro]}
                        fieldProps={getFieldProps(field.id_cadastro)}
                    />
                </Grid>
            case 'Campo Cópia':
                return <CampoCopia
                    refArray={refArray}
                    field={field}
                    disabled={tarefa.status === 'Concluído'}
                    fieldProps={getFieldProps(field.id_cadastro)}
                    error={Boolean(touched[field.id_cadastro] && errors[field.id_cadastro])}
                    helperText={touched[field.id_cadastro] && errors[field.id_cadastro]}
                />
            default:
                return <Grid item xs={12} mb={2}>
                    <CustomTextField
                        disabled={tarefa.status === 'Concluído'}
                        label={field.nome}
                        placeholder={field.nome}
                        error={Boolean(touched[field.id_cadastro] && errors[field.id_cadastro])}
                        helperText={touched[field.id_cadastro] && errors[field.id_cadastro]}
                        fieldProps={getFieldProps(field.id_cadastro)}
                    />
                </Grid>
        }

    }

    return (
        <FormikProvider value={formik}>
            <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                <Grid container spacing={1}>
                    {(tarefa.status === 'Aguardando' && tarefa.aguardando_mensagem) &&
                        <Grid item xs={12} mb={2}>
                            <Alert severity='warning'>{tarefa.aguardando_mensagem}</Alert>
                        </Grid>
                    }
                    {tarefa.dica &&
                        <Grid item xs={12} mb={2}>
                            <Stack spacing={2}>
                                <Typography variant='subtitle2'>
                                    Descrição
                                </Typography>
                                <Typography variant='body1'>
                                    {tarefa.dica}
                                </Typography>
                            </Stack>
                        </Grid>
                    }
                    {tarefa.subprocesso_id &&
                        <Grid item xs={12} mb={2}>
                            <CopyClipboard
                                value={urlPainel + 'processo/' + tarefa.subprocesso_id}
                                label='Link para acesso ao subprocesso'
                                newTab
                            />
                        </Grid>
                    }
                    {tarefa.papel_id === 6 && usuario?.id &&
                        <Grid item xs={12} mb={2}>
                            <CopyClipboard value={urlPainel + 'tarefa-externa/' + process.id} label='Link para acesso externo' />
                        </Grid>
                    }
                    {tarefa && tarefa.campos && tarefa.campos.map((field) => (
                        SwitchField(field)
                    ))}
                </Grid>

                {tarefa.status !== 'Concluído' && !tarefa.subprocesso_id &&
                    <TarefaButtons tarefa={tarefa} salvarComoRascunho={salvarComoRascunho} handleSubmit={handleSubmit} isSubmitting={isSubmitting} />
                }
            </Form>
        </FormikProvider>
    )

}