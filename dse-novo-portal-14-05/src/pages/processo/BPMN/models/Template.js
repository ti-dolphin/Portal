import { api } from '../../../../config.ts'
import {notification} from '../../../../components/notification/notiflix'

export const getPastasPaiTemplate = async () => {
    try {
        var response = await api.get("pasta-cadastro/pais");
        return response.data;
    } catch (error) {
        console.log(error);
        notification('error', 'Ocorreu um erro, tente novamente')
        return [];
    }
}

export const getPastasTemplateFilhas = async (pastaID) => {
    try {
        var response = await api.get("pasta-cadastro/filhas/"+pastaID);
        return response.data;
    } catch (error) {
        console.log(error);
        notification('error', 'Ocorreu um erro , tente novamente')
        return [];
    }
}

export const getCaminhoPastaTemplate = async (pastaID) => {
    try {
        var response = await api.get("pasta-cadastro/caminho/"+pastaID);
        return response.data;
    } catch (error) {
        console.log(error);
        notification('error', 'Ocorreu um erro, tente novamente')
        return [];
    }
}