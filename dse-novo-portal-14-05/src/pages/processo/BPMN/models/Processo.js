import { api } from '../../../../config.ts'
import {notification} from '../../../../components/notification/notiflix'

export const cadastraFluxoProcesso = async (passo_atual, passo_seguinte, passo_decisao, processo_cadastro_id, condicao) => {
    try {
        var response = await api.post('processo-fluxo-cadastro',{
            condicao: condicao,
            valor_condicao : '',
            status: 'Ativo',
            passo_atual : passo_atual,
            passo_seguinte: passo_seguinte,
            passo_decisao: passo_decisao,
            processo_cadastro_id : processo_cadastro_id,
        })
        return response.data;
    } catch (error) {
        console.log(error);
        notification('error', 'Ocorreu um erro ao cadastrar fluxo do processo')
        return null;
    }
}

export const cadastraValoresAnterioresFluxoProcesso = async (processoAnterior,processoNovo) => {
    try{
        var response = await api.post('processo-fluxo-cadastro/cadastraValores',{
            processo_anterior : processoAnterior,
            processo_novo: processoNovo
        })
        return response.data;
    } catch(error){
        console.log(error);
        notification('error', 'Ocorreu um erro ao preencher os valores de fluxo do processo')
        return null;
    }
}

export const cadastraProcesso = async (data) => {
    try {
        var response = await api.post('processo-cadastro/cadastro',data)
        return response.data;
    } catch (error) {
        console.log(error);
        notification('error', 'Ocorreu um erro ao cadastrar processo')
        return null;
    }
}

export const validaTasks = (passos) => {
    var err = false;

    for (var passo of passos) {
        var notificacaoExibida = false; 

        if (passo.decisao === 'nao') {
            if (passo.subprocesso !== 1) {
                if (passo.campos.length === 0) {
                    err = true;
                    notification('warning', 'Passo ' + passo.descricao + ' sem campos cadastrados');
                } else {
                    for (var campo of passo.campos) {
                        var errCampo = validaCampo(campo, passo);
                        if (errCampo) err = errCampo;
                    }
                }
            } else {
                if (!passo.subprocesso_cadastro_id) {
                    notification('warning', 'Sub-processo não selecionado');
                }
            }
        } else {
            if (passo.processo_fluxo_cadastro) {
                passo.processo_fluxo_cadastro.map((fluxo) => {
                    var i = 0;
                    if (fluxo.condicoes.length > 0) {
                        fluxo.condicoes.map((f) => {
                            if (f) {
                                i++;
                                if (!f.processo_campo_cadastro_id || !f.valor_condicao || f.valor_condicao === '') {
                                    err = true;

                                    if (!notificacaoExibida) {
                                        notification('warning', 'Decisão ' + passo.nome + ' Possui caminho(s) sem campo ou valor definido(s)');
                                        notificacaoExibida = true; 
                                    }
                                }
                            }
                        });
                    } else {
                        err = true;
                    }

                    if (i <= 0) {
                        err = true;
                    }
                });
            } else {
                err = true;
            }
        }
    }

    return err;
};


export const getProcesso = async (id) => {
    try {
        var response = await api.get('processo/'+id)
        return response.data[0];
    } catch (error) {
        console.log(error);
        notification('error', 'Ocorreu um erro ao consultar processo')
        return null;
    }
}

export const getProcessoCompleto = async (id) => {
    try {
        var response = await api.get('processo/completo/'+id)
        return response.data
    } catch (error) {
        console.log(error);
        notification('error', 'Ocorreu um erro ao consultar processo')
        return null;
    }
}

const validaCampo = (campo, passo) => {
    var err = false
    if(!campo.nome || campo.nome == '') {
        err = true
        notification('warning', 'Campo ' + campo.tipo + ' do passo ' + passo.descricao + ' não possui descrição')
    } else {
        var camposSemValidacao = ['Texto', 'Número', 'Data', 'Celular', 'Cep', 'CPF/CNPJ', 'Moeda', 'Multi-Seleção']
        if(!camposSemValidacao.includes(campo.tipo)) {
            switch(campo.tipo) {
                case 'Texto com máscara personalizada': 
                    var errCampo = validaTextoPersonalizado(campo, passo)
                    if(errCampo) err = errCampo
                    break;
                case 'Seleção':
                    var errCampo = validaSelecao(campo, passo)
                    if(errCampo) err = errCampo
                    break;
                case 'Arquivo':
                    var errCampo = validaArquivo(campo, passo)
                    if(errCampo) err = errCampo
                    break;
                case 'Campo Cópia':
                    var errCampo = validaCampoCopia(campo, passo)
                    if(errCampo) err = errCampo
                    break;
            }
        }
    }
    return err
}

const validaTextoPersonalizado = (campo, passo) => {
    var err = false
    if(!campo.processo_campo_mascara || !campo.processo_campo_mascara.mascara_id || campo.processo_campo_mascara.mascara_id < 1) {
        notification('warning', 'Campo ' + campo.tipo + ' do passo ' + passo.descricao + ' não possui máscara')
        err = true
    }
    return err
}

const validaSelecao = (campo, passo) => {
    var err = false

    if(!campo.processo_campo_opcao_select || campo.processo_campo_opcao_select.length == 0) {
        notification('warning', 'Campo ' + campo.tipo + ' do passo ' + passo.descricao + ' não possui opções')
        err = true
    }
    return err
}

const validaArquivo = (campo, passo) => {
    var err = false

    if(!campo.processo_campo_arquivo || 
        !campo.processo_campo_arquivo.projeto_pasta_id || 
        campo.processo_campo_arquivo.projeto_pasta_id < 1) {
        notification('warning', 'Campo ' + campo.tipo + ' do passo ' + passo.descricao + ' não possui pasta alvo')
        err = true
    } else if (campo.processo_campo_arquivo.cadastro_nova_pasta_campo_id && 
        campo.processo_campo_arquivo.cadastro_nova_pasta_campo_id < 0) {
            notification('warning', 'Campo ' + campo.tipo + ' do passo ' + passo.descricao + ' não possui campo alvo para cadastro de pasta')
            err = true
    }
    return err
}

const validaCampoCopia = (campo, passo) => {
    var err = false

    if(!campo.processo_campo_copia.processo_campo_copia_id || campo.processo_campo_copia.processo_campo_copia_id < 1) {
        notification('warning', 'Campo ' + campo.tipo + ' do passo ' + passo.descricao + ' não possui campo alvo')
        err = true
    }
    return err
}
