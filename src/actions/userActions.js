import axiosInstance from './axiosInstance';
import { v4 as uuidv4 } from 'uuid';

export const getcreateputUserDetail = (postData, method_) => {
    return axiosInstance({
        url: `/layers/getcreateupdateuserdetail/${
            method_ === "POST"  ? "" : uuidv4()  + "/"
        }`,
        method: method_,
        data: postData
    })
        .then(response => {
            console.log(`User ${method_ === "POST"  ? "updated" : "retrieved"}`, response)
            return response.data
        })
        .catch(error => {
            console.log(error)
        });
};
