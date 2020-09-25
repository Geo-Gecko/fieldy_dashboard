import {
    GET_FIELD_DATA,
    GET_FIELD_DATA_FAIL
} from '../actions/types';

const initialState = {
    FIELD_ID: null,
    field_data: [],
    SidePanelCollapsed: true,
    noFieldData: false
};

const graphsReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_FIELD_DATA:
            return {
                ...state,
                field_data: action.payload.data_,
                SidePanelCollapsed: action.payload.SidePanelCollapsed,
                noFieldData: false
            };
        case GET_FIELD_DATA_FAIL:
            return {
                ...state,
                noFieldData: action.payload
            };
        default:
            return state;
    }
};

export default graphsReducer;
