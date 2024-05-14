import { useEffect, useState, useCallback } from 'react'
import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
import { Grid, TextField, InputAdornment, Typography, Box, MenuItem, Autocomplete, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LinkIcon from '@mui/icons-material/Link';
import ListIcon from '@mui/icons-material/List';
import { api } from '../../config'
import { useSelector, useDispatch } from '../../redux/store';
import { saveProject } from '../../redux/slices/project';
import PermissionsTable from './PermissionsTable';
import UploadFile from '../UploadFile'

import CustomTextField from '../fields/CustomTextField'
import SelectField from '../fields/SelectField'


export default function ProjectForm({ callback, projeto, isEdit, setOpen }) {
    const dispatch = useDispatch();
    const [alvo, setAlvo] = useState('Grupo');
    const ALVO = ['Grupo', 'Usuário'];
    const STATUS = ['Ativo', 'Inativo'];
    const [alvos, setAlvos] = useState([]);
    const [imagem, setImagem] = useState();
    const { usuarios, grupos, templates, permissoesProjeto } = useSelector((state) => state.project)

    const NewUserSchema = Yup.object().shape({
        nome: Yup.string().required('Insira um nome'),
        descricao: Yup.string().required('Insira uma descrição'),
        alvo: Yup.string().required('Selecione um tipo de alvo'),
        alvos: isEdit 
            ? Yup.array().of(Yup.object().shape({ id: Yup.number(), nome: Yup.string() }))
            : Yup.array().of(Yup.object().shape({ id: Yup.number(), nome: Yup.string() })).min(1, 'Selecione um alvo'),
        template: Yup.object().shape({
            id: Yup.number(),
            nome: Yup.string(),
        }
        ),
        prefixo: Yup.string().required('Insira um prefixo'),
        responsavel: Yup.number().required('Selecione um gerente de projeto'),
        imagem: isEdit ? Yup.array() : Yup.array().min(1, 'Insira uma imagem'),
        status: isEdit ? Yup.string().required('Selecione um status') : Yup.string(),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            nome: projeto?.nome || '',
            descricao: projeto?.descricao || '',
            alvo: projeto?.alvo || alvo,
            alvos: projeto?.alvos || [],
            template: projeto?.template !== 1 ? projeto?.template || '' : '',
            prefixo: projeto?.prefixo || '',
            responsavel: projeto?.responsavel_id || '',
            imagem: [],
            status: projeto?.status || 'Ativo',
        },
        validationSchema: NewUserSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                if (isEdit) {
                    //edita projeto
                    await dispatch(saveProject(projeto, imagem, values))
                    resetForm();
                    setSubmitting(false);
                    setOpen(false);
                    callback();
                } else {
                    //cria projeto
                    var dados = {
                        'nome': values.nome,
                        'descricao': values.descricao,
                        'status': 'Ativo',
                        'empresa_id': 1,
                        'prefixo': values.prefixo.toUpperCase(),
                        'responsavel_id': values.responsavel,
                    }

                    api.post('projeto-cadastro/', dados).then(async (r) => {

                        await api.post('projeto-cadastro/cadastraimagem', {
                            id: r.data.rows.insertId,
                            nome: imagem.nome,
                            base64: { base64: imagem.base64 },
                        })

                        const map = values.alvos.map(async (a) => {
                            await api.post('permissao', {
                                permissao: 'Sim',
                                area: 'acesso_projeto',
                                area_id: r.data.rows.insertId,
                                alvo: values.alvo,
                                alvo_id: a.id,
                                status: 'Ativo'
                            })
                        })

                        if (values.template !== '' && values.template !== [] && values.template !== undefined && values.template !== null) {
                            await api.post("projeto-pasta/projetoTemplate", {
                                projeto_id: r.data.rows.insertId,
                                template_id: values.template.id
                            });
                        }
                        await Promise.all(map);

                    })
                    resetForm();
                    setSubmitting(false);
                    setOpen(false);
                    callback();

                }

            } catch (error) {
                console.log('erro')
                console.log(error);
            }
        }
    });

    const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps } = formik;
    console.log(errors)

    useEffect(() => {
        if (alvo === 'Grupo') {
            setAlvos(grupos)
        } else {
            setAlvos(usuarios)
        }
    }, [alvo, usuarios, grupos])

    const onChangeAlvo = (option) => {
        if (option === 'Grupo') {
            setAlvos(grupos)
        } else {
            setAlvos(usuarios)
        }
        if (values.alvos) {
            values.alvos.length = 0
        }
    }

    const setImage = (file) => {
        if (file.type.includes('image')) {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            var nome = file.name;
            reader.onload = (e) => {
                setImagem({ nome: nome, base64: e.target.result })
            }
        } else {
            setFieldValue('imagem', [])
        }
    }

    const handleDrop = useCallback(
        (acceptedFiles) => {
            setFieldValue(
                'imagem',
                acceptedFiles.map((file) =>
                    Object.assign(file, {
                        preview: URL.createObjectURL(file)
                    })
                )
            );
            setImage(acceptedFiles[0]);
        },
        [setFieldValue, setImage]
    );

    const handleRemoveAll = () => {
        setFieldValue('imagem', []);
    };

    const handleRemove = (file) => {
        const filteredItems = values.imagem.filter((_file) => _file !== file);
        setFieldValue('imagem', filteredItems);
    };


    return (
        <FormikProvider value={formik}>
            <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                <Typography variant='h4'>Projeto</Typography>
                <Box mb={2} />
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <CustomTextField
                            label="Nome"
                            placeholder='Nome'
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AccountCircleIcon />
                                    </InputAdornment>
                                )
                            }}
                            fieldProps={getFieldProps('nome')}
                            error={Boolean(touched.nome && errors.nome)}
                            helperText={touched.nome && errors.nome}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <CustomTextField
                            label="Descrição"
                            placeholder='Descrição'
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
                                setFieldValue('alvos', newValue);
                            }}
                            onInputChange={(event, newInputValue) => {
                                setFieldValue('alvos', newInputValue);
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
                        {isEdit ?
                            <SelectField
                                options={STATUS}
                                label="Status"
                                placeholder="Status"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <ListIcon />
                                        </InputAdornment>
                                    )
                                }}
                                fieldProps={getFieldProps('status')}
                                error={Boolean(touched.status && errors.status)}
                                helperText={touched.status && errors.status}
                            />
                            :

                            <TextField
                                select
                                fullWidth
                                label="Template"
                                placeholder="Template"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <ListIcon />
                                        </InputAdornment>
                                    )
                                }}
                                {...getFieldProps('template')}
                                error={Boolean(touched.template && errors.template)}
                                helperText={touched.template && errors.template}
                            >
                                {templates.map((option) => (
                                    <MenuItem key={option.id} value={option}>
                                        {option.nome}
                                    </MenuItem>
                                ))
                                }
                            </TextField>
                        }
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <CustomTextField
                            label="Prefixo"
                            placeholder='Prefixo'
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <ListIcon />
                                    </InputAdornment>
                                )
                            }}
                            fieldProps={getFieldProps('prefixo')}
                            error={Boolean(touched.prefixo && errors.prefixo)}
                            helperText={touched.prefixo && errors.prefixo}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            label="Gerente do Projeto"
                            placeholder="Gerente do Projeto"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <ListIcon />
                                    </InputAdornment>
                                )
                            }}
                            {...getFieldProps('responsavel')}
                            error={Boolean(touched.responsavel && errors.responsavel)}
                            helperText={touched.responsavel && errors.responsavel}
                        >
                            {usuarios.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                    {option.nome}
                                </MenuItem>
                            ))
                            }
                        </TextField>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant='h4'> Imagem do Projeto:</Typography>
                        <Box mb={2} />
                        <UploadFile
                            files={values?.imagem || []}
                            onDrop={handleDrop}
                            onRemove={handleRemove}
                            onRemoveAll={handleRemoveAll}
                            type="file"
                            accept="image/*"
                            {...getFieldProps('imagem')}
                            error={Boolean(touched.imagem && errors.imagem)}
                            helperText={touched.imagem && errors.imagem}
                        />
                    </Grid>

                    <Grid item xs={12} >
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>

                            <Button variant="contained" color='error' sx={{ boxShadow: 'none' }} onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>

                            <Box mr={0.5} />

                            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                                {!isEdit ? 'Criar' : 'Salvar'}
                            </LoadingButton>

                        </Box>
                        <Box mb={2} />
                    </Grid>

                    {isEdit &&
                        <Grid item xs={12} >
                            <Typography variant='h4'>Tabela de Permissões</Typography>
                            <PermissionsTable permissoesProjeto={permissoesProjeto} idProjeto={projeto.id} />
                        </Grid>

                    }

                </Grid>

            </Form>
        </FormikProvider>
    )
}