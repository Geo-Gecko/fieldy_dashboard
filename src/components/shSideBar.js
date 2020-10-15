import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Sidebar, Tab } from 'react-leaflet-sidebarv2';
import { ToastContainer, toast } from 'react-toastify';

import 'font-awesome/css/font-awesome.css';
import './leaflet-sidebar.min.css'

import { Button, Modal } from 'react-bootstrap';

import NdviLineGraph from './ndviLineGraph';
import { OverViewDonutGraph, OverViewBarGraph, OverViewSelect, OverViewLineGraph } from './overView';
import { getcreateputGraphData, getcreateputOverviewGraphData } from '../actions/graphActions';

class ShSideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: true,
      selected: 'ndvi',
      showLogout: false,
      field_data: [],
      layer_data: [],
      crop_data: [],
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
    localStorage.removeItem('featuregroup')
    window.location.reload()
  }

  handleOverViewCropTypeChange() {
    console.log("Type");
  }

  handleOverViewCropTypeOverviewChange() {
    console.log("Data");
  }

  onClose() {
    this.setState({
      ...this.state,
      collapsed: true
    });
  }

  async onOpen(id) {
    if (id === "ndvi") {
      await this.props.dispatch(getcreateputGraphData(
        {}, 'GET', ""
      ))
      this.setState({
        ...this.state,
        field_data: this.props.field_data,
        collapsed: false,
        selected: id
      })
    } else if (id === "overview") {
      let leafletGeoJSON = JSON.parse(localStorage.getItem('featuregroup'));
      let areas = {}, counts = {}, ids = {}, results = [], cropType;
      leafletGeoJSON.features.forEach((layer, index) => {
        let feature_ = layer;
        Object.keys(feature_.properties.field_attributes).forEach(attr => {
          if (attr === "CropType") {
            cropType = feature_.properties.field_attributes[attr]
            if (!(cropType in areas)) {
              areas[cropType] = 0;
              counts[cropType] = 0;
              ids[cropType] = [];
            }
            areas[cropType] += parseFloat(feature_.properties.field_attributes.Area);
            counts[cropType]++;
            ids[cropType].push(feature_.properties.field_id)
          }
        })
      });
      for (cropType in areas) {
        results.push({ cropType: cropType, ids: ids[cropType], area: areas[cropType], count: counts[cropType] });
      }
      await this.props.dispatch(getcreateputOverviewGraphData(
        'GET', results
      ))
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

  render() {
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
          <br /><br />
          <NdviLineGraph graphData={this.state.field_data} />
        </Tab>
        <Tab id="overview" header="OVERVIEW" icon="fa fa-table">
          <br />Field Breakdown<br />
          <div style={{ width: '100%' }}>
            <div style={{ float: 'left', width: '45%' }}>
              <OverViewDonutGraph graphData={this.state.layer_data} />
            </div>
            <div style={{ float: 'right', width: '45%' }}>
              <OverViewBarGraph graphData={this.state.layer_data} />
            </div>
          </div>
          <div style={{ width: '100%' }}>
            <div style={{ float: 'left', width: '15%' }}>
              <br />CropData Breakdown<br />
              <select name='CropTypeOverview' id='CropTypeOverview' onChange={this.handleOverViewCropTypeChange} >
                <option value="Maize">Maize</option>
                <option value="Sorghum">Sorghum</option>
                <option value="Cotton">Cotton</option>
                <option value="Mangoes">Mangoes</option>
                <option value="Coffee">Coffee</option>
                <option value="Banana">Banana</option>
              </select><br />
              <select name='CropTypeDataOverview' id='CropTypeDataOverview' onChange={this.handleOverViewCropTypeOverviewChange} >
                <option value="ndvi">Crop Health</option>
                <option value="ndwi">Soil Moisture</option>
                <option value="rainfall">Rainfall</option>
                <option value="temperature">Temperature</option>
              </select>
              {/* <OverViewSelect selectorData={this.state.layer_data}/> */}
            </div>
            <div style={{ float: 'right', width: '85%' }}>
              <OverViewLineGraph graphData={this.state.layer_data} />
            </div>
          </div>
        </Tab>
        <Tab id="logout" header="LogOut" icon="fa fa-power-off" anchor="bottom"
        >
          <Modal
            show={this.state.showLogout}
            onHide={() => this.setState(
              { ...this.state, showLogout: false, collapsed: true, selected: "ndvi" }
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
