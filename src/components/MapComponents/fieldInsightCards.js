import React, { useState } from 'react';
import L from 'leaflet';
import Control from 'react-leaflet-control';

import { Button } from 'react-bootstrap';


import 'rc-slider/assets/index.css';
import Slider, { createSliderWithTooltip } from 'rc-slider';

import NdviPerformanceLineGraph from '../ChartComponents/ndviPerformanceLineGraph';
import TopBottomPerformanceLineGraph from '../ChartComponents/topbtmPerformanceLineGraph';
import { localGroupBy } from '../../utilities/simpleUtilities';


let FieldInsightCards = ({ localState, _showCards, weeklyData, _editableFG, selectedIndicator }) => {

  const Range = createSliderWithTooltip(Slider.Range);
  const SliderWithTooltip = createSliderWithTooltip(Slider);
  const [slTpVals, setSlTpVals] = useState([15, 85]);

  const [slThVals, setSlThVals] = useState({
    // values follow formart ---> [min, max, title, slider-step]
    "field_ndvi": [-1, 1], "field_precipitation": [0, 500],
    "field_ndwi": [-1, 1], "field_temperature": [15, 35]
  })

  // this is because min, max stay connected to slThVals otherwise, preventing slider mov't
    // values follow formart ---> [min, max, title, slider-step, units]
  const defaultThreshVals = {
    "field_ndvi": [-1, 1, "Crop Health", 0.1, "(-1, 1)"], "field_precipitation": [0, 500, "Precipitation", 1, "mm"],
    "field_ndwi": [-1, 1, "Soil Moisture", 0.01, "(-1, 1)"], "field_temperature": [15, 35, "Temperature", 1, "°C"]
  }

  let recentWeeklyData = localGroupBy(weeklyData, "date_observed")
  let weeks_ = Object.keys(recentWeeklyData); weeks_.sort().reverse();
  recentWeeklyData = recentWeeklyData[weeks_[0]]


  // fitler Thresholds
  let filterThFields = (values_, key_) => {
    _editableFG.leafletElement.eachLayer(layer_ => layer_.setStyle({ weight: 4, color: "#3388ff" }))
    let filteredExceededWeeklyData = recentWeeklyData.filter(row_ => {
      if (row_[key_] < values_[0] || row_[key_] > values_[1]) {
        return true
      }
      return false
    })
    if (filteredExceededWeeklyData.length) {
      let exceedingFieldIds = filteredExceededWeeklyData.map(row_ => row_["field_id"])
      _editableFG.leafletElement.eachLayer(
        layer_ => exceedingFieldIds.includes(layer_.feature.properties.field_id) ?
          layer_.setStyle({ weight: 4, color: "#e15b26" }) : layer_.setStyle({ weight: 4, color: "#3388ff" })
      )
    }
    
  }

  return (
      <React.Fragment>
        <style type="text/css">
              {`
                .close-btn{
                  margin-left: 90%;
                  margin-top: 0.5rem;
                  border: 1px solid #e15b26;
                  background-color: white;
                  color: black;
                  position: absolute;
                }
                .close-btn:hover{
                  color: #7d7171;
                  background-color: white;
                  border: 1px solid #e15b26;
                }                  
              `}
        </style>
        {/* NOTE: Have to separate each statement using a ternary operator rather than chaining them together */}
        {/* Otherwise the amazing react-leaflet duo won't switch out the three divs ma-propsi */}
        {
          localState['Biomass Change'] ?
          <Control
            position="topleft"
            className={
              localState['Biomass Change'] ? "current-view insight-card slide-in" :
              "current-view insight-card slide-out"
            }
          >
            <Button className='close-btn' onClick={_showCards}>
            X
            </Button>
            <h6 style={{"padding": "10px", "fontWeight": "bold"}}>Bio Mass Graph</h6>
            <NdviPerformanceLineGraph SidePanelCollapsed={false} />
          </Control> : null }
          { localState['Top/Bottom Performance'] ?
          <Control
            position="topleft"
            className={
              localState['Top/Bottom Performance'] ? "click-propn current-view insight-card slide-in" :
              "click-propn current-view insight-card slide-out"
            }
          >
            <h6 style={{"padding": "10px", "fontWeight": "bold"}}>Top/Bottom Performance</h6>
            <TopBottomPerformanceLineGraph weeklyData={weeklyData} selectedIndicator={selectedIndicator} slTpVals={slTpVals}/>
            <hr />
            <Range
              style={{ width: "80%" }} min={1} max={100}
              railStyle={{ backgroundColor: '#28a745' }}
              tipFormatter={value => `${value}%`} defaultValue={slTpVals}
              onAfterChange={values_ => { setSlTpVals([values_[0], values_[1]]);}}
            />
          </Control> : null }
          { localState['Thresholds'] ? 
          <Control
            position="topleft"
            className={
              localState['Thresholds'] ? "click-propn current-view insight-card slide-in" :
              "click-propn current-view insight-card slide-out"
            }
          >
            <h6 style={{"padding": "10px", "fontWeight": "bold"}}>Field Thresholds</h6>
            <hr />
              {Object.entries(slThVals).map(([key_, val_]) => {

                // key={key_} coz of warning of each child in list requiring unique key prop
                return <React.Fragment key={key_}>
                  <div style={{"padding": "10px"}}>{defaultThreshVals[key_][2]}</div>
                  <Range
                    style={{ width: "80%" }} min={defaultThreshVals[key_][0]} max={defaultThreshVals[key_][1]}
                    tipFormatter={value => `${value}${defaultThreshVals[key_][4]}`} step={defaultThreshVals[key_][3]}
                    defaultValue={[val_[0], val_[1]]} onAfterChange={values_ => { setSlThVals({ ...slThVals, [key_]: [values_[0], values_[1]] }); filterThFields(values_, key_)}}
                  />
                </React.Fragment>
              })}
          </Control> : null }
      </React.Fragment>
    )
}


export default FieldInsightCards;
