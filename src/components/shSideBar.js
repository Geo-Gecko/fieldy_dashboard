import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Sidebar, Tab } from 'react-leaflet-sidebarv2';
import { ToastContainer, toast } from 'react-toastify';

import 'font-awesome/css/font-awesome.css';
import './leaflet-sidebar.min.css'

import {Button, Modal} from 'react-bootstrap';

import NdviLineGraph from './ndviLineGraph';
// import NdwiLineGraph from './ndwiLineGraph';
import getcreateputGraphData from '../actions/graphActions';
import { GET_FIELD_DATA_FAIL } from '../actions/types';

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
      if (
        prevState.collapsed === true &&
        this.state.selected === "ndvi" &&
        prevState.showLogout === false &&
        this.props.noFieldData === false
      ) {
        this.setState({
          ...this.state,
          collapsed: false,
          field_data: this.props.field_data
        });
      } else if (this.props.noFieldData === true) {
        toast("This field has no NDVI data attached yet.", {
          position: "top-center",
          autoClose: 3500,
          closeOnClick: true,
          pauseOnHover: true,
          })
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
          selected: id,
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
                <br/><br/>
                {
                this.props.noFieldData ? <ToastContainer /> : 
                <NdviLineGraph graphData={this.state.field_data} />
                }
              </Tab>
              {/* <Tab id="ndwi" header="NDWI" icon="fa fa-tint">
                <p>NDWI GRAPH</p>
                <NdwiLineGraph />
              </Tab> */}
              <Tab id="logout" header="LogOut" icon="fa fa-power-off" anchor="bottom"
               >
                <Modal
                 show={this.state.showLogout}
                 onHide={() => this.setState(
                  {...this.state, showLogout: false, collapsed: true, selected: "ndvi"}
                 )}
                 aria-labelledby="contained-modal-title-vcenter"
                 size="sm"
                 centered
                >
                <style type="text/css">
                  {`
                  .modal {
                    z-index: 19999;
                  }
                  `}
                </style>
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
  SidePanelCollapsed: state.graphs.SidePanelCollapsed,
  noFieldData: state.graphs.noFieldData
});

const matchDispatchToProps = dispatch => ({
  dispatch
});

export default connect(
  mapStateToProps, matchDispatchToProps
)(ShSideBar);
