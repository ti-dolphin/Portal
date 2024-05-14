import { createSlice } from '@reduxjs/toolkit';
import { api } from '../../config'
import { GetSession } from '../../session';
import { dataAtual, getPrazo } from '../../utils/utils';

const initialState = {
  isLoading: false,
  error: false,
  processHome: [],
  process: {},
  processInitial: [],
  processGed: [],
  processResponsaveis: [],
  processAbaProcessos: [],
};

const slice = createSlice({
  name: 'process',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    stopLoading(state) {
      state.isLoading = false;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    getProcessHomeSuccess(state, action) {
      state.isLoading = false;
      state.processHome = action.payload;
    },

    getProcessSuccess(state, action) {
      state.isLoading = false;
      state.process = action.payload;
    },

    setProcess(state, action) {
      state.isLoading = false;
      state.process = action.payload;
    },

    getProcessInitialSuccess(state, action) {
      state.isLoading = false;
      state.processInitial = action.payload;
    },

    getProcessGedSuccess(state, action) {
      state.isLoading = false;
      state.processGed = action.payload;
    },

    getProcessResponsaveisSuccess(state, action) {
      state.isLoading = false;
      state.processResponsaveis = action.payload;
    },

    getProcessAbaProcessosSuccess(state, action) {
      state.isLoading = false;
      state.processAbaProcessos = action.payload;
    },

  }
});

// Reducer
export default slice.reducer;
export const { setProcess } = slice.actions;

// ----------------------------------------------------------------------

export function getProcessHome() {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading());
      const usuario = GetSession("@dse-usuario");
      const response = await api.get('processo/home/' + usuario.id);
      dispatch(slice.actions.getProcessHomeSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getProcessExecution(processo_id) {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading());
      const usuario = GetSession("@dse-usuario");
      const response = await api.post('processo/getProcessoExecucao', {
        usuario_id: usuario?.id ? usuario.id : null,
        processo_id: processo_id
      });
      dispatch(slice.actions.getProcessSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getProcessGed(projeto_id, categoria_id) {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading());
      const usuario = GetSession("@dse-usuario");
      var data = {
        usuario_id: usuario.id,
        projeto_id,
        categoria_id,
      }
      const response = await api.post('processo/ged', data);
      dispatch(slice.actions.getProcessGedSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function setProcessFavorite(dados, newValue) {
  return async (dispatch) => {
    try {
      const usuario = GetSession("@dse-usuario");
      if (newValue) {
        var data = {
          usuario_id: usuario.id,
          processo_id: dados.pid,
          data: dataAtual()
        }
        await api.post('processo-favoritos', data);
      } else {
        await api.delete('processo-favoritos/' + dados.pid + '/' + usuario.id)
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getProcessInitial(categoria_id) {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading());
      var response = await api.get('processo-cadastro?target[]=categoria_id&target_value[]=' + categoria_id + '&target[]=status&target_value[]=Ativo')
      dispatch(slice.actions.getProcessInitialSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function iniciaProcess(values, categoria_id, projeto_id, processo_id) {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading());
      var obj = {
        data_inicio: dataAtual(),
        status: 'Ativo',
        usuario_id: values.responsavel.id,
        processo_cadastro_id: processo_id,
        empresa_id: 1,
        categoria_id: categoria_id,
        projeto_id: projeto_id,
        descricao: values.descricao,
      }

      if (values.prazo) {
        obj.prazo = values.prazo;
      }

      var passo = await api.get('processo-passo-cadastro?target[]=processo_cadastro_id&target_value[]=' + processo_id + '&target[]=estagio&target_value[]=inicial')
      if (!passo.data[0]) {
        var passo = await api.get('processo-passo-cadastro?target[]=processo_cadastro_id&target_value[]=' + processo_id + '&target[]=estagio&target_value[]=final')
      }
      if (passo.data[0]) {
        obj.processo_passo_cadastro_id = passo.data[0].id
      }

      var response = await api.post('processo', obj)

      var estimativa;

      if (passo.data[0].estimativa) {
        estimativa = getPrazo(passo.data[0].estimativa)
      }

      let responsavel_id
      if(passo.data[0].papel_id === 5){
        const projeto = await api.get('projeto-cadastro?target[]=id&target_value[]=' + projeto_id);
        responsavel_id = projeto.data[0].responsavel_id
      } else if(passo.data[0].papel_id === 0) {
        responsavel_id = values.responsavel.id
      } else {
        responsavel_id = null
      }

      var objPasso = {
        data_modificacao: dataAtual(),
        processo_id: response.data.rows.insertId,
        usuario_id: null,
        processo_passo_cadastro_id: passo.data[0].id,
        responsavel_id: responsavel_id,
        estimativa: estimativa,
        papel_id: passo.data[0].papel_id,
        status_id: passo.data[0].subprocesso == 1 && !passo.data[0].bloqueante ? 2 : 5,
      }

      if (passo.data[0].subprocesso == 1 && passo.data[0].subprocesso_cadastro_id) {
        const subProcesso = await api.post('processo/iniciaSubProcesso', {
          processo_id: response.data.rows.insertId,
          processo_cadastro_id: passo.data[0].subprocesso_cadastro_id,
          responsavel_id: values.responsavel.id
        })
        if (subProcesso) {
          objPasso.subprocesso_id = subProcesso.data.insertId
        }
      }

      var r = await api.post('processo-passo', objPasso)

      await api.put('processo', { id: response.data.rows.insertId, processo_passo_id: r?.data?.rows?.insertId | null })
      if (passo.data[0].subprocesso == 1 && !passo.data[0].bloqueante) {
        await api.post('processo-fluxo-cadastro/avancaProcessoExecucao/', { processo_id: response.data.rows.insertId })
      }

      dispatch(slice.actions.stopLoading());
      return [response.data.rows.insertId, passo.data[0].papel_id];
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getProcessResponsaveis(id) {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading());
      var response = await api.get('processo-passo/responsaveis/' + id)
      dispatch(slice.actions.getProcessResponsaveisSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getProcessAbaProcessos() {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading());
      const usuario = GetSession("@dse-usuario");
      var response = await api.post('processo/processos', { usuario_id: usuario.id, isAdm: usuario.tipo === 'Administrador' })
      dispatch(slice.actions.getProcessAbaProcessosSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function excluiProcessoExecucao(processo_id) {
  return async (dispatch) => {
    try {
      await api.delete('processo/execucao/' + processo_id)
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function setProcessResponsavel(processo_id, responsavel_id) {
  return async (dispatch) => {
    try {
      await api.post('processo/alteraResponsavel', { processo_id, responsavel_id })
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getPapeisDefinePrazoProcesso(processo_id) {
  return async (dispatch) => {
    try {
      var response = await api.get('/define-prazo-processo/processo/' + processo_id)
      return response.data;
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function editProcess(process) {
  return async (dispatch) => {
    try {
      var response = await api.put('processo', process)
      return response.data;
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}