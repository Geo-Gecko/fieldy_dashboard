import React from 'react';
import { Bar, Line } from 'react-chartjs-2';


export const OverViewBarGraph = graphData => {
    return (
        <Bar
            data={
                { "labels": ["Crop Type 1", "Crop Type 2", "Crop Type 3", "Crop Type 4", "Crop Type 5", "Crop Type 6", "Crop Type 7", "Crop Type 8", "Crop Type 9", "Crop Type 10", "Crop Type 11", "Crop Type 12"],
                "datasets": [
                    {
                        "label": "Number of Fields",
                        "data": graphData.graphData[0],
                        "fill": false,
                        "borderColor": "rgb(75, 192, 192)",
                        "lineTension": 0.1 
                    }
                ] }
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

export const OverViewBarGraph1 = graphData => {
    return (
        <Bar
            data={
                { "labels": ["Crop Type 1", "Crop Type 2", "Crop Type 3", "Crop Type 4", "Crop Type 5", "Crop Type 6", "Crop Type 7", "Crop Type 8", "Crop Type 9", "Crop Type 10", "Crop Type 11", "Crop Type 12"],
                "datasets": [
                    {
                        "label": "Total Area",
                        "data": graphData.graphData[1],
                        "fill": false,
                        "borderColor": "rgb(75, 192, 192)",
                        "lineTension": 0.1 
                    }
                ] }
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