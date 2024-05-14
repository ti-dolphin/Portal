import { createSlice } from '@reduxjs/toolkit';
import { api } from '../../config'
import { SetSession } from '../../session';

const initialState = {
    isLoading: false,
    error: false,
    users: [],
    usersObservadoresCadastro: [],
    usersObservadoresExecucao: [],
    usersByPapel: [],
    codigoSenha: undefined
};

const slice = createSlice({
    name: 'users',
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

        getUsersSuccess(state, action) {
            state.isLoading = false;
            state.users = action.payload;
        },

        getUsersObservadoresCadastroSuccess(state, action) {
            state.isLoading = false;
            state.usersObservadoresCadastro = action.payload;
        },

        getUsersObservadoresExecucaoSuccess(state, action) {
            state.isLoading = false;
            state.usersObservadoresExecucao = action.payload;
        },

        getUsersByPapelSuccess(state, action) {
            state.isLoading = false;
            state.usersByPapel = action.payload;
        },

        getcodigoSenhaSuccess(state, action) {
            state.isLoading = false;
            state.codigoSenha = action.payload;
        }

    }
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getUsers() {
    return async (dispatch) => {
        try {
            dispatch(slice.actions.startLoading());
            var usersAtivos = [];
            const response = await api.get('usuario/usuariosOrdenados');
            response.data.map((user) => {
                if (user.status === "Ativo") {
                    usersAtivos.push({ id: user.id, nome: user.nome })
                }
            })


            dispatch(slice.actions.getUsersSuccess(usersAtivos));
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}

// ----------------------------------------------------------------------

export function getUsersObservadores(processo_id, area) {
    return async (dispatch) => {
        try {
            dispatch(slice.actions.startLoading());
            const data = {
                id: processo_id,
                area,
            }
            const response = await api.post('processo-observadores/consultaObservadores', data);

            if (area === 'Cadastro') {
                dispatch(slice.actions.getUsersObservadoresCadastroSuccess(response.data));
            } else {
                dispatch(slice.actions.getUsersObservadoresExecucaoSuccess(response.data));
            }

        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}

// ----------------------------------------------------------------------

export function setUsersObservadores(processo_id, usuario_id, area) {
    return async (dispatch) => {
        try {
            const data = {
                processo_id,
                usuario_id,
                area,
            }
            const response = await api.post('processo-observadores', data);
            return response
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}

// ----------------------------------------------------------------------

export function deletUsersObservadores(processo_id, area) {
    return async (dispatch) => {
        try {
            const data = {
                processo_id,
                area,
            }
            const response = await api.post('processo-observadores/deleteObservadores', data);
            return response
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}

export function deletUserObservador(processo_id, usuario_id, area) {
    return async (dispatch) => {
        try {
            const data = {
                processo_id,
                area,
                usuario_id
            }
            const response = await api.post('processo-observadores/deleteUserObservador', data);
            return response
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}

// ----------------------------------------------------------------------

export function getUsersByPapel(papel_id) {
    return async (dispatch) => {
        try {
            dispatch(slice.actions.startLoading());
            const response = await api.post('usuario-papel/consultaUsuarios', { papel_id });
            dispatch(slice.actions.getUsersByPapelSuccess(response.data));
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}

export function updateProfile(data) {
    return async (dispatch) => {
        try {
            dispatch(slice.actions.startLoading());
            if (data.avatar && typeof data.avatar !== "string") {
                data.avatar.base64 = await readFile(data.avatar)
            }
            const response = await api.put('usuario/updateProfile', data);
            SetSession("@dse-usuario", response.data); // atualiza a sessão do usuário
            return response.data
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

export function loginUser(login, password) {
    return async (dispatch) => {
        try {
            dispatch(slice.actions.startLoading());
            const response = await api.post('usuario/login', { login: login, senha: password })
            if (response.status === 200 || response.status === 201) {
                return true
            } else {
                return false
            }
        } catch (error) {
            dispatch(slice.actions.hasError(error));
            return 'error'
        }
    };
}

export function atualizaSenha(data) {
    return async (dispatch) => {
        try {
            dispatch(slice.actions.startLoading());
            const response = await api.post('usuario/updatePassword', data)
            if (response.status === 200 || response.status === 201) {
                return true
            } else {
                return false
            }
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}

export function recuperaSenha(email) {
    return async (dispatch) => {
        try {
            dispatch(slice.actions.startLoading());
            const response = await api.get(`auth/recoveryPassword/${email}`);
            dispatch(slice.actions.getcodigoSenhaSuccess(response.data));
            return true;
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}

export function updateAccess(data) {
    return async (dispatch) => {
        try {
            const response = await api.post('usuario/updateAccess', { id: data })
            if (response.status === 200 || response.status === 201) {
                return true
            } else {
                return false
            }
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    }
}