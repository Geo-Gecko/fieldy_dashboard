import React, { useState } from 'react';
import L from 'leaflet';
import Control from 'react-leaflet-control';



import 'rc-slider/assets/index.css'
import Slider, { createSliderWithTooltip } from 'rc-slider';

import NdviPerformanceLineGraph from '../ndviPerformanceLineGraph';


let FieldInsightCards = ({ localState }) => {

  const Range = createSliderWithTooltip(Slider.Range)

  // NOTE: Top/Bottom is still weekly
  const [slVals, setSlVals] = useState({
    // values follow formart ---> [min, max, title, slider-step]
    "field_ndvi": [0.2, 1], "field_precipitation": [3, 500],
    "field_ndwi": [0, 0.3], "field_temperature": [15, 35]
  })

  // this is because min, max stay connected to slVals otherwise, preventing slider mov't
  const defaultThreshVals = {
    "field_ndvi": [0.2, 1, "Crop Health", 0.1, "(-1, 1)"], "field_precipitation": [3, 500, "Precipitation", 1, "mm"],
    "field_ndwi": [0, 0.3, "Soil Moisture", 0.01, "(-1, 1)"], "field_temperature": [15, 35, "Temperature", 1, "°C"]
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
        {
          localState['Biomass Change'] ?
          <Control
            position="topleft"
            className={
              localState['Biomass Change'] ? "current-view insight-card slide-in" :
              "current-view insight-card slide-out"
            }
          >
            <h6 style={{"padding": "10px", "fontWeight": "bold"}}>Bio Mass graph</h6>
            <NdviPerformanceLineGraph SidePanelCollapsed={false} />
          </Control> : localState['Top/Bottom Performance'] ?
          <Control
            position="topleft"
            className={
              localState['Top/Bottom Performance'] ? "current-view insight-card slide-in" :
              "current-view insight-card slide-out"
            }
          >
            <h6 style={{"padding": "10px", "fontWeight": "bold"}}>Top/Bottom Performance</h6>
          </Control> : localState['Thresholds'] ? 
          <Control
            position="topleft"
            className={
              localState['Thresholds'] ? "click-propn current-view insight-card slide-in" :
              "click-propn current-view insight-card slide-out"
            }
          >
            <h6 style={{"padding": "10px", "fontWeight": "bold"}}>Field Thresholds</h6>
            <hr />
              {Object.entries(slVals).map(([key_, val_]) => {

                // key={key_} coz of warning of each child in list requiring unique key prop
                return <React.Fragment key={key_}>
                  <div style={{"padding": "10px"}}>{defaultThreshVals[key_][2]}</div>
                  <Range
                    style={{ width: "80%" }} min={defaultThreshVals[key_][0]} max={defaultThreshVals[key_][1]}
                    tipFormatter={value => `${value}${defaultThreshVals[key_][4]}`}step={defaultThreshVals[key_][3]}
                    defaultValue={[val_[0], val_[1]]} onAfterChange={values_ => { setSlVals({ ...slVals, [key_]: [values_[0], values_[1]] }); console.log(values_)}}
                  />
                </React.Fragment>
              })}
          </Control> : null
        }
      </React.Fragment>
    )
}


export default FieldInsightCards;
