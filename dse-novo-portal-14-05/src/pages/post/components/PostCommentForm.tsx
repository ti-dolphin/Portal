// @mui
import { styled } from '@mui/material/styles';
import { Typography, Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import { FormProvider, RHFTextField } from '../../../components/hook-form';
import usePostComment  from '../hooks/PostComment.hook'

// ----------------------------------------------------------------------

const RootStyles = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(3),
  borderRadius: Number(theme.shape.borderRadius) * 2,
  backgroundColor: theme.palette.background.neutral,
}));

// ----------------------------------------------------------------------

export default function BlogPostCommentForm() {
  const { postCommentHook } = usePostComment();
  

  return (
    <RootStyles>
      <Typography variant="subtitle1" sx={{ mb: 3 }}>
        Adicionar Comentário
      </Typography>

      <FormProvider methods={postCommentHook.methods} onSubmit={postCommentHook.handleSubmit(postCommentHook.onSubmit)}>
        <Stack spacing={3} alignItems="flex-end">
          <RHFTextField name="comment" label="Comentário" multiline rows={3} />

          <LoadingButton type="submit" variant="contained" loading={postCommentHook.isSubmitting}>
            Publicar Comentário
          </LoadingButton>
        </Stack>
      </FormProvider>
    </RootStyles>
  );
}
