import * as Yup from 'yup';
import { useEffect, useState } from "react"
import { getFilters, newPost } from "src/redux/slices/post"
import { sendNotificationPost } from 'src/redux/slices/notification';
import { useDispatch } from "src/redux/store"
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { GetSession } from 'src/session';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { notification } from '../../../components/notification/notiflix';
import { dataAtual } from 'src/utils/utils';

export type FormValuesProps = {
    usuario_id: number;
    conteudo: string;
    conteudo_curto?: string;
    mural: any;
    permitir_comentarios: any;
    comunidade_id: any;
    usuarios: object[];
    projetos: object[];
    arquivos?: object[];
    url_video?: string;
    data_mural?: null | string;
  };

const useNewPost = () => {
    const dispatch = useDispatch();
    const usuario = GetSession('@dse-usuario')
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate()
    const [arquivos, setArquivos] = useState([])
    const [errorArquivos, setErrorArquivos] = useState(false)
    const [openImageEdit, setOpenImageEdit] = useState(false)
    const [imageToEdit, setImageToEdit] = useState();

    const NewPostSchema = Yup.object().shape({
        conteudo: Yup.string().required('Conteúdo obrigatório'),
        mural: Yup.boolean(),
        permitir_comentarios: Yup.boolean(),
        comunidade_id: Yup.object().required("Selecione uma comunidade").nullable(),
        usuarios: Yup.array(),
        projetos: Yup.array(),
        url_video: Yup.string().test("urlTest", "URL inválida", 
            function(value){
                if(value && value !== ''){
                    try {
                        new URL(value)
                        return true
                    } catch(err) {
                        return false
                    }
                } else{
                    return true
                }
            })
      });

    const defaultValues = {
        conteudo: '',
        mural: false,
        permitir_comentarios: true,
        comunidade_id: {value: 0, label: 'Geral'},
        usuarios: [],
        projetos: [],
        url_video: ''
    };

    useEffect(() =>{
        dispatch(getFilters())
    },[])

    function getYoutubeId(url: string) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
    
        return (match && match[2].length === 11)
          ? match[2]
          : false;
    }

    function getVimeoId(url: string) {
        var vimeoRegex = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
        var parsed = url.match(vimeoRegex);
        if(parsed && parsed?.length >= 1 ){
            return parsed[1]
        } else{
            return false
        }
    }

    async function getLoomId(url: string){
        const split = url.split('/')
        if(split.length > 0){
            return split[split.length - 1]
        } else{
            return false
        }
    }

    const videoURL = async (url: string) => {
        let retorno = undefined
        if(url.includes('youtube') || url.includes('youtu.be')){
            const videoId = getYoutubeId(url)
            if(videoId){
                retorno = "https://youtube.com/embed/"+videoId
            }
        } else if(url.includes('vimeo')){
            const videoId = getVimeoId(url)
            if(videoId){
                retorno = "https://player.vimeo.com/video/"+videoId
            }
        } else if(url.includes('loom')){
            const videoId = await getLoomId(url)
            if(videoId){
                retorno = "https://www.loom.com/embed/"+videoId
            }
        }

        return retorno
    }

    const onSubmit = async (data: FormValuesProps) => {
        try {
            if(data.mural){
                data.mural = '1'
            }else{
                data.mural = '0'
            }

            if(data.permitir_comentarios){
                data.permitir_comentarios = '1'
            } else{
                data.permitir_comentarios = '0'
            }

            if(data.url_video && data.url_video !== ''){
                const urlDecodificada = await videoURL(data.url_video)
                if(urlDecodificada){
                    data.url_video = urlDecodificada
                } else{
                    data.url_video = undefined
                }
            }

            data.usuario_id = usuario.id;
            data.comunidade_id = data.comunidade_id.value
            data.arquivos = arquivos
            data.data_mural = data.mural === '1' ? dataAtual() : null;
            var result = await dispatch(newPost(data))
            await new Promise((resolve) => setTimeout(resolve, 1000)); 
            await dispatch(sendNotificationPost(data, result))
            enqueueSnackbar('Post criado com sucesso');
            navigate('/rede-social/home')
        } catch (error) {
            console.error(error);
        }
    };

    const handleDrop = (files: any) => {
        let error = false
        let filesArray = files.map((file: any) => {

            if((file.size/1024) <= 36000){
                return Object.assign(file, {
                    preview: URL.createObjectURL(file)
                })
            } else{
                notification('warning','Um ou város documentos selecionados superam o limite unitário de 36mb.')
                error = true
            }
        })

        if(!error){
            setArquivos(filesArray)
        }

        setErrorArquivos(error)
        
    }
    
    const handleRemove = (file: any) => {
        const filteredItems = arquivos.filter((_file) => _file !== file);
        setArquivos(filteredItems);
    };
    
    const handleRemoveAll = () => {
        setArquivos([])
    };

    const callbackEditImage = (base64, name, index) => {
        var arr = base64.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
        
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }

        var files = [...arquivos];

        var file = new File([u8arr], name, {type:mime});
        file = Object.assign(file, {
            preview: URL.createObjectURL(file),
            path: name
        })

        if(index === 0 || index ){
            files[index] = file;
        } else{
            files.push(file)
        }

        setArquivos(files)
        setImageToEdit(null)

    }

    const methods = useForm<FormValuesProps>({
        resolver: yupResolver(NewPostSchema),
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

    const newPostHook = {
        methods,
        handleSubmit,
        onSubmit,
        isSubmitting,
        control,
        values,
        arquivos,
        setArquivos,
        handleDrop,
        handleRemove,
        handleRemoveAll,
        errorArquivos,
        openImageEdit,
        setOpenImageEdit,
        imageToEdit,
        setImageToEdit,
        callbackEditImage
    }

    return{
        newPostHook
    }
}

export default useNewPost