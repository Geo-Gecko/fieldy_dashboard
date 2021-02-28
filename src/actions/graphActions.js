import axiosInstance from './axiosInstance';
import {
    GET_FIELD_DATA, GET_FIELD_DATA_FAIL, GET_ALL_FIELD_DATA,
    GET_ALL_FIELD_DATA_INITIATED
} from './types';

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
            let indicators_ = [
                "field_ndvi", "field_ndwi","field_rainfall", "field_temperature"
            ]
            // dispatch two, one for all data and one for a specific field
            if (method_ === "GET" && field_id !== "") {
                let data_ = {}
                indicators_.forEach(kator => {
                    // kator stands for indi_Kator
                    data_[kator] = {}
                    data_[kator][cropType] = [];
                    let katorRow = response.data.find(row_ => row_.indicator === kator)
                    months_.forEach(month_ => {
                        if (katorRow[month_]) {
                            if (kator === "field_temperature") {
                                katorRow[month_] = katorRow[month_] - 273.15
                            }
                            data_[kator][cropType].push(parseFloat(katorRow[month_].toFixed(2)))
                        } else {
                            data_[kator][cropType].push(katorRow[month_])
                        }
                    })
                })
                // data array for downloading data
                let data_array = (() => {
                    let fieldCsvData = [[...Object.keys(response.data[0])]]
                    response.data.forEach(row_ => {
                        fieldCsvData.push([...Object.values(row_)])
                    })
                    return fieldCsvData
                })()
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
                let data_ = {}
                let data_array = (() => {
                    let fieldCsvData = [[...Object.keys(response.data[0])]]
                    response.data.forEach(row_ => {
                        fieldCsvData.push([...Object.values(row_)])
                    })
                    return fieldCsvData
                })()
                // this is done to ensure process below runs in parallel
                let fillDataObj = kator => {
                    return new Promise(resolve => {
                        // kator stands for indi_Kator
                        data_[kator] = {}
                        cropTypes.forEach(crop => {
                            let katorFields = response.data.filter(katorArr => {
                                let correspLayer = layers_.features.find(
                                    field_ =>
                                     field_.properties.field_id === katorArr.field_id
                                )
                                if (correspLayer) {
                                    return correspLayer.properties.field_attributes.CropType === crop
                                     && katorArr.indicator === kator
                                }
                                return false
                            })
                            data_[kator][crop] = [];
                            months_.forEach(month_ => {
                                let sumKatorCrop = katorFields.reduce(
                                    (accumulator, nextField) => accumulator + nextField[month_], 0
                                )
                                sumKatorCrop = sumKatorCrop / katorFields.length
                                if (kator === "field_temperature") {
                                    sumKatorCrop = sumKatorCrop - 273.15
                                }
                                data_[kator][crop].push(parseFloat(sumKatorCrop.toFixed(2)))
                            })
                        })
                        resolve(data_[kator])
                    })
                }
                Promise.all([
                    fillDataObj("field_ndvi"), fillDataObj("field_ndwi"),
                    fillDataObj("field_rainfall"), fillDataObj("field_temperature")
                ])
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
