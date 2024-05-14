import { createSlice } from '@reduxjs/toolkit';
import { api } from '../../config'
import { notification } from '../../components/notification/notiflix'

const initialState = {
  isLoading: false,
  error: false,
  archives: [],
};

const slice = createSlice({
  name: 'archives',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    getArchivesSuccess(state, action) {
      state.isLoading = false;
      state.archives = action.payload;
    },

    setArchives(state, action) {
      state.archives = action.payload;
    }
  }
});

// Reducer
export default slice.reducer;
export const { setArchives } = slice.actions;

// ----------------------------------------------------------------------

export function getArchives(status, idPastaPai) {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading());
      var where = ''
      const statusSelected = (status === 0 && 'Ativo') ||
        (status === 1 && 'Inativo') ||
        (status === 2 && null);

      if (status !== 2) {
        where = '&target[]=status&target_value[]=' + statusSelected
      }

      var response = await api.get('projeto-documento?' + where + '&target[]=projeto_diretorio_id&target_value[]=' + idPastaPai)
      dispatch(slice.actions.getArchivesSuccess(response.data));

    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getURLArchive(id) {
  return async () => {
      try {
          var response = await api.post('projeto-documento/urlArquivo',{id})
          return response.data;
      } catch (error) {
        return error;
      }
  };
}

// ----------------------------------------------------------------------

export function editAttributesArchive(projeto_documento_id, pasta_id, values) {
  return async (dispatch) => {
    try {
      var response = await api.delete('projeto-documento-atributo/' + projeto_documento_id);

      const map = Object.keys(values).map(async (id) => {
        if (id !== 'archive' && id !== 'categories' && id !== "categoria_id" && values[id] !== '') {
          await api.post('projeto-documento-atributo', {
            projeto_documento_id: projeto_documento_id,
            projeto_diretorio_id: pasta_id,
            valor: values[id] ? values[id] : '',
            pasta_atributo_id: id
          })
        }
      })

      await Promise.all(map)

      var response = await api.post("projeto-documento/rnarq/" + projeto_documento_id);
      // await api.post("projeto-documento/rnarqs/" + pasta_id);

      return response

    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function renameArchive(data) {
  return async (dispatch) => {
    try {
      await api.post('projeto-documento/renomeia', data);
      notification('success', 'Documento Renomeado!')
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function inativeArchive(id) {
  return async (dispatch) => {
    try {
      await api.delete('projeto-documento/' + id)
      notification('success', 'Documento Inativado!')
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function ativeArchive(id) {
  return async (dispatch) => {
    try {
      await api.put('projeto-documento/query', {
        id: id,
        status: 'Ativo'
      })
      notification('success', 'Documento Ativado!')
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function deleteArchive(id) {
  return async (dispatch) => {
    try {
      var result = await api.delete('projeto-documento/permanente/' + id);
      notification('success', 'Documento Excluído!')
      return result
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function deleteArchiveProcess(id_arquivo, processo_campo_cadastro_id) {
  return async (dispatch) => {
    try {
      // if(!ged){ // somente exclui o arquivo se ele nao foi um arquivo selecionado do
      await api.delete('projeto-documento/permanente/' + id_arquivo);
      // }
      var result = await api.delete('processo-campos/deleteArquive/' + processo_campo_cadastro_id);
      return result
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getArchiveGoogle(url) {
  return async (dispatch) => {
    try {
      var result = await api.post('processo-arquivo/getArquivoGoogle', { url });
      return result
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}