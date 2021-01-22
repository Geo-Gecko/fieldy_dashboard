import React, { Component } from 'react';

import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { connect } from 'react-redux';
import { Map, TileLayer, FeatureGroup, ZoomControl, LayersControl } from 'react-leaflet';
import L, { polygon } from 'leaflet';
import { EditControl } from "react-leaflet-draw";
import Control from 'react-leaflet-control';
import { ToastContainer } from 'react-toastify';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './popupMod'
import './popupMod.css'


import * as d3ScaleChromatic from 'd3-scale-chromatic';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';

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

// put the grid and maxCount here to make it accessible by the buttons to be added or removed
let grid;
let maxCount = 0;

function inside(point, vs) {
  // ray-casting algorithm based on
  // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

  var x = point[0], y = point[1];

  var inside = false;
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    var xi = vs[i][0], yi = vs[i][1];
    var xj = vs[j][0], yj = vs[j][1];

    var intersect = ((yi > y) != (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
};

class MapView extends Component {
  constructor() {
    super();
    this.state = {
      currentLocation: { lat: 1.46, lng: 32.40 },
      zoom: 7,
      userType: ""
    }
  }

  async componentDidMount() {
    const tokenValue = localStorage.getItem('x-token')
    const secret_ = process.env.REACT_APP_SECRET || ""
    const user = jwt.verify(tokenValue, secret_);
    this.setState({
      ...this.state,
      userType: user.userType
    })

    let current_center  = await this.props.getcreateputUserDetail({}, 'GET')
    if (current_center) {
      console.log(current_center.geometry.coordinates)
      let currentView = current_center.geometry.coordinates
      this.setState({
        ...this.state,
        zoom: current_center.properties.zoom_level,
        currentLocation: {lat: currentView[0], lng: currentView[1]}
      })
    }

    // ON 2020-dec-11-friday solved the data-flow through the code. yipeee!!
    // this is being called twice and needs to be changed.
    await this.props.dispatch(getPolygonLayers());
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
    let coordinates = [];

    // populate the leaflet FeatureGroup with the geoJson layers
    if (
      reactFGref && Object.keys(this.props.LayersPayload).length > 0
    ) {
      let leafletFG = reactFGref.leafletElement;

      let leafletGeoJSON = this.props.LayersPayload

      leafletGeoJSON = new L.GeoJSON(leafletGeoJSON)
      leafletGeoJSON.eachLayer( layer => {
        //Generates and array of centroids that i can use to attach to the grid,
        // here other information such as croptypes and perhaps values
        // to be attached to the grid later on --- Zeus
        coordinates.push(layer.getBounds().getCenter());
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
    //here if the feature group is loaded, then we split the area into gridcells
    // that can then be put into a geojson variable that i can load into leaflet --- Zeus
    if (this._editableFG) {
      let bounds = this._editableFG.leafletElement.getBounds();
      let width = bounds._northEast.lng - bounds._southWest.lng;
      let height = bounds._northEast.lat - bounds._southWest.lat;
      //here we modify the number of gridcells, can be changed to account for closer clusters of gridcells
      var countX = 10; //cells by x
      var countY = 10; //cells by y
      var cellWidth = width / countX;
      var cellHeight = height / countY;

      var features = [],
        c = { x: bounds._southWest.lng, y: bounds._northEast.lat }, //cursor
        //top-left/top-right/bottom-right/bottom-left
        tLx, tLy, tRx, tRy,
        bRx, bRy, bLx, bLy;

      // build coordinates array, from top-left to bottom-right
      // count by row
      for (var iY = 0; iY < countY; iY++) {
        // count by cell in row
        for (var iX = 0; iX < countX; iX++) {
          tLx = bLx = c.x;
          tLy = tRy = c.y;
          tRx = bRx = c.x + cellWidth;
          bRy = bLy = c.y - cellHeight;
          var cell = [
            // top-left/top-right/bottom-right/bottom-left/top-left
            [tLx, tLy], [tRx, tRy], [bRx, bRy], [bLx, bLy], [tLx, tLy]
          ];
          features.push({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [cell]
            },
            properties: {
              count: 0,
            }
          });
          // refresh cusror for cell
          c.x = c.x + cellWidth;
        }
        // refresh cursor for row
        c.x = bounds._southWest.lng;
        c.y = c.y - cellHeight;
      }

      grid = {
        type: 'FeatureCollection',
        features: features
      };

      grid = new L.GeoJSON(grid);

      //loop through the grid cells here to attach information summarised elsewhere --- Zeus
      grid.eachLayer(layer => {
        let poly = [
          [layer.getLatLngs()[0][0].lat, layer.getLatLngs()[0][0].lng],
          [layer.getLatLngs()[0][1].lat, layer.getLatLngs()[0][1].lng],
          [layer.getLatLngs()[0][2].lat, layer.getLatLngs()[0][2].lng],
          [layer.getLatLngs()[0][3].lat, layer.getLatLngs()[0][3].lng]
        ]
        let count = 0;
        //calcualtes the number (COUNT) of centroids that fall within each polygon
        // (I wish to be able to remove from the array as they are found,
        // but i dont want to spent too much time on that.) --- Zeus
        coordinates.forEach(element => {
          if (inside([element.lat, element.lng], poly)) count++;
        });
        layer.feature.properties.count = count;
        //bind a popup for now just showing the count of the features per grid cell
        layer.bindPopup("Count: " + count);

        maxCount = count > maxCount ? count : maxCount;


      });

      if (this.refs.myMap) {

        const thresholds = d3Array
          .range(0, 10)
          .map(p => Math.pow(2, p));
        const color = d3Scale
          .scaleLog()
          .domain(d3Array.extent(thresholds))
          .interpolate(() => d3ScaleChromatic.interpolateYlGn);

        grid.eachLayer(layer => {
          //grid style per gridcell depending on factors, for now just visibility of a cell.
          layer.setStyle({
            // the fillColor is adapted from a property which can be changed by the user (segment)
            fillColor: color(layer.feature.properties.count),
            weight: 0.3,
            //stroke-width: to have a constant width on the screen need to adapt with scale
            opacity: layer.feature.properties.count > 0 ? 1 : 0,
            // color: ,
            // dashArray: '3',
            fillOpacity: layer.feature.properties.count > 0 ? 0.4 : 0
          })

        })
        this.refs.myMap.leafletElement.addLayer(grid);
        //this removes the grid when the user zooms in past zoom level 11
        this.refs.myMap.leafletElement.on('moveend', () => {
          if (this.refs.myMap.leafletElement.getZoom() > 10) {
            this.refs.myMap.leafletElement.removeLayer(grid)
          }
        })
      }
    }
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
      e.layer.feature.properties.field_attributes.CropType,
      this.props.cropTypes, this.props.LayersPayload
    ))
  }

  addGridLayers = () => {
    this.refs.myMap.leafletElement.addLayer(grid);

  }
  removeGridLayers = () => {
    this.refs.myMap.leafletElement.removeLayer(grid);
  }

  render() {
    const { currentLocation, zoom } = this.state;

    return (
      <React.Fragment>
        <ShSideBar />
        <ToastContainer />
        <Map
          ref="myMap"
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
            <button className="grid-view" onClick={this.addGridLayers}>Add Grid</button>
            {' '}
            <button className="grid-view" onClick={this.removeGridLayers}>Remove Grid</button>
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
                  JSON.stringify(this.props.LayersPayload)
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
  postPointLayer, postPolygonLayer,
  deletePolygonLayer, updatePolygonLayer, getcreateputUserDetail,
  dispatch
});

export default connect(
  mapStateToProps, matchDispatchToProps
)(MapView);
