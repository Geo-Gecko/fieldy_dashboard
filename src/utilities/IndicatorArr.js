import { inside } from './gridFns';
import { months_ } from '../actions/graphActions';
import {
  GET_GROUP_FIELD_DATA, GET_ALL_FIELD_DATA_INITIATED
} from '../actions/types';

let storedindicatorArr;

export const getKatorsInCell = (gridCell, indicatorArr, fields) => {
  let Kators = []
  const poly = [
    [gridCell.getLatLngs()[0][0].lat, gridCell.getLatLngs()[0][0].lng],
    [gridCell.getLatLngs()[0][1].lat, gridCell.getLatLngs()[0][1].lng],
    [gridCell.getLatLngs()[0][2].lat, gridCell.getLatLngs()[0][2].lng],
    [gridCell.getLatLngs()[0][3].lat, gridCell.getLatLngs()[0][3].lng]
  ]
  let originalRespObj = []
  indicatorArr.slice(1).forEach(eachArr => {
    let RespObjRow = {};
    indicatorArr[0].forEach((colName, index) => {
      // RespObjRow[colName] = parseFloat(eachArr[index])
      RespObjRow[colName] = eachArr[index]
    });
    originalRespObj.push(RespObjRow);
  })
  fields.eachLayer(fieldLayer => {
    let layerLatLng = fieldLayer.getBounds().getCenter()
    if (inside([layerLatLng.lat, layerLatLng.lng], poly)) {
      let fieldId = fieldLayer.feature.properties.field_id
      let katorInCell = originalRespObj.filter(kator => kator.field_id === fieldId)
      if (katorInCell.length) {
        Kators.push(...katorInCell)
      }
    }
  })
  return Kators
}

export const newkatorArr = (
  katorArr, cropTypes, layers_
) => async dispatch => {
  await dispatch({
      type: GET_ALL_FIELD_DATA_INITIATED,
      payload: true
  })
  let data_ = {}
  let data_array = (() => {
    // response.data is now katorArr
    let fieldCsvData = [[...Object.keys(katorArr[0])]]
    katorArr.forEach(row_ => {
      fieldCsvData.push([...Object.values(row_)])
    })
    return fieldCsvData
  })()
  // this is done to ensure process below runs in parallel
  let fillDataObj = kator => {
    return new Promise(resolve => {
      // kator stands for indi_Kator
      data_[kator] = {}
      cropTypes.forEach(crop => {
        let katorFields = katorArr.filter(katorArr => {
          let correspLayer = layers_.features.find(
            field_ =>
              field_.properties.field_id === katorArr.field_id
          )
          if (correspLayer) {
            return correspLayer.properties.field_attributes.CropType === crop
              && katorArr.indicator === kator
          }
          return false
        })
        if (katorFields.length) {
          data_[kator][crop] = [];
          months_.forEach(month_ => {
            let sumKatorCrop = katorFields.reduce(
              (accumulator, nextField) => accumulator + nextField[month_], 0
            )
            sumKatorCrop = sumKatorCrop / katorFields.length
            if (kator === "field_temperature") {
              sumKatorCrop = sumKatorCrop - 273.15
            }
            data_[kator][crop].push(parseFloat(sumKatorCrop.toFixed(2)))
          })
        }
      })
      resolve(data_[kator])
    })
  }
  Promise.all([
    fillDataObj("field_ndvi"), fillDataObj("field_ndwi"),
    fillDataObj("field_rainfall"), fillDataObj("field_temperature")
  ])
  dispatch({
    type: GET_GROUP_FIELD_DATA,
    payload: {
      data_, collapsed: false,
      allFieldsIndicatorArray: data_array
    }
  })
}
