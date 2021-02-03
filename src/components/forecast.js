import React from 'react';
import { connect } from 'react-redux';
import { Bar, Doughnut } from 'react-chartjs-2';
import forecastData from './forecastData.json'

class ForecastBarGraph extends React.Component {

    render() {
        let selectedfield = this.props.fieldId;

        let labels = [];
        let temperature = [];
        let precipitation = [];

        let isValid = false

        forecastData.forEach(element => {
            if (element.field_id === selectedfield)
                isValid = true;
            labels.push(element.day.substring(0, 10));
            temperature.push(element.avg_temperature)
            precipitation.push(element.sum_precipitation)
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
                            text: `${this.props.fieldId ? "Field Identifier: " + this.props.fieldId : "All fields"}`
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

export default connect(
    mapStateToProps
)(ForecastBarGraph);
