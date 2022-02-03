import axiosInstance from './axiosInstance';
import {
    GET_ALL_FCAST_DATA, GET_FCAST_DATA_FAIL
 } from './types';


 export const getFCastData = () => dispatch => {
  return axiosInstance.get('/layers/forecast-indicators/')
    .then(async response => {
      dispatch({
        type: GET_ALL_FCAST_DATA,
        payload: response.data
      })
      return response.data
    })
    .catch(error => {
      dispatch({
        type: GET_FCAST_DATA_FAIL,
        payload: true
      })
    });
};
