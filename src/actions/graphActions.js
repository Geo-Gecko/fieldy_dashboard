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
            if (field_id !== "") {
                data_ = {
                    field_ndvi: [],
                    field_ndwi: [],
                    field_rainfall: [],
                    field_temperature: []
                }
                Object.keys(data_).forEach(indicator_ => {
                    months_.forEach(month_ => {
                        data_[indicator_].push(parseFloat(response.data[indicator_][month_]))
                    })
                })
                console.log(cropType)
                dispatch({
                    type: GET_FIELD_DATA,
                    payload: {data_, collapsed: false, fieldId: field_id, cropType}
                })
            } else if (method_ === "GET" && field_id === "") {
                data_ = {
                    field_ndvi: [],
                    field_ndwi: [],
                    field_rainfall: [],
                    field_temperature: []
                }
                // getting an average of each indicator for each month for all fields
                Object.keys(data_).forEach(indicator_ => {
                    months_.forEach((month_, index) => {
                        data_[indicator_][index] = 0
                        response.data.forEach(field_ => {
                            data_[indicator_][index] += parseFloat(field_[indicator_][month_])
                        })
                        data_[indicator_][index] = data_[indicator_][index] / response.data.length
                        data_[indicator_][index] = parseFloat(data_[indicator_][index].toFixed(2))
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
