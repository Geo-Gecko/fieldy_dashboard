import { GET_LAST_VISITS, GET_STATUS } from '../actions/types';

const initialState = { visitsPerDate: [], oafStatus: [] };

export const oaReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_LAST_VISITS:
      return {
        ...state,
        visitsPerDate: action.payload
      }
    case GET_STATUS:
      return {
        ...state,
        oafStatus: action.payload
      } ; 
    default:
      return state;
  }
};

export default oaReducer;
