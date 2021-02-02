import React from 'react';

import { Map, TileLayer, FeatureGroup, ZoomControl, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { EditControl } from "react-leaflet-draw";
import Control from 'react-leaflet-control';
import { ToastContainer } from 'react-toastify';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import '../popupMod'
import '../popupMod.css'



// local components
import ShSideBar from '../shSideBar';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-icon.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-shadow.png',
});

const { BaseLayer } = LayersControl

let ShMap = ({
  state, myMap, mapInstance
}) => {
  
  let {
    currentLocation, zoom, userType
  } = state;
  let {
    _saveCurrentView, addGridLayers, removeGridLayers, _onFeatureGroupReady,
    handleRightClick, _onEdited, _onCreated, _onDeleted, props
  } = mapInstance

  return (
    <React.Fragment>
    <ShSideBar />
    <ToastContainer />
    <Map
      ref={myMap}
      zoomControl={false}
      center={currentLocation}
      zoom={zoom}
    >
      <LayersControl position="bottomright">
        <BaseLayer name="Google Satellite">
          <TileLayer
            url="https://mt0.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
            attribution="powered by Google. <br/> Please note this imagery isn't necessarily up to date "
          />
        </BaseLayer>
        <BaseLayer checked name="OpenStreetMap.BlackAndWhite">
          <TileLayer
            attribution="&amp;copy <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors  <br/> Please note this imagery isn't necessarily up to date "
            url="https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
          />
        </BaseLayer>
        <BaseLayer name="OpenStreetMap.Mapnik">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors. <br/> Please note this imagery isn't necessarily up to date "
          />
        </BaseLayer>
      </LayersControl>
      <ZoomControl position="bottomright" />
      <Control position="topright" >
        <style type="text/css">
          {`
              .current-view {
                box-shadow: 0 1px 5px rgba(0,0,0,0.65);
                border-radius: 4px;
                border: none;
              }
              `}
        </style>
        <button
          className="current-view"
          onClick={_saveCurrentView}
        >
          Save current view
            </button>
      </Control>
      <Control position="topright" >
        <style type="text/css">
          {`
              .grid-view {
                box-shadow: 0 1px 5px rgba(0,0,0,0.65);
                border-radius: 4px;
                border: none;
              }
              `}
        </style>
        <button className="grid-view" onClick={addGridLayers}>Add Grid</button>
        {' '}
        <button className="grid-view" onClick={removeGridLayers}>Remove Grid</button>
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
      <Control position="topright" >
        <style type="text/css">
          {`
                .current-view {
                  box-shadow: 0 1px 5px rgba(0,0,0,0.65);
                  border-radius: 4px;
                  border: none;
                }
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
        </button>
      </Control>
    </Map>
  </React.Fragment>
  )
}

export default ShMap;
