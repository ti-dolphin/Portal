import { createSlice } from '@reduxjs/toolkit';
import { api } from '../../config'
import { GetSession } from '../../session';
import { notification } from '../../components/notification/notiflix'
import * as Helpers from "../../components/convertImageToPdf/helpers";
import { dispatch } from '../store';

const initialState = {
  isLoading: false,
  error: false,
  pastes: [],
  pastePath: [],
  categories: [],
  allCategories: [],
  pasteAttributes: [],
  parameters: [],
  items: [],
  grupos: [],
  usuarios: [],
  permissoesPasta: [],
  folderTree: [],
  responsibles: [],
};

const slice = createSlice({
  name: 'paste',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },

    stopLoading(state) {
      state.isLoading = false;
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    getPastesSuccess(state, action) {
      state.isLoading = false;
      state.pastes = action.payload;
    },

    getPastePathSuccess(state, action) {
      state.isLoading = false;
      state.pastePath = action.payload;
    },

    getPasteAttributesSuccess(state, action) {
      state.isLoading = false;
      state.pasteAttributes = action.payload;
    },

    getCategorieSuccess(state, action) {
      state.isLoading = false;
      state.categories = action.payload;
    },

    getAllCategorieSuccess(state, action) {
      state.isLoading = false;
      state.allCategories = action.payload;
    },

    setPastePath(state, action) {
      state.pastePath = action.payload;
    },

    getParametersSuccess(state, action) {
      state.isLoading = false;
      state.parameters = action.payload;
    },

    getItemsSuccess(state, action) {
      state.isLoading = false;
      state.items = action.payload;
    },

    getOptionsFormSuccess(state, action) {
      state.isLoading = false;
      state.grupos = action.payload.grupos;
      state.usuarios = action.payload.usuarios;
      state.permissoesPasta = action.payload.permissoesPasta;
    },

    getPermissionSuccess(state, action) {
      state.isLoading = false;
      state.permissoesPasta = action.payload;
    },

    getFolderTreeSuccess(state, action) {
      state.isLoading = false;
      state.folderTree = action.payload;
    },

    getResponsiblesSuccess(state, action) {
      state.isLoading = false;
      state.responsibles = action.payload;
    },

  }
});

// Reducer
export default slice.reducer;
export const { setPastePath } = slice.actions;

// ----------------------------------------------------------------------

export function getPastes(idCategoria, idProjeto, status, idPastaPai) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      var data = {
        categoria_id: idCategoria,
        status: (status === 0 && 'Ativo') ||
          (status === 1 && 'Inativo') ||
          (status === 2 && null),
        pai_id: idPastaPai,
        projeto_id: idProjeto,
      }
      const response = await api.post('projeto-pasta/getPastasGed', data);
      dispatch(slice.actions.getPastesSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getPastePath(id) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await api.get('projeto-pasta/caminho/' + id);
      dispatch(slice.actions.getPastePathSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function insertPaste(pai_id, nome, projeto_id, categoria_id, herda_conf_nome) {
  return async (dispatch) => {
    try {
      var response = await api.post('projeto-pasta/cadastraPasta', {
        pai_id: pai_id,
        nome: nome.toUpperCase(),
        projeto_id: projeto_id,
        categoria_id: categoria_id,
        herda_conf_nome: herda_conf_nome
      })
      if (response.data.message === true) {
        notification('success', 'Pasta cadastrada com sucesso!')
      }
      return response
    } catch (error) {
      console.log(error)
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function updatePaste(folder) {
  return async (dispatch) => {
    try {
      var response = await api.put('projeto-pasta', folder)
      notification('success', 'Pasta editada com sucesso!')
      return response
    } catch (error) {
      console.log(error)
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getPasteAtrributes(id) {
  return async (dispatch) => {
    try {
      var response = await api.get('pasta-atributo/categoria/' + id)
      dispatch(slice.actions.getPasteAttributesSuccess(response.data))
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getPasteAttributesWithCategory(pasta_id, categoria_id, arquivo_id = null, flag_filha = false) {
  return async (dispatch) => {
    try {
      var response = await api.post('pasta-atributo/atributosComCategoria', {
        pasta_id, categoria_id, arquivo_id, flag_filha
      })
      return response.data
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getAttributeWithValues(pasta_id, categoria_id, arquivo_id = null, flag_filha = false) {
  return async (dispatch) => {
    try {
      var response = await api.post('pasta-atributo/atributosComValores', {pasta_id, categoria_id, arquivo_id, flag_filha})
      return response.data
    } catch (error) {
      dispatch(slice.actions.hasError(error))
    }
  }
}

// ----------------------------------------------------------------------

export function setPasteAtrributes(PasteAtrributes) {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.getPasteAttributesSuccess(PasteAtrributes))
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getCategories(onlyAtivo) {
  return async (dispatch) => {
    try {
      if (onlyAtivo) {
        var response = await api.get('categoria-atributo?target[]=status&target_value[]=Ativo')
      } else {
        var response = await api.get('categoria-atributo')
      }

      dispatch(slice.actions.getCategorieSuccess(response.data))
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getAllCategories() {
  return async (dispatch) => {
    try {
      var options = [];
      var response = await api.get('categoria')
      response.data.map((r) => {
        options.push({ nome: r.nome, id: r.id })
      })
      dispatch(slice.actions.getAllCategorieSuccess(options))
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getCategoriesWithResponsibles() {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading());
      const response = await api.get('categoria/getCategoriesWithResponsibles')
      dispatch(slice.actions.getCategorieSuccess(response.data.sort((a, b) => {
        const categoriaA = a.categoria.toUpperCase();
        const categoriaB = b.categoria.toUpperCase();
    
        if (categoriaA < categoriaB) {
            return -1;
        }
        if (categoriaA > categoriaB) {
            return 1;
        }
        return 0;
    })))
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function insertPasteAtrribute(attribute) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      var mask
      if (attribute.tipo === 'Texto' || attribute.tipo === 'Número' || attribute.tipo === 'Data') {
        mask = false
      } else {
        mask = true
      }

      var response = await api.post('pasta-atributo', {
        alvo: "projeto_pasta",
        alvo_id: attribute.pasta_id,
        atributo: attribute.nome.toUpperCase(),
        status: "Ativo",
        tipo: !mask ? attribute.tipo : null,
        mask: mask ? attribute.tipo : null,
        isnull: attribute.preenchimento === "Obrigatório" ? "Nao" : "Sim",
        flag_filha: attribute.aplicar_filhas === 'Sim' ? 1 : 0
      })

      if (attribute.categoria && attribute.categoria != '') {
        await api.post('categoria-tem-atributo', {
          categoria_id: attribute.categoria,
          atributo_id: response.data.rows.insertId,
          pasta_id: attribute.pasta_id,
          projeto_id: attribute.projeto_id
        })
      }

      if (attribute.tipo === 'Seleção' && attribute.configSelect && attribute.configSelect.length > 0) {
        await api.post('pasta-atributo-opcao-select', {
          atributo_id: response.data.rows.insertId,
          pasta_id: attribute.pasta_id,
          configSelect: attribute.configSelect
        })
      }

      dispatch(slice.actions.stopLoading());
      notification('success', 'Atributo cadastrado com sucesso!')
      return response
    } catch (error) {
      console.log(error)
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function updatePasteAtrribute(attribute) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      var mask
      if (attribute.tipo === 'Texto' || attribute.tipo === 'Número' || attribute.tipo === 'Data') {
        mask = false
      } else {
        mask = true
      }

      var response = await api.put('pasta-atributo', {
        id: attribute.id,
        atributo: attribute.nome.toUpperCase(),
        tipo: !mask ? attribute.tipo : null,
        mask: mask ? attribute.tipo : null,
        isnull: attribute.preenchimento === "Obrigatório" ? "Nao" : "Sim",
        flag_filha: attribute.aplicar_filhas === 'Sim' ? 1 : 0
      })

      await api.delete('categoria-tem-atributo/' + attribute.id)

      if (attribute.categoria && attribute.categoria != '') {
        await api.post('categoria-tem-atributo', {
          categoria_id: attribute.categoria,
          atributo_id: attribute.id,
          pasta_id: attribute.pasta_id,
          projeto_id: attribute.projeto_id
        })
      }

      if (attribute.tipo === 'Seleção' && attribute.configSelect && attribute.configSelect.length > 0) {
        await api.post('pasta-atributo-opcao-select', {
          atributo_id: attribute.id,
          pasta_id: attribute.pasta_id,
          configSelect: attribute.configSelect
        })
      }

      dispatch(slice.actions.stopLoading());
      notification('success', 'Atributo editado com sucesso!')
      return response
    } catch (error) {
      console.log(error)
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function inativePasteAtrribute(id) {
  return async (dispatch) => {
    try {
      var response = await api.put('pasta-atributo', {
        id: id,
        status: 'Inativo'
      })
      notification('success', 'Atributo excluido com sucesso!')
      return response
    } catch (error) {
      console.log(error)
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getParameters() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      var response = await api.get('pasta-documento-nome-tipo')
      dispatch(slice.actions.getParametersSuccess(response.data));
    } catch (error) {
      console.log(error)
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getItems(id) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      var response = await api.get('pasta-documento-nome/itens/' + id)
      dispatch(slice.actions.getItemsSuccess(response.data));
    } catch (error) {
      console.log(error)
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function setItems(itens, id) {
  return async (dispatch) => {
    try {
      await api.post('pasta-documento-nome/cadastro', itens);
      await api.post('projeto-documento/rnarqs/' + id);
    } catch (error) {
      console.log(error)
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getOptionsForm(id) {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading());
      const usuario = GetSession("@dse-usuario");
      var options_grupos = [];
      var options_usuarios = [];
      var permissoes_usuario = await api.get('permissao?target[]=area&target_value[]=projeto_pasta&target[]=alvo&target_value[]=Usuario&target[]=area_id&target_value[]=' + id)
      var permissoes_grupo = await api.get('permissao?target[]=area&target_value[]=projeto_pasta&target[]=alvo&target_value[]=Grupo&target[]=area_id&target_value[]=' + id)
      var permissoes_pasta = await api.get('permissao?target[]=area&target_value[]=projeto_pasta&target[]=area_id&target_value[]=' + id)
      var usuarios = await api.get('usuario-empresa?target[]=empresa_id&target_value[]=' + usuario.empresa_id);
      var grupos = await api.get('grupo?target[]=empresa_id&target_value[]=' + usuario.empresa_id);


      var gruposPermissao = []

      permissoes_grupo.data.map((p) => {
        gruposPermissao.push(p.alvo_id)
      })

      const map = grupos.data.map((grupo) => {
        if (gruposPermissao.indexOf(grupo.id) === -1) {
          options_grupos.push({
            nome: grupo.nome, id: grupo.id
          })
        }
      })

      var usuariosPermissao = []

      permissoes_usuario.data.map((p) => {
        usuariosPermissao.push(p.alvo_id)
      })

      const map1 = usuarios.data.map(async (u) => {
        if (usuariosPermissao.indexOf(u.usuario_id) === -1) {
          var user = await api.get('usuario/' + u.usuario_id);
          if (user.data[0].tipo == 'Geral') {
            options_usuarios.push({
              nome: user.data[0].nome, id: user.data[0].id
            })
          }
        }
      })

      const map2 = permissoes_pasta.data.map(async (p) => {

        if (p.alvo == 'Grupo') {
          var al = await api.get('grupo/' + p.alvo_id)
          var alvo_nome = al.data[0].nome
        } else {
          var al = await api.get('usuario/' + p.alvo_id)
          var alvo_nome = al.data[0].nome
        }

        p.alvo_nome = alvo_nome
      })


      await Promise.all(map);
      await Promise.all(map1);
      await Promise.all(map2)


      dispatch(slice.actions.getOptionsFormSuccess({ grupos: options_grupos, usuarios: options_usuarios, permissoesPasta: permissoes_pasta.data }));
    } catch (error) {
      console.log(error)
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

export function getCategoriesAtributtesPaste(paste_id) {
  return async (dispatch) => {
    try {
      var response = await api.get('categoria-atributo/categoriasAtributosPasta/' + paste_id)
      response.data.unshift({ categoria_id: 0, categoria: "Sem tipo" })
      dispatch(slice.actions.getCategorieSuccess(response.data))
    } catch (error) {
      console.log(error)
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------
export async function getFileAndName(values, imgToPdf){
  let base64;
  var file;
  var fileName;

  if (values.archive[0].ged) {
    fileName = values.archive[0].path.replaceAll("'", "")
  } else {
    file = values.archive[0]
    fileName = file.path.replaceAll("'", "")
    if (imgToPdf) {
      base64 = await converteImagemPDF(values.archive)
      if (base64) {
        var array = fileName.split('.')
        array.pop()
        fileName = array.join('') + '.pdf'
      } else {
        base64 = await readFile(file)
      }
    } else {
      base64 = await readFile(file)
    }
  }
  return { base64, fileName }
}
// ----------------------------------------------------------------------
export function insertArchivePaste(pasta_id, projeto_id, values, status = null, not = true, atributes = null, imgToPdf = null, substituiArquivo = false) {
  return async (dispatch) => {
    try {

      let base64;
      var file;
      var nome
      let map

      if (values.archive[0].ged) {
        base64 = await getBase64FromUrl(values.archive[0].url)
        nome = values.archive[0].path.replaceAll("'", "")
      } else {
        file = values.archive[0]
        nome = file.path.replaceAll("'", "")
        if (imgToPdf) {
          base64 = await converteImagemPDF(values.archive)
          if (base64) {
            var array = nome.split('.')
            array.pop()
            nome = array.join('') + '.pdf'
          } else {
            base64 = await readFile(file)
          }
        } else {
          base64 = await readFile(file)
        }
      }

      var resultArchive = await api.post('projeto-documento', {
        projeto_diretorio_id: pasta_id,
        projeto_id: projeto_id,
        titulo: nome,
        doc: base64, // base64 do arquivo
        template: "Sim",
        status: status ? 'Inativo' : 'Ativo',
        categoria_id: values.categoria_id ? values.categoria_id : null
      })

      if (atributes) {
        map = Object.keys(values).map(async (id, index) => {
          if (id !== 'archive' && id !== 'categories' && id !== "categoria_id" && id !== 'pastaFilha' && values[id] !== '') {
            const mapAtributes = atributes.map(async (atr) => {
              if (atr.atributo == id || atr?.atributo_id == id) {
                await api.post('projeto-documento-atributo', {
                  projeto_documento_id: resultArchive.data.rows.insertId,
                  projeto_diretorio_id: pasta_id,
                  valor: values[id] ? values[id] : '',
                  pasta_atributo_id: atr.atributo_id ? atr.atributo_id : atr.id
                })
              }
            })

            await Promise.all(mapAtributes)
          }
        })


      } else {
        map = Object.keys(values).map(async (id) => {
          if (id !== 'archive' && id !== 'categories' && id !== "categoria_id" && id !== 'pastaFilha' && values[id] !== '') {
            await api.post('projeto-documento-atributo', {
              projeto_documento_id: resultArchive.data.rows.insertId,
              projeto_diretorio_id: pasta_id,
              valor: values[id] ? values[id] : '',
              pasta_atributo_id: id
            })
          }
        })

      }

      await Promise.all(map)
      await api.post("projeto-documento/rnarq/" + resultArchive.data.rows.insertId + "/" + substituiArquivo)
      //.then(async () => {
      // api.post("projeto-documento/rnarqs/"+pasta_id);
      //})
      if (not) {
        notification("success", "Arquivo inserido com sucesso")
      }
      return resultArchive.data.rows.insertId

    } catch (error) {
      console.log(error)
      dispatch(slice.actions.hasError(error));
    }
  };
}
function readFile(file) {
  return new Promise(function (resolve, reject) {
    try {
      if (file.url && file.url.trim() !== '') {
        resolve(file.url);
      } else {
        if (file instanceof Blob) {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target.result);
          };
          reader.onerror = (error) => {
            reject(error);
          };
          reader.readAsDataURL(file);
        } else {
          reject(new Error('O parâmetro fornecido não é um Blob.'));
        }
      }
    } catch (error) {
      reject(error);
    }
  });
}



const getBase64FromUrl = async (url) => {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    }
  });
}

const converteImagemPDF = async (file) => {
  return new Promise((resolve) => {
    const fileToImagePromises = Helpers.fileToImageURLArray(file)
    fileToImagePromises.then(async (image) => {
      if (image.length > 0) {
        var e = await Helpers.generatePdfFromImages(image)
        resolve(e.target.result)
      } else {
        resolve(false)
      }
    }).catch((error) => {
      console.log(error)
    })
  });
}

export function createCategorie(categorie) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      await api.post('categoria-atributo', categorie)
      dispatch(slice.actions.stopLoading());
      notification("success", "Categoria criada com sucesso!")
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function updateCategorie(data) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      await api.put('categoria-atributo', data)
      dispatch(slice.actions.stopLoading());
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function insertPermissionPaste(values) {
  return async (dispatch) => {
    try {
      var response = await api.post('permissao/paste', values)
      notification('success', 'Permissão cadastrada com sucesso!')
      return response
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function moveFolder(pasta_id, categoria_id) {
  return async (dispatch) => {
    try {
      var response = await api.post('projeto-pasta/movePasta', { pasta_id, categoria_id })
      if (response.data) {
        notification('success', 'Pasta movida com sucesso!')
      } else {
        notification('warning', 'A pasta já se encontra na categoria selecionada.')
      }
      return response
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getPermissionPaste(pasta_id) {
  return async (dispatch) => {
    try {
      var response = await api.get('permissao?target[]=area&target_value[]=projeto_pasta&target[]=area_id&target_value[]=' + pasta_id)
      dispatch(slice.actions.getPermissionSuccess(response.data))
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getFolderTree(id_folder, id_projeto, id_projeto_processo) {
  return async (dispatch) => {
    // dispatch(slice.actions.startLoading());
    try {
      var response = await api.post('projeto-pasta/arvoreFilhosArquivos/', {
        id_folder, id_projeto, id_projeto_processo
      })
      return response.data
      // dispatch(slice.actions.getFolderTreeSuccess(response.data))
    } catch (error) {
      console.log(error)
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getPastasFilhas(id) {
  return async (dispatch) => {
    try {
      var response = await api.get("projeto-pasta/selectfilhos/" + id);
      return response.data;
    } catch (error) {
      console.log(error)
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getIdPastaByIdArquivo(id) {
  return async (dispatch) => {
    try {
      var response = await api.get("projeto-documento/idPastaArquivo/" + id);
      return response.data[0].pasta_id;
    } catch (error) {
      console.log(error)
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function newFolderByField(valores, campos, pai_id, projeto_id, categoria_id, field_id, processo_id) {
  return async (dispatch) => {
    try {
      var nome = await api.get('processo-campos/valorCampo/' + field_id + '/' + processo_id);

      let nomePasta = "";

      if (nome.data) {
        nomePasta = nome.data[0].valor.toUpperCase()
      } else {
        campos.map((c) => {
          if (c.id_cadastro == field_id) {
            if (c.campo_copia) {
              nomePasta = c.nome
            } else{
              nomePasta = valores[field_id] ?? ''
            }
          }
        })

      }

      var response = await api.post('projeto-pasta/cadastraPasta', {
        pai_id,
        nome: nomePasta,
        projeto_id,
        categoria_id,
        herda_conf_nome: 1
      })

      if (response.data.message === 'Nome de pasta já existente neste diretório, favor tente novamente.') {
        response = await api.post('projeto-pasta/selectIdByNome', { nome: nomePasta.toUpperCase(), pai_id })
        return [response.data[0].id, true]
      } else {
        return [response.data.fields, false]
      }
    } catch (error) {
      console.log(error)
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getPastaTemplate(data) {
  return async (dispatch) => {
    try {
      var response = await api.post("projeto-cadastro/projetoTemplate/", {
        "projeto_processo": data.projeto_processo,
        "projeto_id": data.projeto_id,
        "projeto_pasta_id": data.projeto_pasta_id
      });
      if (response.data) {
        return response.data.pasta_id
      } else {
        return false
      }
    } catch (error) {
      console.log(error)
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function addResponsibleCategoriePaste(data) {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading())
     const response = await api.post("categoria-atributo/add-responsibles", data)
      dispatch(slice.actions.getResponsiblesSuccess(response.data))
    } catch (error) {
      console.log(error)
      dispatch(slice.actions.hasError(error))
    }
  }
}

export function removeResponsiblesCategoriePaste(data) {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading())
      const response = await api.post("categoria-atributo/remove-all-responsibles", data)
      return response
    } catch (error) {
      console.log(error)
      dispatch(slice.actions.hasError(error))
    }
  }
}