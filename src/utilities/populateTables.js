import axiosInstance from '../actions/axiosInstance';
import { months_ } from '../actions/graphActions';

import jwt from 'jsonwebtoken';


export function populateIndicators(leafletGeoJSON) {
    const user = JSON.parse(localStorage.getItem('user'))
    let field_data = [];

      axiosInstance.get('/layers/fieldindicators/')
      .then(
        response => {
          response.data.forEach(field_ => field_data.push(field_.field_id)); 
        leafletGeoJSON.features.forEach(feature_ => {
          let field_ndvi = {}, field_ndwi = {}, field_evapotranspiration = {},
           field_rainfall = {}, field_temperature = {}
          months_.forEach(mth_ => {
            field_ndvi[mth_] = 0.1 * Math.floor(Math.random() * 10)
            field_ndwi[mth_] = 0.1 * Math.floor(Math.random() * 10)
            field_evapotranspiration[mth_] = 0.1 * Math.floor(Math.random() * 10)
    
            field_ndvi[mth_] = parseFloat(field_ndvi[mth_].toFixed(2))
            field_ndwi[mth_] = parseFloat(field_ndwi[mth_].toFixed(2))
            field_evapotranspiration[mth_] = parseFloat(field_evapotranspiration[mth_].toFixed(2))
    
            // 30 and 280 are max | 0 and 230 are min
            field_rainfall[mth_] = Math.floor( Math.random() * (30 - 0) + 0)
            field_temperature[mth_] = Math.floor(Math.random() * (280 - 230) + 230)
          })
          let featureIndicators = {
            user_id: user.uid,
            year: 2020,
            field_id: feature_.properties.field_id,
            field_ndvi, field_ndwi, field_rainfall,
            field_temperature, field_evapotranspiration
          }
          if (!field_data.includes(featureIndicators.field_id)) {
            axiosInstance.post('/layers/fieldindicators/', featureIndicators)
              .then(response => console.log(response))
              .catch(error => console.log(error, featureIndicators))
          }
    
        })
        }
      )
      .catch(error => console.log(error))


}

// equivalent to python's time.sleep
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
