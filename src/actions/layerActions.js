// import { toast } from 'react-toastify';
import axiosInstance from './axiosInstance';
import {
  GET_LAYERS_SUCCESS, GET_LAYERS_FAIL
} from './types';


export const postPolygonLayer = postData => {
return axiosInstance
    .post('/layers/listcreatepolygonlayer/', postData)
    .then(response => {
        return {"Layer saved": response.data}
    })
    .catch(err => {
      return {error: "was unable to create layer"}
    });
};

export const getPolygonLayers = () => dispatch => {
  return axiosInstance
      .get('/layers/listcreatepolygonlayer/')
      .then(response => {
          let cropTypes = new Set()
          response.data.features.forEach(feature_ => {
            if(feature_.properties.field_attributes.CropType){
              cropTypes.add(feature_.properties.field_attributes.CropType)
            }
          })
          dispatch({
            type: GET_LAYERS_SUCCESS,
            payload: {
              LayersPayload: response.data,
              cropTypes: Array.from(cropTypes)
            }
          })
          return response.data
      })
      .catch(err => {
        dispatch({
          type: GET_LAYERS_FAIL,
          payload: {}
        })
      });
  };


export const updatePolygonLayer = layer_ => {
  return axiosInstance
      .put(`/layers/getupdatedeletelayer/${layer_.properties.field_id}/`, layer_)
      .then(response => {
        return {"Layer updated": response.data}
      })
      .catch(err => {
      return {error: "layer could not be updated"}
      });
  };


export const deletePolygonLayer = (field_id, layer_) => {
  return axiosInstance
      .delete(`/layers/getupdatedeletelayer/${field_id}/`)
      .then(() => {
          return "Layer has been deleted"
      })
      .catch(err => {
        return {error: "unable to delete layer"}
      });
  };
