import {
    CREATE_LAYERS_SUCCESS,
    GET_LAYERS_SUCCESS
} from '../actions/types';

const initialState = {
    createLayersPayload: {},
    LayersPayload: {}
};

export const layersReducer = (state = initialState, action) => {
    switch (action.type) {
        case CREATE_LAYERS_SUCCESS:
            return {
                ...state,
                createLayersPayload: action.payload
            };
            case GET_LAYERS_SUCCESS:
                return {
                    ...state,
                    LayersPayload: action.payload
                };
        default:
            return state;
    }
};

export default layersReducer;
