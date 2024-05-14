import { useEffect, useState } from "react"
import { getPostsFeed, getMorePostsFeed, getPostsMural, likePost, removeLikePost, deletePost, removeFromPostWall, resetIndex } from "src/redux/slices/post"
import { useDispatch, useSelector } from "src/redux/store"
import { useSnackbar } from 'notistack';
import { sendNotificationLikePost } from 'src/redux/slices/notification';
import { getFavorites } from 'src/redux/slices/project'
import { GetSession } from '../../../session' 
import { updateAccess } from 'src/redux/slices/users'


const useRedeSocial = () => {
    const dispatch = useDispatch();
    const { index, isLoading } = useSelector((state: any) => state.post)
    const [filter, setFilter] = useState('');
    const usuario = GetSession("@dse-usuario")
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() =>{
        dispatch(updateAccess(usuario.id))
        dispatch(getPostsMural())
        dispatch(getFavorites())
        dispatch(resetIndex());
        dispatch(getPostsFeed({
                           index: 1, 
                           comunidades:  usuario.tipo === 'Administrador' ? 'all' : [...usuario.grupos, 0],
                           filter: filter, 
                        }))
    },[])

    const removePostWall = async (id: number) =>{
        dispatch(removeFromPostWall(id))
        window.location.reload()
    }

    const handleGetMorePostsFeed = () =>{
        if(!isLoading){
            dispatch(getMorePostsFeed({
                index: index, 
                comunidades: usuario.tipo === 'Administrador' ? 'all' : [...usuario.grupos, 0],
                filter: filter,  
            }))
        }
    }

    const handleLikePost = (post_id: number) =>{
        dispatch(likePost({post_id, usuario_id: usuario.id}))
        dispatch(getPostsFeed({
            index: index, 
            comunidades: usuario.tipo === 'Administrador' ? 'all' : [...usuario.grupos, 0],
            filter: filter, 
         }))
        dispatch(sendNotificationLikePost(post_id))
    }

    const handleRemoveLikePost = (post_id: number) =>{
        dispatch(removeLikePost({post_id, usuario_id: usuario.id}))
        dispatch(getPostsFeed({
            index: index, 
            comunidades: usuario.tipo === 'Administrador' ? 'all' : [...usuario.grupos, 0],
            filter: filter, 
         }))
    }

    const handleDeletePost = (post_id: number) =>{
        dispatch(deletePost(post_id))
        window.location.reload()
        enqueueSnackbar('Post deletado com sucesso');
    }

    const handleFilter = (value: string) =>{
        dispatch(resetIndex());
        dispatch(getPostsFeed({
                           index: 1, 
                           comunidades:  usuario.tipo === 'Administrador' ? 'all' : [...usuario.grupos, 0],
                           filter: value, 
                        }))
    }

    const onClickTag = (value: string) =>{
        window.scrollTo(0,0)
        dispatch(resetIndex());
        setFilter(value);
        dispatch(getPostsFeed({
                           index: 1, 
                           comunidades:  usuario.tipo === 'Administrador' ? 'all' : [...usuario.grupos, 0],
                           filter: value, 
                        }))
    }

    const redeSocialHook = {
        filter,
        setFilter,
        removePostWall,
        handleGetMorePostsFeed,
        handleLikePost,
        handleRemoveLikePost,
        handleDeletePost,
        handleFilter,
        onClickTag
    }

    return{
        redeSocialHook
    }
}

export default useRedeSocial