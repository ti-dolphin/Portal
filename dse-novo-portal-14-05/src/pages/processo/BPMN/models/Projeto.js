import { api } from '../../../../config.ts'
import {notification} from '../../../../components/notification/notiflix'

export const getProjetos = async () => {
    try {
        var response = await api.get("projeto-cadastro/projetosOnly");
        return response.data;
    } catch (error) {
        console.log(error);
        notification('error', 'Ocorreu um erro ao consultar as máscaras cadastradas, tente novamente')
        return [];
    }
}

export const getProjeto = async (id) => {
    try {
        var response = await api.get("projeto-cadastro?target[]=id&target_value[]="+id);
        if(response.data.length > 0){
            return response.data[0]
        } else{
            return null
        }
    } catch (error) {
        console.log(error);
        notification('error', 'Ocorreu um erro ao consultar as máscaras cadastradas, tente novamente')
        return [];
    }
}

export const getTemplates = async () => {
    try {
        var response = await api.get("projeto-cadastro?target[]=status&target_value[]=Ativo&target[]=template&target_value[]=1");
        return response.data;
    } catch (error) {
        console.log(error);
        notification('error', 'Ocorreu um erro ao consultar as máscaras cadastradas, tente novamente')
        return [];
    }
}