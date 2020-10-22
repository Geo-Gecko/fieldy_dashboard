import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';

export const OverViewDonutGraph = graphData => {

    let labels = [...new Set(graphData.graphData.map(data_ => data_.cropType))];
    let count = [...new Set(graphData.graphData.map(data_ => data_.count))];
    let colours = [...new Set(graphData.graphData.map(data_ => data_.colours))];

    return (
        <Doughnut
            data={
                {
                    "labels": labels,
                    "datasets": [
                        {
                            "label": "Number of Fields",
                            "data": count,
                            "backgroundColor": colours,
                        }
                    ]
                }
            }
            options={{
                legend: {
                    display: true,
                    position: "bottom",
                },
                tooltips: {
                    callbacks: {
                      label: function(tooltipItem, data) {
                        var dataset = data.datasets[tooltipItem.datasetIndex];
                        var meta = dataset._meta[Object.keys(dataset._meta)[0]];
                        var total = meta.total;
                        var currentValue = dataset.data[tooltipItem.index];
                        var percentage = parseFloat((currentValue/total*100).toFixed(1));
                        return currentValue + ' fields - representing (' + percentage + '%)';
                      },
                      title: function(tooltipItem, data) {
                        return data.labels[tooltipItem[0].index];
                      }
                    }
                  },
            }}
            height={60}
        />
    )

}


export const OverViewBarGraph = graphData => {

    let labels = [...new Set(graphData.graphData.map(it => it.cropType))];
    let area = [...new Set(graphData.graphData.map(it => it.area))];
    let colours = [...new Set(graphData.graphData.map(data_ => data_.colours))];

    return (
        <Bar
            data={
                {
                    "labels": labels,
                    "datasets": [
                        {
                            "label": "Total Area",
                            "data": area,
                            "backgroundColor": colours,
                            "borderColor": "rgb(75, 192, 192)",
                            "lineTension": 0.1
                        }
                    ]
                }
            }
            options={{
                legend: {
                    display: true,
                    position: "bottom",
                },
                scales: {
                    yAxes: [
                      {
                        ticks: {
                          callback: function(value) {
                            return `${value} sq m`;
                          }
                        }
                      }
                    ]
                  }
            }}
            height={60}
        />
    )

}
