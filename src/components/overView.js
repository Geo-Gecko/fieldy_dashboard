import React from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

export const OverViewDonutGraph = graphData => {
    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    let labels = [...new Set(graphData.graphData.map(data_ => data_.cropType))];
    let count = [...new Set(graphData.graphData.map(data_ => data_.count))];

    let colours = [...new Set(graphData.graphData.map(() => getRandomColor()))];




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
            }}
            height={120}
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
            height={120}
        />
    )

}

export const OverViewSelect = selectorData => {
    let options = Object.keys(selectorData.selectorData).map(attr => {
        if (attr === '0') {
            return `<option selected value=${selectorData.selectorData[attr].cropType} label=${selectorData.selectorData[attr].cropType}>${selectorData.selectorData[attr].cropType}</option>`
        } else {
            return `<option value=${selectorData.selectorData[attr].cropType} label=${selectorData.selectorData[attr].cropType}>${selectorData.selectorData[attr].cropType}</option>`
        }
    })
    return (
        <select name='CropTypeOverview' id='CropTypeOverview'>
            <option value="Maize">Maize</option>
            <option value="Sorghum">Sorghum</option>
            <option value="Cotton">Cotton</option>
            <option value="Mangoes">Mangoes</option>
            <option value="Coffee">Coffee</option>
            <option value="Banana">Banana</option>
        </select>
    )
}

export const OverViewLineGraph = graphData => {
    let labels = [...new Set(graphData.graphData.map(it => it.cropType))];
    let area = [...new Set(graphData.graphData.map(it => it.area))];
    return (
        <Line
            data={
                {
                    "labels": labels,
                    "datasets": [
                        {
                            "label": "Total Area",
                            "data": area,
                            "fill": false,
                            // "backgroundColor": 'red',
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
            height={120}
        />
    )

}