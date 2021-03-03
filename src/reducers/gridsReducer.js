import { GET_ALL_GRID_DATA, GET_GRID_DATA_FAIL } from '../actions/types';

const initialState = { gridPayload: {} };

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
    default:
      return state;
  }
};

export default gridsReducer;
