import { Box, Card, Divider, Container, Typography, Stack } from '@mui/material';
import useSettings from '../../hooks/useSettings';
import Page from '../../components/Page';
import Markdown from '../../components/Markdown';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import SkeletonPost from './components/SkeletonPost';
import PostHero from './components/PostHero'
import PostTags from './components/PostTags'
import PostCommentForm from './components/PostCommentForm'
import PostCommentList from './components/PostCommentList'
import PostArchives from './components/PostArchives'
import { useSelector } from 'src/redux/store';
import usePost from './hooks/Post.hook'


export default function BlogPost() {
  const { themeStretch } = useSettings();
  const postHook = usePost();
  const { postDetails } = useSelector((state: any) => state.post)

  return (
    <Page title="Detalhes do Post">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading='Detalhes do Post'
          links={[
            { name: 'Voltar ao Feed', isGoBack: true },
            { name: 'Post' },
          ]}
        />
        {postDetails && (
          <Card>
            <PostHero post={postDetails} />

            <Box sx={{ p: { xs: 3, md: 5 } }}>

              <Typography dangerouslySetInnerHTML={{ __html: postDetails.conteudo }} />

              {postDetails.url_video &&
                <Stack alignItems='center' sx={{ py: 2 }}>
                  <iframe
                    src={postDetails.url_video}
                    frameborder='0'
                    allow='autoplay; encrypted-media'
                    allowFullScreen
                    title='video'
                    height={'350px'}
                    width={'100%'}
                    style={{ maxWidth: '550px' }}
                  />
                </Stack>
              }

              <PostArchives archives={postDetails.arquivos} />

              <Box sx={{ my: 5 }}>
                <Divider />
                <PostTags post={postDetails} postHook={postHook} />
                <Divider />
              </Box>

              {postDetails.permitir_comentarios &&
                <>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Typography variant="h4">Comentários</Typography>
                    <Typography variant="subtitle2" sx={{ color: 'text.disabled' }}>
                      ({postDetails.comentarios.length})
                    </Typography>
                  </Box>

                  <PostCommentForm />

                  <PostCommentList post={postDetails} postHook={postHook} />
                </>
              }

            </Box>
          </Card>
        )}

        {!postDetails && <SkeletonPost />}

      </Container>
    </Page>
  );
}
