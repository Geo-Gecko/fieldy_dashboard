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

function CustomWMSLayer(props) {
    const { url, options, layers } = props;
    const ctx = useLeaflet()
    const map = ctx.map;


    // Add WMS source/layers
    const source = WMS.source(
        url,
        options
    );

    // console.log(layers)
    for (let name of layers) {
        source.getLayer(name).addTo(map)
    }


    return null;
}

export default CustomWMSLayer;