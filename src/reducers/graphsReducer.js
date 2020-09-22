import {
    GET_FIELD_DATA,
} from '../actions/types';

const initialState = {
    FIELD_ID: null,
    field_data: [],
    SidePanelCollapsed: true
};

const graphsReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_FIELD_DATA:
            return {
                ...state,
                field_data: action.payload.data_,
                SidePanelCollapsed: action.payload.SidePanelCollapsed
            };
        default:
            return state;
    }
};

export default graphsReducer;
