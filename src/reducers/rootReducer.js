import { combineReducers } from 'redux';
import layersReducer from './layersReducer';
import graphsReducer from './graphsReducer';
import gridsReducer from './gridsReducer';

const rootReducer = combineReducers({
//   user: userReducer,
  layers: layersReducer,
  graphs: graphsReducer,
  grid: gridsReducer
});

export default rootReducer;
