import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';

let colours;
export const OverViewDonutGraph = graphData => {

    let labels = [...new Set(graphData.graphData.map(data_ => data_.cropType))];
    let count = [...new Set(graphData.graphData.map(data_ => data_.count))];
    if (!colours) {
        colours = [...new Set(graphData.graphData.map(data_ => data_.colours))];
    }

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
                title: {
                    display: true,
                    text: 'Crop Type Representation'
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
            height={140}    
        />
    )

}


export const OverViewBarGraph = graphData => {

    let labels = [...new Set(graphData.graphData.map(it => it.cropType))];
    let area = [...new Set(graphData.graphData.map(it => (it.area/1000000).toFixed(2)))];
    if (!colours) {
        colours = [...new Set(graphData.graphData.map(data_ => data_.colours))];
    }

    return (
        <Bar
            data={
                {
                    "labels": labels,
                    "datasets": [
                        {
                            "label": "Total Areas",
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
                    display: false,
                    position: "bottom",
                },
                title: {
                    display: true,
                    text: 'Crop Area Coverage'
                },
                scales: {
                    yAxes: [
                      {
                        scaleLabel: {
                          display: true,
                          labelString: 'Area (sq km)'
                        },
                        ticks: {
                          callback: function(value) {
                            value += '';
                            let x = value.split('.');
                            let x1 = x[0];
                            let x2 = x.length > 1 ? '.' + x[1] : '';
                            let rgx = /(\d+)(\d{3})/;
                            while (rgx.test(x1)) {
                                x1 = x1.replace(rgx, '$1' + ',' + '$2');
                            }
                            return `${(x1 + x2)}`;
                          }
                        }
                      }
                    ]
                  }
            }}
            height={140}
        />
    )

}
