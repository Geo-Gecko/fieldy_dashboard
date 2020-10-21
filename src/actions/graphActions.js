import axiosInstance from './axiosInstance';
import {
    GET_FIELD_DATA, GET_FIELD_DATA_FAIL, GET_ALL_FIELD_DATA
} from './types';

export const months_ = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october","november", "december"
]

const getcreateputGraphData = (
    postData, method_, field_id, cropType=""
) => dispatch => {
    return axiosInstance({
        url: `/layers/fieldindicators/${
            method_ === "POST" || field_id === "" ? "" : field_id + "/"
        }`,
        method: method_,
        data: postData
    })
        .then(response => {
            let data_;
            let cropTypes = JSON.parse(localStorage.getItem('cropTypes'))
            let layers_ = JSON.parse(localStorage.getItem('featuregroup'))
            if (field_id !== "") {
                let fieldcType = layers_.features.find(
                    field_ =>
                     field_.properties.field_id === response.data.field_id
                )
                fieldcType = fieldcType.properties.field_attributes.CropType
                let createCropObj = () => {
                    let cropTypeObj = {};
                    cropTypeObj[fieldcType] = [...months_.map(month_ => 0)]
                    return cropTypeObj
                }
                data_ = {
                    field_ndvi: createCropObj(),
                    field_ndwi: createCropObj(),
                    field_rainfall: createCropObj(),
                    field_temperature: createCropObj()
                }
                Object.keys(data_).forEach(indicator_ => {
                    months_.forEach((month_, index) => {
                        data_[indicator_][fieldcType][index] = 
                         parseFloat(response.data[indicator_][month_])
                    })
                })
                dispatch({
                    type: GET_FIELD_DATA,
                    payload: {data_, collapsed: false, fieldId: field_id, cropType}
                })
            } else if (method_ === "GET" && field_id === "") {
                let createCropObj = () => {
                    let cropTypeObj = {};
                    cropTypes.forEach(
                        type_ => cropTypeObj[type_] = [...months_.map(month_ => 0)]
                    )
                    return cropTypeObj
                }
                // this variable will store the total fields for each cropType
                let totalCropTypes = {}; cropTypes.forEach(type_ => totalCropTypes[type_] = 0)

                data_ = {
                    field_ndvi: createCropObj(),
                    field_ndwi: createCropObj(),
                    field_rainfall: createCropObj(),
                    field_temperature: createCropObj()
                }
                let indicators = Object.keys(data_)


                response.data.forEach(field_ => {
                    let fieldcType = layers_.features.find(
                        layerField =>
                        layerField.properties.field_id === field_.field_id
                    )
                    fieldcType = fieldcType.properties.field_attributes.CropType
                    // regarding if for fieldcType (cropType)
                    // , some fields may not have a cropType attached
                    if (fieldcType) {
                        totalCropTypes[fieldcType] += 1
                        Object.keys(field_).forEach(field_key => {
                            if (indicators.includes(field_key)) {
                                months_.forEach((month_, index) => {
                                    data_[field_key][fieldcType][index] +=
                                     parseFloat(field_[field_key][month_])
                                })
                            }
                        })
                    }
                })

                Object.keys(data_).forEach(indicator_ => {
                    Object.keys(data_[indicator_]).forEach(cType =>{
                        data_[indicator_][cType] = data_[indicator_][cType].map(value_ => {
                            let new_value = value_ / totalCropTypes[cType]
                            new_value = parseFloat(new_value.toFixed(2))
                            return new_value
                        })
                    })
                })
                dispatch({
                    type: GET_ALL_FIELD_DATA,
                    payload: {data_, collapsed: false}
                })
            }
            return response.data
        })
        .catch(error => {
            dispatch({
                type: GET_FIELD_DATA_FAIL,
                payload: true
            })
        });
};

export default getcreateputGraphData;
