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

function CustomWMSLayer(url, options, layers, map, widerAreaLayer, setWiderAreaLayer) {


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
        } else {
            layer_ = widerAreaLayer
        }
        layer_.addTo(map.current.leafletElement)
        // NOTE: For multiple layers, would look like this below. Would need to specify widerAreaLayer array length so they can be replaced
        // setWiderAreaLayer(prevState => [...prevState, source.getLayer(name).addTo(map)])
    }


    return null;
}

export default CustomWMSLayer;
