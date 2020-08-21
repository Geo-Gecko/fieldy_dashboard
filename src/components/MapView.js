import React, { Component, createRef } from 'react';
import { Map, TileLayer, Circle, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-editable'
import ReactLeafletEditable from 'react-leaflet-editable';
import { Sidebar, Tab } from 'react-leaflet-sidebarv2';

import ndviLineGraph from './ndvi';
import ndwiLineGraph from './ndwi';

import 'leaflet-draw/dist/leaflet.draw';
import 'leaflet-toolbar/dist/leaflet.toolbar-src';

import 'leaflet-wfst/dist/leaflet-wfst.src';

import 'leaflet/dist/leaflet.css';
import 'leaflet-toolbar/dist/leaflet.toolbar.css';
import 'font-awesome/css/font-awesome.css';
import './leaflet-sidebar.min.css'


L.DeletePopup = L.Toolbar2.Action.extend({
    options: {
      toolbarIcon: {className: 'fa fa-lg fa-trash'}
    },
  
    initialize: function (map, shape, options) {
      this._map = map;
      this._layer = shape;
  
      L.Toolbar2.Action.prototype.initialize.call(this, map, options);
    },
  
    addHooks: function () {
      this._map.removeLayer(this._layer);
      this._map.removeLayer(this.toolbar);
      this._map.fire('editable:delete', {layer: this._layer});
    }
  });
  
  L.EditPopup = L.Toolbar2.Action.extend({
    options: {
      toolbarIcon: {className: 'fa fa-lg fa-edit'}
    },
  
    initialize: function (map, shape, options) {
      this._map = map;
      this._layer = shape;
  
      L.Toolbar2.Action.prototype.initialize.call(this, map, options);
    },
  
    enable: function () {
      var map = this._map,
        layer = this._layer;
  
      layer.enableEdit();
      map.removeLayer(this.toolbar);
  
      map.once('click', function () {
        layer.disableEdit();
      });
    }
  });
  
  L.EditPopupToolbar = L.Toolbar2.Popup.extend({
    options: {
      actions: [
        L.EditPopup,
        L.DeletePopup
      ]
    },
  
    onAdd: function (map) {
      var shape = this._arguments[1];
  
      if (shape instanceof L.Marker) {
        /* Adjust the toolbar position so that it doesn't cover the marker. */
        this.options.anchor = L.point(shape.options.icon.options.popupAnchor);
      }
      var that = this;
      map.once('click', function () {
        map.removeLayer(that);
      });
  
      L.Toolbar2.Popup.prototype.onAdd.call(this, map);
    }
  });
  

class MapView extends Component {
    constructor(props) {
        super(props);
        this.editRef = createRef();
        this.mapRef = createRef();
        this.state = {
            currentLocation: { lat: 1.46, lng: 32.40 },
            zoom: 7,
            collapsed: false,
            selected: 'ndvi'
        }
    }

    onClose() {
      this.setState({
        ...this.state,
        collapsed: true 
      });
    }
    onOpen(id) {
      this.setState({
        ...this.state,
        collapsed: false,
        selected: id
      });
    }

    _onFeatureGroupReady () {
        let map = this.mapRef.current.state.map
        let leafletWFST = new L.WFST({
            url: 'http://geogecko.gis-cdn.net/geoserver/ows',
            typeNS: 'shp_test',
            typeName: 'fields_shp_test',
            crs: L.CRS.EPSG4326,
            geometryField: 'geom',
            forceMulti: true,
            style: {
                color: 'green',
                weight: 2
            }
        })
        // }, new L.Format.GeoJSON({ crs: L.CRS.EPSG4326 }))
            .addTo(map)
            .once('load', function (e) {
                // leafletWFST.enableEdit();
                // map.fitBounds(leafletWFST);
            });

        new L.Toolbar2.Control({
            position: 'topright',
            actions: [
                L.Toolbar2.Action.extend({
                    options: {
                        toolbarIcon: {
                            className: 'fa fa-lg fa-square'
                        }
                    },
                    addHooks: function () {
                        map.editTools.startPolygon();
                    }
                }),
                L.Toolbar2.Action.extend({
                    options: {
                        toolbarIcon: {
                            className: 'fa fa-lg fa-save'
                        }
                    },
                    addHooks: function () {
                        leafletWFST.save();
                    }
                })
            ]
        }).addTo(map);

        leafletWFST.on('click', function (event) {
            new L.EditPopupToolbar(event.latlng).addTo(map, event.layer);
        });

        map.on('editable:created', function (e) {
            leafletWFST.addLayer(e.layer);
        });

        map.on('editable:editing', function (e) {
            leafletWFST.editLayer(e.layer);
        });

        map.on('editable:delete', function (e) {
            leafletWFST.removeLayer(e.layer);
        });
    }

    // render method is defined as the last method
    // in most use cases
    render() {
      const { currentLocation, zoom } = this.state;

      return (
          <ReactLeafletEditable ref={this.mapRef}>
              <Sidebar
                id="sidebar"
                collapsed={this.state.collapsed}
                selected={this.state.selected}
                onOpen={(id) => this.onOpen(id)}
                onClose={() => this.onClose()}
              >
                <Tab id="ndvi" header="NDVI" icon="fa fa-leaf">
                  <p>NDVI GRAPH</p>
                  {ndviLineGraph()}
                </Tab>
                <Tab id="ndwi" header="NDWI" icon="fa fa-tint">
                  <p>NDWI GRAPH</p>
                   {ndwiLineGraph()}
                </Tab>
                <Tab id="settings" header="Settings" icon="fa fa-cog" anchor="bottom">
                  <p>Settings dialogue.</p>
                </Tab>
              </Sidebar>
              <Map
              zoomControl={false}
              center={currentLocation} 
              zoom={zoom} 
              ref={this.mapRef} 
              editable={true}
              >
                  <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                  />
                  <FeatureGroup ref={() => this._onFeatureGroupReady()}>
                  </FeatureGroup>
              </Map>
          </ReactLeafletEditable>
      );
  }
}

export default MapView;
