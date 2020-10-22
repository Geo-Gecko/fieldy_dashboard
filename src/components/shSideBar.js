import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Sidebar, Tab } from 'react-leaflet-sidebarv2';
import { toast } from 'react-toastify';

import 'font-awesome/css/font-awesome.css';
import './leaflet-sidebar.min.css'

import {Button, Modal} from 'react-bootstrap';

import IndicatorsLineGraph from './indicatorsLineGraph';
import { OverViewDonutGraph, OverViewBarGraph } from './overView';
import { GET_ALL_FIELD_DATA, GET_FIELD_DATA_FAIL } from '../actions/types'

class ShSideBar extends Component {
    constructor() {
        super();
        this.state = {
            collapsed: true,
            selected: 'overview',
            showLogout: false,
            field_data: [],
            layer_data: []
        }
    }

    componentDidUpdate(prevProps, prevState) {
      if (
        prevState.collapsed === true &&
        (prevState.selected === "indicators"
          || prevState.selected === "overview") &&
        prevState.showLogout === false &&
        this.props.noFieldData === false &&
        this.props.fieldId !== ""
      ) {
        this.setState({
          ...this.state,
          collapsed: false,
          selected: this.props.field_id !== "" ?
           "indicators" : this.state.selected,
          field_data: this.props.field_data
        });
      } else if (this.props.noFieldData === true) {
        toast("This field has no indicators data attached yet.", {
          position: "top-center",
          autoClose: 3500,
          closeOnClick: true,
          pauseOnHover: true,
          })
          this.props.dispatch({
              type: GET_FIELD_DATA_FAIL,
              payload: false
          })
      }
    }

    handleshowLogout() {
      localStorage.removeItem('x-token')
      localStorage.removeItem('featuregroup')
      window.location.reload()
    }

    onClose() {
      this.props.dispatch({
          type: GET_ALL_FIELD_DATA,
          payload: {
            data_: this.props.allFieldData, collapsed: false
          }
      })
      this.setState({
        ...this.state,
        collapsed: true 
      });
      }

    async onOpen(id) {
      

    function getRandomColor() {
      var letters = '0123456789ABCDEF'.split('');
      var color = '#';
      for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
  }

      if (id === "indicators") {
        document.getElementById('indicated').innerHTML = 'Overview';
        this.props.dispatch({
            type: GET_ALL_FIELD_DATA,
            payload: {
              data_: this.props.allFieldData, collapsed: false
            }
        })
        this.setState({
          ...this.state,
          collapsed: false,
          selected: id
        })
      } else if (id === "overview") {
        let leafletGeoJSON = JSON.parse(localStorage.getItem('featuregroup'));
        let areas = {}, counts = {}, results = [], cropType, colours = {};
        leafletGeoJSON.features.forEach((layer, index) => {
          let feature_ = layer;
          Object.keys(feature_.properties.field_attributes).forEach((attr, index) => {
            if (attr === "CropType") {
              cropType = feature_.properties.field_attributes[attr]
              console.log(index)
              if (!(cropType in areas)) {
                areas[cropType] = 0;
                counts[cropType] = 0;
                colours[cropType] = "";
              }
              areas[cropType] += parseFloat(feature_.properties.field_attributes.Area);
              counts[cropType]++;
              colours[cropType] = getRandomColor();
            }
          })
        });
        for (cropType in areas) {
          results.push({ cropType: cropType, area: areas[cropType], count: counts[cropType], colours: colours[cropType]});
        }

        this.setState({
          ...this.state,
          layer_data: results,
          collapsed: false,
          selected: id
        })
      } else if (id === "logout") {
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
              <Tab id="overview" header="OVERVIEW" icon="fa fa-table">
                <br/><br/>
                <OverViewDonutGraph graphData={this.state.layer_data} />
                <OverViewBarGraph graphData={this.state.layer_data} />
              </Tab>
              <Tab id="indicators" header="INDICATORS" icon="fa fa-leaf">
                <br/>
                <p>Area: <span id='indicated'>Overview</span></p>
                <IndicatorsLineGraph SidePanelCollapsed={this.state.collapsed} />
              </Tab>
              <Tab id="logout" header="LogOut" icon="fa fa-power-off" anchor="bottom"
               >
                <Modal
                 show={this.state.showLogout}
                 onHide={() => this.setState(
                  {...this.state, showLogout: false, collapsed: true, selected: "indicators"}
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
  allFieldData: state.graphs.allFieldData,
  fieldId: state.graphs.fieldId,
  SidePanelCollapsed: state.graphs.SidePanelCollapsed,
  noFieldData: state.graphs.noFieldData
});

const matchDispatchToProps = dispatch => ({
  dispatch
});

export default connect(
  mapStateToProps, matchDispatchToProps
)(ShSideBar);
