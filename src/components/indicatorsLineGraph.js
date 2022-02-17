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

  let {
    lineGraphState, setLineGraphState,
    groupFieldIndicatorArray, allFieldsIndicatorArray, indicatorObj
  } = props;

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
    setLineGraphState({
      ...lineGraphState,
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
      setLineGraphState({
        ...lineGraphState,
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
      setLineGraphState({
        ...lineGraphState,
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
      setLineGraphState({
        ...lineGraphState,
        dataset: props.groupFieldData["field_rainfall"] ?
         props.groupFieldData["field_rainfall"][groupCrops[0]] : [],
         FieldindicatorArray: props.FieldindicatorArray,
        selectedCropType: groupCrops[0],
        selectedIndicator: "field_rainfall",
        displayedIndicator: "Rainfall"
      })
    } else if (
      (prevfieldId !== props.fieldId && props.fieldId === "") ||
      prevgroupFieldData && (Object.keys(prevgroupFieldData).length &&
        !Object.keys(props.groupFieldData).length)
    ) {
      // block to display allFieldData when sidepanel ain't collapsed
      let { cropTypes, allFieldData } = props
      setLineGraphState({
        ...lineGraphState,
        cropTypes,
        dataset: allFieldData["field_rainfall"] ?
         allFieldData["field_rainfall"][cropTypes[0]] : [],
        selectedCropType: cropTypes[0],
        selectedIndicator: "field_rainfall",
        displayedIndicator: "Rainfall"
      })
    }
  }, [
    lineGraphState, props,
    prevSidePanelCollapsed, prevfieldId, prevgroupFieldData
  ])


  let {
    displayedIndicator, selectedCropType, FieldindicatorArray, dataset, cropTypes
    } = lineGraphState;
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
      {/* 
      <DropdownButton
      size="sm"
      variant="outline-dropdown"
      id="dropdown-basic-button"
      title={props.fieldId === "" ? selectedCropType : props.cropType}
      as={ButtonGroup}
      >
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
      </DropdownButton> */}
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
                    "label": lineGraphState.indicatorObj[displayedIndicator][1],
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
                    labelString: lineGraphState.indicatorObj[displayedIndicator][1]
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
  grid_id: state.graphs.grid_id
});


export default connect(mapStateToProps)(IndicatorsLineGraph);
