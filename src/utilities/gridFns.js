
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

  let minMaxKators = {
    "field_rainfall": [], "field_ndvi": [],
    "field_ndwi": [], "field_temperature": [],
    "field_evapotranspiration": [], "count": []
  }
  grid.eachLayer(layer => {
    if (layer.feature.properties.count && gridIndicator !== "count") {
      Object.entries(
        layer.feature.properties.field_attributes.grid_summary
      ).forEach(([attr_, attrArr]) => {
        minMaxKators[attr_].push(
          parseFloat(attrArr[0]) < 1 ? parseFloat(attrArr[0]) * 100 :
          parseFloat(attrArr[0])
        )
      })
    } else if ((layer.feature.properties.count && gridIndicator === "count")) {
      minMaxKators["count"].push(layer.feature.properties.count)
    }
  })
  Object.keys(minMaxKators).forEach(attr_ => {
    minMaxKators[attr_].sort((el1, el2) => {
      if (el1 < el2) {
        return -1
      }
      if (el1 > el2) {
        return 1
      }
      return 0
    })
    // negative values cause rgb(0,0,0)
    minMaxKators[attr_] = minMaxKators[attr_].filter(el => el > 0)
  })


  const thresholds = ((minScale, maxScale) => {
    return d3Array
      .range(minScale, maxScale)
  })(
    minMaxKators[gridIndicator][0],
    minMaxKators[gridIndicator][minMaxKators[gridIndicator].length - 1]
  )

  const colorShemes = {
    "count": d3ScaleChromatic.interpolateYlGn,
    "field_ndvi": d3ScaleChromatic.interpolateYlGn,
    "field_ndwi": d3ScaleChromatic.interpolateBlues,
    "field_rainfall": d3ScaleChromatic.interpolateBlues,
    "field_temperature": d3ScaleChromatic.interpolateReds,
    "field_evapotranspiration": d3ScaleChromatic.interpolateBlues
  }
  const color = d3Scale
    .scaleLog()
    .domain(d3Array.extent(thresholds))
    .interpolate(() => colorShemes[gridIndicator]);

  grid.eachLayer(layer => {
    //grid style per gridcell depending on factors, for now just visibility of a cell.
    let colorArg;
    if (layer.feature.properties.field_attributes) {
      if (gridIndicator !== "count") {
        // NOTICE: BUG!!! If "show fields" is clicked, error will occur hear because fields are part of
        // the grid layers. So going to check if there is field_attributes.
        // which if you recall, was supposed to change to grid_attributes. smh. -- 16/03/2022
        colorArg = layer.feature.properties.field_attributes.grid_summary[gridIndicator][0]
        colorArg = colorArg < 1 ? colorArg * 100 : colorArg
      }
      layer.setStyle({
        // the fillColor is adapted from a property which can be changed by the user (segment)
        fillColor: color(
          gridIndicator === "count" ?
            layer.feature.properties[gridIndicator] : colorArg
        ),
        weight: 0.3,
        //stroke-width: to have a constant width on the screen need to adapt with scale
        opacity: layer.feature.properties.count > 0 ? 1 : 0,
        fillOpacity: layer.feature.properties.count > 0 ? 0.4 : 0
      })
    }
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
