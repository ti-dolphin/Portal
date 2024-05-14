// @mui
import { Box, List } from '@mui/material';
//
import PostCommentItem from './PostCommentItem';

// ----------------------------------------------------------------------

type Props = {
  post: any;
  postHook: any;
};

export default function BlogPostCommentList({ post, postHook }: Props) {
  return (
    <List disablePadding>
      {post.comentarios.map((comentario: any) => {
        const { id, respostas } = comentario;
        const hasReply = respostas.length > 0;

        return (
          <Box key={id} sx={{}}>
            <PostCommentItem
              tipo={comentario.usuario_tipo}
              commentId = {id}
              userId = {comentario.usuario_id}
              name={comentario.usuario_nome}
              postedAt={comentario.data}
              message={comentario.conteudo}
              postHook={postHook}
              avatar={comentario.avatar}
            />
            {hasReply &&
              comentario.respostas.map((reply: any) => {
                return (
                  <PostCommentItem
                    tipo={reply.usuario_tipo}
                    userId = {reply.usuario_id}
                    commentId = {id}
                    key={reply.id}
                    postedAt={reply.data}
                    message={reply.conteudo}
                    name={reply.usuario_nome}
                    postHook={postHook}
                    hasReply
                    avatar={reply.avatar}
                  />
                );
              })}
          </Box>
        );
      })}
    </List>
  );
}
