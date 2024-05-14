import { createSlice } from '@reduxjs/toolkit';
import { api } from 'src/config';
import { dispatch } from '../store';

const initialState = {
  isLoading: false,
  error: false,
  favoriteReports: [],
  reports: {},
  categories: [],
  grupos: [],
  usuarios: [],
  templates: [],
  permissoesProjeto: [],
  reportsDetails: [],
  favoriteReportsDetails: []
};

const slice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    setReports(state, action) {
      state.isLoading = false;
      state.favoriteReports = action.payload;
    },
    getReportSuccess(state, action) {
      state.isLoading = false;
      state.reports = action.payload;
    },
    getDetailsSucess(state, action){
      state.isLoading = false;
      state.reportsDetails = action.payload;
    },
    setReportsDetails(state, action){
      state.isLoading = false;
      state.reportsDetails = action.payload;
    },

  }
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getReports() {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading());
      // const response = await api.get('projeto-cadastro?target[]=id&target_value[]=' + id); //Mudar rota
      const response = {
        data: [
          { id: "1", name: "Documentos a vencer/vencidos", isFavorite: true },
        ]
      };
      if (response.data.length > 0) {
        dispatch(slice.actions.getReportSuccess(response.data));
      } else {
        dispatch(slice.actions.getReportSuccess([]));
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function setReports(reports) {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading());
      dispatch(slice.actions.getReportSuccess(reports));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
// ----------------------------------------------------------------------

export function getReportsDetails(userId) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      var response = await api.get("projeto-documento/expiringDocumentsReports/"+userId)
      if (response && response.data.length > 0) {
        dispatch(slice.actions.getDetailsSucess(response.data));
      } else {
        dispatch(slice.actions.getDetailsSuccess([]));
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error))
    }
  }
}

// ----------------------------------------------------------------------

export function setFavoritesDocuments(id, isFavorite) {
  return async (dispatch) => {
    try {
      await api.put("projeto-documento", {id, isFavorite})
    } catch (error) {
      dispatch(slice.actions.hasError(error))
    }
  }
}

// ----------------------------------------------------------------------

export function setReportsDetails(details) {
  return async (dispatch) => {
    try {
      dispatch(slice.actions.startLoading());
      dispatch(slice.actions.setReportsDetails(details))
    } catch(error) {
      dispatch(slice.actions.hasError(error))
    }
  }
}

// ----------------------------------------------------------------------





