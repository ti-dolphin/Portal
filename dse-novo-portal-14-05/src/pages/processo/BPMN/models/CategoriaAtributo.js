import { api } from '../../../../config.ts'
import {notification} from '../../../../components/notification/notiflix'

export const getCategoriasPasta = async (filha,pastaID) => {
    try {
        if(pastaID){
            var response = await api.post('categoria-atributo/catpasta',{filha:filha,pasta_id:pastaID})
            return response.data.rows;
        } else{
            return [];
        }
    } catch (error) {
        console.log(error);
        notification('error', 'Ocorreu um erro ao consultar as máscaras cadastradas, tente novamente')
        return [];
    }
}
