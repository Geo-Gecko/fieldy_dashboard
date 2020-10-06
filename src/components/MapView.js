import React, { Component } from 'react';

import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { connect } from 'react-redux';
import { Map, TileLayer, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';
import { EditControl } from "react-leaflet-draw";
// import Popup from 'react-leaflet-editable-popup';
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
import { getcreateputUserDetail } from '../actions/userActions';
import getcreateputGraphData from '../actions/graphActions';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-icon.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-shadow.png',
});

let cropTypes = [
  "Maize", "Sorghum", "Banana", "Wheat",
  "Coffee", "Cotton", "Mangoes"
]

class MapView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentLocation: { lat: 1.46, lng: 32.40 },
      zoom: 7
    }
  }


  _onEdited = (e) => {

    let numEdited = 0;
    e.layers.eachLayer((layer) => {
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
    attributed_layer.eachLayer((layer_, index_) => {
      let feature_ = layer_.feature

      let attr_list = ""
      let cropOptions = cropTypes.map(type_ => {
        if (type_ !== feature_.properties.field_attributes.CropType) {
          return `<option >${type_}</option>`
        } else {
          return `<option selected>${type_}</option>`
        }
      })
      attr_list += `
        CropType: <select
                    name=CropType
                    id=CropType_${feature_.properties.field_id}
                  >
                    ${cropOptions.join("")}
                  </select><br/>`
      feature_.properties.field_attributes.Area =
        L.GeometryUtil.geodesicArea(layer_.getLatLngs()[0]).toFixed(2);
      attr_list += `Area: ${feature_.properties.field_attributes.Area}<br/>`
      attr_list += `
        Planting Time:
        <input
          type="date" id=plant_${feature_.properties.field_id}
          name=plantingTime
          value=${feature_.properties.field_attributes.plantingTime}
        ><br/>
      `
      attr_list += `
        Harvest Time:
        <input
          type="date" id=harvest_${feature_.properties.field_id}
          name=harvestTime
          value=${feature_.properties.field_attributes.harvestTime}
        ><br/>`

      layer_.bindPopup(attr_list, { editable: true, removable: true })
      this._editableFG.leafletElement.addLayer(layer_)
      layer_.openPopup();
    })

    this._onChange();
  }

  _onDeleted = (e) => {

    let numDeleted = 0;
    e.layers.eachLayer((layer) => {
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
    
    let current_center = await this.props.getcreateputUserDetail({}, 'GET')
    if (current_center) {
      let [lat, lng] = current_center.geometry.coordinates
      leafletFG._map.setView(
        [lat, lng],
        current_center.properties.zoom_level
      )
    }

    let leafletGeoJSON = await this.props.getPolygonLayers();

    leafletGeoJSON = new L.GeoJSON(leafletGeoJSON)

    leafletGeoJSON.eachLayer((layer, index) => {
      let feature_ = layer.feature;
      let attr_list = ""
      let cropOptions = cropTypes.map(type_ => {
        if (type_ !== feature_.properties.field_attributes.CropType) {
          return `<option >${type_}</option>`
        } else {
          return `<option selected>${type_}</option>`
        }
      })
      attr_list += `
        CropType: <select
                    name=CropType
                    id=CropType_${feature_.properties.field_id}
                  >
                    ${cropOptions.join("")}
                  </select><br/>`
      feature_.properties.field_attributes.Area =
        L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]).toFixed(2);
      attr_list += `Area: ${feature_.properties.field_attributes.Area}<br/>`
      attr_list += `
        Planting Time:
        <input
          type="date" id=plant_${feature_.properties.field_id}
          name=plantingTime
          value=${feature_.properties.field_attributes.plantingTime}
        ><br/>
      `
      attr_list += `
        Harvest Time:
        <input
          type="date" id=harvest_${feature_.properties.field_id}
          name=harvestTime
          value=${feature_.properties.field_attributes.harvestTime}
        ><br/>`

      layer.bindPopup(attr_list, { editable: true, removable: true })

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
      properties: { zoom_level: zoom_ },
      geometry: { type: "Point", coordinates: [centre_.lat, centre_.lng] }
    }

    this.props.getcreateputUserDetail(current_centre, 'PUT')
  }

  handleRightClick = e => {
    this.props.dispatch(getcreateputGraphData(
      {}, 'GET', e.layer.feature.properties.field_id
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
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />

          <Control position="topright" >
            <button
              onClick={this._saveCurrentView}
            >
              Save current view
            </button>
          </Control>
          <FeatureGroup
            ref={(reactFGref) => { this._onFeatureGroupReady(reactFGref); }}
            onContextmenu={this.handleRightClick}
          >
            <EditControl
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
            />
          </FeatureGroup>
        </Map>
      </React.Fragment>
    );
  }
}


const mapStateToProps = state => ({
  createLayersPayload: state.layers.createLayersPayload,
  LayersPayload: state.layers.LayersPayload
});

const matchDispatchToProps = dispatch => ({
  postPointLayer, postPolygonLayer, getPolygonLayers,
  deletePolygonLayer, updatePolygonLayer, getcreateputUserDetail,
  dispatch
});

export default connect(
  mapStateToProps, matchDispatchToProps
)(MapView);
