import React, { Component } from 'react';
import { Sidebar, Tab } from 'react-leaflet-sidebarv2';

import 'font-awesome/css/font-awesome.css';
import './leaflet-sidebar.min.css'

import NdviLineGraph from './ndviLineGraph';
import NdwiLineGraph from './ndwiLineGraph';
import AttributeTable from './attributesTable';

export default class ShSideBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: true,
            selected: 'ndvi'
        }
    }

    onClose() {
        this.setState({
          ...this.state,
          collapsed: true 
        });
      }

    onOpen(id) {
    this.setState({
        ...this.state,
        collapsed: false,
        selected: id
    });
    }

    render () {
        return (
            <Sidebar
              id="sidebar"
              closeIcon="fa fa-times"
              collapsed={this.state.collapsed}
              selected={this.state.selected}
              onOpen={(id) => this.onOpen(id)}
              onClose={() => this.onClose()}
            >
              <Tab id="ndvi" header="NDVI" icon="fa fa-leaf">
                <p>NDVI GRAPH</p>
                <NdviLineGraph />
              </Tab>
              <Tab id="ndwi" header="NDWI" icon="fa fa-tint">
                <p>NDWI GRAPH</p>
                <NdwiLineGraph />
              </Tab>
              <Tab id="attributes" header="Attributes" icon="fa fa-table">
                <p>Attributes</p>
                <AttributeTable />
              </Tab>
              <Tab id="settings" header="Settings" icon="fa fa-power-off" anchor="bottom">
                <p>Settings dialogue.</p>
              </Tab>
            </Sidebar>
        )
    }
}
