import { createSlice } from '@reduxjs/toolkit';
import { api } from '../../config'
import { GetSession } from '../../session';

const initialState = {
  isLoading: false,
  error: false,
  favoriteProjects: [],
  project: {},
  categories: [],
  grupos: [],
  usuarios: [],
  templates: [],
  permissoesProjeto: [],
};

const slice = createSlice({
  name: 'project',
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

    getFavoritesSuccess(state, action) {
      state.isLoading = false;
      state.favoriteProjects = action.payload;
    },

    getProjectSuccess(state, action) {
      state.isLoading = false;
      state.project = action.payload;
    },

    getCategoriesSuccess(state, action) {
      state.isLoading = false;
      state.categories = action.payload;
    },

    getOptionsFormSuccess(state, action) {
      state.isLoading = false;
      state.grupos = action.payload.grupos;
      state.usuarios = action.payload.usuarios;
      state.templates = action.payload.templates;
    },

    getOptionsFormEditSuccess(state, action) {
      state.isLoading = false;
      state.grupos = action.payload.grupos;
      state.usuarios = action.payload.usuarios;
      state.templates = action.payload.templates;
      state.permissoesProjeto = action.payload.permissoesProjeto;
    },

  }
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getFavorites() {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading());
      const usuario = GetSession("@dse-usuario")
      var data = {
        usuario_id: usuario.id,
        usuario_papel: usuario.papeis
      }
      const response = await api.post('projeto-favoritos/home', data);
      dispatch(slice.actions.getFavoritesSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getProject(id) {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading());
      const response = await api.get('projeto-cadastro?target[]=id&target_value[]=' + id);
      if (response.data.length > 0) {
        dispatch(slice.actions.getProjectSuccess(response.data[0]));
      } else {
        dispatch(slice.actions.getProjectSuccess({}));
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getCategories(id) {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading());
      const response = await api.get('categoria/projeto/' + id)
      dispatch(slice.actions.getCategoriesSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getOptionsForm() {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading());
      const response = await api.get("usuario/optionsForm")
      dispatch(slice.actions.getOptionsFormSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}



// ----------------------------------------------------------------------

export function getOptionsFormEdit(id) {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading());
      const usuario = GetSession("@dse-usuario")
      var options_grupos = [];
      var options_usuarios = [];
      var options_templates = [];
      var permissoes_projeto = await api.get('permissao?target[]=area&target_value[]=acesso_projeto&target[]=area_id&target_value[]=' + id)
      var permissoes_usuario = await api.get('permissao?target[]=area&target_value[]=acesso_projeto&target[]=alvo&target_value[]=Usuario&target[]=area_id&target_value[]=' + id)
      var permissoes_grupo = await api.get('permissao?target[]=area&target_value[]=acesso_projeto&target[]=alvo&target_value[]=Grupo&target[]=area_id&target_value[]=' + id)
      var usuarios = await api.get('usuario-empresa?target[]=empresa_id&target_value[]=' + usuario.empresa_id);
      var grupos = await api.get('grupo?target[]=empresa_id&target_value[]=' + usuario.empresa_id);
      var templates = await api.get('projeto-cadastro/templates');
      var gruposPermissao = [];
      var usuariosPermissao = [];

      for (const p of permissoes_grupo.data) {
        gruposPermissao.push(p.alvo_id);
      }

      for (const grupo of grupos.data) {
        if (gruposPermissao.indexOf(grupo.id) === -1) {
          options_grupos.push({
            nome: grupo.nome, id: grupo.id
          });
        }
      }

      for (const permissao of permissoes_usuario.data) {
        usuariosPermissao.push(permissao.alvo_id);
      }

      for (const u of usuarios.data) {
        if (usuariosPermissao.indexOf(u.usuario_id) === -1) {
          const user = await api.get(`usuario/${u.usuario_id}`);
          options_usuarios.push({
            nome: user.data[0].nome, id: user.data[0].id
          });
        }
      };

      for (const template of templates.data) {
        options_templates.push({ id: template.id, nome: template.nome })
      }

      for (const p of permissoes_projeto.data) {
        var alvo;
        if (p.alvo === 'Grupo') {
          alvo = await api.get('grupo/' + p.alvo_id)
          p.alvo_nome = alvo.data[0].nome
        } else {
          alvo = await api.get('usuario/' + p.alvo_id)
          p.alvo_nome = alvo.data[0].nome
        }
      }

      options_usuarios.sort((a, b) => a.nome.localeCompare(b.nome))

      dispatch(slice.actions.getOptionsFormEditSuccess({ grupos: options_grupos, usuarios: options_usuarios, templates: options_templates, permissoesProjeto: permissoes_projeto.data }));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function deletePermission(id) {
  return async (dispatch) => {
    try {
      await api.delete('permissao/' + id)
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function saveProject(projeto, imagem, values) {
  return async (dispatch) => {
    try {

      if (imagem) { // se foi feito upload de arq seta como imagem do projeto
        await api.put('projeto-cadastro/editaimagem', {
          id: projeto.id,
          nome: imagem.nome,
          base64: { base64: imagem.base64 },
          imgantiga: projeto.imagem,
        })
      }

      await api.put('projeto-cadastro', {
        id: projeto.id,
        nome: values.nome,
        descricao: values.descricao,
        status: values.status,
        prefixo: values.prefixo.toUpperCase(),
        responsavel_id: values.responsavel
      })

      const map = values.alvos.map(async (alvo) => {
        await api.post('permissao', {
          permissao: 'Sim',
          area: 'acesso_projeto',
          area_id: projeto.id,
          alvo: values.alvo,
          alvo_id: alvo.id,
          status: 'Ativo'
        })
      })

      await Promise.all(map)

      await api.post('pasta-documento-nome/editaPrefixo', {
        prefixo: values.prefixo.toUpperCase(),
        projeto_id: projeto.id
      })

    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

