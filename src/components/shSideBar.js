import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Sidebar, Tab } from 'react-leaflet-sidebarv2';

import 'font-awesome/css/font-awesome.css';
import './leaflet-sidebar.min.css'

import {Button, Modal} from 'react-bootstrap';

import NdviLineGraph from './ndviLineGraph';
// import NdwiLineGraph from './ndwiLineGraph';
import getcreateputGraphData from '../actions/graphActions';

class ShSideBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: true,
            selected: 'ndvi',
            showLogout: false,
            field_data: []
        }
    }

    componentDidUpdate(prevProps, prevState) {
      let prevFieldData = prevProps.field_data.reduce(
        (a,b) => a + b, 0
      )
      let currentFieldData = this.props.field_data.reduce(
        (a,b) => a + b, 0
      )
      if (prevState.collapsed !== false) {
        this.setState({
          ...this.state,
          collapsed: false,
          field_data: this.props.field_data
        });
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

    async onOpen(id) {
      if (id !== "logout") {
        await this.props.dispatch(getcreateputGraphData(
          {}, 'GET', ""
        ))
        this.setState({
          ...this.state,
          field_data: this.props.field_data,
          collapsed: false,
          selected: id
        })
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
                <NdviLineGraph graphData={this.state.field_data} />
              </Tab>
              {/* <Tab id="ndwi" header="NDWI" icon="fa fa-tint">
                <p>NDWI GRAPH</p>
                <NdwiLineGraph />
              </Tab> */}
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


const mapStateToProps = state => ({
  field_data: state.graphs.field_data,
  SidePanelCollapsed: state.graphs.SidePanelCollapsed
});

const matchDispatchToProps = dispatch => ({
  dispatch
});

export default connect(
  mapStateToProps, matchDispatchToProps
)(ShSideBar);
