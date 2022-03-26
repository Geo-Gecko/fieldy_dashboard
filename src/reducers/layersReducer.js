import {
    CREATE_LAYERS_SUCCESS,
    GET_LAYERS_SUCCESS,
    GET_GROP_TYPES
} from '../actions/types';

const initialState = {
    createLayersPayload: {},
    LayersPayload: {},
    // need to pick this up from the fields // "Wheat"
    cropTypes: []
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
                    LayersPayload: action.payload.LayersPayload,
                    cropTypes: action.payload.cropTypes
                };
            case GET_GROP_TYPES:
                return {
                    ...state,
                    cropTypes: action.payload.cropTypes
                }
        default:
            return state;
    }
};

export default layersReducer;
