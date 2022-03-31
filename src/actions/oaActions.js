import axiosInstance from './axiosInstance';
import {
  GET_LAST_VISITS
} from './types';


export const getLastVisits = month_ => dispatch => {
  return axiosInstance
    .get(`/layers/last-visit-summary/${month_}`)
    .then(response => {
      dispatch({
        type: GET_LAST_VISITS,
        payload: response.data
      })
      return response.data
    })
    .catch(error => {
      console.log(error)
    });
};
