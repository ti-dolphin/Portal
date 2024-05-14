
import { useCallback } from 'react'
import { Controller } from 'react-hook-form';
// @mui
import { LoadingButton } from '@mui/lab';
import { styled } from '@mui/material/styles';
import {
  Grid,
  Card,
  Chip,
  Stack,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material';
// routes
import {
  RHFSwitch,
  RHFEditor,
  FormProvider,
  RHFTextField
} from '../../../components/hook-form';

import useNewPost from '../hooks/NewPost.hook'
import { useSelector } from "src/redux/store"
import { GetSession } from '../../../session';
import UploadFile from '../../../components/UploadFile'

import ImageEditModal from '../../../components/fields/ImageEditModal'

const LabelStyle = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));


export default function NewPostForm() {
  const { usersOptions, cumunityOptions, projectOptions } = useSelector((state: any) => state.post)
  const { newPostHook } = useNewPost();
  const usuario = GetSession("@dse-usuario")

  return (
    <>
      <FormProvider methods={newPostHook.methods} onSubmit={newPostHook.handleSubmit(newPostHook.onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>

                <div>
                  <LabelStyle>Conteúdo</LabelStyle>
                  <RHFEditor simple name="conteudo" />
                </div>

                <div>
                  <LabelStyle>URL Vídeo</LabelStyle>
                  <RHFTextField name="url_video" placeholder='Digite aqui...' sx={{textDecorationLine: 'underline', input: { color: '#0000EE' }}} />
                </div>

                <div>
                  <LabelStyle>Arquivos</LabelStyle>
                  <UploadFile
                      multiple={true}
                      showPreview={false}
                      files={newPostHook.arquivos}
                      onDrop={newPostHook.handleDrop}
                      onRemove={newPostHook.handleRemove}
                      onRemoveAll={newPostHook.handleRemoveAll}
                      error={newPostHook.errorArquivos}
                      editImage={(index: number) => {
                        newPostHook.arquivos[index].index = index
                        newPostHook.setImageToEdit(newPostHook.arquivos[index]); 
                        newPostHook.setOpenImageEdit(true);
                      }}
                  />
                </div>

                <ImageEditModal 
                  open={newPostHook.openImageEdit} 
                  handleClose={() => newPostHook.setOpenImageEdit(false)} 
                  image={newPostHook.imageToEdit} 
                  callback={newPostHook.callbackEditImage}
                  isMuralEdit
                />

              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>

                {usuario.tipo === 'Administrador' &&
                  <div>
                    <RHFSwitch
                      name="permitir_comentarios"
                      label="Permitir comentários"
                      labelPlacement="start"
                      sx={{ mb: 1, mx: 0, width: 1, justifyContent: 'space-between' }}
                    />

                    <RHFSwitch
                      name="mural"
                      label="Publicar no mural"
                      labelPlacement="start"
                      sx={{ mb: 1, mx: 0, width: 1, justifyContent: 'space-between' }}
                    />
                  </div>
                }

                <Controller
                  name={"comunidade_id"}
                  control={newPostHook.control}
                  render={({ field, fieldState: { error } }) => (
                    <Autocomplete
                        onChange={(_, data) => field.onChange(data)}
                        defaultValue={field.value}
                        onBlur={() => field.onBlur()}
                        fullWidth
                        options={cumunityOptions}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option,value) => option.value === value.value}
                        renderInput={(params) => <TextField label="Comunidade" {...params} {...field} name={"comunidade"} margin="none" error={!!error} helperText={error?.message}/>}
                    />
                  )}
                />

                <Controller
                  name={"usuarios"}
                  control={newPostHook.control}
                  render={({ field, fieldState: { error } }) => (
                    <Autocomplete
                        onChange={(_, data) => field.onChange(data)}
                        defaultValue={field.value}
                        onBlur={() => field.onBlur()}
                        multiple
                        fullWidth
                        options={usersOptions}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option,value) => option.value === value.value}
                        renderInput={(params) => <TextField label="Usuários" {...params} {...field} name={"usuarios"} margin="none" error={!!error} helperText={error?.message}/>}
                    />
                  )}
                />

                <Controller
                  name={"projetos"}
                  control={newPostHook.control}
                  render={({ field, fieldState: { error } }) => (
                    <Autocomplete
                        onChange={(_, data) => field.onChange(data)}
                        defaultValue={field.value}
                        onBlur={() => field.onBlur()}
                        multiple
                        fullWidth
                        options={projectOptions}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option,value) => option.value === value.value}
                        renderInput={(params) => <TextField label="Projetos" {...params} {...field} name={"projetos"} margin="none" error={!!error} helperText={error?.message}/>}
                    />
                  )}
                />

              </Stack>
            </Card>

            <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
              <LoadingButton
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                loading={newPostHook.isSubmitting}
              >
                Postar
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </FormProvider>

    </>

  );
}
