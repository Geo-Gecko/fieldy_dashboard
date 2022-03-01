import React from 'react';

import {
  Dropdown, DropdownButton, ButtonGroup,
} from 'react-bootstrap';
import Accordion from "react-bootstrap/Accordion";


import 'font-awesome/css/font-awesome.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import '../../popupMod'
import '../../popupMod.css'



let FieldInsightAccordions = ({
  _showCards, getEvent, lineGraphState, clickedActiveKey, setClickedActiveKey
}) => {

  return (
      <React.Fragment>
        <style type="text/css">
        {`
        .btn-dropdown {
            background-color: #e15b26;
            color: white;
        }
        .btn-sm {
          border-color: #e15b26;
        }
        .dropdown-item {
          color: inherit !important;
        }
        .dropdown-item.active, .dropdown-item:active {
            color: #fff;
            text-decoration: none;
            background-color: #e15b26;
        }
        #indicator_download_button {
          border-color: #e15b26;
        }
        a {
          color: white;
        }
        a:hover {
          color: black;
          text-decoration: none;
        }
        .btn:focus,.btn:active {
          outline: none !important;
          box-shadow: none;
        }
        #indicator_download_button_words {
          color: black;
        }
        `}
        </style>
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
        >Top/Bottom Performance</button>
        <Accordion activeKey={clickedActiveKey.TopBottomKey}>
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
                ThresholdsKey: "8"
              })
            }
          }
        >Thresholds</button>
      </React.Fragment>
  )
}


export default FieldInsightAccordions;
