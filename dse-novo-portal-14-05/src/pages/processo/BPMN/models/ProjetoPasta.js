import { api } from '../../../../config.ts'
import {notification} from '../../../../components/notification/notiflix'

export const getPastasPaiProjeto = async (projetoID) => {
    try {
        var response = await api.get("projeto-pasta/selectpais/"+projetoID);
        return response.data;
    } catch (error) {
        console.log(error);
        notification('error', 'Ocorreu um erro ao consultar as máscaras cadastradas, tente novamente')
        return [];
    }
}

export const getPastasFilhas = async (pastaID) => {
    try {
        var response = await api.get("projeto-pasta/selectfilhos/"+pastaID);
        return response.data;
    } catch (error) {
        console.log(error);
        notification('error', 'Ocorreu um erro ao consultar as máscaras cadastradas, tente novamente')
        return [];
    }
}

export const getCaminhoPastaProjeto = async (pastaID) => {
    try {
        var response = await api.get("projeto-pasta/caminho/"+pastaID);
        return response.data;
    } catch (error) {
        console.log(error);
        notification('error', 'Ocorreu um erro, tente novamente')
        return [];
    }
}

export const getPastaProjetoTemplate = async (projeto_id,pasta_id) => {
    try {
        var response = await api.get("projeto-pasta/pastaProjetoTemplate/"+projeto_id+"/"+pasta_id);
        return response.data;
    } catch (error) {
        console.log(error);
        notification('error', 'Ocorreu um erro, tente novamente')
        return [];
    }
}

export const cadastraProjetoComBaseEmTemplate = async (projeto_id,template_id) => { 
    try {
        var response = await api.post("projeto-pasta/projetoTemplate",{
            projeto_id : projeto_id,
            template_id : template_id
        });
        return response.data;
    } catch (error) {
        console.log(error);
        notification('error', 'Ocorreu um erro, tente novamente')
        return [];
    }
}