import { api } from '../../../../config.ts'
import {notification} from '../../../../components/notification/notiflix'

export const getTituloDinamico = async (processo_id) => {
    try {
        var response = await api.get("processo-titulo/titulo-processo/"+processo_id);
        return response.data;
    } catch (error) {
        console.log(error);
        notification('error', 'Ocorreu um erro ao consultar a configuração de título dinâmico do processo, tente novamente')
        return [];
    }
}

export const postTituloDinamico = async (processo_id, campos) => {
    try {
        var response = await api.post("processo-titulo/titulo-processo", {processo_id,campos});
        return response.data;
    } catch (error) {
        console.log(error);
        notification('error', 'Ocorreu um erro ao cadastrar a configuração de título dinâmico do processo, tente novamente')
        return [];
    }
}

