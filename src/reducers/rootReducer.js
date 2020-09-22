import { combineReducers } from 'redux';
import layersReducer from './layersReducer';
import graphsReducer from './graphsReducer';

const rootReducer = combineReducers({
//   user: userReducer,
  layers: layersReducer,
  graphs: graphsReducer
});

export default rootReducer;
