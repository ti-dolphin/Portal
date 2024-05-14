import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch } from '../../../redux/store'
import { commentPost, getPostDetails } from '../../../redux/slices/post'
import { useParams } from 'react-router-dom';
import { sendNotificationCommentPost } from 'src/redux/slices/notification';



type FormValuesProps = {
    comment: string;
};

const usePostComment = () => {
    const dispatch = useDispatch()
    const { postId } = useParams()


    const CommentSchema = Yup.object().shape({
        comment: Yup.string().required('Insira um comentário'),
    });

    const defaultValues = {
        comment: '',
    };

    const methods = useForm<FormValuesProps>({
        resolver: yupResolver(CommentSchema),
        defaultValues,
    });

    const {
        reset,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const onSubmit = async (data: FormValuesProps) => {
        try {
            await dispatch(commentPost(postId, data.comment))
            await dispatch(sendNotificationCommentPost(Number(postId)))
            dispatch(getPostDetails(postId))
            reset();
        } catch (error) {
            console.error(error);
        }
    };

    const postCommentHook = {
        isSubmitting,
        methods,
        handleSubmit,
        onSubmit,
    }

    return{
        postCommentHook
    }
}

export default usePostComment