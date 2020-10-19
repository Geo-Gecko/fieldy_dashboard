import React from 'react';
import { connect } from 'react-redux';
import { Line } from 'react-chartjs-2';

import {Dropdown, DropdownButton, ButtonGroup} from 'react-bootstrap';

import getcreateputGraphData, { months_ } from '../actions/graphActions';

class IndicatorsLineGraph extends React.Component {
  constructor() {
    super();
    this.state = {
        dataset: [],
        selectedIndicator: "Indicator",
        indicatorObj: {
            field_rainfall: "Rainfall",
            field_ndvi: "NDVI",
            field_ndwi: "NDWI",
            field_temperature: "Ground Temperature"
        }
    }
  }

  async componentDidMount() {
    await this.props.dispatch(getcreateputGraphData(
      {}, 'GET', ""
    ))
    this.setState({dataset: this.props.allFieldData.field_rainfall})
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.fieldId !== "" && prevProps.fieldId !== this.props.fieldId
    ) {
      this.setState({
        ...this.state,
        dataset: this.props.field_data.field_rainfall,
        selectedIndicator: "Rainfall"
      })
    } else if (
      this.props.fieldId === "" &&
       prevProps.SidePanelCollapsed !== this.props.SidePanelCollapsed
    ) {
      this.setState({
        ...this.state,
        dataset: this.props.allFieldData.field_rainfall,
        selectedIndicator: "Rainfall"
      })
    }
  }

  getEvent = eventKey => {
    if (
      typeof(eventKey) === "string" &&
        !["all", "sorghum", "maize"].includes(eventKey)
    ) {
      let { allFieldData, fieldId, field_data } = this.props
      this.setState({
        dataset: fieldId === "" ? allFieldData[eventKey] : field_data[eventKey],
        selectedIndicator: this.state.indicatorObj[eventKey]
      })
    }
  }

  render () {
    return (
      <React.Fragment>
        <style type="text/css">
        {`
        .btn-dropdown {
            background-color: #e15b26;
        }
        .dropdown-item.active, .dropdown-item:active {
            color: #fff;
            text-decoration: none;
            background-color: #e15b26;
        }
        `}
        </style>
        <DropdownButton
        variant={"dropdown"}
        className="mr-1"
        id="dropdown-basic-button"
        title={this.state.selectedIndicator}
        as={ButtonGroup}
        >
          {Object.keys(this.state.indicatorObj).map(obj_ => 
              <Dropdown.Item eventKey={obj_} onSelect={this.getEvent}>
                  {this.state.indicatorObj[obj_]}
              </Dropdown.Item>
          )}
        </DropdownButton>
        <DropdownButton
        variant={"dropdown"}
        id="dropdown-basic-button"
        title={this.props.fieldId === "" ? "Crop Type" : this.props.cropType}
        as={ButtonGroup}
        >
          {this.props.fieldId === "" ? this.props.cropTypes.map(type_ => 
              <Dropdown.Item eventKey={type_} onSelect={this.getEvent}>
                  {type_}
              </Dropdown.Item>
          ) : ""}
        </DropdownButton>
        <br/><br/>
        <Line
          data={
              {
                  "labels": months_,
                  "datasets": [{
                      "label": this.state.selectedIndicator,
                      "data": this.state.dataset,
                      "fill": false,
                      "borderColor": "rgb(75, 192, 192)",
                      "lineTension": 0.1 
                  }]
              }
          }
          options={{
              legend: {
                  display: true,
                  position: "bottom",
              },
              scales: {
                  yAxes: [{
                    scaleLabel: {
                      display: true,
                      labelString: this.state.selectedIndicator
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
  field_data: state.graphs.field_data,
  allFieldData: state.graphs.allFieldData,
  fieldId: state.graphs.fieldId,
  cropType: state.graphs.cropType,
  noFieldData: state.graphs.noFieldData,
  cropTypes: state.layers.cropTypes
});

const matchDispatchToProps = dispatch => ({
  dispatch
});

export default connect(
  mapStateToProps, matchDispatchToProps
)(IndicatorsLineGraph);
