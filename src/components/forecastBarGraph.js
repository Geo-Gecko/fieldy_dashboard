import React from 'react';
import { connect } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import { forecastData } from './forecastData'

import { FORECAST_FIELD_ID } from '../actions/types'

class ForecastBarGraph extends React.Component {
    constructor() {
      super();
      this.state = {
        fieldId: ""
      }
    }

    componentDidUpdate(prevProps) {
      if (this.props.fieldId !== "" && prevProps.fieldId !== this.props.fieldId) {
        this.setState({ fieldId: this.props.fieldId })
        this.props.dispatch({
          type: FORECAST_FIELD_ID,
          payload: this.props.fieldId
      })
      }
    }

    render() {
      let selectedfield = this.state.fieldId;

      let labels = [];
      let temperature = [];
      let precipitation = [];

      let isValid = false

      forecastData.forEach(element => {
        if (element.field_id === selectedfield) {
          isValid = true;
          labels.push(element.day.substring(6, 10));
          temperature.push(element.avg_temperature)
          precipitation.push(element.sum_precipitation)
        }
      });

      if (isValid) {

        return (
          <Bar
            data={
              {
                'datasets': [{
                  'label': 'Precipitation Forecast',
                  'data': precipitation,
                  "backgroundColor": 'blue',
                  // this dataset is drawn below
                  'order': 1
                }, {
                  'label': 'Temperature Forecast',
                  'data': temperature,
                  'type': 'line',
                  "backgroundColor": 'red',
                  'fill': false,
                  'borderColor': 'red',
                  // this dataset is drawn on top
                  'order': 2
                }],
                'labels': labels
              }
            }

            options={{
              title: {
                display: true,
                position: "top",
                fontSize: 18,
                text: `Field Identifier: ${this.state.fieldId}`
              },
              legend: {
                display: true,
                position: "bottom",
              },
              scales: {
                xAxes: [{
                  scaleLabel: {
                    display: true,
                    labelString: "forecast days"
                  }
                }],
              }
            }}
            height={60}
          />
        )

      }
      else return ('No forecast data available yet')
    }
}
const mapStateToProps = state => ({
  fieldId: state.graphs.fieldId,
});

const matchDispatchToProps = dispatch => ({
  dispatch
});


export default connect(
  mapStateToProps, matchDispatchToProps
)(ForecastBarGraph);
