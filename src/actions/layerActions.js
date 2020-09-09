// import { toast } from 'react-toastify';
import axiosInstance from './axiosInstance';

export const postPointLayer = postData => {
    return axiosInstance
      .post('/layers/listcreatepointlayer/', postData)
      .then(response => {
          console.log("Layer saved", response)
      })
      .catch(error => {
        console.log(error)
      });
  };

export const postPolygonLayer = postData => {
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


export const updatePolygonLayer = layer_ => {
  return axiosInstance
      .put(`/layers/${layer_.properties.field_id}/`, layer_)
      .then(response => {
          console.log("Layer has been edited", response.data)
      })
      .catch(error => {
      console.log(error)
      });
  };


export const deletePolygonLayer = (field_id, layer_) => {
  return axiosInstance
      .delete(`/layers/${field_id}/`)
      .then(() => {
          console.log("Layer has been deleted")
      })
      .catch(error => {
      console.log(error)
      });
  };
