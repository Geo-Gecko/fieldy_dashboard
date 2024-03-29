import React, { Component } from 'react';

import { v4 as uuidv4 } from 'uuid';
import { connect } from 'react-redux';
import L from 'leaflet';
import ReactGA from 'react-ga';


// our components
import {
  postPointLayer, postPolygonLayer, getPolygonLayers,
  deletePolygonLayer, updatePolygonLayer, getCropTypes
} from '../../actions/layerActions';
import {
  GET_ALL_FIELD_DATA_INITIATED, GET_GROUP_FIELD_DATA, FORECAST_FIELD_ID
} from '../../actions/types';
import { getcreateputUserDetail } from '../../actions/userActions';
import getcreateputGraphData, { getWeeklyIndicators } from '../../actions/graphActions';
import {
  getGridData, getSummarizedIndicatorData, getFieldsInCell, getKatorsInGridCellAction
} from '../../actions/gridActions';
import { getFCastData } from '../../actions/foreCastActions';
import { attrCreator } from '../../utilities/attrCreator';
import { getKatorsInCell, newkatorArr } from '../../utilities/IndicatorArr';
import ShMap from './shMap';
import createGrid from './shGrid';

let clickedLayer;

class MapView extends Component {
  constructor() {
    super();
    this.myMap = React.createRef();
    this.myCookiePref = React.createRef();
    this.state = {
      currentLocation: { lat: 1.46, lng: 32.40 },
      initiateGetData: true,
      zoom: 7,
      userType: "",
      showCookiePolicy: false,
      grid: undefined,
      gridCellArea: "",
      layer_data: [],
      disablegridKator: false
    }
  }

  async componentDidMount() {
    

    let user_details = await this.props.getcreateputUserDetail({}, 'GET')
    // https://stackoverflow.com/a/48433029
    let { current_center, user_detail } = { ...user_details }
  localStorage.setItem('user', JSON.stringify(user_detail))

    this.setState({
      ...this.state,
      userType: user_detail.userType
    })
    ReactGA.initialize(
      process.env.REACT_APP_ANALYTIC || "", {
      gaOptions: {
        userId: user_detail.uid
      }
    }
    );
    ReactGA.pageview(window.location.pathname + window.location.search);

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
    await this.props.dispatch(getGridData());
    this.props.dispatch(getFCastData())
    await this.props.dispatch(getCropTypes())
    if (!this.props.gridLayer.length) await this.props.dispatch(getPolygonLayers());
    await this.props.dispatch(getSummarizedIndicatorData());
    await this.props.dispatch(getcreateputGraphData(
      {}, 'GET', "", "", this.props.cropTypes,
      this.props.LayersPayload, this.props.katorPayload
    ));
    this.setState({
      ...this.state,
      initiateGetData: false,
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

    const user = JSON.parse(localStorage.getItem('user'))
    geo_layer.properties.user_id = user.uid

    this.props.postPolygonLayer(geo_layer)
    this._editableFG.leafletElement.removeLayer(e.layer)
    let geoLayerClln = {
      type: "FeatureCollection",
      features: [geo_layer]
    }
    let attributed_layer = new L.GeoJSON(geoLayerClln)
    attributed_layer.eachLayer( layer_ => {
      let attr_list = attrCreator(layer_, this.props.cropTypes, this.state.userType);
      layer_.setStyle({ weight: 1, color: "grey" });
      layer_.on('click', function (e) {
        if (clickedLayer) {
          clickedLayer.setStyle({ weight: 1, color: "grey" });
        }
    
        document.getElementById("grid-info").innerHTML = attr_list;
        layer_.setStyle({ weight: 1, color: "#e15b26" });
        clickedLayer = layer_
      });
      if (this.state.userType === "EDITOR") {
        layer_.bindPopup(
          null,
          {editable: true, removable: true}
        );
      }
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

  _onFeatureGroupReady = async (reactFGref, props) => {

    // populate the leaflet FeatureGroup with the geoJson layers
    if (
      reactFGref && Object.keys(this.props.LayersPayload).length > 0
    ) {
      let leafletFG = reactFGref.leafletElement;

      let leafletGeoJSON = this.props.LayersPayload

      leafletGeoJSON = new L.GeoJSON(leafletGeoJSON)
      if (!this._editableFG && !this.props.gridLayer.length) {
        leafletGeoJSON.eachLayer( layer => {
          layer.setStyle({ weight: 1, color: "grey" });
          let attr_list = attrCreator(layer, this.props.cropTypes, this.state.userType)
          layer.on('click', function (e) {
            if (clickedLayer) {
              clickedLayer.setStyle({ weight: 1, color: "grey" });
            }
            props.dispatch({
              type: GET_ALL_FIELD_DATA_INITIATED,
              payload: true
            });
            props.dispatch(getcreateputGraphData(
              {}, 'GET', layer.feature.properties.field_id,
              layer.feature.properties.CropType,
              props.cropTypes, props.LayersPayload
            ));
        
            document.getElementById("grid-info").innerHTML = attr_list;
            layer.setStyle({ weight: 1, color: "#e15b26" });
            clickedLayer = layer
          });
          if (this.state.userType === "EDITOR") {
            layer.bindPopup(
              null,
              {editable: true, removable: true}
            );
          }
          leafletFG.addLayer(layer);
        });
      }
    }
    // store the ref for future access to content
    this._editableFG = reactFGref;

    //here if the feature group is loaded, then we split the area into gridcells
    // that can then be put into a geojson variable that i can load into leaflet --- Zeus
    if (this._editableFG && !this.state.grid) {
      if (this.props.allFieldsIndicatorArray && this.props.allFieldsIndicatorArray.length > 0) {
        if (!this.myMap.current.leafletElement.hasLayer(this.state.grid)) {
          let { grid, gridCellArea } = createGrid(this)
          grid.on("click", async e => {
            this.setState({...this.state, initiateGetData: true,})
            let gridCellFields = await getFieldsInCell(e.layer.feature.properties.grid_id)
            localStorage.removeItem("gridCellFields")
            localStorage.setItem("gridCellFields", JSON.stringify(gridCellFields))
            this.setState({...this.state, initiateGetData: false,})

            let indicatorsInCell =  await getKatorsInGridCellAction(e.layer.feature.properties.grid_id)

            if (!indicatorsInCell.length) {
              if (gridCellFields && gridCellFields.length) {
                indicatorsInCell = getKatorsInCell(
                  e.layer, this.props.allFieldsIndicatorArray, new L.GeoJSON(gridCellFields)
                )
              }

              if (this.props.LayersPayload.length) {
                indicatorsInCell = getKatorsInCell(
                  e.layer, this.props.allFieldsIndicatorArray, new L.GeoJSON(this.props.LayersPayload)
                )
              }
            }
            // grid context is stil caught when cell is removed, hence the check
            // this is for accunts with more than 1000 fields
            if (indicatorsInCell.length) {
              this.props.dispatch(newkatorArr(
                indicatorsInCell, this.props.cropTypes,
                gridCellFields && gridCellFields.length ? gridCellFields : this.props.LayersPayload,
                GET_GROUP_FIELD_DATA, e.layer.feature.properties.grid_id
              ))
            }
          })

          // SCRIPT FOR SAVING GRIDS GOES HERE
          await this.setState({...this.state, grid, gridCellArea});

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


  toggleGridLayers = () => {
    if (this.state.grid._map) {
      this.myMap.current.leafletElement.removeLayer(this.state.grid);
      document.getElementById("grid-info").innerHTML = "Click on grid or field for info";
    } else if (!this.state.grid._map) {
      this.state.grid.eachLayer(layer_ => {
        if (layer_.feature.properties.count) {
          layer_.setStyle({ weight: 0.5, color: "#3388ff" });
        }
      })
      this.myMap.current.leafletElement.addLayer(this.state.grid);
    }
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
  forecastData: state.forecast.foreCastPayload,
  allFieldsIndicatorArray: state.graphs.allFieldsIndicatorArray,
  gridLayer: state.grid.gridPayload,
  katorPayload: state.grid.katorPayload,
  fieldId: state.graphs.fieldId,
  forecastFieldId: state.graphs.forecastFieldId,
  weeklyData: state.graphs.weeklyData,
  NDVIChange: state.graphs.NDVIChange,
  initiateGetWeeklyData: state.graphs.initiateGetWeeklyData,
  visitsPerDate: state.oaData.visitsPerDate,
  oafStatus: state.oaData.oafStatus,

  // passed for indicatorslinegraph
  cropType: state.graphs.cropType,
  fieldId: state.graphs.fieldId,
  allFieldData: state.graphs.allFieldData,
  field_data: state.graphs.field_data,
  groupFieldData: state.graphs.groupFieldData,
});

const matchDispatchToProps = dispatch => ({
  postPointLayer, postPolygonLayer, getSummarizedIndicatorData, getcreateputGraphData,
  deletePolygonLayer, updatePolygonLayer, getcreateputUserDetail, getWeeklyIndicators,
  dispatch
});

export default connect(
  mapStateToProps, matchDispatchToProps
)(MapView);
