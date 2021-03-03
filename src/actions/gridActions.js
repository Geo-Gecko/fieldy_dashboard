import axiosInstance from './axiosInstance';
import { GET_ALL_GRID_DATA, GET_GRID_DATA_FAIL } from './types';


const getGridData = () => dispatch => {
  return axiosInstance.get('/layers/gridlayers/')
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

export default getGridData;
