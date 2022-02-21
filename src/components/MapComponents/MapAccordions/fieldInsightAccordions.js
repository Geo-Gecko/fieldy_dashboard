import React, { useState } from 'react';

import {
  Map, TileLayer, FeatureGroup, MapControl,
  ZoomControl, LayersControl
} from 'react-leaflet';
import L from 'leaflet';
// https://github.com/alex3165/react-leaflet-draw/issues/100
// react-leaflet-draw has been pinned to 0.19.0 coz of above
import { EditControl } from "react-leaflet-draw";
import Control from 'react-leaflet-control';
import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';
import {
  Dropdown, DropdownButton, ButtonGroup, Button, Modal, Collapse
} from 'react-bootstrap';
import CloseButton from 'react-bootstrap/CloseButton'
import Spinner from 'react-bootstrap/Spinner';
import Accordion from "react-bootstrap/Accordion";


import 'font-awesome/css/font-awesome.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import '../../popupMod'
import '../../popupMod.css'



// local components
import IndicatorsLineGraph from '../../indicatorsLineGraph';
import NdviPerformanceLineGraph from '../../ndviPerformanceLineGraph';
import { IndicatorInformation } from '../../indicatorInformation';
import { OverViewTable } from '../../overView';
import { CookiesPolicy } from '../../cookiesPolicy';
import { colorGrid } from '../../../utilities/gridFns';


import CustomWMSLayer from '../customLayer';
import FieldInsightCards from '../fieldInsightCards';


let FieldInsightAccordions = ({ _showCards, getEvent, lineGraphState, clickedActiveKey, setClickedActiveKey }) => {


  return (
      <React.Fragment>
        <button
          className="current-view field-side-btns" onClick={
            e => {
              _showCards(e); setClickedActiveKey({
                ...Object.fromEntries(
                  Object.keys(clickedActiveKey).map(key_ => [clickedActiveKey[key_], "-1"])
                ),
                FieldInsightsKey: "2"
              })
            }
          }
        >
          Biomass Change
        </button>
        <hr></hr>
        <button
          className="current-view field-side-btns" onClick={
            (e) => {
              _showCards(e); setClickedActiveKey({
                ...Object.fromEntries(Object.keys(clickedActiveKey).map(key_ => [clickedActiveKey[key_], -1])),
                TopBottomKey: "7"
              })
            }
          }
        > Top/Bottom Performance </button>
        <Accordion activeKey={clickedActiveKey.ThresholdsKey}>
          {/* NOTE: eventKey(s) probably have to be globally different for accordions?? */}
          <Accordion.Collapse eventKey="7">
            <>
              <hr></hr>
              <div id="fields-choice-button" style={{"alignSelf": "center"}}>
                <DropdownButton
                  size="sm"
                  variant="outline-dropdown"
                  className="mr-1"
                  id="dropdown-basic-button"
                  title={lineGraphState.displayedIndicator}
                  as={ButtonGroup}
                  >
                    {Object.keys(lineGraphState.indicatorObj).map(obj_ => 
                        <Dropdown.Item key={obj_} eventKey={obj_} onClick={getEvent}>
                            {obj_}
                        </Dropdown.Item>
                    )}
                </DropdownButton>
              </div>
            </>
          </Accordion.Collapse>
        </Accordion>
        <hr></hr>
        <button
          className="current-view field-side-btns" onClick={
            (e) => {
              _showCards(e); setClickedActiveKey({
                ...Object.fromEntries(Object.keys(clickedActiveKey).map(key_ => [clickedActiveKey[key_], -1])),
                TopBottomKey: "8"
              })
            }
          }
        > Thresholds </button>
        <Accordion activeKey={clickedActiveKey.ThresholdsKey}>
          {/* NOTE: eventKey(s) probably have to be globally different for accordions?? */}
          <Accordion.Collapse eventKey="8">
            <>
              <hr></hr>
                <div id="fields-choice-button" style={{"alignSelf": "center"}}>
                  <DropdownButton
                    size="sm"
                    variant="outline-dropdown"
                    className="mr-1"
                    id="dropdown-basic-button"
                    title={lineGraphState.displayedIndicator}
                    as={ButtonGroup}
                    >
                      {Object.keys(lineGraphState.indicatorObj).map(obj_ => 
                          <Dropdown.Item key={obj_} eventKey={obj_} onClick={getEvent}>
                              {obj_}
                          </Dropdown.Item>
                      )}
                  </DropdownButton>
                </div>
            </>
          </Accordion.Collapse>
        </Accordion>
      </React.Fragment>
  )
}


export default FieldInsightAccordions;
