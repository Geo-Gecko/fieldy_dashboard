import {
  GET_ALL_GRID_DATA, GET_GRID_DATA_FAIL,
  GET_ALL_KATOR_DATA, GET_kATOR_DATA_FAIL
} from '../actions/types';

const initialState = { gridPayload: {}, katorPayload: {} };

export const gridsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ALL_GRID_DATA:
      return {
        ...state,
        gridPayload: action.payload
      };
    case GET_GRID_DATA_FAIL:
      return {
        ...state,
        gridPayload: {},
      };
    case GET_ALL_KATOR_DATA:
      return {
        ...state,
        katorPayload: action.payload
      };
    case GET_kATOR_DATA_FAIL:
      return {
        ...state,
        katorPayload: {},
      };
    default:
      return state;
  }
};

export default gridsReducer;
