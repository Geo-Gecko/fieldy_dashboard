import axiosInstance from './axiosInstance';
import {
  GET_ALL_GRID_DATA, GET_GRID_DATA_FAIL,
  GET_ALL_KATOR_DATA, GET_kATOR_DATA_FAIL
 } from './types';


 export const getGridData = () => dispatch => {
  return axiosInstance.get('/layers/grid-layers/')
    .then(async response => {
      dispatch({
        type: GET_ALL_GRID_DATA,
        payload: response.data
      })
      return response.data
    })
    .catch(error => {
      dispatch({
        type: GET_GRID_DATA_FAIL,
        payload: true
      })
    });
};


export const getFieldsInCell = grid_id => {
  return axiosInstance.get(`/layers/field-in-grid-cell/${grid_id}`)
    .then(async response => {
      return response.data
    })
    .catch(error => {
      console.log(error)
    });
};


export const getKatorsInGridCellAction = grid_id => {
  return axiosInstance.get(`/layers/kators-in-grid-cell/${grid_id}`)
    .then(async response => {
      return response.data
    })
    .catch(error => {
      console.log(error)
    });
};

export const getIndicatorData = () => dispatch => {
  return axiosInstance.get('/layers/indicator-calculations/')
    .then(async response => {
      dispatch({
        type: GET_ALL_KATOR_DATA,
        payload: response.data
      })
      return response.data
    })
    .catch(error => {
      dispatch({
        type: GET_kATOR_DATA_FAIL,
        payload: true
      })
    });
};

