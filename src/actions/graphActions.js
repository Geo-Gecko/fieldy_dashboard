import axiosInstance from './axiosInstance';
import {
    GET_FIELD_DATA, GET_FIELD_DATA_FAIL, GET_ALL_FIELD_DATA,
    GET_ALL_FIELD_DATA_INITIATED
} from './types';
import objToArray from '../utilities/objectToArray'

export const months_ = (() => {
    let current_month = new Date()
    current_month = new Intl.DateTimeFormat(
        'en-US', {month: 'long'}
    ).format(current_month).toLowerCase();
    let months_ = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october","november", "december"
    ]
    let older_months = months_.slice(months_.indexOf(current_month))
    months_ = months_.slice(0, months_.indexOf(current_month))
    older_months.push(...months_)
    return older_months

})()

const getcreateputGraphData = (
    postData, method_, field_id, cropType="", cropTypes=[], layers_ = {}
) => dispatch => {
    return axiosInstance({
        url: `/layers/fieldindicators/${
            method_ === "POST" || field_id === "" ? "" : field_id + "/"
        }`,
        method: method_,
        data: postData
    })
        .then(async response => {
            let data_;
            // dispatch two, one for all data and one for a specific field
            if (method_ === "GET" && field_id !== "") {
                let data_array = objToArray([response.data], months_)
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
                    payload: {
                        data_, collapsed: false,
                        FieldindicatorArray: data_array,
                        fieldId: field_id, cropType
                    }
                })
            } else if (method_ === "GET" && field_id === "") {
                await dispatch({
                    type: GET_ALL_FIELD_DATA_INITIATED,
                    payload: true
                })
                let data_array = objToArray(response.data, months_)
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
                    // regarding if for fieldcType (cropType)
                    // , some fields may not have a cropType attached
                    if (fieldcType) {
                        fieldcType = fieldcType.properties.field_attributes.CropType
                        // this sum is probably affected if there is more than one year
                        // ##################NOTE##################
                        // 30th_november_2020 ==> start migration to using 2020 data
                        totalCropTypes[fieldcType] += 1
                        indicators.forEach(indicator_ => {
                                months_.forEach((month_, index) => {
                                    if (field_[indicator_][month_]) {
                                        data_[indicator_][fieldcType][index] +=
                                        parseFloat(field_[indicator_][month_])
                                    }
                                })
                        })
                    }
                })

                Object.keys(data_).forEach(indicator_ => {
                    Object.keys(data_[indicator_]).forEach(cType =>{
                        data_[indicator_][cType] = data_[indicator_][cType].map(value_ => {
                            // dividing by 2 to consider only the one year of 2019
                            // 30th_november_2020 ==> start migration to using 2020 data
                            let new_value = value_ / totalCropTypes[cType]
                            new_value = parseFloat(new_value.toFixed(2))
                            return new_value
                        })
                    })
                })

                // convert temperature from Kelvin
                Object.keys(data_.field_temperature).forEach(croptype => {
                    data_.field_temperature[croptype] =
                     data_.field_temperature[croptype].map(
                        value_ => {
                            if (value_) {
                                let diff = value_ - 273.15
                                diff = parseFloat(diff.toFixed(2))
                                return diff
                            }
                            return value_
                        }
                    )
                })
                dispatch({
                    type: GET_ALL_FIELD_DATA,
                    payload: {
                        data_, collapsed: false,
                        allFieldsIndicatorArray: data_array
                    }
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
