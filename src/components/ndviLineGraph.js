import React from 'react';
import { Line } from 'react-chartjs-2';


import { months_ } from '../actions/graphActions';

let NdwiLineGraph = graphData => {

    return (
        <Line
            data={
                { "labels": months_,
                "datasets": [
                    {
                        "label": "Static Dataset",
                        "data": graphData.graphData,
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
            height={120}
        />
    )

}

export default NdwiLineGraph;