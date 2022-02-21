import React, { useState } from 'react';
import Control from 'react-leaflet-control';
import {
  Dropdown, DropdownButton, ButtonGroup, Button, Modal, Collapse
} from 'react-bootstrap';

import NdviPerformanceLineGraph from '../ndviPerformanceLineGraph';



let FieldInsightCards = ({localState, setLocalState}) => {

  return (
      <React.Fragment>
        <style type="text/css">
              {`
                .katorline {
                  height: 68vh; !important;
                  z-index: -9;
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
        <Control
          position="topleft"
          className={
            localState['Biomass Change'] ? "current-view main-insight-card katorline slide-in" :
            "current-view main-insight-card katorline slide-out"
          }
        >
          <h6 style={{"padding": "10px", "font-weight": "bold"}}>Bio Mass graph</h6>
          <NdviPerformanceLineGraph SidePanelCollapsed={false} />
        </Control>
      </React.Fragment>
    )
}


export default FieldInsightCards;
