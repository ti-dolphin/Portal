import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
import projectReducer from './slices/project'
import processReducer from './slices/process'
import pasteReducer from './slices/paste'
import archivesReducer from './slices/archives'
import usersReducer from './slices/users'
import stepReducer from './slices/step'
import notificationReducer from './slices/notification'
import postReducer from './slices/post'
import reportReducer from './slices/relatorios'

const rootPersistConfig = {
  key: 'root',
  storage,
  keyPrefix: 'redux-',
  whitelist: []
};

const rootReducer = combineReducers({
  notification: notificationReducer,
  step: stepReducer,
  users: usersReducer,
  project: projectReducer,
  process: processReducer,
  paste: pasteReducer,
  archives: archivesReducer,
  post: postReducer,
  report: reportReducer
});

export { rootPersistConfig, rootReducer };
