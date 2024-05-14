import * as Yup from 'yup';
import { useState, useCallback } from 'react';
import { useDispatch } from "src/redux/store"
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { GetSession } from 'src/session';
import { updateProfile } from 'src/redux/slices/users';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

export type FormValuesProps = {
    nome: string;
    data_nascimento: Date;
    celular: string;
    email: string;
  };

const useMeusDados = () => {
    const dispatch = useDispatch();
    const usuario = GetSession('@dse-usuario')
    const { enqueueSnackbar } = useSnackbar();
    const [currentTab, setCurrentTab] = useState("Meus Dados")
    const navigate = useNavigate()

    const UserSchema = Yup.object().shape({
        id: Yup.number(),
        nome: Yup.string().required('Conteúdo obrigatório'),
        data_nascimento: Yup.string().required('Conteúdo obrigatório'),
        celular: Yup.string(),
        email: Yup.string().required('Conteúdo obrigatório').email("Endereço de email inválido"),
        avatar: Yup.mixed(),
        url_avatar: Yup.string()
    });

    const defaultValues = {
        id: usuario.id,
        nome: usuario.nome ? usuario.nome : undefined,
        data_nascimento: usuario.data_nascimento ? usuario.data_nascimento.split('T')[0] : undefined,
        celular: usuario.celular ? usuario.celular : undefined,
        email: usuario.email ? usuario.email : undefined,
        avatar: usuario.avatar ? usuario.avatar: undefined,
        url_avatar: usuario.url_avatar ? usuario.url_avatar : undefined
    };

    const onSubmit = async (data: FormValuesProps) => {
        try {
            var result = await dispatch(updateProfile(data))
            if(result){
                enqueueSnackbar('Perfil atualizado com sucesso');
                navigate('/rede-social/home')
            } else{
                enqueueSnackbar('Erro ao atualizar perfil, favor tente novamente', {variant: "error"});
            }
        } catch (error) {
            console.error(error);
            enqueueSnackbar('Erro ao atualizar perfil, favor tente novamente', {variant: "error"});
        }
    };

    const methods = useForm<FormValuesProps>({
        resolver: yupResolver(UserSchema),
        defaultValues,
    });

    const {
        reset,
        watch,
        setValue,
        control,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = methods;

    const handleDrop = useCallback(
        (acceptedFiles) => {
          const file = acceptedFiles[0];
    
          if (file) {
            setValue(
              'avatar',
              Object.assign(file, {
                preview: URL.createObjectURL(file),
              })
            );
          }
        },
        [setValue]
    );

    const meusDadosHook = {
        methods,
        handleSubmit,
        currentTab,
        setCurrentTab,
        handleDrop,
        onSubmit,
        isSubmitting
    }

    return{
        meusDadosHook
    }
}

export default useMeusDados