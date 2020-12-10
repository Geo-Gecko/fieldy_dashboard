import React, { Component } from 'react';

import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { connect } from 'react-redux';
import { Map, TileLayer, FeatureGroup, ZoomControl, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { EditControl } from "react-leaflet-draw";
import Control from 'react-leaflet-control';
import { ToastContainer } from 'react-toastify';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './popupMod'
import './popupMod.css'


// our components
import ShSideBar from './shSideBar';
import {
  postPointLayer, postPolygonLayer, getPolygonLayers,
  deletePolygonLayer, updatePolygonLayer
} from '../actions/layerActions';
import { GET_ALL_FIELD_DATA_INITIATED } from '../actions/types';
import { getcreateputUserDetail } from '../actions/userActions';
import getcreateputGraphData from '../actions/graphActions';
import { attrCreator } from '../utilities/attrCreator';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-icon.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-shadow.png',
});

const { BaseLayer } = LayersControl

class MapView extends Component {
  constructor() {
    super();
    this.state = {
      currentLocation: { lat: 1.46, lng: 32.40 },
      zoom: 7,
      userType: ""
    }
  }

  componentDidMount() {
    const tokenValue = localStorage.getItem('x-token')
    const secret_ = process.env.REACT_APP_SECRET || ""
    const user = jwt.verify(tokenValue, secret_);
    this.setState({
      ...this.state,
      userType: user.userType
    })
  }  

  _onEdited = (e) => {

    let numEdited = 0;
    e.layers.eachLayer( (layer) => {
      layer = layer.toGeoJSON()
      this.props.updatePolygonLayer(layer)
      numEdited += 1;
    });
    console.log(`_onEdited: edited ${numEdited} layers`, e);

    this._onChange();
  }

  _onCreated = (e) => {
    let type = e.layerType;
    if (type === 'marker') {
      // Do marker specific actions
      console.log("_onCreated: marker created", e);
    }
    else {
      console.log("_onCreated: something else created:", type, e);
    }
    let geo_layer = e.layer.toGeoJSON()
    geo_layer.properties.field_id = uuidv4()
    geo_layer.properties.field_attributes = {}

    const tokenValue = localStorage.getItem('x-token')
    const secret_ = process.env.REACT_APP_SECRET || ""
    const user = jwt.verify(tokenValue, secret_);
    geo_layer.properties.user_id = user.uid

    this.props.postPolygonLayer(geo_layer)
    this._editableFG.leafletElement.removeLayer(e.layer)
    let geoLayerClln = {
      type: "FeatureCollection",
      features: [geo_layer]
    }
    let attributed_layer = new L.GeoJSON(geoLayerClln)
    attributed_layer.eachLayer( layer_ => {
      let attr_list = attrCreator(layer_, this.props.cropTypes, this.state.userType)
      layer_.bindPopup(attr_list, {editable: true, removable: true})
      this._editableFG.leafletElement.addLayer(layer_)
      layer_.openPopup();
    })

    this._onChange();
  }

  _onDeleted = (e) => {

    let numDeleted = 0;
    e.layers.eachLayer( (layer) => {
      layer = layer.toGeoJSON()
      this.props.deletePolygonLayer(layer.properties.field_id)
      numDeleted += 1;
    });
    console.log(`onDeleted: removed ${numDeleted} layers`, e);

    this._onChange();
  }


  _editableFG = null

  _onFeatureGroupReady = async (reactFGref) => {

    // populate the leaflet FeatureGroup with the geoJson layers
    let leafletFG = reactFGref.leafletElement;

  
    let current_center  = await this.props.getcreateputUserDetail({}, 'GET')
    if (current_center) {
      let [lat, lng] = current_center.geometry.coordinates
      leafletFG._map.setView(
        [lat, lng],
        current_center.properties.zoom_level
      )
    }

    let leafletGeoJSON = await this.props.getPolygonLayers();
    localStorage.setItem("featuregroup", JSON.stringify(leafletGeoJSON))

    leafletGeoJSON = new L.GeoJSON(leafletGeoJSON)
    leafletGeoJSON.eachLayer( layer => { 
      let attr_list = attrCreator(layer, this.props.cropTypes, this.state.userType)
      layer.bindPopup(
        attr_list,
        this.state.userType === "EDITOR" ?
         {editable: true, removable: true} : {}
      );
      leafletFG.addLayer(layer);
    });

    // store the ref for future access to content

    this._editableFG = reactFGref;
  }

  _onChange = () => {

    // this._editableFG contains the edited geometry, which can be manipulated through the leaflet API

    const { onChange } = this.props;

    if (!this._editableFG || !onChange) {
      return;
    }

    const geojsonData = this._editableFG.leafletElement.toGeoJSON();
    onChange(geojsonData);
  }

  _saveCurrentView = () => {
    let centre_ = this._editableFG.leafletElement._map.getCenter()
    let zoom_ = this._editableFG.leafletElement._map.getZoom()
    let current_centre = {
      type: "Feature",
      properties: {zoom_level: zoom_},
      geometry: {type: "Point", coordinates: [centre_.lat, centre_.lng]}
    }

    this.props.getcreateputUserDetail(current_centre, 'PUT')
  }

  handleRightClick = async e => {
    await this.props.dispatch({
        type: GET_ALL_FIELD_DATA_INITIATED,
        payload: true
    })
    this.props.dispatch(getcreateputGraphData(
      {}, 'GET', e.layer.feature.properties.field_id,
      e.layer.feature.properties.field_attributes.CropType
    ))
  }

  render() {
    const { currentLocation, zoom } = this.state;

    return (
      <React.Fragment>
        <ShSideBar />
        <ToastContainer />
        <Map
          zoomControl={false}
          center={currentLocation}
          zoom={zoom}
        >
          <LayersControl position="bottomright">
          <BaseLayer checked name="Google Satellite">
            <TileLayer
              url="https://mt0.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
              attribution="powered by Google. <br/> Please note this imagery isn't necessarily up to date "
            />
          </BaseLayer>
          <BaseLayer name="OpenStreetMap.BlackAndWhite">
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
          <ZoomControl position="bottomright"/> 
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
              onClick={this._saveCurrentView}
            >
              Save current view
            </button>
          </Control>
          <FeatureGroup
           ref={ (reactFGref) => {this._onFeatureGroupReady(reactFGref);} }
           onContextmenu={this.handleRightClick} 
          >
              {this.state.userType === "EDITOR" ? <EditControl
                position='topright'
                onEdited={this._onEdited}
                onCreated={this._onCreated}
                onDeleted={this._onDeleted}
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
                  localStorage.getItem('featuregroup')
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
    );
  }
}


const mapStateToProps = state => ({
  createLayersPayload: state.layers.createLayersPayload,
  LayersPayload: state.layers.LayersPayload,
  cropTypes: state.layers.cropTypes
});

const matchDispatchToProps = dispatch => ({
  postPointLayer, postPolygonLayer, getPolygonLayers,
  deletePolygonLayer, updatePolygonLayer, getcreateputUserDetail,
  dispatch
});

export default connect(
  mapStateToProps, matchDispatchToProps
)(MapView);
