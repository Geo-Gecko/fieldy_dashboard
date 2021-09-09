import L from 'leaflet';

import { v4 as uuidv4 } from 'uuid';

import { months_ } from '../../actions/graphActions';
import { inside, colorGrid, bindGridPopup } from '../../utilities/gridFns';

let maxCount = 0;

let createGrid = mapViewInst => {
  let { _editableFG, myMap } = mapViewInst
  let { LayersPayload, allFieldsIndicatorArray, cropTypes } = mapViewInst.props
  let savedGrid = mapViewInst.props.gridLayer

  if (savedGrid.length) {

    savedGrid.forEach(gridLayer => {
      gridLayer.properties.grid_id = uuidv4();
      try{
        gridLayer.properties.field_attributes.grid_summary =
          JSON.parse(
            gridLayer.properties.field_attributes.grid_summary
          )
      } catch (e) {
        if (e instanceof SyntaxError) {
          // console.log(gridLayer)
        }
      }
    })
    let grid = new L.GeoJSON(savedGrid);
    let gridCellArea = L.GeometryUtil.geodesicArea(
      savedGrid[0].geometry.coordinates[0].map(x => new L.latLng([...x].reverse()))
    ) / 1000000
    gridCellArea = gridCellArea.toFixed(2)
    
    grid.eachLayer(layer => {
      let fieldCount = layer.feature.properties.count
      if (fieldCount > 0) {
        bindGridPopup(
          layer, fieldCount,
          layer.feature.properties.field_attributes.grid_summary,
          cropTypes, mapViewInst.state.userType, LayersPayload
        )
      }
    })
    colorGrid(grid)

    return {grid, gridCellArea };

  } else {

  let prevMonth = months_[months_.length - 1]
  let neededMonth = allFieldsIndicatorArray[0].indexOf(prevMonth)
  let bounds = _editableFG.leafletElement.getBounds();
  LayersPayload = new L.GeoJSON(LayersPayload)
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
          grid_id: uuidv4()
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
  let gridCellArea = L.GeometryUtil.geodesicArea(
    grid.features[0].geometry.coordinates[0].map(x => new L.latLng([...x].reverse()))
  ) / 1000000
  gridCellArea = gridCellArea.toFixed(2)

  grid = new L.GeoJSON(grid);

  //loop through the grid cells here to attach information summarised elsewhere --- Zeus
  grid.eachLayer(layer => {
    let poly = [
      [layer.getLatLngs()[0][0].lat, layer.getLatLngs()[0][0].lng],
      [layer.getLatLngs()[0][1].lat, layer.getLatLngs()[0][1].lng],
      [layer.getLatLngs()[0][2].lat, layer.getLatLngs()[0][2].lng],
      [layer.getLatLngs()[0][3].lat, layer.getLatLngs()[0][3].lng]
    ]
    let fieldCount = 0;
    // calcualtes the number (COUNT) of centroids that fall within each polygon
    // (I wish to be able to remove from the array as they are found,
    // but i dont want to spent too much time on that.) --- Zeus
    let grid_summary = {
      // first element in array is for average, second is for lowest value,
      // third is the max value
      "field_ndvi": [0, 0, 0],
      "field_ndwi": [0, 0, 0],
      "field_rainfall": [0, 0, 0],
      "field_temperature": [0, 0, 0],
      "field_evapotranspiration": [0, 0, 0]
    }

    LayersPayload.eachLayer(fieldLayer => {

      let layerLatLng = fieldLayer.getBounds().getCenter()
      if (inside([layerLatLng.lat, layerLatLng.lng], poly)) {
        fieldCount++
        let fieldId = fieldLayer.feature.properties.field_id
        Object.keys(grid_summary).forEach(key => {
          let fieldArray = allFieldsIndicatorArray.find(
            fieldArr => fieldArr[0] === fieldId && fieldArr[1] === key
          )
          if (fieldArray) {
            let indicatorValue = fieldArray[neededMonth]
            grid_summary[key][0] += indicatorValue
            if (indicatorValue && grid_summary[key][1] === 0 && grid_summary[key][2] === 0) {
              grid_summary[key][1] = indicatorValue
              grid_summary[key][2] = indicatorValue
            } else if (indicatorValue && grid_summary[key][1] > indicatorValue) {
              grid_summary[key][1] = indicatorValue
            } else if (indicatorValue && grid_summary[key][2] < indicatorValue) {
              grid_summary[key][2] = indicatorValue
            }
          }

        })
      }
    })

    Object.keys(grid_summary).forEach(key => {
      grid_summary[key][0] = grid_summary[key][0] / fieldCount
      if (key === "field_temperature") {
        grid_summary[key][0] = grid_summary[key][0] - 273.15
        grid_summary[key][1] = grid_summary[key][1] - 273.15
        grid_summary[key][2] = grid_summary[key][2] - 273.15
      }
    })

    layer.feature.properties.count = fieldCount;
    layer.feature.properties.field_attributes = {grid_summary: JSON.stringify(grid_summary)}
    //bind a popup for now just showing the count of the features per grid cell
    if (fieldCount > 0) {
      bindGridPopup(layer, fieldCount, grid_summary)
    }

    maxCount = fieldCount > maxCount ? fieldCount : maxCount;


  });

  colorGrid(grid);

  if (myMap.current && myMap.current.leafletElement) {
    //this removes the grid when the user zooms in past zoom level 11
    myMap.current.leafletElement.on('moveend', () => {
      if (myMap.current.leafletElement.getZoom() > 10) {
        myMap.current.leafletElement.removeLayer(grid)
        document.getElementById("grid-info").innerHTML = "Click on grid or field for info";
      }
    })
  }
  return { grid, gridCellArea };
  }
}

export default createGrid;
