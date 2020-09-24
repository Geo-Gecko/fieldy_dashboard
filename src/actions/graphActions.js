import axiosInstance from './axiosInstance';
import { GET_FIELD_DATA } from './types';

export const months_ = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october","november", "december"
]

const getcreateputGraphData = (
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
            console.log(error)
        });
};

export default getcreateputGraphData;
