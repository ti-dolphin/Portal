import * as Yup from 'yup';
import { useDispatch } from "src/redux/store"
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { GetSession } from 'src/session';
import { loginUser, atualizaSenha } from 'src/redux/slices/users';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

export type FormValuesProps = {
    senhaAntiga: string;
    novaSenha: string;
    confirmaNovaSenha: string;
  };

const useTrocarSenha = () => {
    const dispatch = useDispatch();
    const usuario = GetSession('@dse-usuario')
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate()

    const UserSchema = Yup.object().shape({
        senhaAntiga: Yup.string().required('Conteúdo obrigatório'),
        novaSenha: Yup.string().required('Conteúdo obrigatório').oneOf([Yup.ref('confirmaNovaSenha'), null], 'As senhas precisam ser iguais').min(8, "A senha precisa ter ao menos 8 caracteres"),
        confirmaNovaSenha: Yup.string().required('Conteúdo obrigatório').oneOf([Yup.ref('novaSenha'), null], 'As senhas precisam ser iguais').min(8, "A senha precisa ter ao menos 8 caracteres")
    });

    const defaultValues = {
        senhaAntiga: undefined,
        novaSenha: undefined,
        confirmaNovaSenha: undefined,
    };

    const onSubmit = async (data: FormValuesProps) => {
        try {
            
            const result = await dispatch(loginUser(usuario.login, data.senhaAntiga))
            if(result !== 'error'){
                if(result){
                    var response = await dispatch(atualizaSenha({id:usuario.id, senha: data.novaSenha}))
                    if(response){
                        enqueueSnackbar('Senha atualizada com sucesso');
                        navigate('/rede-social/home')
                    }
                } else{
                    enqueueSnackbar('A senha antiga inserida está errada', {variant: "error"});
                }
            } else{
                enqueueSnackbar('Erro ao atualizar senha, favor tente novamente', {variant: "error"});
            }
            
        } catch (error) {
            console.error(error);
            enqueueSnackbar('Erro ao atualizar senha, favor tente novamente', {variant: "error"});
        }

    };

    const methods = useForm<FormValuesProps>({
        resolver: yupResolver(UserSchema),
        defaultValues,
    });

    const {
        reset,
        watch,
        control,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = methods;

    const values = watch();

    const trocarSenhaHook = {
        methods,
        handleSubmit,
        isSubmitting,
        onSubmit
    }

    return{
        trocarSenhaHook
    }
}

export default useTrocarSenha