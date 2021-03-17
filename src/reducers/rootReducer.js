import { combineReducers } from 'redux';
import layersReducer from './layersReducer';
import graphsReducer from './graphsReducer';
import gridsReducer from './gridsReducer';
import foreCastReducer from './foreCastReducer';

const rootReducer = combineReducers({
//   user: userReducer,
  layers: layersReducer,
  graphs: graphsReducer,
  grid: gridsReducer,
  forecast: foreCastReducer,
});

export default rootReducer;
