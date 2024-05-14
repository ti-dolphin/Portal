
import { useEffect } from 'react';
import { useDispatch } from '../../../redux/store'
import { getPostDetails } from '../../../redux/slices/post'
import { useParams } from 'react-router-dom';
import { likePost, removeLikePost, commentPost, removeCommentPost } from "src/redux/slices/post"
import { GetSession } from "src/session"

export default function usePost() {
    const dispatch = useDispatch()
    const { postId } = useParams()
    const usuario = GetSession("@dse-usuario")

    useEffect(() => {
        if (postId) {
            dispatch(getPostDetails(postId))
        }
    }, [postId])

    const handleLikePost = async (post: any) => {
        await dispatch(likePost({ post, usuario_id: usuario.id }))
        dispatch(getPostDetails(postId))
    }

    const handleRemoveLikePost = async (post_id: number) => {
        await dispatch(removeLikePost({ post_id, usuario_id: usuario.id }))
        dispatch(getPostDetails(postId))
    }

    const handleReplyCommentPost = async (post: any, content: string, comment_id: number, user_id: number) => {
        await dispatch(commentPost(postId, content, comment_id))
        dispatch(getPostDetails(postId))
    }

    const handleRemoveComment = async (comment_id: number) => {
        await dispatch(removeCommentPost(comment_id))
        dispatch(getPostDetails(postId))
    }

    return {
        handleLikePost,
        handleRemoveLikePost,
        handleReplyCommentPost,
        handleRemoveComment
    };
}