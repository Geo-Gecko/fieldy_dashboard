import React from 'react';
import { Line } from 'react-chartjs-2';

import {Dropdown, DropdownButton, ButtonGroup} from 'react-bootstrap';

import { months_ } from '../actions/graphActions';

let IndicatorsLineGraph = graphData => {

    function getEvent (eventKey) {
        // of the data pulled,
        // we can switch out depending on what is selected here
        if (typeof(eventKey) === "string") {
            console.log(eventKey)
        }
    }

    return (
        <React.Fragment>
            <style type="text/css">
            {`
            .btn-dropdown {
                background-color: #e15b26;
            }
            .dropdown-item.active, .dropdown-item:active {
                color: #fff;
                text-decoration: none;
                background-color: #e15b26;
            }
            `}
            </style>
            <DropdownButton
             variant={"dropdown"}
             className="mr-1"
             id="dropdown-basic-button"
             title="Vegetation Health"
             as={ButtonGroup}
            >
                <Dropdown.Item eventKey="1" onSelect={getEvent}>Soil Moisture</Dropdown.Item>
                <Dropdown.Item eventKey="2" onSelect={getEvent}>Rainfall</Dropdown.Item>
                <Dropdown.Item eventKey="3" active>NDVI</Dropdown.Item>
                <Dropdown.Item eventKey="4" onSelect={getEvent}>Ground Temperature</Dropdown.Item>
            </DropdownButton>
            <DropdownButton
             variant={"dropdown"}
             id="dropdown-basic-button"
             title="Crop Type"
             as={ButtonGroup}
            >
                <Dropdown.Item eventKey="1" active>All</Dropdown.Item>
                <Dropdown.Item eventKey="2" onSelect={getEvent}>Maize</Dropdown.Item>
                <Dropdown.Item eventKey="3" onSelect={getEvent}>Sorghum</Dropdown.Item>
            </DropdownButton>
            <br/><br/>
            <Line
                data={
                    { "labels": months_,
                    "datasets": [
                        {
                            "label": "Indicators",
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
        </React.Fragment>
    )

}

export default IndicatorsLineGraph;
