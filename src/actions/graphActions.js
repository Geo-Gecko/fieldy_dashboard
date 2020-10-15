import axiosInstance from './axiosInstance';
import {
    GET_FIELD_DATA, GET_FIELD_DATA_FAIL
} from './types';

export const months_ = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october","november", "december"
]

export const getcreateputGraphData = (
    postData, method_, field_id
) => dispatch => {
    return axiosInstance({
        url: `/layers/fieldndvi/${
            method_ === "POST" || field_id === "" ? "" : field_id + "/"
        }`,
        method: method_,
        data: postData
    })
        .then(response => {
            let data_ = []
            if (field_id !== "") {
                data_ = []
                months_.forEach(month_ => {
                    data_.push(response.data.field_ndvi[month_])
                })
            } else if (method_ === "GET" && field_id === "") {
                data_ = []
                months_.forEach((month_, index) => {
                    data_[index] = 0
                    response.data.forEach(field_ => {
                        data_[index] += parseFloat(field_.field_ndvi[month_])
                    })
                    data_[index] = data_[index] / response.data.length
                    data_[index] = parseFloat(data_[index].toFixed(2))
                })
            }

            dispatch({
                type: GET_FIELD_DATA,
                payload: {data_: data_, collapsed: false}
            })
            return response.data
        })
        .catch(error => {
            dispatch({
                type: GET_FIELD_DATA_FAIL,
                payload: true
            })
        });
};

export const getcreateputOverviewGraphData = (
    method_, ids
) => dispatch => {
    return axiosInstance({
        url: `/layers/fieldndvi/`,
        method: method_,
    })
        .then(response => {
            console.log(response.data);
            console.log(ids[0].ids);

            // let data_ = [];
            

            // ids[0].ids
            // let id_set = [...new Set(response.data.map(data_ => data_.cropType))];
            // console.log(id_set)

            // var filteredIDs = response.data.filter((id) => !id_set.includes(id));

            // let id = [...new Set(graphData.graphData.map(data_ => data_.cropType))];
            // let data_ = []
            // if (field_id !== "") {
            //     data_ = []
            //     months_.forEach(month_ => {
            //         data_.push(response.data.field_ndvi[month_])
            //     })
            // } else if (method_ === "GET" && field_id === "") {
            //     data_ = []
            //     months_.forEach((month_, index) => {
            //         data_[index] = 0
            //         response.data.forEach(field_ => {
            //             data_[index] += parseFloat(field_.field_ndvi[month_])
            //         })
            //         data_[index] = data_[index] / response.data.length
            //         data_[index] = parseFloat(data_[index].toFixed(2))
            //     })
            // }

            // dispatch({
            //     type: GET_FIELD_DATA,
            //     payload: {data_: data_, collapsed: false}
            // })
            // return response.data
        })
        .catch(error => {
            dispatch({
                type: GET_FIELD_DATA_FAIL,
                payload: true
            })
        });
};