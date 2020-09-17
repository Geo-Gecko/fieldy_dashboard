import React, { Component } from 'react';
import L from 'leaflet';
import { Sidebar, Tab } from 'react-leaflet-sidebarv2';

import 'font-awesome/css/font-awesome.css';
import './leaflet-sidebar.min.css'

import {Button, Modal} from 'react-bootstrap';

import NdviLineGraph from './ndviLineGraph';
import NdwiLineGraph from './ndwiLineGraph';

export default class ShSideBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: true,
            selected: 'ndvi',
            showLogout: false,
        }
    }

    handleshowLogout() {
      localStorage.removeItem('x-token')
      window.location.reload()
    }

    onClose() {
        this.setState({
          ...this.state,
          collapsed: true 
        });
      }

    onOpen(id) {
      if (id !== "logout") {
        this.setState({
            ...this.state,
            collapsed: false,
            selected: id
        });
      } else {
        this.setState({
          ...this.state,
          showLogout: true
        })
      }
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
              <Tab id="logout" header="LogOut" icon="fa fa-power-off" anchor="bottom"
               >
                <Modal
                 show={this.state.showLogout}
                 onHide={() => this.setState({...this.state, showLogout: false})}
                 aria-labelledby="contained-modal-title-vcenter"
                 size="sm"
                 centered
                >
                  <Modal.Body className="text-center">
                  Would you Like to logout?
                  </Modal.Body>
                  <Modal.Footer>
                    <style type="text/css">
                      {`
                      .btn-logout {
                        background-color: #e15b26;
                      }
                      `}
                    </style>
                    <Button variant="logout" onClick={this.handleshowLogout}>
                      Yes
                    </Button>
                  </Modal.Footer>
                </Modal>
              </Tab>
            </Sidebar>
        )
    }
}
