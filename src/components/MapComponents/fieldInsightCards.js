import React, { useState } from 'react';
import Control from 'react-leaflet-control';
import {
  Dropdown, DropdownButton, ButtonGroup, Button, Modal, Collapse
} from 'react-bootstrap';

import NdviPerformanceLineGraph from '../ndviPerformanceLineGraph';


let FieldInsightCards = ({localState}) => {

  return (
      <React.Fragment>
        <style type="text/css">
              {`
                .katorline {
                  height: 68vh; !important;
                  z-index: -9;
                }
                .field-thresholds {
                  // NOT WORKING - SUPPOSED TO REDUCE SIZE OF CARDS
                  height: 30vh; !important;
                  z-index: -9;
                }
                .field-top-bottom {
                  height: 30vh; !important;
                }
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
              localState['Biomass Change'] ? "current-view insight-card katorline slide-in" :
              "current-view insight-card katorline slide-out"
            }
          >
            <h6 style={{"padding": "10px", "fontWeight": "bold"}}>Bio Mass graph</h6>
            <NdviPerformanceLineGraph SidePanelCollapsed={false} />
          </Control> : localState['Top/Bottom Performance'] ?
          <Control
            position="topleft"
            className={
              localState['Top/Bottom Performance'] ? "current-view insight-card field-top-bottom slide-in" :
              "current-view insight-card field-top-bottom slide-out"
            }
          >
            <h6 style={{"padding": "10px", "fontWeight": "bold"}}>Top/Bottom Performance</h6>
          </Control> : localState['Thresholds'] ? 
          <Control
            position="topleft"
            className={
              localState['Thresholds'] ? "current-view insight-card field-thresholds slide-in" :
              "current-view insight-card field-thresholds slide-out"
            }
          >
            <h6 style={{"padding": "10px", "fontWeight": "bold"}}>Field Thresholds</h6>
          </Control> : null
        }
      </React.Fragment>
    )
}


export default FieldInsightCards;
