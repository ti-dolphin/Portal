import { api } from '../../../../config.ts'
import {notification} from '../../../../components/notification/notiflix'

export const getMascara = async () => {
    try {
        var response = await api.get("mascara");
        return response.data;
    } catch (error) {
        console.log(error);
        notification('error', 'Ocorreu um erro ao consultar as máscaras cadastradas, tente novamente')
        return [];
    }
}

export const getMascaraId = async (mascaraID) => {
    try {
        var response = await api.get("mascara?target[]=id&target_value[]="+mascaraID);
        return response.data;
    } catch (error) {
        console.log(error);
        notification('error', 'Ocorreu um erro ao consultar as máscaras cadastradas, tente novamente')
        return [];
    }
}

export const cadastraMascara = async (mascara) => {
    try {
        var response = await api.post("mascara",mascara);
        return response.data;
    } catch (error) {
        console.log(error);
        notification('error', 'Ocorreu um erro ao cadastrar a máscara, tente novamente')
        return [];
    }
}
