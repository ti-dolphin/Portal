import { createSlice } from '@reduxjs/toolkit';
import { api } from '../../config'
import { GetSession } from '../../session';


const initialState = {
  postsMural: [],
  postsFeed: { posts: [], next: true },
  usersOptions: [],
  cumunityOptions: [],
  projectOptions: [],
  index: 1,
  postDetails: null,
};

const slice = createSlice({
  name: 'post',
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

    resetIndex(state) {
      state.index = 1;
    },

    getPostsFeedSuccess(state, action) {
      state.isLoading = false;
      state.postsFeed = action.payload;
    },

    getMorePostsFeedSuccess(state, action) {
      if (action.payload.next) {
        state.index = state.index + 1
      }
      state.isLoading = false;
      state.postsFeed = action.payload;
    },

    getPostsMuralSuccess(state, action) {
      state.isLoading = false;
      state.postsMural = action.payload;
    },

    getFiltersSuccess(state, action) {
      state.isLoading = false;
      state.usersOptions = action.payload.usuarios;
      state.cumunityOptions = action.payload.grupos;
      state.projectOptions = action.payload.projetos;
    },

    getPostDetailsSuccess(state, action) {
      state.isLoading = false;
      state.postDetails = action.payload;
    }

  }
});

// Reducer
export default slice.reducer;
export const { resetIndex } = slice.actions;

// ----------------------------------------------------------------------

export function getPostsMural() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      var mural = await api.get('post/mural')
      dispatch(slice.actions.getPostsMuralSuccess(mural.data));
      return true
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function updatePost(body) {
  return async (dispatch) => {
    try {
      await api.put('post/', body)
      return true
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getPostsFeed(filters) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      var feed = await api.post('post/feed', filters)
      dispatch(slice.actions.getPostsFeedSuccess(feed.data));
      return true
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getMorePostsFeed(filters) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      var feed = await api.post('post/feed', filters)
      dispatch(slice.actions.getMorePostsFeedSuccess(feed.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function removeFromPostWall(id) {
  return async (dispatch) => {
    try {
      await api.post('post/removeMural', { id })
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getFilters() {
  return async (dispatch) => {
    try {
      const usuario = GetSession("@dse-usuario");
      var options = await api.get('post/filtersByUser/' + usuario.id)
      options.data.grupos.unshift({ value: 0, label: 'Geral' })
      await dispatch(slice.actions.getFiltersSuccess(options.data))
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function newPost(post) {
  return async (dispatch) => {
    try {
      const map = post.arquivos.map(async (arquivo) => {
        arquivo.base64 = await readFile(arquivo)
      })

      await Promise.all(map)

      var response = await api.post('post/', post)
      dispatch(slice.actions.startLoading());
      return response.data.rows
    } catch (error) {
      dispatch(slice.actions.hasError(error));
      return false
    }
  };
}

function readFile(file) { // retorna o base64 do arquivo

  return new Promise(function (resolve, reject) {
    try {
      let reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = async (e) => {
        resolve(e.target.result)
      }

    } catch (error) {
      reject(error)
    }

  });
}

export function likePost(postLike) {
  return async (dispatch) => {
    try {
      await api.post('post-like/', postLike)
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function removeLikePost(postLike) {
  return async (dispatch) => {
    try {
      await api.delete('post-like/' + postLike.post_id + '/' + postLike.usuario_id)
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function deletePost(postId) {
  return async (dispatch) => {
    try {
      await api.put('post/', { id: postId, status: 'Inativo' })
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function commentPost(post_id, conteudo, comentario_pai) {
  return async (dispatch) => {
    try {
      const usuario = GetSession("@dse-usuario");
      await api.post('post-comentario/',
        {
          post_id,
          usuario_id: usuario.id,
          conteudo,
          comentario_pai: comentario_pai ? comentario_pai : 0,
          status: 'Ativo'
        })
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function removeCommentPost(comment_id) {
  return async (dispatch) => {
    try {
      await api.put('post-comentario/', { id: comment_id, status: 'Inativo' })
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getPostDetails(postId) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      var detalhes = await api.get('post/detalhes/' + postId)
      detalhes.data[0].arquivos.sort((a, b) => {
        if ((b.titulo.toLowerCase().includes('.webp') || b.titulo.toLowerCase().includes('.jfif') || b.titulo.toLowerCase().includes('.png') || b.titulo.toLowerCase().includes('.jpg') || b.titulo.toLowerCase().includes('.jpeg') || b.titulo.toLowerCase().includes('.mp4') || b.titulo.toLowerCase().includes('.webm') || b.titulo.toLowerCase().includes('.ogg')) && (!a.titulo.toLowerCase().includes('.png') && !a.titulo.toLowerCase().includes('.jpg') && !a.titulo.toLowerCase().includes('.jpeg') && !a.titulo.toLowerCase().includes('.mp4') && !a.titulo.toLowerCase().includes('.webm') && !a.titulo.toLowerCase().includes('.ogg'))) {
          return 1;
        }
        if ((a.titulo.toLowerCase().includes('.webp') || a.titulo.toLowerCase().includes('.jfif') || a.titulo.toLowerCase().includes('.png') || a.titulo.toLowerCase().includes('.jpg') || a.titulo.toLowerCase().includes('.jpeg') || a.titulo.toLowerCase().includes('.mp4') || a.titulo.toLowerCase().includes('.webm') || a.titulo.toLowerCase().includes('.ogg')) && (!b.titulo.toLowerCase().includes('.png') && !b.titulo.toLowerCase().includes('.jpg') && !b.titulo.toLowerCase().includes('.jpeg') && !b.titulo.toLowerCase().includes('.mp4') && !b.titulo.toLowerCase().includes('.webm') && !b.titulo.toLowerCase().includes('.ogg'))) {
          return -1;
        }
        // a must be equal to b
        return 0;
      })
      dispatch(slice.actions.getPostDetailsSuccess(detalhes.data[0]));
      return true
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}