import axiosInstance from './axiosInstance';
import {
    GET_FIELD_DATA, GET_FIELD_DATA_FAIL, GET_ALL_FIELD_DATA,
    GET_ALL_FIELD_DATA_INITIATED, INITIATE_GET_NDVI_CHANGE,
    GET_NDVI_CHANGE_SUCCESS, GET_NDVI_CHANGE_FAIL, INITIATE_GET_WEEKLY_DATA,
    GET_WEEKLY_DATA_SUCCESS, GET_WEEKLY_DATA_FAIL
} from './types';

import { newkatorArr } from '../utilities/IndicatorArr';

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
    postData, method_, field_id, cropType="",
    cropTypes=[], layers_ = {}, katorPayload={}
) => dispatch => {
    if (katorPayload.length && field_id === "") {

        let data_ = {}
        let data_array = (() => {
            let fieldCsvData = [[...Object.keys(katorPayload[0]).slice(0,2), ...months_]]
            katorPayload.forEach(row_ => {
                let rowData = [...Object.values(row_).slice(0, 2)]
                months_.forEach(month_ => {
                    rowData.push(row_[month_])
                })
                fieldCsvData.push([...rowData])
            })
            return fieldCsvData
        })()

        katorPayload.forEach(row_ => {
            if (!data_[row_["indicator"]]) {
                data_[row_["indicator"]] = {}
            }
            data_[row_["indicator"]][row_["crop_type"]] = [
                    ...months_.map(month_ => {
                    let value_ = row_[month_]
                    delete row_[month_]
                    return value_
                })
            ]

        })

        dispatch({
            type: GET_ALL_FIELD_DATA,
            payload: {
                data_, collapsed: false,
                allFieldsIndicatorArray: data_array
            }
        })
    } else {
        return axiosInstance({
            url: `/layers/field-indicators/${
                method_ === "POST" || field_id === "" ? "" : field_id + "/"
            }`,
            method: method_,
            data: postData
        })
            .then(async response => {
                let indicators_ = [
                    "field_ndvi", "field_ndwi","field_rainfall",
                    "field_temperature", "field_evapotranspiration"
                ]
                // response.data.results is when results are paginated. otherwise response.data for per field
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
                        let fieldCsvData = [[...Object.keys(response.data[0]).slice(0,2), ...months_]]
                        response.data.forEach(row_ => {
                            let rowData = [...Object.values(row_).slice(0, 2)]
                            months_.forEach(month_ => {
                                rowData.push(row_[month_])
                            })
                            fieldCsvData.push([...rowData])
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
                    dispatch(newkatorArr(
                        response.data.results, cropTypes, layers_, GET_ALL_FIELD_DATA, ""
                    ))
                    // saving of calculations is in file with newkatorArr
                }
                return field_id !== "" ? response.data : response.data.results
            })
            .catch(error => {
                dispatch({
                    type: GET_FIELD_DATA_FAIL,
                    payload: true
                })
            });
    }
};

export const getNdviChange = earliest_month => async dispatch =>  {
    await dispatch({
        type: INITIATE_GET_NDVI_CHANGE,
        payload: true
    })
    return axiosInstance
        .get(`/indicator-analytics/ndvi-change/?earliest_month=${earliest_month}`)
        .then(async response => {
            await dispatch({
                type: GET_NDVI_CHANGE_SUCCESS,
                payload: response.data.results
            })
        })
        .catch(async error => {
            await dispatch({
                type: GET_NDVI_CHANGE_FAIL,
                payload: error
            })
        });
    };


export const getWeeklyIndicators = earliest_month => async dispatch =>  {
    await dispatch({
        type: INITIATE_GET_WEEKLY_DATA,
        payload: true
    })
    return axiosInstance
        .get(`/indicator-analytics/weekly-indicators/${earliest_month ? `earliest_month=${earliest_month}` : ''}`)
        .then(async response => {
            response.data.results = response.data.results.map(row_ => {
                row_["field_temperature"] = row_["field_temperature"] - 273.15
                return row_
            })
            await dispatch({
                type: GET_WEEKLY_DATA_SUCCESS,
                payload: response.data.results
            })
        })
        .catch(async error => {
            await dispatch({
                type: GET_WEEKLY_DATA_FAIL,
                payload: error
            })
        });
};

export default getcreateputGraphData;
