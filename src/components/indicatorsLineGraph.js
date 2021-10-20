import React, {
  useState, useEffect, useRef
} from 'react';
import { connect, useDispatch } from 'react-redux';
import { Line } from 'react-chartjs-2';

import { CSVLink } from "react-csv";
import {Dropdown, DropdownButton, ButtonGroup, Button} from 'react-bootstrap';

import { months_ } from '../actions/graphActions';
import { GET_ALL_FIELD_DATA } from '../actions/types';

function IndicatorsLineGraph (props) {

  const [localState, setLocalState] = useState({
    dataset: [],
    selectedIndicator: "field_rainfall",
    indicatorObj: {
        "Rainfall": ["field_rainfall", "Precipitation (mm)"],
        "Vegetation Health": ["field_ndvi", "Vegetation Health Index (-1, 1)"],
        "Soil Moisture": ["field_ndwi", "Soil Moisture Index (-1, 1)"],
        "Ground Temperature": ["field_temperature", "Ground Temperature (°Celcius)"],
        "Evapotranspiration": ["field_evapotranspiration", "Evapotranspiration (mm)"]
    },
    displayedIndicator: "Rainfall",
    selectedCropType: "Crop Type",
    cropTypes: [],
    FieldindicatorArray: [],
    allFieldsIndicatorArray: []
  });
  const dispatch = useDispatch();
  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }
  const prevfieldId = usePrevious(props.fieldId);
  const prevSidePanelCollapsed = usePrevious(props.SidePanelCollapsed);
  const prevgroupFieldData = usePrevious(props.groupFieldData);
  const prevgrid_id = usePrevious(props.grid_id);

  useEffect(() => {
    let cropTypes = props.cropTypes
    // this isn't setting croptypes for admins
    setLocalState({
      ...localState,
      cropTypes,
      allFieldsIndicatorArray: props.allFieldsIndicatorArray,
      dataset: props.allFieldData["field_rainfall"] ?
       props.allFieldData["field_rainfall"][cropTypes[0]] : []
    })
  }, []);

  useEffect(() => {
    if (
      props.fieldId !== "" && prevfieldId !== props.fieldId
    ) {
      // block to display one field's data by uncollapsing sidepanel
      setLocalState({
        ...localState,
        dataset: props.field_data["field_rainfall"][props.cropType],
        FieldindicatorArray: props.FieldindicatorArray,
        selectedCropType: props.cropType,
        selectedIndicator: "field_rainfall",
        displayedIndicator: "Rainfall"
      })
    } else if (
      (props.fieldId === "" && !Object.keys(props.groupFieldData).length ) &&
       prevSidePanelCollapsed !== props.SidePanelCollapsed
    ) {
      // block to display all fields data by uncollapsing sidepanel
      let { cropTypes, allFieldData } = props
      setLocalState({
        ...localState,
        cropTypes,
        dataset: allFieldData["field_rainfall"] ?
         allFieldData["field_rainfall"][cropTypes[0]] : [],
        selectedCropType: cropTypes[0],
        selectedIndicator: "field_rainfall",
        displayedIndicator: "Rainfall"
      })
    } else if (
      props.grid_id !== "" && prevgrid_id !== props.grid_id
    ) {
      // block to display group field data and uncollapse sidepanel
      let { groupFieldData } = props
      let groupCrops = Object.keys(groupFieldData.field_rainfall)
      setLocalState({
        ...localState,
        dataset: props.groupFieldData["field_rainfall"] ?
         props.groupFieldData["field_rainfall"][groupCrops[0]] : [],
         FieldindicatorArray: props.FieldindicatorArray,
        selectedCropType: groupCrops[0],
        selectedIndicator: "field_rainfall",
        displayedIndicator: "Rainfall"
      })
    } else if (
      (prevfieldId !== props.fieldId && props.fieldId === "") ||
      (Object.keys(prevgroupFieldData).length &&
        !Object.keys(props.groupFieldData).length)
    ) {
      // block to display allFieldData when sidepanel ain't collapsed
      let { cropTypes, allFieldData } = props
      setLocalState({
        ...localState,
        cropTypes,
        dataset: allFieldData["field_rainfall"] ?
         allFieldData["field_rainfall"][cropTypes[0]] : [],
        selectedCropType: cropTypes[0],
        selectedIndicator: "field_rainfall",
        displayedIndicator: "Rainfall"
      })
    }
  }, [
    localState, props,
    prevSidePanelCollapsed, prevfieldId, prevgroupFieldData
  ])

  let getEvent = e => {
    if (typeof(e.currentTarget.text) === "string") {
      let { allFieldData, fieldId, field_data, groupFieldData } = props;
      let cropTypes = localState.cropTypes;
      let selectedCropType = localState.selectedCropType === "Crop Type" ?
        cropTypes[0] : localState.selectedCropType;

      if (cropTypes.includes(e.currentTarget.text)) {
        setLocalState({
          ...localState,
          dataset: fieldId === "" && !Object.keys(groupFieldData).length ?
           allFieldData[localState.selectedIndicator][e.currentTarget.text]
            :fieldId === "" && Object.keys(groupFieldData).length ?
            groupFieldData[localState.selectedIndicator][e.currentTarget.text]
            : field_data[localState.selectedIndicator][e.currentTarget.text],
          selectedCropType: e.currentTarget.text
        })
      } else {
        setLocalState({
          ...localState,
          dataset: fieldId === "" ?
           allFieldData[localState.indicatorObj[e.currentTarget.text][0]][selectedCropType]
            : field_data[localState.indicatorObj[e.currentTarget.text][0]][selectedCropType],
          selectedIndicator: localState.indicatorObj[e.currentTarget.text][0],
          displayedIndicator: e.currentTarget.text
        })
      }
    }
  }

  let {
    displayedIndicator, indicatorObj,
    selectedCropType, FieldindicatorArray, dataset, cropTypes
    } = localState;
    let { 
      groupFieldIndicatorArray, allFieldsIndicatorArray
     } = props;
  return (
    <React.Fragment>
      <style type="text/css">
      {`
      .btn-dropdown {
          background-color: #e15b26;
          color: white;
      }
      .btn-sm {
        border-color: #e15b26;
      }
      .dropdown-item {
        color: inherit !important;
      }
      .dropdown-item.active, .dropdown-item:active {
          color: #fff;
          text-decoration: none;
          background-color: #e15b26;
      }
      #indicator_download_button {
        border-color: #e15b26;
      }
      a {
        color: white;
      }
      a:hover {
        color: black;
        text-decoration: none;
      }
      .btn:focus,.btn:active {
        outline: none !important;
        box-shadow: none;
      }
      #indicator_download_button_words {
        color: black;
      }
      `}
      </style>
      <br />&nbsp;<DropdownButton
      size="sm"
      variant="outline-dropdown"
      className="mr-1"
      id="dropdown-basic-button"
      title={displayedIndicator}
      as={ButtonGroup}
      >
        {Object.keys(indicatorObj).map(obj_ => 
            <Dropdown.Item key={obj_} eventKey={obj_} onClick={getEvent}>
                {obj_}
            </Dropdown.Item>
        )}
      </DropdownButton>
      {' '}
      <DropdownButton
      size="sm"
      variant="outline-dropdown"
      id="dropdown-basic-button"
      title={props.fieldId === "" ? selectedCropType : props.cropType}
      as={ButtonGroup}
      >
        {/* NOTE: this should remain as getting from redux state because actual
        croptypes are not yet gotten from the backend by the time component is mounted...hehe. mounted. */}
        {
          props.fieldId === "" &&
          Object.keys(props.groupFieldData).length ?
          Object.keys(props.groupFieldData.field_rainfall).map(type_ => 
              <Dropdown.Item key={type_} eventKey={type_} onClick={getEvent}>
                  {type_}
              </Dropdown.Item>
          ) :
            props.fieldId === "" &&
            !Object.keys(props.groupFieldData).length ? cropTypes.map(type_ => 
              <Dropdown.Item key={type_} eventKey={type_} onClick={getEvent}>
                  {type_}
              </Dropdown.Item>
          ) : ""
        }
      </DropdownButton>
      {' '}
      <Button id="indicator_download_button" size="sm" variant="outline-primary">
        <CSVLink
        // if indicatorsArray is undefined will return an error,
        // so need to check for it
          data={
            props.fieldId ?
            FieldindicatorArray ? FieldindicatorArray : []
              :
            Object.keys(props.groupFieldData).length ?
            groupFieldIndicatorArray :
            allFieldsIndicatorArray
          }
          target="_blank"
          id="indicator_download_button_words"
          style={{"textDecoration": "none"}}
          filename={
            props.fieldId ?
            `${props.fieldId}_indicators_data.csv` : "indicators_data.csv"
          }
        >
        Download Data
        </CSVLink>
      </Button>
      {' '}
      {
        props.fieldId || props.grid_id ?
        <Button
          size="sm" variant="outline-primary"
          style={{color: "black"}}
          onClick={
            () => dispatch({
                type: GET_ALL_FIELD_DATA,
                payload: {
                  data_: props.allFieldData, collapsed: false,
                  allFieldsIndicatorArray: props.allFieldsIndicatorArray
                }
            })
          }
        >
          All fields
        </Button> : null
      }
      <br/><br/>
      <Line
        data={
            {
                "labels": months_.map(
                  mth => mth[0].toUpperCase() + mth.slice(1,3)
                ),
                "datasets": [{
                    "label": indicatorObj[displayedIndicator][1],
                    "data": dataset,
                    "fill": false,
                    "borderColor": "rgb(75, 192, 192)",
                    "lineTension": 0.1 
                }]
            }
        }
        options={{
          title: {
              display: true,
              position: "top",
              fontSize: 18,
              fontStyle: "normal",
              text: `${
                props.fieldId ? "Field Identifier: " + props.fieldId :
                Object.keys(props.groupFieldData).length ?
                // division of 4 is because there are 4 indicators
                  `Indicator Chart for ${
                  (props.groupFieldIndicatorArray.length - 1) / 4
                  } fields` : "All fields"
              }`
          },
            legend: {
                display: true,
                position: "bottom",
            },
            scales: {
                yAxes: [{
                  scaleLabel: {
                    display: true,
                    labelString: indicatorObj[displayedIndicator][1]
                  }
                }],
                xAxes: [{
                  scaleLabel: {
                    display: false,
                    labelString: "months"
                  }
                }],
              }
        }}
      />
    </React.Fragment>
  )
}

const mapStateToProps = state => ({
  FieldindicatorArray: state.graphs.FieldindicatorArray,
  allFieldData: state.graphs.allFieldData,
  allFieldsIndicatorArray: state.graphs.allFieldsIndicatorArray,
  groupFieldIndicatorArray: state.graphs.groupFieldIndicatorArray,
  field_data: state.graphs.field_data,
  groupFieldData: state.graphs.groupFieldData,
  fieldId: state.graphs.fieldId,
  cropType: state.graphs.cropType,
  grid_id: state.graphs.grid_id,
  cropTypes: state.layers.cropTypes,
  LayersPayload: state.layers.LayersPayload,
  katorPayload: state.grid.katorPayload
});


export default connect(mapStateToProps)(IndicatorsLineGraph);
