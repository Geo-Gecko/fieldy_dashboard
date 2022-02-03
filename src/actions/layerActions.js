// import { toast } from 'react-toastify';
import axiosInstance from './axiosInstance';
import {
  GET_LAYERS_SUCCESS
} from './types';

export const postPointLayer = postData => {
    return axiosInstance
      .post('/v1/layers/listcreatepointlayer/', postData)
      .then(response => {
          console.log("Layer saved", response)
      })
      .catch(error => {
        console.log(error)
      });
  };

export const postPolygonLayer = postData => {
return axiosInstance
    .post('/v1/layers/listcreatepolygonlayer/', postData)
    .then(response => {
        console.log("Layer saved", response)
    })
    .catch(error => {
    console.log(error)
    });
};

export const getPolygonLayers = () => dispatch => {
  return axiosInstance
      .get('/v1/layers/listcreatepolygonlayer/')
      .then(response => {
          let cropTypes = new Set()
          response.data.results.forEach(feature_ => {
            if(feature_.properties.CropType){
              cropTypes.add(feature_.properties.CropType)
            }
          })
          dispatch({
            type: GET_LAYERS_SUCCESS,
            payload: {
              LayersPayload: response.data.results,
              cropTypes: Array.from(cropTypes)
            }
          })
          return response.data
      })
      .catch(error => {
      console.log(error)
      });
  };


export const updatePolygonLayer = layer_ => {
  return axiosInstance
      .put(`/v1/layers/getupdatedeletelayer/${layer_.properties.field_id}/`, layer_)
      .then(response => {
          console.log("Layer has been edited", response.data)
      })
      .catch(error => {
      console.log(error)
      });
  };


export const deletePolygonLayer = (field_id, layer_) => {
  return axiosInstance
      .delete(`/v1/layers/getupdatedeletelayer/${field_id}/`)
      .then(() => {
          console.log("Layer has been deleted")
      })
      .catch(error => {
      console.log(error)
      });
  };
