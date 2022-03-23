import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';

import { CSVLink } from "react-csv";
import { Button } from 'react-bootstrap';

import 'chartjs-adapter-moment';
import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

import { localGroupBy, perfChartLabelsValues } from '../../utilities/simpleUtilities';

Chart.register(annotationPlugin);

function ThresholdsLineGraph({ weeklyData, selectedIndicator, defaultThreshVals, slThVals }) {


  let recentWeeklyData = localGroupBy(weeklyData, "date_observed");
  // weekly data uses field_precipitation, different from monthly data, hence the switch in the next line
  let localSelectedIndicator =
    selectedIndicator === "field_rainfall" ? "field_precipitation" : selectedIndicator;

  recentWeeklyData = Object.fromEntries(
    Object.keys(recentWeeklyData).map(key_ => {
      let dateData = recentWeeklyData[key_];
      dateData.sort((row1_, row2_) => {
        if (row1_[localSelectedIndicator] < row2_[localSelectedIndicator]) {
          return -1
        } else if (row1_[localSelectedIndicator] > row2_[localSelectedIndicator]) {
          return 1
        }
        return 0
      }).reverse();
      return [key_, dateData]
    })
  );

  let [chartLabels, chartValues] = perfChartLabelsValues(recentWeeklyData, localSelectedIndicator);

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
      {' '}
      <Button id="indicator_download_button" size="sm" variant="outline-primary">
        <CSVLink
          data={weeklyData} target="_blank" id="indicator_download_button_words"
          style={{ "textDecoration": "none" }} filename="top_bottom_performance_data.csv"
        >
          Download Data
        </CSVLink>
      </Button>
      <br /><br />
      <Line
        data={{
          "labels": chartLabels,
          "datasets": [
            {
              "label": defaultThreshVals[selectedIndicator][2], "data": chartValues,
              "fill": false, "borderColor": "#28a745", "lineTension": 0.1
            }
          ]
        }}
        options={{
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'week',
                displayFormats: {
                  week: 'DD-MM'
                }
              },
            },
          },
          plugins: {
            title: {
              display: true,
              position: "top",
              fontSize: 18,
              fontStyle: "normal",
              text: `${defaultThreshVals[selectedIndicator][2]} Threshold Chart`
            },
            legend: {
              display: true,
              position: "bottom",
            },
            annotation: {
              annotations: {
                lowLine: {
                  type: 'line',
                  yMin: slThVals[selectedIndicator][0],
                  yMax: slThVals[selectedIndicator][0],
                  label: {
                    enabled: true,
                    position: "end",
                    color: "red",
                    backgroundColor: "transparent",
                    content: `min threshold: ${slThVals[selectedIndicator][0]}`
                  },
                  borderColor: "#fc9272",
                  borderWidth: 2,
                },
                highLine: {
                  type: 'line',
                  yMin: slThVals[selectedIndicator][1],
                  yMax: slThVals[selectedIndicator][1],
                  label: {
                    enabled: true,
                    position: "end",
                    color: "red",
                    backgroundColor: "transparent",
                    content: `max threshold: ${slThVals[selectedIndicator][1]}`
                  },
                  borderColor: "#fc9272",
                  borderWidth: 2,
                }
              }
            },
          }
        }}
      />
    </React.Fragment>
  )
}

export default ThresholdsLineGraph;
