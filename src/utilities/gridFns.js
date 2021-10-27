
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';

import { months_ } from '../actions/graphActions';

let clickedGrid;

export function inside(point, vs) {
  // ray-casting algorithm based on
  // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

  var x = point[0], y = point[1];

  var inside = false;
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    var xi = vs[i][0], yi = vs[i][1];
    var xj = vs[j][0], yj = vs[j][1];

    var intersect = ((yi > y) !== (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
};

export const colorGrid = (grid, gridIndicator) => {

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
      fillColor: color(
        gridIndicator === "count" ? layer.feature.properties[gridIndicator] :
          layer.feature.properties.field_attributes.grid_summary[gridIndicator][0]
      ),
      weight: 0.3,
      //stroke-width: to have a constant width on the screen need to adapt with scale
      opacity: layer.feature.properties.count > 0 ? 1 : 0,
      // color: ,
      // dashArray: '3',
      fillOpacity: layer.feature.properties.count > 0 ? 0.4 : 0
    })

  })
}

export const bindGridPopup = (
  layer, fieldCount, grid_summary, cropTypes=[], userType="", LayersPayload={}
) => {
  let gridInfo =
    `
    <strong>Field Count: </strong><small> ${fieldCount} </small> <br/><br/>

    Summary of values for ${months_[months_.length - 1]};<br/>
    <strong>Avg Crop Health: </strong><small> ${grid_summary["field_ndvi"][0].toFixed(2)} </small> <br/>
    <strong>Avg Soil Moisture: </strong><small> ${grid_summary["field_ndwi"][0].toFixed(2)} </small> <br/>
    <strong>Avg Precipitation: </strong><small> ${grid_summary["field_rainfall"][0].toFixed(2)} </small> <br/>
    <strong>Avg Ground Temperature: </strong><small> ${grid_summary["field_temperature"][0].toFixed(2)} </small> <br/>
    ${
      grid_summary["field_evapotranspiration"] ?
      `<strong>Avg Evapotranspiration: </strong><small> ${grid_summary["field_evapotranspiration"][0].toFixed(2)} </small>`
      : "" }
    
    
    ${fieldCount > 1 ?
      `<br/><br/><strong>Min, Max Crop Health: </strong><small> ${grid_summary["field_ndvi"][1].toFixed(2)}, ${grid_summary["field_ndvi"][2].toFixed(2)} </small> <br/>
    <strong>Min, Max Soil Moisture: </strong><small> ${grid_summary["field_ndwi"][1].toFixed(2)}, ${grid_summary["field_ndwi"][2].toFixed(2)} </small> <br/>
    <strong>Min, Max Precipitation: </strong><small> ${grid_summary["field_rainfall"][1].toFixed(2)}, ${grid_summary["field_rainfall"][2].toFixed(2)} </small> <br/>`
      : `<br/>`}
    
    `
  layer.on('click', function (e) {
    if (clickedGrid) {
      clickedGrid.setStyle({ weight: 0.5, color: "#3388ff" });
    }

    document.getElementById("grid-info").innerHTML = gridInfo;
    layer.setStyle({ weight: 4, color: "#e15b26" });
    clickedGrid = layer
  });
  if (Object.keys(LayersPayload).length) {
    layer.bindPopup(
      "",
      {removable: true, cropTypes, userType, LayersPayload}
    )
  }
}
