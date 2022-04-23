import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';

import { CSVLink } from "react-csv";
import { Button } from 'react-bootstrap';

import { localGroupBy, perfChartLabelsValues } from '../../utilities/simpleUtilities';
import LogosComponent from '../../utilities/sponsorLogos';


function TopBottomPerformanceLineGraph ({weeklyData, selectedIndicator, slTpVals}) {


  let recentWeeklyData = localGroupBy(weeklyData, "date_observed");
  let localSelectedIndicator =
   selectedIndicator === "field_rainfall" ? "field_precipitation" : selectedIndicator;
  let topFields = Object.fromEntries(
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
      return [key_, dateData.slice(0, parseInt((slTpVals[0]/100) * dateData.length))]
    })
  );
  let btmFields = Object.fromEntries(
    Object.keys(recentWeeklyData).map(key_ => {
      let dateData = recentWeeklyData[key_];
      dateData.sort((row1_, row2_) => {
        if (row1_[localSelectedIndicator] < row2_[localSelectedIndicator]) {
          return -1
        } else if (row1_[localSelectedIndicator] > row2_[localSelectedIndicator]) {
          return 1
        }
        return 0
      });
      return [key_, dateData.slice(0, parseInt((1 - (slTpVals[1]/100)) * dateData.length))]
    })
  )

  let [ btmchartLabels, btmchartValues ] = perfChartLabelsValues(btmFields, localSelectedIndicator)
  let [ topchartLabels, topchartValues ] = perfChartLabelsValues(topFields, localSelectedIndicator)

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
          style={{"textDecoration": "none"}} filename="top_bottom_performance_data.csv"
        >
        Download Data
        </CSVLink>
      </Button>
      <br/><br/>
      <Line
        data={{
          "labels": topchartLabels,
          "datasets": [
            {
              "label": "Top Performing Fields", "data": topchartValues, "fill": false,
              "borderColor": "#28a745", "lineTension": 0.1 
            },
            {
              "label": "Bottom Performing Fields", "data": btmchartValues, "fill": false,
              "borderColor": "#a1cfaa", "lineTension": 0.1 
            }
          ]
        }}
        options={{
          title: {
            display: true,
            position: "top",
            fontSize: 18,
            fontStyle: "normal",
            text: `Top And Bottom Performance Chart`
          },
          legend: {
            display: true,
            position: "bottom",
          },
          scales: {
            xAxes: [{
              type: 'time',
              time: {
                unit: 'week',
                displayFormats: {
                    week: 'DD-MM'
                }
              },
            }],
          }
        }}
      />
      <LogosComponent />
    </React.Fragment>
  )
}

export default TopBottomPerformanceLineGraph;
