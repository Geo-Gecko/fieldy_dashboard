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
  Dropdown, DropdownButton, ButtonGroup, Button, Modal
} from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';

import 'font-awesome/css/font-awesome.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import '../popupMod'
import '../popupMod.css'



// local components
import IndicatorsLineGraph from '../indicatorsLineGraph';
import ForecastBarGraph from '../forecastBarGraph';
import { IndicatorInformation } from '../indicatorInformation';
import { OverViewDonutGraph, OverViewBarGraph } from '../overView';
import { CookiesPolicy } from '../cookiesPolicy';
import { colorGrid } from '../../utilities/gridFns';


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
    _saveCurrentView, toggleGridLayers, _onFeatureGroupReady,
    handleRightClick, _onEdited, _onCreated, _onDeleted, props, myCookiePref,
  } = mapInstance;

  const [showLogout, setShowLogout] = useState(false);
  const [showKatorInfo, setShowKatorInfo] = useState(false);

  const [localState, setLocalState] = useState({
    Overview: true,
    Indicators: false,
    Forecast: false
  })

  const [localindicatorObj, setLocalindicatorObj] = useState({
    "Precipitation": "field_rainfall", "Crop Health": "field_ndvi",
    "Soil Moisture": "field_ndwi", "Ground Temperature": "field_temperature",
    "Evapotranspiration": "field_evapotranspiration", "✓ Field Count": "count"
  })

  let results = [];
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
      results.push({
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
    } else {
      // switch selected button
      Array.from(
        document.getElementsByClassName("catBtn")
      ).forEach(el => {
        if (el.textContent === e.currentTarget.textContent) {
          el.className = "current-view catBtn clicked_topleft_btn"
        } else {
          el.className = "current-view catBtn"
        };
      })
      // switch cards
      setLocalState({
        ...Object.fromEntries(
          Object.keys(localState).map(key_ => [localState[key_], false])
        ),
        [e.currentTarget.textContent]: true
      });
    }
  }

  function handleshowLogout() {
    localStorage.removeItem('x-token')
    localStorage.removeItem('user')
    window.location.reload()
  }

  let getEvent = e => {
    let indicatorObj = localindicatorObj
    let gridIndicator = indicatorObj[e.currentTarget.text]

    // create new obj with selected indicator key. fromEntries is so key order is maintained
    indicatorObj = Object.fromEntries(
      Object.entries(indicatorObj).map(([key_, val_]) => {
        if (key_.includes("✓")) {
          key_ = key_.replace("✓ ", "")
        }
        if (key_ === e.currentTarget.text) {
          key_ = e.currentTarget.text = "✓ " + e.currentTarget.text
        }
        return [key_, val_]
      })
    )

    colorGrid(grid, gridIndicator)
    setLocalindicatorObj({...indicatorObj})
  }

  return (
    <React.Fragment>
    <ToastContainer />
    {
      initiateGetData ?
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
        <button
          className="current-view catBtn clicked_topleft_btn"
          onClick={_showCards}
        >
          Overview
        </button>&nbsp;&nbsp;&nbsp;
        <button
          className="current-view catBtn"
          onClick={_showCards}
        >
          Indicators
        </button>&nbsp;&nbsp;&nbsp;
        {props.forecastData.length ? 
          <button
            className="current-view catBtn"
            onClick={_showCards}
          >
            Forecast
          </button>
        : null}
      </Control>
      {
      localState.Overview && results.length ?
        <React.Fragment>
          <Control
            position="topleft"
            className={
              localState.Overview ? "current-view donut_css slide-in" :
              "current-view donut_css slide-out"
            }
          >
            <OverViewDonutGraph graphData={results} />
          </Control>
          <Control
            position="topleft"
            className={
              localState.Overview ? "current-view donut_css slide-in" :
              "current-view donut_css slide-out"
            }
          >
            <OverViewBarGraph graphData={results} />
          </Control>
        </React.Fragment>
        : null
      }
      <br/>
      {localState.Indicators && props.cropTypes.length > 0 ?
        <React.Fragment>
          <style type="text/css">
                {`
                  .katorline {
                    height: 51vh;
                  }
                `}
          </style>
          <Control
            position="topleft"
            className={
              localState.Indicators ? "current-view donut_css katorline slide-in" :
              "current-view donut_css katorline slide-out"
            }
            id="katorlineId"
          >
            <IndicatorsLineGraph SidePanelCollapsed={false} />
          </Control>
        </React.Fragment>
       : <React.Fragment />}
      {localState.Forecast && props.forecastData.length && props.fieldId !== "" ?
        <Control
          position="topleft"
          className={
            localState.Forecast ? "current-view donut_css katorline slide-in" :
            "current-view donut_css katorline slide-out"
          }
          id="katorlineId"
        >
          <ForecastBarGraph
            SidePanelCollapsed={false}
          />
        </Control> : <React.Fragment />}
      <CookiesPolicy mapInstance={mapInstance} state={state} />
      <Legend map={myMap} gridCellArea={gridCellArea} />
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
      <LayersControl position="bottomright">
        <BaseLayer name="Google Satellite">
          <TileLayer
            url="https://mt0.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
            attribution={`powered by Google. | &copy; ${new Date().getFullYear()} GeckosUnited <br/> Note that this imagery isn't necessarily up to date `}
          />
        </BaseLayer>
        <BaseLayer checked name="OpenStreetMap.BlackAndWhite">
          <TileLayer
            attribution={`&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors | &copy; ${new Date().getFullYear()} GeckosUnited  <br/> Note that this imagery isn't necessarily up to date `}
            url="https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
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
      <Control position="topright" >
        <button
          className="current-view"
          onClick={_saveCurrentView}
        >
          Save current view
        </button>&nbsp;&nbsp;&nbsp;
        <style type="text/css">
          {`
                #field_download_link, field_download_link:hover {
                  color: black;
                  text-decoration: none;
                }
                `}
        </style>
        <button className="current-view">
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
            <button className="current-view" onClick={
              () => {
                toggleGridLayers();
                mapInstance.setState({ ...state, disablegridKator: !disablegridKator });
              }
            }>
              Toggle Grid
            </button>&nbsp;&nbsp;&nbsp;
          </React.Fragment>
        }

        <style type="text/css">
          {`
            .grid-color-view {
              background-color: #ecebeb;
              width: 7vw;
              height: 3vh;
            }
            .grid-color-view button {
              padding: 0;
              font: 12px/1.5 "Helvetica Neue", Arial, Helvetica, sans-serif;
            }
            .grid-color-view button:focus {
              box-shadow: none;
            }
            .grid-color-view div a {
              color: inherit !important;
            }
            .grid-color-view div a.active, .grid-color-view div a:active {
                color: #fff;
                text-decoration: none;
            }
          `}
        </style>
        <DropdownButton
          size="sm"
          disabled={disablegridKator}
          variant="outline-dropdown"
          className="mr-1 current-view grid-color-view"
          id="dropdown-basic-button"
          title={"Grid Indicator"}
          as={ButtonGroup}
        >
          {
            Object.keys(localindicatorObj).map(key_ => 
              <Dropdown.Item key={key_} eventKey={key_} onClick={getEvent}>
                  {key_}
              </Dropdown.Item>
            )
          }
        </DropdownButton>
      </Control>
      <FeatureGroup
        ref={(reactFGref) => { _onFeatureGroupReady(reactFGref); }}
        onContextmenu={handleRightClick}
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
                padding-left: 2px;
              }
              `}
        </style>
        <div id="grid-info">Click on grid or field for info</div>
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
        <Button
          variant="outline-primary"
          className="rounded-circle btn-md fa fa-info logoutbtn"
          style={{width: "2.8vw"}}
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
