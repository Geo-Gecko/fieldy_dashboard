import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';

import { CSVLink } from "react-csv";
import { Button } from 'react-bootstrap';

import { localGroupBy } from '../utilities/simpleUtilities';


function TopBottomPerformanceLineGraph ({weeklyData, selectedIndicator}) {


  
  let recentWeeklyData = localGroupBy(weeklyData, "date_observed");
  let localSelectedIndicator =
   selectedIndicator === "field_rainfall" ? "field_precipitation" : selectedIndicator;
  // console.log(recentWeeklyData)
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
      return [key_, dateData.slice(0, parseInt(0.20 * dateData.length))]
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
      console.log(JSON.parse(JSON.stringify(dateData)))
      return [key_, dateData.slice(0, parseInt(0.20 * dateData.length))]
    })
  )

  let chartData = fields_ => {
    let totalFields = [...new Set(Object.values(fields_)[0].map(row_ => row_.field_id))]
    let avgWeeklyData = {};
    [
      "field_evapotranspiration", "field_ndvi", "field_ndwi",
      "field_precipitation", "field_temperature"
    ].forEach(kator => {

      // sum for each date for each indicator
      Object.keys(fields_).forEach(date_ => {
        fields_[date_].reduce((storage_, item) => {
          storage_[date_] = storage_[date_] ? storage_[date_] : {};
          storage_[date_][kator] = storage_[date_][kator] ?
            storage_[date_][kator] + item[kator] : item[kator];
          return storage_;
        }, avgWeeklyData)
      })

      // average each date for each indicator
      Object.keys(avgWeeklyData).forEach(date_ => {
        avgWeeklyData[date_][kator] = (
          avgWeeklyData[date_][kator] / totalFields.length
        ).toFixed(4)
      })
    })

    let chartValues = Object.keys(avgWeeklyData).map(
      key_ => avgWeeklyData[key_][localSelectedIndicator]
    );
    let chartLabels = Object.keys(avgWeeklyData);
    return [chartLabels, chartValues]
  }

  let [ btmchartLabels, btmchartValues ] = chartData(btmFields)
  let [ topchartLabels, topchartValues ] = chartData(topFields)

  console.log(btmchartLabels, btmchartValues)
  console.log(topchartLabels, topchartValues)

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
        <h6>Top And Bottom Performance Chart</h6>
      </div>
      {' '}
      <Button id="indicator_download_button" size="sm" variant="outline-primary">
        <CSVLink
        // if indicatorsArray is undefined will return an error,
        // so need to check for it
          data={weeklyData}
          target="_blank"
          id="indicator_download_button_words"
          style={{"textDecoration": "none"}}
          filename="top_bottom_performance_data.csv"
        >
        Download Data
        </CSVLink>
      </Button>
      <br/><br/>
      <Line
        data={
            {
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



            }
        }
        options={{
          title: {
              display: true,
              position: "top",
              fontSize: 18,
              fontStyle: "normal",
              text: `All fields`
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
    </React.Fragment>
  )
}

export default TopBottomPerformanceLineGraph;
