import React, { Component } from 'react';
import L from 'leaflet';
import { Sidebar, Tab } from 'react-leaflet-sidebarv2';

import 'font-awesome/css/font-awesome.css';
import './leaflet-sidebar.min.css'


export default class ShSideBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: false,
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
                {/* {ndviLineGraph()} */}
              </Tab>
              <Tab id="ndwi" header="NDWI" icon="fa fa-tint">
                <p>NDWI GRAPH</p>
                 {/* {ndwiLineGraph()} */}
              </Tab>
              <Tab id="settings" header="Settings" icon="fa fa-cog" anchor="bottom">
                <p>Settings dialogue.</p>
              </Tab>
            </Sidebar>
        )
    }
}
