import {
  GET_ALL_FCAST_DATA, GET_FCAST_DATA_FAIL
} from '../actions/types';

const initialState = { foreCastPayload: [] };

export const foreCastReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ALL_FCAST_DATA:
      return {
        ...state,
        foreCastPayload: action.payload
      };
    case GET_FCAST_DATA_FAIL:
      return {
        ...state,
        foreCastPayload: [],
      };
    default:
      return state;
  }
};

export default foreCastReducer;
