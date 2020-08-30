import { combineReducers } from 'redux';
import layersReducer from './layersReducer';

const rootReducer = combineReducers({
//   user: userReducer,
  layers: layersReducer,
});

export default rootReducer;
