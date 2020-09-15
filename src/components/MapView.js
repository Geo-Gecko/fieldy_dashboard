import React, { Component } from 'react';

import { v4 as uuidv4 } from 'uuid';
import { connect } from 'react-redux';
import { Map, TileLayer, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';
import { EditControl } from "react-leaflet-draw";
// import Popup from 'react-leaflet-editable-popup';
import Control from 'react-leaflet-control';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';


// our components
import ShSideBar from './shSideBar';
import {
  postPointLayer, postPolygonLayer, getPolygonLayers,
  deletePolygonLayer, updatePolygonLayer
} from '../actions/layerActions';
import { getcreateputUserDetail } from '../actions/userActions';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-icon.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-shadow.png',
});

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
    this.props.postPolygonLayer(geo_layer)

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

  _onMounted = (drawControl) => {
    console.log('_onMounted', drawControl);
  }

  _onEditStart = (e) => {
    console.log('_onEditStart', e);
  }

  _onEditStop = (e) => {
    console.log('_onEditStop', e);
  }

  _onDeleteStart = (e) => {
    console.log('_onDeleteStart', e);
  }

  _onDeleteStop = (e) => {
    console.log('_onDeleteStop', e);
  }

  _editableFG = null

  _onFeatureGroupReady = async (reactFGref) => {

    // populate the leaflet FeatureGroup with the geoJson layers
    let leafletFG = reactFGref.leafletElement;

  
    let current_center  = await this.props.getcreateputUserDetail({}, 'GET')
    if (current_center) {
      let [lat, lng] = current_center.geometry.coordinates
      leafletFG._map.flyTo(
        [lat, lng],
        current_center.properties.zoom_level
      )
    }

    let leafletGeoJSON = await this.props.getPolygonLayers();

    leafletGeoJSON = new L.GeoJSON(leafletGeoJSON)

    leafletGeoJSON.eachLayer( (layer, index) => {
      let feature_ = layer.feature;
      let attr_list = ""
      Object.keys(feature_.properties.field_attributes).forEach(attr => {
        attr_list += `${attr}: ${feature_.properties.field_attributes[attr]}<br/>`
      })

      layer.bindPopup(attr_list)

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

  render() {
    const { currentLocation, zoom } = this.state;

    return (
      <React.Fragment>
        <ShSideBar />
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
          <FeatureGroup ref={ (reactFGref) => {this._onFeatureGroupReady(reactFGref);} }>
              <EditControl
                position='topright'
                onEdited={this._onEdited}
                onCreated={this._onCreated}
                onDeleted={this._onDeleted}
                onMounted={this._onMounted}
                onEditStart={this._onEditStart}
                onEditStop={this._onEditStop}
                onDeleteStart={this._onDeleteStart}
                onDeleteStop={this._onDeleteStop}
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
