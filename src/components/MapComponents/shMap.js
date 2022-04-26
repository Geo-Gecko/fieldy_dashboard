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
import Spinner from 'react-bootstrap/Spinner';
import Accordion from "react-bootstrap/Accordion";

import 'rc-slider/assets/index.css';
import Slider, { createSliderWithTooltip } from 'rc-slider';

import 'font-awesome/css/font-awesome.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import '../popupMod'
import '../popupMod.css'



// local components
import IndicatorsLineGraph from '../ChartComponents/indicatorsLineGraph';
import { IndicatorInformation } from '../indicatorInformation';
import { CookiesPolicy } from '../cookiesPolicy';


import CustomWMSLayer from './customLayer';
import FieldInsightCards from './fieldInsightCards';
import FieldInsightAccordions from './MapAccordions/fieldInsightAccordions';
import { getWeeklyIndicators } from '../../actions/graphActions';
import { getLastVisits, getStatus } from '../../actions/oaActions';
import { colorGrid } from '../../utilities/gridFns';
import LogosComponent from '../../utilities/sponsorLogos';

import { OAVisitsTable, OAStatusTable } from '../overView';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-icon.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-shadow.png',
});

const { BaseLayer } = LayersControl

function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

let commafy = (value) => {
  value += '';
  let x = value.split('.');
  let x1 = x[0];
  let x2 = x.length > 1 ? '.' + x[1] : '';
  let rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }
  return `${x1 + x2} sq km`;
}

class Legend extends MapControl {
  createLeafletElement(props) {}
  
  legend = L.control({ position: "bottomright" });

  componentDidUpdate(prevProps, prevState) {
    if (this.props.gridCellArea !== prevProps.gridCellArea) {
      const { gridCellArea } = this.props;
      this.legend._container.innerHTML =
        `Grid cell area - <span style="color: #e15b26">${commafy(gridCellArea)}</span>`
    }
  }

  componentDidMount() {

    const { map } = this.props;
    this.legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");
      return div;
    };
    this.legend.addTo(map.current.leafletElement);
  }
}


let ShMap = ({
  state, myMap, mapInstance
}) => {
  let {
    currentLocation, zoom, userType, gridCellArea,
    initiateGetData, grid, disablegridKator
  } = state;
  let {
    _saveCurrentView, toggleGridLayers, _onFeatureGroupReady, _editableFG,
    handleRightClick, _onEdited, _onCreated, _onDeleted, props, myCookiePref,
  } = mapInstance;

  const Range = createSliderWithTooltip(Slider.Range);

  const [showLogout, setShowLogout] = useState(false);
  const [showKatorInfo, setShowKatorInfo] = useState(false);

  const [localState, setLocalState] = useState({
    "Field Data": false,
    "Wider Area": false,
    "Top/Bottom Performance": false,
    "Thresholds": false,
    "Biomass Change": false,
    "Wider Area Landcover": false,
    "Wider Area Elevation": false,
    "Wider Area Slope": false,
    "Wider Area Fertility": false,
    "Field Insight": false,
    "Wider Area Insight": false,
    "Wider Area Thresholds": false,
    "OAF Summary": false,
    "OAF Last Visit": false,
  });

  const [lineGraphState, setLineGraphState] = useState({
    dataset: [],
    selectedIndicator: "field_rainfall",
    indicatorObj: {
        "Rainfall": ["field_rainfall", "Precipitation (mm)"],
        "Vegetation Health": ["field_ndvi", "Vegetation Health Index (-1, 1)"],
        "Soil Moisture": ["field_ndwi", "Soil Moisture Index (-1, 1)"],
        "Ground Temperature": ["field_temperature", "Ground Temperature (°Celcius)"],
        "Evapotranspiration": ["field_evapotranspiration", "Evapotranspiration (mm)"]
    },
    displayedIndicator: "Rainfall",
    selectedCropType: "Crop Type",
    cropTypes: [],
    FieldindicatorArray: [],
    allFieldsIndicatorArray: []
  })

  // showFieldDataChoice activeFieldDataKey
  const [activeFieldKey, setActiveFieldKey] = useState("-1");
  const [activeFieldDataKey, setActiveFieldDataKey] = useState("-1");
  const [activeFieldInsightsKey, setactiveFieldInsightsKey] = useState("-1");

  const [widerAreaLayer, setWiderAreaLayer] = useState(undefined);
  const [activeWiderAreaKey, setActiveWiderAreaKey] = useState("-1");
  const [activeWiderAreaInsightKey, setActiveWiderAreaInsightKey] = useState("-1");
  const [activeWiderAreaFiltersKey, setActiveWiderAreaFiltersKey] = useState("-1");

  const [activeOAFKey, setActiveOAFKey] = useState(undefined);
  const [activeOAFDataKey, setActiveOAFDataKey] = useState("-1");
  const [activeOAFInsightsKey, setactiveOAFInsightsKey] = useState("-1");

  const [clickedActiveKey, setClickedActiveKey] = useState({
    BioMassKey: "-1",
    TopBottomKey: "-1",
    ThresholdsKey: "-1",
    FieldInsightsKey: "-1"
  })


  const [displayedWAT, setDisplayedWAT] = useState("Landcover");
  const [slWThVals, setSlWThVals] = useState({
      "Elevation": [0, 999, "elevation"], "Landcover": [10, 95, "land_cover"],
      "Slope": [0, 10, "slope"], "Fertility": [0, 9644, "fcc"]
  })

  const [wAreaRadioBtns, setWAreaRadioBtns] = React.useState('Landcover');
  const [wAsliderValues, setWAsliderValues] = React.useState({"kator": "", "values": [0, 0]})


  const defaultWThreshVals = {
    "Elevation": [0, 999, 1, ""], "Landcover": [10, 95, 1, ""],
    "Slope": [0, 10, 1, ""], "Fertility": [15, 9644, 1, ""]
  }

  const [oALastVIsit, setOALastVisit] = useState("1 Month since last visit")
  let oALastVIsits = {
    "1 Month since last visit" : 1 ,
    "3 Months since last visit" : 3 , "6 Months since last visit" : 6
  }

  const [oafStatusDisplay, setOafStatusDisplay] = useState("Currently")
  let oafStatusDisplays = {
    "Currently" : "Currently" , 
    "Not Currently" : "Not Currently" ,
    "Once Was" : "Once Was"
  }

  let overViewSummary = [];
  if (props.LayersPayload.length) {
    let areas = {}, counts = {}, cropType, colours = {};
    props.LayersPayload.forEach(feature_ => {
      let totalArea =
       L.GeometryUtil.geodesicArea(
        //  [...x] returns a copy of x otherwise the corrdinates in 
        // this.props.LayersPayload are reversed in place. This affected the
        // function for right clicking a graph cell to pull up the indicator
        // line graph --- 24/03/2021
        feature_.geometry.coordinates[0].map(x => new L.latLng([...x].reverse()))
       ).toFixed(2)
       if (feature_.properties.CropType) {
         cropType = feature_.properties.CropType
         if (!(cropType in areas)) {
           areas[cropType] = 0;
           counts[cropType] = 0;
           colours[cropType] = "";
         }
         areas[cropType] += parseFloat(totalArea);
         counts[cropType]++;
         colours[cropType] = getRandomColor();
       }
    });
    for (cropType in areas) {
      overViewSummary.push({
        cropType: cropType, area: areas[cropType].toFixed(2),
        count: counts[cropType], colours: colours[cropType]
      });
    }
  }


  let _showCards = e => {
    if (e.currentTarget.textContent === "Forecast" && !props.forecastFieldId) {
      toast("Right click on a field to show this chart", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        })
    } else if (Object.keys(localState).includes(e.currentTarget.textContent)) {
      // switch cards
      setLocalState({
        ...Object.fromEntries(Object.keys(localState).map(key_ => [key_, false])),
        [e.currentTarget.textContent]: true
      });
    } else {
      setLocalState({
        ...Object.fromEntries(Object.keys(localState).map(key_ => [key_, false]))
      })
    }
  }


  function handleshowLogout() {
    localStorage.removeItem('x-token')
    localStorage.removeItem('user')
    window.location.reload()
  }


  let getEvent = e => {
    if (typeof(e.currentTarget.text) === "string") {
      let { allFieldData, fieldId, field_data, groupFieldData } = props;
      let cropTypes = lineGraphState.cropTypes;
      let selectedCropType = lineGraphState.selectedCropType === "Crop Type" ?
        cropTypes[0] : lineGraphState.selectedCropType;

      if (cropTypes.includes(e.currentTarget.text)) {
        setLineGraphState({
          ...lineGraphState,
          dataset: fieldId === "" && !Object.keys(groupFieldData).length ?
           allFieldData[lineGraphState.selectedIndicator][e.currentTarget.text]
            :fieldId === "" && Object.keys(groupFieldData).length ?
            groupFieldData[lineGraphState.selectedIndicator][e.currentTarget.text]
            : field_data[lineGraphState.selectedIndicator][e.currentTarget.text],
          selectedCropType: e.currentTarget.text
        })
      } else {
        setLineGraphState({
          ...lineGraphState,
          dataset: fieldId === "" ?
           allFieldData[lineGraphState.indicatorObj[e.currentTarget.text][0]][selectedCropType]
            : field_data[lineGraphState.indicatorObj[e.currentTarget.text][0]][selectedCropType],
          selectedIndicator: lineGraphState.indicatorObj[e.currentTarget.text][0],
          displayedIndicator: e.currentTarget.text
        });
        colorGrid(grid, lineGraphState.indicatorObj[e.currentTarget.text][0])
      }
    }
  }

  const handleChange = (event) => {
    setWAreaRadioBtns(event.target.value)
  }

  const [opacityVisible, setopacityVisible] = React.useState(false);
  
  const [wlegendVisible, setwlegendVisible] = React.useState(false);

  const [viewlegend, setViewlegend] = useState({
    "wideArea_lgds": true,
    "wideArea_lgds2": false
  });

  return (
    <React.Fragment>
    <ToastContainer />
    {
      initiateGetData || props.initiateGetWeeklyData ?
        <div className="map-loading">
          <Spinner animation="border" variant="danger" />
        </div> : null
    }
    <Map
      ref={myMap}
      zoomControl={false}
      center={currentLocation}
      zoom={zoom}
      minZoom={5}
    >
      <Control position="topleft" >
        <div className="div-sidebar">
        <div className="map-btn">
        <button className="map-btns"
          onClick={_saveCurrentView}
        >
          <i className="fa fa-bookmark"></i>
          <br/>
          Save view
        </button>&nbsp;&nbsp;&nbsp;
        <style type="text/css">
          {`
                #field_download_link{
                  color: #e15b26 !important;
                  text-decoration: none;
                }
                #field_download_link:hover{
                  color: #7d7171 !important;
                  text-decoration: none;
                }
                `}
        </style>
        <button className="map-btns">
        <i className="fa fa-download"></i>
          <br/>
          <a
            href={`data:text/json;charset=utf-8,${encodeURIComponent(
              JSON.stringify(props.LayersPayload)
            )}`}
            id="field_download_link"
            download="field_poygons.json"
          >
            Download fields
              </a>
        </button>&nbsp;&nbsp;&nbsp;
        {
          props.gridLayer && props.gridLayer.length ? null :
          <React.Fragment>
            <button className="map-btns"
              onClick={
              () => {
                toggleGridLayers();
                mapInstance.setState({ ...state, disablegridKator: !disablegridKator });
              }
            }>
          <i className="fa fa-toggle-on"></i>
          <br/>
              Toggle Grid
            </button>&nbsp;&nbsp;&nbsp;
          </React.Fragment>
        }
      </div>
      <br/>
      <hr></hr>
        <div style={{"alignSelf": "center", "display": "flex"}}>
              <button type="reset"
                className="side-btns"
                onClick={e => {
                  setActiveFieldKey("0"); setActiveWiderAreaKey("-1"); setActiveOAFKey("-1"); _showCards(e);
                  (() => widerAreaLayer ? myMap.current.leafletElement.removeLayer(widerAreaLayer) : null)();
                  setWAreaRadioBtns(''); setwlegendVisible(false); setopacityVisible(false);
                }}
                // setActiveWideAreaKey to -1. the other button will be vice-versa
              >
                  Fields
              </button>
              {
                localStorage.getItem("user") ?
                JSON.parse(localStorage.getItem("user"))["paymentLevels"] === "SECOND LEVEL" ?
                <React.Fragment>
                  &nbsp;&nbsp;&nbsp; <button type="reset" className="side-btns"
                      onClick={e => {
                        _showCards(e); setActiveFieldKey("-1"); setActiveWiderAreaKey("3");  setActiveOAFKey("-1");
                        setactiveFieldInsightsKey("-1"); setActiveFieldDataKey("-1"); setActiveOAFDataKey("-1"); setactiveOAFInsightsKey("-1");
                        setWAreaRadioBtns(''); setopacityVisible(true); 
                        setLocalState({
                          ...Object.fromEntries(Object.keys(localState).map(key_ => [key_, false])),
                          "Wider Area Landcover": false
                        })
                      }}
                      >
                    Wider Area
                  </button>&nbsp;&nbsp;&nbsp;
                </React.Fragment> : null : null
              }
        </div>
        <hr></hr>
        {/* 61164207eaef91000adcfeab */}
        {
          localStorage.getItem("user") ?
          [
            JSON.parse(localStorage.getItem("user"))["memberOf"],
            JSON.parse(localStorage.getItem("user"))["uid"]
          ].includes("623731215344c1000aae2459") ? 
          <div style={{"alignSelf": "center", "display": "flex"}}>
              <button type="reset"
                className="side-btns"
                onClick={e => {
                  setActiveOAFKey("0"); setActiveFieldKey("-1"); setActiveWiderAreaKey("-1"); setactiveOAFInsightsKey("-1"); _showCards(e);
                  (() => widerAreaLayer ? myMap.current.leafletElement.removeLayer(widerAreaLayer) : null)();
                  setWAreaRadioBtns(''); setwlegendVisible(false); setopacityVisible(false);
                }}
                // setActiveWideAreaKey to -1. the other button will be vice-versa
              >
                  OAF
              </button>&nbsp;&nbsp;&nbsp;
        </div> : null : null}
        <hr></hr>
        <Accordion activeKey={activeFieldKey}>
          <div className='d-flex justify-content-center'>
            <Accordion.Collapse eventKey="0">
              <>
                <div id="fields-button" style={{"alignSelf": "center"}}>
                  <button
                    className="current-view field-side-btns" onClick={
                      e => { _showCards(e); setActiveFieldDataKey("1"); setactiveFieldInsightsKey("-1") }
                    }
                  >
                    Field Data
                  </button>
                  <Accordion activeKey={activeFieldDataKey}>
                    {/* NOTE: eventKey(s) probably have to be globally different for accordions?? */}
                    <Accordion.Collapse eventKey="1">
                      <>
                        <hr></hr>
                        <div style={{"alignSelf": "center"}}>
                          <DropdownButton
                          size="sm"
                          variant="outline-dropdown"
                          id="dropdown-basic-button"
                          title={props.fieldId === "" ? lineGraphState.selectedCropType : props.cropType}
                          as={ButtonGroup}
                          >
                            {
                              props.fieldId === "" &&
                              Object.keys(props.groupFieldData).length ?
                              Object.keys(props.groupFieldData.field_rainfall).map(type_ => 
                                  <Dropdown.Item key={type_} eventKey={type_} onClick={getEvent}>
                                      {type_}
                                  </Dropdown.Item>
                              ) :
                                props.fieldId === "" &&
                                !Object.keys(props.groupFieldData).length ? props.cropTypes.map(type_ => 
                                  <Dropdown.Item key={type_} eventKey={type_} onClick={getEvent}>
                                      {type_}
                                  </Dropdown.Item>
                              ) : ""
                            }
                          </DropdownButton>
                          <hr></hr>
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
                  {
                    localStorage.getItem("user") ?
                    JSON.parse(localStorage.getItem("user"))["paymentLevels"] === "SECOND LEVEL" ?
                    <button
                      className="current-view field-side-btns" onClick={
                        (e) => {
                          _showCards(e); setActiveFieldDataKey("-1"); setactiveFieldInsightsKey("2");
                          return !props.weeklyData.length ? props.dispatch(getWeeklyIndicators('')) : null;
                        }
                      }
                    >
                      Field Insight
                    </button> : null : null
                  }
                  <Accordion activeKey={activeFieldInsightsKey}>
                    {/* NOTE: eventKey(s) probably have to be globally different for accordions?? */}
                    <div className='d-flex justify-content-center'>
                      <Accordion.Collapse eventKey="2">
                        <>
                          <hr></hr>
                          <FieldInsightAccordions
                            clickedActiveKey={clickedActiveKey} setClickedActiveKey={setClickedActiveKey}
                            _showCards={_showCards} lineGraphState={lineGraphState} getEvent={getEvent} props={props}
                          />
                        </>
                      </Accordion.Collapse>
                    </div>
                  </Accordion>
                </div>
              </>
            </Accordion.Collapse>
          </div>
        </Accordion>


        <Accordion activeKey={activeWiderAreaKey}>
          <div className='d-flex justify-content-center'>
            <Accordion.Collapse eventKey="3">
              <>
                <div id="fields-button" style={{"alignSelf": "center"}}>
                  <button
                    className="current-view field-side-btns" onClick={
                      e => {
                        setActiveWiderAreaInsightKey("4"); setActiveWiderAreaFiltersKey("-1"); setViewlegend("wideArea_lgds");
                        _showCards(e); (() => widerAreaLayer ? myMap.current.leafletElement.removeLayer(widerAreaLayer) : null)()
                      }
                    }
                  >
                    Wider Area Insights
                  </button>
                  <Accordion activeKey={activeWiderAreaInsightKey}>
                    {/* NOTE: eventKey(s) probably have to be globally different for accordions?? */}
                    <Accordion.Collapse eventKey="4">
                      <>
                        <hr></hr>
                          <div style={{"position": "relative", "left": "1.5rem"}}>
                            <input type="radio" value="Landcover" name="insight" checked={wAreaRadioBtns === 'Landcover'} onChange={handleChange}
                              onClick={() => { setwlegendVisible(true); setLocalState({
                                ...Object.fromEntries(Object.keys(localState).map(key_ => [key_, false])),
                                    "Wider Area Landcover": true
                                  })
                                }}
                            /> Landcover<br/>
                            <input type="radio" value="Slope" name="insight" checked={wAreaRadioBtns === 'Slope'} onChange={handleChange}
                            onClick={() => { setwlegendVisible(true); setLocalState({
                              ...Object.fromEntries(Object.keys(localState).map(key_ => [key_, false])),
                                    "Wider Area Slope": true
                                  })
                                }}
                              /> Slope<br/>
                            <input type="radio" value="Elevation" name="insight" checked={wAreaRadioBtns === 'Elevation'} onChange={handleChange}
                              onClick={() => { setwlegendVisible(true); setLocalState({
                                    ...Object.fromEntries(Object.keys(localState).map(key_ => [key_, false])),
                                    "Wider Area Elevation": true
                                  })
                                }}
                              /> Elevation<br/>
                            <input type="radio" value="Fertility Classification" name="insight" checked={wAreaRadioBtns === 'Fertility Classification'} onChange={handleChange}
                              onClick={() => { setwlegendVisible(true); setLocalState({
                                ...Object.fromEntries(Object.keys(localState).map(key_ => [key_, false])),
                                    "Wider Area Fertility": true
                                  })
                                }}
                              /> Fertility Classification
                          </div>
                      </>
                    </Accordion.Collapse>
                  </Accordion>
                  <hr></hr>
                  <button
                    className="current-view field-side-btns" onClick={
                      e => {
                        _showCards(e); setDisplayedWAT("Landcover");
                        setwlegendVisible(true); setViewlegend("wideArea_lgds2");
                        setActiveWiderAreaInsightKey("-1"); setActiveWiderAreaFiltersKey("5");
                      }
                    }
                  >
                    Wider Area Thresholds
                  </button>
                  <Accordion activeKey={activeWiderAreaFiltersKey}>
                    {/* NOTE: eventKey(s) probably have to be globally different for accordions?? */}
                    <Accordion.Collapse eventKey="5">
                      <>
                        <hr></hr>
                        <div style={{"alignSelf": "center"}}>
                          <DropdownButton
                            size="sm" variant="outline-dropdown" className="mr-1"
                            id="dropdown-basic-button" title={displayedWAT} as={ButtonGroup}
                            >
                              {Object.keys(slWThVals).map(key_ => 
                                  <Dropdown.Item
                                    key={key_} eventKey={key_}
                                    onClick={e => {
                                      setDisplayedWAT(e.currentTarget.textContent); setLocalState({
                                        ...Object.fromEntries(Object.keys(localState).map(
                                          key_ => [key_, key_ !== "Wider Area Thresholds" ? false : true]
                                        )),
                                        [`Wider Area ${e.currentTarget.textContent}`]: true
                                      }); setWAsliderValues({"kator": "", "values": [0, 0]})
                                    }}
                                  >
                                      {key_}
                                  </Dropdown.Item>
                              )}
                          </DropdownButton>
                        </div>
                      </>
                    </Accordion.Collapse>
                  </Accordion>
                  { localState['Wider Area Thresholds'] ? 
                  <Control
                    position="topleft"
                    className={
                      localState['Wider Area Thresholds'] ? "sm-height click-propn current-view insight-card slide-in" :
                      "sm-height click-propn current-view insight-card slide-out"
                    }
                  >
                    <h6 style={{"padding": "10px", "fontWeight": "bold"}}>Wider Area Thresholds</h6>
                    <hr />
                    <Range
                      style={{ width: "80%" }} min={defaultWThreshVals[displayedWAT][0]} max={defaultWThreshVals[displayedWAT][1]} tipProps={{visible:true}}
                      tipFormatter={value => `${value}${defaultWThreshVals[displayedWAT][3]}`} step={defaultWThreshVals[displayedWAT][2]}
                      defaultValue={[slWThVals[displayedWAT][0], slWThVals[displayedWAT][1]]} onAfterChange={values_ => {
                        setSlWThVals({ ...slWThVals, [displayedWAT]: [values_[0], values_[1]] });
                        setWAsliderValues({"kator": displayedWAT, "values": values_});
                      }}
                    />
                    <LogosComponent />
                  </Control> : null }
                </div>
              </>
            </Accordion.Collapse>
          </div>
        </Accordion>

        <Accordion activeKey={activeOAFKey}>
          <div className='d-flex justify-content-center'>
            <Accordion.Collapse eventKey="0">
              <>
                <div id="oaf-button" style={{"alignSelf": "center"}}>
                  <button
                    className="current-view field-side-btns" onClick={
                      async e => { _showCards(e); setActiveOAFDataKey("1"); setactiveOAFInsightsKey("-1");
                      setLocalState({
                        ...Object.fromEntries(Object.keys(localState).map(key_ => [key_, false])),
                            "OAF Summary": true
                          });
                          if (!props.oafStatus.length) await props.dispatch(getStatus("Currently"));
                          if (props.oafStatus.length) {
                            function getOAFColor(value) {
                              return value >= 900 ? "#004529":
                              value >= 800 ? "#006837":
                              value >= 700 ? "#238443" :
                              value >= 600 ? "#41ab5d" :
                              value >= 500 ? "#78c679" :
                              value >= 400 ? "#addd8e" :
                              value >= 300 ? "#d9f0a3" :
                              value >= 200 ? "#f7fcb9" :
                              value >= 100 ? "#ffffe5" :
                              '#ffffff00';
                            }
                            grid.eachLayer(element => {
                              let id = element.feature.properties.grid_id
                              element.setStyle({
                                fillColor: getOAFColor([props.oafStatus[1][id]]),
                                weight: 0.3,
                                opacity: props.oafStatus[1][id] > 0 ? 1 : 0,
                                fillOpacity: props.oafStatus[1][id] > 0 ? 0.4 : 0 
                              });
                            });
  
                            _editableFG.leafletElement.eachLayer(l_ => {
                              let status = l_.feature.properties.OAFStatus;
                              if ( status === oafStatusDisplay) {
                                l_.setStyle({ weight: 4, color: "#e15b26" })
                              } else {
                                l_.setStyle({ weight: 4, color: "#3388ff" });
                              }
                            })
                          }
                        } 
                    }
                  >
                    OAF Fields
                  </button>
                  <Accordion activeKey={activeOAFDataKey}>
                    {/* NOTE: eventKey(s) probably have to be globally different for accordions?? */}
                    <Accordion.Collapse eventKey="1">
                          <>
                          <hr></hr>
                      <DropdownButton
                            size="sm"
                            variant="outline-dropdown"
                            className="mr-1"
                            id="dropdown-basic-button"
                            title={oafStatusDisplay}
                            as={ButtonGroup}
                            >
                              {["Currently", "Not Currently", "Once Was"].map(obj_ => 
                                  <Dropdown.Item key={obj_} eventKey={obj_} onClick={async e => {
                                    let selectedText = e.currentTarget.textContent

                                    setOafStatusDisplay(selectedText)
                                    await props.dispatch(getStatus(oafStatusDisplays[selectedText]));

                                    _editableFG.leafletElement.eachLayer(l_ => {
                                      let status = l_.feature.properties.OAFStatus;
                                      if ( status === selectedText) {
                                        l_.setStyle({ weight: 4, color: "#e15b26" })
                                      } else {
                                        l_.setStyle({ weight: 4, color: "#3388ff" });
                                      }
                                    })
                                  }}>
                                      {obj_}
                                  </Dropdown.Item>
                              )}
                          </DropdownButton>

                          </>
                    </Accordion.Collapse>
                  </Accordion>
                  <hr></hr>
                  <button
                    className="current-view field-side-btns" onClick={
                      async e => {
                        _showCards(e); setActiveOAFDataKey("-1"); setactiveOAFInsightsKey("2");
                        setLocalState({
                          ...Object.fromEntries(Object.keys(localState).map(key_ => [key_, false])),
                              "OAF Last Visit": true
                            }); await props.dispatch(getLastVisits(1));

                            const currentMth = new Date(Date.now()).getMonth()
                            _editableFG.leafletElement.eachLayer(l_ => {
                              let visitMth = new Date(l_.feature.properties.LastVisit).getMonth();
                              if (Math.abs(currentMth - visitMth) <= oALastVIsits[oALastVIsit]) {
                                l_.setStyle({ weight: 4, color: "#e15b26" })
                              } else {
                                l_.setStyle({ weight: 4, color: "#3388ff" });
                              }
                            });
                      }
                    }
                  >
                    OAF Now
                  </button>
                  <Accordion activeKey={activeOAFInsightsKey}>
                    {/* NOTE: eventKey(s) probably have to be globally different for accordions?? */}
                    <div className='d-flex justify-content-center'>
                      <Accordion.Collapse eventKey="2">
                        <>
                          <hr></hr>
                          <DropdownButton
                            size="sm"
                            variant="outline-dropdown"
                            className="mr-1"
                            id="dropdown-basic-button"
                            title={oALastVIsit}
                            as={ButtonGroup}
                            >
                              {Object.keys(oALastVIsits).map(obj_ => 
                                  <Dropdown.Item key={obj_} eventKey={obj_} onClick={async e => {
                                    let selectedText = e.currentTarget.textContent
                                    setOALastVisit(selectedText);
                                    await props.dispatch(getLastVisits(oALastVIsits[selectedText]));

                                    const currentMth = new Date(Date.now()).getMonth()
                                    _editableFG.leafletElement.eachLayer(l_ => {
                                      let visitMth = new Date(l_.feature.properties.LastVisit).getMonth();
                                      if (Math.abs(currentMth - visitMth) <= oALastVIsits[selectedText]) {
                                        l_.setStyle({ weight: 4, color: "#e15b26" })
                                      } else {
                                        l_.setStyle({ weight: 4, color: "#3388ff" });
                                      }
                                    })
                                  }}>
                                      {obj_}
                                  </Dropdown.Item>
                              )}
                          </DropdownButton>
                        </>
                      </Accordion.Collapse>
                    </div>
                  </Accordion>
                </div>
              </>
            </Accordion.Collapse>
          </div>
          { localState['OAF Summary'] ? 
                  <Control
                    position="topleft"
                    className={
                      localState['OAF Summary'] ? "click-propn sm-height current-view insight-card slide-in" :
                      "click-propn sm-height current-view insight-card slide-out"
                    }
                  >
                    <h6 style={{"padding": "10px", "fontWeight": "bold"}}>OAF Summary</h6>
                    <hr />
                    <div style={{"alignSelf": "center"}}>
                      {<OAStatusTable status={props.oafStatus.length ? props.oafStatus : []} value={oafStatusDisplay}/>}
                    </div>
                    <LogosComponent />
                  </Control> : null }
                  { localState['OAF Last Visit'] ? 
                  <Control
                    position="topleft"
                    className={
                      localState['OAF Last Visit'] ? "click-propn sm-height current-view insight-card slide-in" :
                      "click-propn sm-height current-view insight-card slide-out"
                    }
                  >
                    <h6 style={{"padding": "10px", "fontWeight": "bold"}}>OAF Last Visit</h6>
                    <hr />
                    <div style={{"alignSelf": "center"}}>
                      <OAVisitsTable visitsPerDate={props.visitsPerDate} monthPeriod={oALastVIsit} />
                    </div>
                    <LogosComponent />
                  </Control> : null }
        </Accordion>

        </div>
      </Control>
      {
      localState['Field Data'] ?
        <React.Fragment>
          <style type="text/css">
                {`
                  .katorline {
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
              localState['Field Data'] ? "current-view donut_css katorline slide-in" :
              "current-view donut_css katorline slide-out"
            }
          >
            <Button className='close-btn' onClick={_showCards}>
            X
            </Button>
            {/* <h6 style={{"padding": "10px", "font-weight": "bold"}}>Field Overview</h6>
            <OverViewTable graphData={overViewSummary} /> */}
            <h6 style={{"padding": "10px", "fontWeight": "bold"}}>Monthly Field Indicators</h6>
            <IndicatorsLineGraph
              SidePanelCollapsed={false} cropTypes={props.cropTypes} 
              lineGraphState={lineGraphState} setLineGraphState={setLineGraphState}
            />
            <LogosComponent />
          </Control>
        </React.Fragment>
        : null
      }
      <br/>
      {
        props.cropTypes.length > 0 ?
        <FieldInsightCards
         localState={localState}
         selectedIndicator={lineGraphState.selectedIndicator}
         _showCards={_showCards}
         _editableFG={_editableFG}
         weeklyData={props.weeklyData}
         setLocalState={setLocalState}
         props={props}
        /> : <React.Fragment />
      }
      <CookiesPolicy mapInstance={mapInstance} state={state} />
      {!localStorage.getItem("cookieusagedisplayed") ?
      <Control 
        position="bottomright"
        ref={myCookiePref}
        >
        <style type="text/css">
          {`
              #cookie_wording {
                box-shadow: 0 1px 5px rgba(0,0,0,0.65);
                border-radius: 4px;
                border: none;
                background-color: white;
              }
              #cookie-view {
                color: #e15b26;
                border: none;
                box-shadow: 0;
                background-color: transparent;
              }
              `}
        </style>
        <h6 id="cookie_wording">
          <button className="current-view" onClick={
            () => {
              myMap.current.leafletElement.removeControl(myCookiePref.current.leafletElement)
              localStorage.setItem('cookieusagedisplayed', true)

            }
          }>
            <i className="fa fa-times"></i>
          </button>
          {' '}By continuing to view this site, you agree to our usage of
          <button id="cookie-view" onClick={() => mapInstance.setState({...state, showCookiePolicy: true})}
            > cookies{' '}.
          </button>
        </h6>
      </Control> : null }
      <Control 
        position="bottomleft"
        >
      {wlegendVisible && <div className={viewlegend}>
        {localState["Wider Area Landcover"] && <div style={{"background": "white", "paddingTop": "5px"}}><p>Landcover</p><img src="http://geogecko.gis-cdn.net/geoserver/fieldy_data/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=fieldy_data:kenya_HT_grid&STYLE=fieldy_lc"/></div>}
        {localState["Wider Area Slope"] && <div style={{"background": "white", "paddingTop": "5px"}}><p>Slope (Degrees)</p><img src="http://geogecko.gis-cdn.net/geoserver/fieldy_data/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=fieldy_data:kenya_HT_grid&STYLE=fieldy_slope"/></div>}
        {localState["Wider Area Elevation"] && <div style={{"background": "white", "paddingTop": "5px"}}><p>Elevation (m.a.s.l)</p><img src="http://geogecko.gis-cdn.net/geoserver/fieldy_data/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=fieldy_data:kenya_HT_grid&STYLE=fieldy_elevation"/></div>}
        {localState["Wider Area Fertility"] && <div style={{"background": "white", "paddingTop": "5px"}}><p>Fertility Classification</p><img src="http://geogecko.gis-cdn.net/geoserver/fieldy_data/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=fieldy_data:kenya_HT_grid&STYLE=fieldy_fcc"/></div>}
      </div>}
      </Control>
      <Legend map={myMap} gridCellArea={gridCellArea} />
      {/* filter for events with "Wider Area" and call CustomWMSLayer if one of them is set to true */}
      {Object.keys(localState).filter(
            key_ => key_.includes("Wider Area") && localState[key_] ? key_ : ""
        ).join("") !== "" ? CustomWMSLayer(
          localState, myMap, widerAreaLayer, setWiderAreaLayer, wAsliderValues, setWAsliderValues
        ) : null}
      <LayersControl position="bottomright">
        <BaseLayer name="Google Satellite">
          <TileLayer
            url="https://mt0.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
            attribution={`powered by Google. | &copy; ${new Date().getFullYear()} GeckosUnited <br/> Note that this imagery isn't necessarily up to date `}
          />
        </BaseLayer>
        <BaseLayer checked name="Stamen_TonerLite">
          <TileLayer
            url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png"
            attribution={`Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors. | &copy; ${new Date().getFullYear()} GeckosUnited <br/> Note that this imagery isn't necessarily up to date `}
          />
        </BaseLayer>
        <BaseLayer name="OpenStreetMap.Mapnik">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution={`&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors. | &copy; ${new Date().getFullYear()} GeckosUnited <br/> Note that this imagery isn't necessarily up to date `}
          />
        </BaseLayer>
      </LayersControl>
      <ZoomControl position="bottomright" />
      <FeatureGroup
        ref={(reactFGref) => { _onFeatureGroupReady(reactFGref, props); }}
        onClick={handleRightClick}
        onContextmenu={() => console.log("dummy context menu for popupMod.js 'mapLayer._events.contextmenu'")}
      >
        {userType === "EDITOR" ? <EditControl
          position='topright'
          onEdited={_onEdited}
          onCreated={_onCreated}
          onDeleted={_onDeleted}
          draw={{
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false,
            polyline: false,
          }}
        /> : null}
      </FeatureGroup>
      <style type="text/css">
        {
          `.grid-polygon-info {
              z-index: 700;
          }`
        }
      </style>
      <Control
        position="topright"
        className="grid-polygon-info"
      >
        <style type="text/css">
          {`
              #grid-info {
                box-shadow: 0 1px 5px rgba(0,0,0,0.65);
                border-radius: 4px;
                border: none;
                background: #ecebeb;
                padding-right: 2px;
                paddingLeft: 2px;
              }
              `}
        </style>
        <div id="grid-info">Click on grid or field for info</div><br/>
        {opacityVisible && <div style= {{"padding": "5px", "box-shadow": "0 1px 5px rgba(0,0,0,0.65)", "background": "#ecebeb"}}>
          <label>
              Layer opacity
              <br/><input id="opacity-input" type="range" min="0" max="1" step="0.01" />
          </label>
        </div>}
      </Control>
      <Control
        position="bottomleft"
      >
        <style type="text/css">
          {`
            .logoutbtn {
              border-color: #e15b26;
            }
            .btn-outline-primary:hover, .btn-outline-primary:active {
              color: white !important;
              border-color: #e15b26 !important;
              background-color: #e15b26 !important;
            }
            .btn-outline-primary:focus {
              box-shadow: 0 0 0 .1rem #e15b26 !important;
            }
          `}
        </style>
        <div style={{"paddingLeft": "50%", "paddingBottom": "10%", "display": "flex", "columnGap": "20px"}}>
          <Button
            variant="outline-primary"
            className="rounded-circle btn-md fa fa-info logoutbtn"
            style={{width: "2.5vw"}}
            onClick={() => setShowKatorInfo(true)}
          ></Button>
          <IndicatorInformation
            setShowKatorInfo={setShowKatorInfo} showKatorInfo={showKatorInfo}
          />{' '}
          <Button
            variant="outline-primary"
            className="rounded-circle btn-md fa fa-power-off logoutbtn"
            onClick={() => setShowLogout(true)}
          ></Button>
        </div>
          <Modal
            show={showLogout}
            onHide={() => setShowLogout(false)}
            aria-labelledby="contained-modal-title-vcenter"
            size="sm"
            centered
          >
            <Modal.Body className="text-center">
            Would you Like to logout?
            </Modal.Body>
            <Modal.Footer>
              <style type="text/css">
                {`
                .btn-logout {
                  background-color: #e15b26;
                }
                `}
              </style>
              <Button variant="logout" onClick={handleshowLogout}>
                Yes
              </Button>
            </Modal.Footer>
          </Modal>
      </Control>
    </Map>
  </React.Fragment>
  )
}

export default ShMap;
