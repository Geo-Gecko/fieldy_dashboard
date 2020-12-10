import React from 'react';
import { connect } from 'react-redux';
import { Line } from 'react-chartjs-2';

import { CSVLink } from "react-csv";
import {Dropdown, DropdownButton, ButtonGroup, Button} from 'react-bootstrap';

import getcreateputGraphData, { months_ } from '../actions/graphActions';
import { getPolygonLayers } from '../actions/layerActions';

class IndicatorsLineGraph extends React.Component {
  constructor() {
    super();
    this.state = {
        dataset: [],
        selectedIndicator: "field_rainfall",
        indicatorObj: {
            "Rainfall": "field_rainfall",
            "Vegetation Health": "field_ndvi",
            "Soil Moisture": "field_ndwi",
            "Ground Temperature": "field_temperature"
        },
        displayedIndicator: "Rainfall",
        selectedCropType: "Crop Type",
        cropTypes: [],
        FieldindicatorArray: [],
        allFieldsIndicatorArray: []
    }
  }

  async componentDidMount() {
    // this is being called twice and needs to be changed.
    let leafletGeoJSON = await this.props.getPolygonLayers();
    localStorage.setItem("featuregroup", JSON.stringify(leafletGeoJSON))
    await this.props.dispatch(getcreateputGraphData(
      {}, 'GET', ""
    ))
    let cropTypes = JSON.parse(localStorage.getItem("cropTypes"))
    // this isn't setting croptypes for admins
    this.setState({
      ...this.state,
      cropTypes,
      allFieldsIndicatorArray: this.props.allFieldsIndicatorArray,
      dataset: this.props.allFieldData["field_rainfall"][cropTypes[0]]
    })
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.fieldId !== "" && prevProps.fieldId !== this.props.fieldId
    ) {
      this.setState({
        ...this.state,
        dataset: this.props.field_data["field_rainfall"][this.props.cropType],
        FieldindicatorArray: this.props.FieldindicatorArray,
        selectedCropType: this.props.cropType,
        selectedIndicator: "field_rainfall"
      })
    } else if (
      this.props.fieldId === "" &&
       prevProps.SidePanelCollapsed !== this.props.SidePanelCollapsed
    ) {
      let cropTypes = JSON.parse(localStorage.getItem('cropTypes'))
      this.setState({
        ...this.state,
        cropTypes,
        dataset: this.props.allFieldData["field_rainfall"][cropTypes[0]],
        selectedCropType: cropTypes[0],
        selectedIndicator: "field_rainfall"
      })
    }
  }

  getEvent = eventKey => {
    if (typeof(eventKey) === "string") {
      let { allFieldData, fieldId, field_data } = this.props;
      let cropTypes = this.state.cropTypes;
      if (cropTypes.includes(eventKey)) {
        this.setState({
          dataset: fieldId === "" ?
           allFieldData[this.state.selectedIndicator][eventKey]
            : field_data[this.state.selectedIndicator][eventKey],
          selectedCropType: eventKey
        })
      } else {
        this.setState({
          dataset: fieldId === "" ?
           allFieldData[this.state.indicatorObj[eventKey]][this.state.selectedCropType]
            : field_data[this.state.indicatorObj[eventKey]][this.state.selectedCropType],
          selectedIndicator: this.state.indicatorObj[eventKey],
          displayedIndicator: eventKey
        })
      }
    }
  }

  render () {
    return (
      <React.Fragment>
        <style type="text/css">
        {`
        .btn-dropdown {
            background-color: #e15b26;
            color: white;
        }
        .dropdown-item.active, .dropdown-item:active {
            color: #fff;
            text-decoration: none;
            background-color: #e15b26;
        }
        #indicator_download_button {
          
          background-color: #e15b26;
          border-color: #e15b26;
        }
        a {
          color: white;
        }
        a:hover {
          color: black;
          text-decoration: none;
        }
        `}
        </style>
        <DropdownButton
        variant={"dropdown"}
        className="mr-1"
        id="dropdown-basic-button"
        title={this.state.displayedIndicator}
        as={ButtonGroup}
        >
          {Object.keys(this.state.indicatorObj).map(obj_ => 
              <Dropdown.Item key={obj_} eventKey={obj_} onSelect={this.getEvent}>
                  {obj_}
              </Dropdown.Item>
          )}
        </DropdownButton>
        <DropdownButton
        variant={"dropdown"}
        id="dropdown-basic-button"
        title={this.props.fieldId === "" ? this.state.selectedCropType : this.props.cropType}
        as={ButtonGroup}
        >
          {/* NOTE: this should remain as getting from redux state because actual
          croptypes are not yet gotten from the backend by the time component is mounted...hehe. mounted. */}
          {this.props.fieldId === "" ? this.state.cropTypes.map(type_ => 
              <Dropdown.Item key={type_} eventKey={type_} onSelect={this.getEvent}>
                  {type_}
              </Dropdown.Item>
          ) : ""}
        </DropdownButton>
        {' '}
        <Button id="indicator_download_button">
          <CSVLink
          // if indicatorsArray is undefined will return an error,
          // so need to check for it
           data={
             this.props.fieldId ?
              this.state.FieldindicatorArray ? this.state.FieldindicatorArray : []
               :
              this.state.allFieldsIndicatorArray
            }
           target="_blank"
           filename={
             this.props.fieldId ?
              `${this.props.fieldId}_indicators_data.csv` : "indicators_data.csv"
           }
          >
          Download Data
          </CSVLink>
        </Button>
        <br/><br/>
        <Line
          data={
              {
                  "labels": months_,
                  "datasets": [{
                      "label": this.state.displayedIndicator,
                      "data": this.state.dataset,
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
                text: `${this.props.fieldId ? "Field Identifier: " + this.props.fieldId : "All fields"}`
            },
              legend: {
                  display: true,
                  position: "bottom",
              },
              scales: {
                  yAxes: [{
                    scaleLabel: {
                      display: true,
                      labelString: this.state.displayedIndicator
                    }
                  }],
                  xAxes: [{
                    scaleLabel: {
                      display: true,
                      labelString: "months"
                    }
                  }],
                }
          }}
          height={120}
          ref={this.chartReference}
        />
      </React.Fragment>
    )
  }

}

const mapStateToProps = state => ({
  FieldindicatorArray: state.graphs.FieldindicatorArray,
  allFieldsIndicatorArray: state.graphs.allFieldsIndicatorArray,
  field_data: state.graphs.field_data,
  allFieldData: state.graphs.allFieldData,
  fieldId: state.graphs.fieldId,
  cropType: state.graphs.cropType,
  cropTypes: state.layers.cropTypes
});

const matchDispatchToProps = dispatch => ({
  getPolygonLayers,
  dispatch
});

export default connect(
  mapStateToProps, matchDispatchToProps
)(IndicatorsLineGraph);
