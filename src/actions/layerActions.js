// import { toast } from 'react-toastify';
import axiosInstance from './axiosInstance';

export const postPointLayer = postData => dispatch => {
    return axiosInstance
      .post('/layers/listcreatepointlayer/', postData)
      .then(response => {
          console.log("Layer saved", response)
      })
      .catch(error => {
        console.log(error)
      });
  };

export const postPolygonLayer = postData => dispatch => {
return axiosInstance
    .post('/layers/listcreatepolygonlayer/', postData)
    .then(response => {
        console.log("Layer saved", response)
    })
    .catch(error => {
    console.log(error)
    });
};

export const getPolygonLayers = () => {
  return axiosInstance
      .get('/layers/listcreatepolygonlayer/')
      .then(response => {
          return response.data
      })
      .catch(error => {
      console.log(error)
      });
  };
