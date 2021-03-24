import {
    GET_FIELD_DATA,
    GET_FIELD_DATA_FAIL,
    GET_ALL_FIELD_DATA,
    GET_GROUP_FIELD_DATA,
    GET_ALL_FIELD_DATA_INITIATED,
    FORECAST_FIELD_ID
} from '../actions/types';

const initialState = {
    fieldId: "",
    cropType: "",
    field_data: {},
    allFieldData: {},
    groupFieldData: {},
    SidePanelCollapsed: true,
    noFieldData: false,
    initiateGetAllFieldData: false,
    allFieldsIndicatorArray: [],
    groupFieldIndicatorArray: [],
    FieldindicatorArray: [],
    forecastFieldId: undefined
};

const graphsReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_ALL_FIELD_DATA_INITIATED:
            return {
                ...state,
                initiateGetAllFieldData: action.payload
            }
        case GET_FIELD_DATA:
            return {
                ...state,
                FieldindicatorArray: action.payload.FieldindicatorArray,
                field_data: action.payload.data_,
                groupFieldData: {},
                fieldId: action.payload.fieldId,
                cropType: action.payload.cropType,
                SidePanelCollapsed: true,
                noFieldData: false,
                initiateGetAllFieldData: false
            };
        case GET_ALL_FIELD_DATA:
            return {
                ...state,
                allFieldsIndicatorArray: action.payload.allFieldsIndicatorArray,
                allFieldData: action.payload.data_,
                groupFieldData: {},
                fieldId: "",
                SidePanelCollapsed: action.payload.collapsed,
                noFieldData: false,
                initiateGetAllFieldData: false
            };
            case GET_GROUP_FIELD_DATA:
                return {
                    ...state,
                    groupFieldIndicatorArray: action.payload.allFieldsIndicatorArray,
                    groupFieldData: action.payload.data_,
                    fieldId: "",
                    SidePanelCollapsed: action.payload.collapsed,
                    noFieldData: false,
                    initiateGetAllFieldData: false
                };
        case GET_FIELD_DATA_FAIL:
            return {
                ...state,
                noFieldData: action.payload,
                initiateGetAllFieldData: false
            };
            case FORECAST_FIELD_ID:
                return {
                    ...state,
                    forecastFieldId: action.payload,
                };
        default:
            return state;
    }
};

export default graphsReducer;
