import React, { useState } from 'react';
import L from 'leaflet';
import Control from 'react-leaflet-control';

import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';


import 'rc-slider/assets/index.css';
import Slider, { createSliderWithTooltip } from 'rc-slider';

import ThresholdsLineGraph from '../ChartComponents/thresholdsLineGraph';
import NdviPerformanceLineGraph from '../ChartComponents/ndviPerformanceLineGraph';
import TopBottomPerformanceLineGraph from '../ChartComponents/topbtmPerformanceLineGraph';
import { localGroupBy } from '../../utilities/simpleUtilities';


let FieldInsightCards = (
  { localState, _showCards, weeklyData, _editableFG, selectedIndicator, props }
) => {

  let { katorPayload, fieldId } = props;
  const Range = createSliderWithTooltip(Slider.Range);
  const SliderWithTooltip = createSliderWithTooltip(Slider);
  const [slTpVals, setSlTpVals] = useState([15, 85]);

  const [slThVals, setSlThVals] = useState({
    // values follow formart ---> [min, max, title, slider-step]
    "field_ndvi": [-1, 1], "field_rainfall": [0, 20],
    "field_ndwi": [-1, 1], "field_temperature": [15, 35]
  })

  // this is because min, max stay connected to slThVals otherwise, preventing slider mov't
    // values follow formart ---> [min, max, title, slider-step, units]
  const defaultThreshVals = {
    "field_ndvi": [-1, 1, "Crop Health", 0.1, "(-1, 1)"], "field_rainfall": [0, 20, "Precipitation", 1, "mm"],
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
            !Object.keys(katorPayload).length ?
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
                {console.log(fieldId)}
              </Control> : Object.keys(katorPayload).length && fieldId ? 
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
                </Control> : toast("Click on a field to show this chart", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                }) : null }
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
              style={{ width: "80%" }} min={1} max={100} tipProps={{visible:true}}
              railStyle={{ backgroundColor: '#28a745' }}
              tipFormatter={value => `${100 - value <= 50 ? `Bottom ${100 - value}` : `Top ${value}`}%`} defaultValue={slTpVals}
              onAfterChange={values_ => { setSlTpVals([values_[0], values_[1]]); }}
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
                <ThresholdsLineGraph
                  weeklyData={weeklyData} selectedIndicator={selectedIndicator}
                  slThVals={slThVals} defaultThreshVals={defaultThreshVals}
                />
                <hr />
                <Range
                  style={{ width: "80%" }} min={defaultThreshVals[selectedIndicator][0]} max={defaultThreshVals[selectedIndicator][1]}
                  tipFormatter={value => `${value}${defaultThreshVals[selectedIndicator][4]}`} step={defaultThreshVals[selectedIndicator][3]} tipProps={{visible:true}}
                  defaultValue={[slThVals[selectedIndicator][0], slThVals[selectedIndicator][1]]}
                  onAfterChange={values_ => { setSlThVals({ ...slThVals, [selectedIndicator]: [values_[0], values_[1]] }); filterThFields(values_, selectedIndicator)}}
                />
          </Control> : null }
      </React.Fragment>
    )
}


export default FieldInsightCards;
