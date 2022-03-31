import { combineReducers } from 'redux';
import layersReducer from './layersReducer';
import graphsReducer from './graphsReducer';
import gridsReducer from './gridsReducer';
import foreCastReducer from './foreCastReducer';
import oaReducer from './oaReducer';

const rootReducer = combineReducers({
//   user: userReducer,
  layers: layersReducer,
  graphs: graphsReducer,
  grid: gridsReducer,
  forecast: foreCastReducer,
  oaData: oaReducer
});

export default rootReducer;
