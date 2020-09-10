import React from 'react';
import { Line } from 'react-chartjs-2';


let NdviLineGraph = () => {

    return (
        <Line
            data={
                { "labels": ["January", "February", "March", "April", "May", "June", "July"],
                "datasets": [
                    {
                        "label": "Static Dataset",
                        "data": [65, 59, 80, 81, 56, 55, 40],
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

export default NdviLineGraph;