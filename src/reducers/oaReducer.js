import { GET_LAST_VISITS } from '../actions/types';

const initialState = { visitsPerDate: [] };

export const oaReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_LAST_VISITS:
      return {
        ...state,
        visitsPerDate: action.payload
      };
    default:
      return state;
  }
};

export default oaReducer;
