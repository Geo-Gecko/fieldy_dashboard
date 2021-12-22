import axiosInstance from './axiosInstance';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';

export const getcreateputUserDetail = (postData, method_) => {
    return axiosInstance({
        url: `/layers/getcreateupdateuserdetail/${
            method_ === "POST"  ? "" : uuidv4()  + "/"
        }`,
        method: method_,
        data: postData
    })
        .then(response => {
            let call_toast = (message_) => 
                toast(message_, {
                    position: "top-center",
                    autoClose: 2500,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    })
            if (method_ === "PUT") {
                call_toast("Current view has been saved :)")
            }
            console.log(`User ${method_ === "POST"  ? "updated" : "retrieved"}`)
            return response.data
        })
        .catch(error => {
            if (error.response.status == 403) {
                localStorage.removeItem('x-token')
                localStorage.removeItem('user')
                window.location.reload()
            }
            console.log(error)
        });
};
