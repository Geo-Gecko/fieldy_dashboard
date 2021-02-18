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
        let totalPrecip = precipitation.reduce(
          (acc, currentValue) => parseFloat(acc) + parseFloat(currentValue)
        )
        let yAxes = [{
          id: 'precip',
          type: 'linear',
          position: 'right',
          scaleLabel: {
            display: true,
            labelString: 'Precipitation'
          },
        }, {
          id: 'temp',
          type: 'linear',
          position: 'left',
          scaleLabel: {
            display: true,
            labelString: 'Temperature'
          },
        }], datasets = [{
          'label': 'Precipitation Forecast',
          'yAxisID': totalPrecip === 0 ? null : 'precip',
          'data': precipitation,
          "backgroundColor": 'blue',
          // this dataset is drawn below
          'order': 2
        }, {
          'label': 'Temperature Forecast',
          'yAxisID': 'temp',
          'data': temperature,
          'type': 'line',
          "backgroundColor": 'red',
          'fill': false,
          'borderColor': 'red',
          // this dataset is drawn on top
          'order': 1
        }]
        if (totalPrecip === 0) {
          yAxes.splice(0, 1)
          datasets.splice(0, 1)
        }

        return (
          <Bar
            data={{ datasets, labels }}
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
                yAxes
              }
            }}
            height={120}
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
