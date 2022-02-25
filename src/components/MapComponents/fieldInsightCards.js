import React, { useState } from 'react';
import L from 'leaflet';
import Control from 'react-leaflet-control';



import 'rc-slider/assets/index.css'
import Slider, { createSliderWithTooltip } from 'rc-slider';

import NdviPerformanceLineGraph from '../ndviPerformanceLineGraph';


let FieldInsightCards = ({ localState, slVals, setSlVals }) => {

  const Range = createSliderWithTooltip(Slider.Range)

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
                console.log(key_, val_)
                // key={key_} coz of warning of each child in list requiring unique key prop
                return <React.Fragment key={key_}>
                  <h6 style={{"padding": "10px"}}>{val_[2]}</h6>
                  <Range
                    style={{ width: "80%" }} min={val_[0]} max={val_[1]} tipFormatter={value => `${value}%`} value={[val_[0], val_[1]]}
                    onChange={values_ => setSlVals({...slVals, [key_]: [values_[0], values_[1], slVals[key_][2]]})} step={val_[3]}
                    defaultValue={[val_[0], val_[1]]} onAfterChange={values_ => {console.log(values_)}}
                  />
                </React.Fragment>
              })}
          </Control> : null
        }
      </React.Fragment>
    )
}


export default FieldInsightCards;
