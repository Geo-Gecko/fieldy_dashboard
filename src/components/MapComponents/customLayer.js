import React, { Component } from 'react';
import { withLeaflet, useLeaflet } from "react-leaflet";
import * as WMS from "leaflet.wms";
// import * as WMS from "./CustomLeafletWMS/leaflet.wms/src/leaflet.wms"
// import $ from "jquery";

// function MySource() {
//     return WMS.Source.extend({
//         'ajax': function (url, callback) {
//             $.ajax(url, {
//                 'context': this,
//                 'success': function(result) {
//                     callback.call(this, result);
//                  }
//             });
//         }
//     })
// }

// function MySource() {
//     return L.WMS.Source.extend({
//         '_ajax': function (url, callback) {
//             $.ajax(url, {
//                 'context': this,
//                 'success': function (result) {
//                     callback.call(this, result);
//                 }
//             });
//         }
//     });
// }
// var MySource = WMS.source.extend({});

let prevSelectedWiderArea;

function CustomWMSLayer(localState, map, widerAreaLayer, setWiderAreaLayer) {

    // let url = process.env.GEOSERVER_URL;
    let url = "http://geogecko.gis-cdn.net/geoserver/fieldy_data/wms"
    // console.log(process.env.GEOSERVER_URL, process.env.REACT_APP_SH_BACKEND_URL)
    let layers = ["fieldy_data:kenya_HT_grid"];
    let options = {
        "transparent" : "true", "format": "image/png",
        "attribution": "GeoGecko", "styles":
        localState["Wider Area Landcover"] ? "fieldy_lc" :
        localState["Wider Area Elevation"] ? "fieldy_elevation" :
        localState["Wider Area Slope"] ? "fieldy_slope" :
        localState["Wider Area Fertility"] ? "fieldy_fcc" : ""
    }
    // Add WMS source/layers
    const source = WMS.source(
        url,
        options
    );

    for (let name of layers) {
        let layer_;

        if (!widerAreaLayer) {
            layer_ = source.getLayer(name)
            setWiderAreaLayer(layer_)
        } 

        if (!prevSelectedWiderArea) {
            prevSelectedWiderArea = Object.keys(localState).filter(
                key_ => key_.includes("Wider Area") && localState[key_] ? key_ : ""
            )[0]
        } else {
            let newSelectedWiderArea = Object.keys(localState).filter(
                key_ => key_.includes("Wider Area") && localState[key_] ? key_ : ""
            )[0]
            if (newSelectedWiderArea !== prevSelectedWiderArea) {

                prevSelectedWiderArea = newSelectedWiderArea
                map.current.leafletElement.removeLayer(widerAreaLayer)
                layer_ = source.getLayer(name)
                setWiderAreaLayer(layer_)
            } else {
                layer_ = widerAreaLayer
            }
        }

        layer_.addTo(map.current.leafletElement)
        // NOTE: For multiple layers, would look like this below. Would need to specify widerAreaLayer array length so they can be replaced
        // setWiderAreaLayer(prevState => [...prevState, source.getLayer(name).addTo(map)])
    }


    return null;
}

export default CustomWMSLayer;
