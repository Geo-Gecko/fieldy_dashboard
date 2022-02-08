import React, {
  useState, useEffect, useRef
} from 'react';
import { connect, useDispatch } from 'react-redux';
import { Line } from 'react-chartjs-2';

import { CSVLink } from "react-csv";
import {Dropdown, DropdownButton, ButtonGroup, Button} from 'react-bootstrap';

import { months_ } from '../actions/graphActions';
import { GET_ALL_FIELD_DATA } from '../actions/types';

function NdviPerformanceLineGraph (props) {

  const [localState, setLocalState] = useState({
    dataset: [],
    selectedIndicator: "field_ndvi",
    indicatorObj: {
        "Vegetation Health": ["field_ndvi", "Vegetation Health Index (-1, 1)"]
    },
    displayedIndicator: "Vegetation Health",
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
      dataset: props.allFieldData["field_ndvi"] ?
       props.allFieldData["field_ndvi"][cropTypes[0]] : []
    })
  }, []);

  useEffect(() => {
    if (
      props.fieldId !== "" && prevfieldId !== props.fieldId
    ) {
      // block to display one field's data by uncollapsing sidepanel
      setLocalState({
        ...localState,
        dataset: props.field_data["field_ndvi"][props.cropType],
        FieldindicatorArray: props.FieldindicatorArray,
        selectedCropType: props.cropType,
        selectedIndicator: "field_ndvi",
        displayedIndicator: "Vegetation Health"
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
        dataset: allFieldData["field_ndvi"] ?
         allFieldData["field_ndvi"][cropTypes[0]] : [],
        selectedCropType: cropTypes[0],
        selectedIndicator: "field_ndvi",
        displayedIndicator: "Vegetation Health"
      })
    } else if (
      props.grid_id !== "" && prevgrid_id !== props.grid_id
    ) {
      // block to display group field data and uncollapse sidepanel
      let { groupFieldData } = props
      let groupCrops = Object.keys(groupFieldData.field_ndvi)
      setLocalState({
        ...localState,
        dataset: props.groupFieldData["field_ndvi"] ?
         props.groupFieldData["field_ndvi"][groupCrops[0]] : [],
         FieldindicatorArray: props.FieldindicatorArray,
        selectedCropType: groupCrops[0],
        selectedIndicator: "field_ndvi",
        displayedIndicator: "Vegetation Health"
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
        dataset: allFieldData["field_ndvi"] ?
         allFieldData["field_ndvi"][cropTypes[0]] : [],
        selectedCropType: cropTypes[0],
        selectedIndicator: "field_ndvi",
        displayedIndicator: "Vegetation Health"
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
         {/* NOTE: this should remain as getting from redux state because actual
        croptypes are not yet gotten from the backend by the time component is mounted...hehe. mounted. */}
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

              //   "datasets": [{
              //     "label": "Monthly goal reached",
              //     backgroundColor: "green",
              //     data: dataset.map(function(value) {
              //           return value >= 1.0 ? value : null
              //         }),
              //   },
              //   {
              //     "label": "Monthly goal not reached",
              //     backgroundColor: "red",
              //     data: dataset.map(function(value) {
              //       return value < 1.0 ? value : null
              //     }),
              //   }
              // ]


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


export default connect(mapStateToProps)(NdviPerformanceLineGraph);
