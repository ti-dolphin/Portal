import { createSlice } from '@reduxjs/toolkit';
import { api } from '../../config'
import { dataAtual } from '../../utils/utils';
import { GetSession } from '../../session';
import { notification } from '../../components/notification/notiflix'

const initialState = {
  isLoading: false,
  error: false,
  archives: [],
  passosProcesso: [],
  passoComents: [],
  passo: {},
  flagPassosAntigos: false,
  passosErroCondicao: []
};

const slice = createSlice({
  name: 'step',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    stopLoading(state) {
      state.isLoading = false;
    },
    setFlagPassosAntigos(state, action) {
      state.flagPassosAntigos = action.payload;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getArchivesSuccess(state, action) {
      state.isLoading = false;
      state.archives = action.payload;
    },

    getPassosProcessSuccess(state, action) {
      state.isLoading = false;
      state.passosProcesso = action.payload;
    },

    getPassoComentsSuccess(state, action) {
      state.isLoading = false;
      state.passoComents = action.payload;
    },

    getPassoSuccess(state, action) {
      state.isLoading = false;
      state.passo = action.payload;
    },

    getPassosErroCondicaoSuccess(state, action) {
      state.isLoading = false;
      state.passosErroCondicao = action.payload;
    }

  }
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function updateResponsavel(data) {
  return async (dispatch) => {
    try {
      const response = await api.put('processo-passo', data);
      if (response) {
        notification('success', 'Responsável Alterado!')
        return true;
      } else {
        notification('error', 'Erro ao alterar!')
        return false;
      }
    } catch (error) {
      notification('error', 'Erro ao alterar!')
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getPassosProcess(id, flagPassosAntigos) {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading());
      const response = await api.get('processo-passo/passos/' + id + "/" + flagPassosAntigos);
      dispatch(slice.actions.getPassosProcessSuccess(response.data));
    } catch (error) {
      notification('error', 'Erro ao alterar!')
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getPassoComents(id) {
  return async (dispatch) => {
    try {
      // dispatch(slice.actions.startLoading());
      const response = await api.get('processo-passo-comentarios/' + id);
      dispatch(slice.actions.getPassoComentsSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function sendPassoComent(data) {
  return async (dispatch) => {
    try {
      await api.post('processo-passo-comentarios', data);
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function editPassoComent(data) {
  return async (dispatch) => {
    try {
      await api.put('processo-passo-comentarios', data);
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function deletePassoComent(id) {
  return async (dispatch) => {
    try {
      await api.delete('processo-passo-comentarios/' + id);
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getPasso(id, processoId) {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading());
      const response = await api.get('processo-passo/passo/' + id + '/' + processoId);
      dispatch(slice.actions.getPassoSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function insertFile(data){
  return async (dispatch) => {
    try {
      const response = await api.post('processo-execucao/envia-arquivo', data);
      return response;
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };

}

export function saveFields(data){
  return async (dispatch) => {
    try {
      const response = await api.post('processo-execucao/save-fields', data);
      return response;
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getFileAttributes(arquivo, process) {
  return async (dispatch) => {
    try {
      const data = {
        arquivo: arquivo,
        process: process
      };
      const response = await api.post('processo-execucao/obtem-atributos', data);
      return response.data;
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------
export function insertCampoArquivo(arquivo_id, campo, ged) {
  return async (dispatch) => {
    try {
      var arquivo = await api.get('projeto-documento/' + arquivo_id)
      const response = await api.post('processo-campos', campo);

      if (arquivo.data.length > 0) {
        await api.post('processo-arquivo', {
          id_arquivo: arquivo.data[0].id,
          campo_id: response.data.rows.insertId,
          url_arquivo: arquivo.data[0].url,
          ged,
        })
      }

      return true
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function salvaCampos(campos, id, processo_id) {
  return async (dispatch) => {
    try {
      await api.delete('processo-campos/' + id);

      const map = Object.keys(campos).map(async (chave) => {
        if (campos[chave] && campos[chave] !== '') {
          await api.post('processo-campos', {
            valor: campos[chave],
            processo_passo_id: id,
            processo_campo_cadastro_id: parseInt(chave)
          })
        }
      })

      await Promise.all(map)

      await api.post('processo/setaTituloProcesso', {
        id: processo_id
      })

    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function atualizaStatus(id, status_id, mensagem) {
  return async (dispatch) => {
    try {
      const usuario = GetSession("@dse-usuario");
      await api.put('processo-passo', {
        id,
        status_id,
        usuario_id: status_id !== 1 ? null : usuario?.id ? usuario.id : null,
        data_conclusao: status_id === 1 ? dataAtual() : null,
        data_modificacao: dataAtual(),
        aguardando_mensagem: mensagem ? mensagem : '',
      })
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getSimplePasso(id) {
  return async (dispatch) => {
    try {
      const response = await api.get('processo-passo/' + id);
      if (response.data && response.data.length > 0) {
        return response.data[0]
      } else {
        return null
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function goToNextPasso(processo_id, tarefa_id, papel_id) {
  return async (dispatch) => {
    try {
      var processo = await api.get('processo/' + processo_id);
      if (processo.data.length > 0) {
        if (processo.data[0].processo_passo_id === tarefa_id) { // somente avança o processo se a tarefa preenchida for a tarefa atual
          var result = await api.post('processo-fluxo-cadastro/avancaProcessoExecucao/', { processo_id })

          if (result.data.rows) {
            if (result.data.rows === 'Nenhuma condição foi cumprida') {
              notification('warning', 'Nenhuma condição para dar seguimento ao processo foi cumprida.')
            }
            if (result.data.rows === 'fim') {
              notification('success', 'Processo finalizado.')
              return 'fim'
            } else {
              var r = await api.get('processo-passo/passo_atual/' + processo_id)

              if (r.data) {
                notification('success', 'Tarefa concluída com sucesso.')
                return r.data
              } else {
                notification('error', 'Erro ao dar segmento ao processo, favor tente novamente.')
                await api.get('processo/verificaProcessos/')
                return null
              }
            }
          } else {
            notification('error', 'Erro ao dar segmento ao processo, favor tente novamente.')
            await api.get('processo/verificaProcessos/')
            return null
          }
        } else {
          notification('success', 'Tarefa concluída com sucesso.')
          return true
        }
      } else {
        notification('error', 'Erro ao dar segmento ao processo, favor tente novamente.')
        return null
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function verifyPermission(tarefa_id) {
  return async (dispatch) => {
    try {
      const usuario = GetSession("@dse-usuario");
      const passo = await dispatch(getSimplePasso(tarefa_id))
      if (usuario.tipo !== "Administrador" && passo && !passo.data_conclusao) { // se existir data_conclusao então o passo foi finalizado, logo todos podem visualizar
        if (passo.papel_id == 6 || usuario.papeis.indexOf(passo.papel_id) !== -1 || usuario.id === passo.responsavel_id) { // status_id 3 está em aguardando deixa visualizar, papel_id 6 é o externo que todos podem visualizar
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  }
}

export function getPassoExterno(processoId) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await api.get('processo-passo/passoExterno/' + processoId);
      dispatch(slice.actions.getPassoSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function StartLoading() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
  }
}

export function StopLoading() {
  return async (dispatch) => {
    dispatch(slice.actions.stopLoading());
  }
}

export function SetFlagPassosAntigos(value) {
  return async (dispatch) => {
    dispatch(slice.actions.setFlagPassosAntigos(value));
  }
}

export function getPassosErroCondicao(processoId) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await api.get('processo-passo/errocondicao/' + processoId);
      dispatch(slice.actions.getPassosErroCondicaoSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function continuaProcesso(data) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await api.post('processo/continuaProcesso', data);
      return response
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}