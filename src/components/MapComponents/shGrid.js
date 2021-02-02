import L from 'leaflet';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';



let maxCount = 0;

function inside(point, vs) {
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

let createGrid = (_editableFG, myMap, coordinates) => {
  let bounds = _editableFG.leafletElement.getBounds();
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

  let grid = {
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

  if (myMap.current && myMap.current.leafletElement) {

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
    myMap.current.leafletElement.addLayer(grid);
    //this removes the grid when the user zooms in past zoom level 11
    myMap.current.leafletElement.on('moveend', () => {
      if (myMap.current.leafletElement.getZoom() > 10) {
        myMap.current.leafletElement.removeLayer(grid)
      }
    })
  }
  return grid;
}

export default createGrid;
