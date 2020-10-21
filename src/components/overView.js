import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';

export const OverViewDonutGraph = graphData => {

    let labels = [...new Set(graphData.graphData.map(data_ => data_.cropType))];
    let count = [...new Set(graphData.graphData.map(data_ => data_.count))];

    console.log(graphData);

    return (
        <Doughnut
            data={
                {
                    "labels": labels,
                    "datasets": [
                        {
                            "label": "Number of Fields",
                            "data": count,
                            // "backgroundColor": colours,
                        }
                    ]
                }
            }
            options={{
                legend: {
                    display: true,
                    position: "bottom",
                },
            }}
            height={60}
        />
    )

}


export const OverViewBarGraph = graphData => {

    let labels = [...new Set(graphData.graphData.map(it => it.cropType))];
    let area = [...new Set(graphData.graphData.map(it => it.area))];
    return (
        <Bar
            data={
                {
                    "labels": labels,
                    "datasets": [
                        {
                            "label": "Total Area",
                            "data": area,
                            "backgroundColor": 'red',
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
            }}
            height={60}
        />
    )

}
