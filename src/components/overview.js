import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';

export const OverViewBarGraph = graphData => {
    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    let labels = [...new Set(graphData.graphData.map(it => it.cropType))];
    let count = [...new Set(graphData.graphData.map(it => it.count))];

    let colours = [...new Set(graphData.graphData.map(it => getRandomColor()))];




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
                            // "borderColor": "rgb(75, 192, 192)",
                            // "lineTension": 0.1 
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


// export const OverViewBarGraph = graphData => {
//     let labels = [...new Set(graphData.graphData.map(it => it.cropType))];
//     let  count = [...new Set(graphData.graphData.map(it => it.count))];
//     return (
//         <Bar
//             data={
//                 { "labels": labels,
//                 "datasets": [
//                     {
//                         "label": "Number of Fields",
//                         "data": count,
//                         "backgroundColor": 'green',
//                         "borderColor": "rgb(75, 192, 192)",
//                         "lineTension": 0.1 
//                     }
//                 ] }
//             }
//             options={{
//                 legend: {
//                     display: true,
//                     position: "bottom",
//                 },
//             }}
//             height={60}
//         />

//     )

// }

export const OverViewBarGraph1 = graphData => {

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