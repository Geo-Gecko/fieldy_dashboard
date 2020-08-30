// import { toast } from 'react-toastify';
import axiosInstance from './axiosInstance';

export const postPointLayer = postData => dispatch => {
    return axiosInstance
      .post('/layers/createpointlayer/', postData)
      .then(response => {
          console.log("Layer saved", response)
      })
      .catch(error => {
        console.log(error)
      });
  };

export const postPolygonLayer = postData => dispatch => {
return axiosInstance
    .post('/layers/createpolygonlayer/', postData)
    .then(response => {
        console.log("Layer saved", response)
    })
    .catch(error => {
    console.log(error)
    });
};
