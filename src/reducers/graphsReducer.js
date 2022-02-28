import {
    GET_FIELD_DATA, GET_FIELD_DATA_FAIL, GET_ALL_FIELD_DATA, GET_GROUP_FIELD_DATA,
    GET_ALL_FIELD_DATA_INITIATED, FORECAST_FIELD_ID, INITIATE_GET_NDVI_CHANGE,
    GET_NDVI_CHANGE_SUCCESS, INITIATE_GET_WEEKLY_DATA, GET_WEEKLY_DATA_FAIL,
    GET_WEEKLY_DATA_SUCCESS
} from '../actions/types';

const initialState = {
    fieldId: "",
    grid_id: "",
    cropType: "",
    field_data: {},
    allFieldData: {},
    groupFieldData: {},
    SidePanelCollapsed: true,
    noFieldData: false,
    initiateGetAllFieldData: false,
    initiateGetNDVIChange: false,
    initiateGetWeeklyData: false,
    NDVIChange: [],
    weeklyData: [],
    allFieldsIndicatorArray: [],
    groupFieldIndicatorArray: [],
    FieldindicatorArray: [],
    forecastFieldId: undefined
};

const graphsReducer = (state = initialState, action) => {
    switch (action.type) {
        case INITIATE_GET_WEEKLY_DATA:
            return {
                ...state,
                initiateGetWeeklyData: action.payload
            }
        case GET_WEEKLY_DATA_SUCCESS:
            return {
                ...state,
                weeklyData: action.payload,
                initiateGetWeeklyData: false
            }
        case INITIATE_GET_NDVI_CHANGE:
            return {
                ...state,
                initiateGetNDVIChange: action.payload
            }
        case GET_NDVI_CHANGE_SUCCESS:
            return {
                ...state,
                NDVIChange: action.payload,
                initiateGetNDVIChange: false
            }
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
                grid_id: "",
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
                    grid_id: action.payload.grid_id,
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
