import React, { Component } from 'react';

import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { connect } from 'react-redux';
import L from 'leaflet';
import ReactGA from 'react-ga';


// our components
import {
  postPolygonLayer, getPolygonLayers,
  deletePolygonLayer, updatePolygonLayer
} from '../../actions/layerActions';
import {
  GET_ALL_FIELD_DATA_INITIATED, GET_GROUP_FIELD_DATA
} from '../../actions/types';
import { getcreateputUserDetail } from '../../actions/userActions';
import getcreateputGraphData from '../../actions/graphActions';
import { getGridData } from '../../actions/gridActions';
import { getFCastData } from '../../actions/foreCastActions';
import { attrCreator } from '../../utilities/attrCreator';
import { getKatorsInCell, newkatorArr } from '../../utilities/IndicatorArr';
import ShMap from './shMap';
import createGrid from './shGrid';


class MapView extends Component {
  constructor() {
    super();
    this.myMap = React.createRef();
    this.myCookiePref = React.createRef();
    this.state = {
      currentLocation: { lat: 1.46, lng: 32.40 },
      zoom: 7,
      userType: "",
      showCookiePolicy: false,
      grid: undefined
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
    ReactGA.initialize(
      process.env.REACT_APP_ANALYTIC || "", {
      gaOptions: {
        userId: user.uid
      }
    }
    );
    ReactGA.pageview(window.location.pathname + window.location.search);
    

    let current_center  = await this.props.getcreateputUserDetail({}, 'GET')
    if (current_center) {
      let currentView = current_center.geometry.coordinates
      this.setState({
        ...this.state,
        zoom: current_center.properties.zoom_level,
        currentLocation: {lat: currentView[0], lng: currentView[1]}
      })
    }

    // ON 2020-dec-11-friday solved the data-flow through the code. yipeee!!
    // this is being called twice and needs to be changed.
    this.props.dispatch(getGridData());
    this.props.dispatch(getFCastData())
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

    // populate the leaflet FeatureGroup with the geoJson layers
    if (
      reactFGref && Object.keys(this.props.LayersPayload).length > 0
    ) {
      let leafletFG = reactFGref.leafletElement;

      let leafletGeoJSON = this.props.LayersPayload

      leafletGeoJSON = new L.GeoJSON(leafletGeoJSON)
      if (!this.props.gridLayer.features.length) {
        leafletGeoJSON.eachLayer( layer => {
          let attr_list = attrCreator(layer, this.props.cropTypes, this.state.userType)
          layer.bindPopup(
            attr_list,
            this.state.userType === "EDITOR" ?
            {editable: true, removable: true} : {}
          );
          leafletFG.addLayer(layer);
        });
      }

      // store the ref for future access to content

      this._editableFG = reactFGref;
    }

    //here if the feature group is loaded, then we split the area into gridcells
    // that can then be put into a geojson variable that i can load into leaflet --- Zeus
    if (this._editableFG && !this.state.grid) {
      if (this.props.allFieldsIndicatorArray && this.props.allFieldsIndicatorArray.length > 0) {
        if (!this.myMap.current.leafletElement.hasLayer(this.state.grid)) {
          let grid = createGrid(this)
          grid.on("contextmenu", e => {
            let indicatorsInCell = getKatorsInCell(
              e.layer, this.props.allFieldsIndicatorArray,
              new L.GeoJSON(this.props.LayersPayload)
            )
            this.props.dispatch(newkatorArr(
              indicatorsInCell, this.props.cropTypes,
              this.props.LayersPayload, GET_GROUP_FIELD_DATA
            ))
          })

          // SCRIPT FOR SAVING GRIDS GOES HERE
          await this.setState({...this.state, grid})
          this.myMap.current.leafletElement.addLayer(this.state.grid)
        }
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
    this.myMap.current.leafletElement.addLayer(this.state.grid);
  }
  removeGridLayers = () => {
    this.myMap.current.leafletElement.removeLayer(this.state.grid);
  }

  render() {

    return (
      <ShMap
        state={this.state}
        myMap={this.myMap}
        mapInstance={this}
      />
    );
  }
}


const mapStateToProps = state => ({
  createLayersPayload: state.layers.createLayersPayload,
  LayersPayload: state.layers.LayersPayload,
  cropTypes: state.layers.cropTypes,
  allFieldsIndicatorArray: state.graphs.allFieldsIndicatorArray,
  gridLayer: state.grid.gridPayload
});

const matchDispatchToProps = dispatch => ({
  postPolygonLayer, deletePolygonLayer,
  updatePolygonLayer, getcreateputUserDetail,
  dispatch
});

export default connect(
  mapStateToProps, matchDispatchToProps
)(MapView);
