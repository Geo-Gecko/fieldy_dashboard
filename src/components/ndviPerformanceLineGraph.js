import React, {
  useState, useEffect, useRef
} from 'react';
import { connect, useDispatch } from 'react-redux';
import { Bar } from 'react-chartjs-2';

import { CSVLink } from "react-csv";
import {Dropdown, DropdownButton, ButtonGroup, Button} from 'react-bootstrap';

import { getNdviChange, months_ } from '../actions/graphActions';
import { GET_ALL_FIELD_DATA } from '../actions/types';

function NdviPerformanceLineGraph (props) {

  const [localState, setLocalState] = useState({ dataset: [], currentFieldId: "" });
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
  const prevNDVIChange = usePrevious(props.NDVIChange);

  useEffect(() => {
    dispatch(getNdviChange("february"))
    if (props.NDVIChange.length) {
      let firstFieldId = props.NDVIChange[0].field_id
      setLocalState({
        ...localState,
        currentFieldId: firstFieldId,
        dataset: props.NDVIChange.filter(row_ => row_.field_id === firstFieldId)
      })
    } 
  }, [props.NDVIChange.length]);

  useEffect(() => {
    if (prevfieldId !== props.fieldId) {
      // block to display one field's data by uncollapsing sidepanel
      setLocalState({
        ...localState,
        currentFieldId: props.fieldId,
        dataset: props.NDVIChange.filter(row_ => row_.field_id === props.fieldId)
      })
    }
  }, [
    localState, props, prevfieldId
  ])

  let { dataset, currentFieldId } = localState;
  // note: why are the values repeated
  let ndviCvalues = [
    ...new Set(dataset.flatMap(Object.values))
  ].slice(1).reverse()
  let ndviClabels = [
    ...new Set(dataset.flatMap(Object.keys))
  ].slice(1).reverse().map(row_ => row_.split(" - ")[1])

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
      <div style={{"padding": "10px"}}>
        <h6>Vegetation Health Difference</h6>
      </div>
      {' '}
      <Button id="indicator_download_button" size="sm" variant="outline-primary">
        <CSVLink
        // if indicatorsArray is undefined will return an error,
        // so need to check for it
          data={dataset}
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
      <br/><br/>
         {/* NOTE: this should remain as getting from redux state because actual
        croptypes are not yet gotten from the backend by the time component is mounted...hehe. mounted. */}
      <Bar
        data={
            {
                "labels": ndviClabels,
                "datasets": [{
                    "label": "Days",
                    "data": ndviCvalues,
                    "fill": false,
                    "backgroundColor": "#e15b26",
                    "borderColor": "#e15b26",
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
              text: `Indicator Chart for ${currentFieldId}`
          },
            legend: {
                display: true,
                position: "bottom",
            },
            scales: {
                // yAxes: [{
                //   scaleLabel: {
                //     display: true,
                //     labelString: indicatorObj[displayedIndicator][1]
                //   }
                // }],
                xAxes: [{
                  type: 'time',
                  time: {
                      unit: 'day',
                      displayFormats: {
                          day: 'DD-MM'
                      }
                  }  
                  // scaleLabel: {
                  //   display: false,
                  //   labelString: "months"
                  // }
                }],
              }
        }}
      />
    </React.Fragment>
  )
}

const mapStateToProps = state => ({
  ex_: state.graphs,
  fieldId: state.graphs.fieldId,
  NDVIChange: state.graphs.NDVIChange
});


export default connect(mapStateToProps)(NdviPerformanceLineGraph);
