import {
    GET_FIELD_DATA,
    GET_FIELD_DATA_FAIL,
    GET_ALL_FIELD_DATA
} from '../actions/types';

const initialState = {
    fieldId: "",
    cropType: "",
    field_data: {},
    allFieldData: {},
    SidePanelCollapsed: true,
    noFieldData: false
};

const graphsReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_FIELD_DATA:
            return {
                ...state,
                field_data: action.payload.data_,
                fieldId: action.payload.fieldId,
                cropType: action.payload.cropType,
                SidePanelCollapsed: true,
                noFieldData: false
            };
        case GET_ALL_FIELD_DATA:
            return {
                ...state,
                allFieldData: action.payload.data_,
                fieldId: "",
                SidePanelCollapsed: true,
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
