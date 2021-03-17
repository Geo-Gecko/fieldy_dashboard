import React, { Component } from 'react';
import L from 'leaflet';
import { connect } from 'react-redux';
import { Sidebar, Tab } from 'react-leaflet-sidebarv2';
import { toast } from 'react-toastify';
import jwt from 'jsonwebtoken';

import 'font-awesome/css/font-awesome.css';
import './leaflet-sidebar.min.css'

import {Button, Modal} from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';

// import ContactFormRequest from './contactForm'
import ForecastBarGraph from './forecastBarGraph';
import { IndicatorInformation } from './indicatorInformation';
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
            showIndicatorInfo: false,
            showContactForm: false,
            initiateGetData: true,
            field_data: {},
            layer_data: [],
            user: ""
        }
    }

    componentDidMount() {
      const tokenValue = localStorage.getItem('x-token')
      const secret_ = process.env.REACT_APP_SECRET || ""
      const user = jwt.verify(tokenValue, secret_);
      this.setState({ ...this.state, user })

    }

    componentDidUpdate(prevProps, prevState) {
      // this is placed here because otherwise,
      // the sidebar buttons are clickable momentary on first
      // landing in the dashboard
      if (prevProps.initiateGetData !== this.props.initiateGetData) {
        this.setState({
          ...this.state,
          initiateGetData: this.props.initiateGetData
        })
      }

      if (
        prevState.collapsed === true &&
        (prevState.selected === "indicators"
          || prevState.selected === "overview"
          || prevState.selected === "forecast") &&
        prevState.showLogout === false &&
        prevState.showIndicatorInfo === false &&
        this.props.noFieldData === false &&
        this.props.fieldId !== ""
      ) {
        // this if clause considers a particular field
        // all fields are hit by onOpen function
        this.setState({
          ...this.state,
          collapsed: false,
          selected: this.props.field_id !== "" ?
           "indicators" : this.state.selected,
          field_data: this.props.field_data,
          initiateGetData: false
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
        let leafletGeoJSON = this.props.LayersPayload;
        let areas = {}, counts = {}, results = [], cropType, colours = {};
        // stop random color coming up on pressing button each time using if below
        if (this.state.layer_data.length === 0) {
          leafletGeoJSON.features.forEach(feature_ => {
            let totalArea =
             L.GeometryUtil.geodesicArea(
              feature_.geometry.coordinates[0].map(x => new L.latLng(x.reverse()))
             ).toFixed(2)
             if (feature_.properties.field_attributes.CropType) {
               cropType = feature_.properties.field_attributes.CropType
               if (!(cropType in areas)) {
                 areas[cropType] = 0;
                 counts[cropType] = 0;
                 colours[cropType] = "";
               }
               areas[cropType] += parseFloat(totalArea);
               counts[cropType]++;
               colours[cropType] = getRandomColor();
             }
          });
          for (cropType in areas) {
            results.push({
              cropType: cropType, area: areas[cropType].toFixed(2),
              count: counts[cropType], colours: colours[cropType]
            });
          }
          this.setState({
            ...this.state,
            layer_data: results,
            collapsed: false,
            selected: id
          })
        } else {
          this.setState({
            ...this.state,
            collapsed: false,
            selected: id
          })
        }

      } else if (id === "forecast") {
        // there is no summary of forecast data. As such,
        // clicking should not show the data
        if (this.props.forecastFieldId) {
          this.setState({
            ...this.state,
            collapsed: false,
            selected: id
          })
        } else {
          toast("Please right click on a field to show this chart", {
            position: "top-center",
            autoClose: 3500,
            closeOnClick: true,
            pauseOnHover: true,
            })
        }

  
      } else if (id === "logout") {
        this.setState({
          ...this.state,
          selected: id,
          showLogout: true
        })
      } else if (id === "indicatorInfo") {
        this.setState({
          ...this.state,
          selected: id,
          showIndicatorInfo: true
        })
      } else if (id === "contact") {
        this.setState({
          ...this.state,
          showContactForm: true
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
              <Tab
                id="overview"
                header="OVERVIEW"
                icon="fa fa-table"
                disabled={this.state.initiateGetData}  
              >
                <br/><br/>
                <OverViewDonutGraph graphData={this.state.layer_data} />
                <OverViewBarGraph graphData={this.state.layer_data} />
              </Tab>
              <Tab
                id="indicators"
                header="INDICATORS"
                icon="fa fa-leaf"
                disabled={this.state.initiateGetData}
              >
                <br/>
                {this.props.cropTypes.length > 0 ?
                 <IndicatorsLineGraph
                  SidePanelCollapsed={this.state.collapsed}
                 />
                 : <React.Fragment />}
              </Tab>
              {
                this.props.forecastData.length ?
                <Tab
                id="forecast"
                header="FORECAST"
                icon="fa fa-bolt"
                disabled={this.state.initiateGetData}
                >
                  <br /><br />
                  <ForecastBarGraph
                    SidePanelCollapsed={this.state.collapsed}
                  />
                </Tab> : null
              }
              {
              this.state.initiateGetData ?
              <Tab
                id="loader"
                header="LOADER"
                icon={<Spinner animation="grow" variant="danger" />}
              >
              </Tab> : null
              }
              {/* CONTACT PAGE FEATURE MARKED FOR REMOVAL */}
              {/* <Tab
                id="contact"
                anchor="bottom"
                header="CONTACT"
                icon="fa fa-comment"
                disabled={this.state.initiateGetData}
              >
                <br/>
                <ContactFormRequest
                 showContactForm={this.state.showContactForm}
                 hideContactForm={
                  () => this.setState({...this.state, showContactForm : false})
                 }
                />
              </Tab> */}
              <Tab id="indicatorInfo" header="Indicator Information" icon="fa fa-info" anchor="bottom"
               >
                 <IndicatorInformation sideBarInstance={this} />
               </Tab>
              <Tab id="logout" header="Indicator Information" icon="fa fa-power-off" anchor="bottom"
               >
                <Modal
                 show={this.state.showLogout}
                 onHide={() => this.setState(
                  {...this.state, showLogout: false, collapsed: true, selected: "overview"}
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
  noFieldData: state.graphs.noFieldData,
  initiateGetData: state.graphs.initiateGetAllFieldData,
  forecastFieldId: state.graphs.forecastFieldId,
  LayersPayload: state.layers.LayersPayload,
  cropTypes: state.layers.cropTypes,
  forecastData: state.forecast.foreCastPayload
});

const matchDispatchToProps = dispatch => ({
  dispatch
});

export default connect(
  mapStateToProps, matchDispatchToProps
)(ShSideBar);
