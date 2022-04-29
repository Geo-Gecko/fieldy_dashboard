import L from 'leaflet';
import { toast } from 'react-toastify';

import axiosInstance from '../actions/axiosInstance';
import { attrCreator } from '../utilities/attrCreator';
import {
  GET_ALL_FIELD_DATA_INITIATED
} from '../actions/types';
import getcreateputGraphData from '../actions/graphActions';

// Adding nametag labels to all popup-able leaflet layers
const sourceTypes = ['Layer','Circle','CircleMarker','Marker','Polyline','Polygon','ImageOverlay','VideoOverlay','SVGOverlay','Rectangle','LayerGroup','FeatureGroup','GeoJSON']

sourceTypes.forEach( type => {
   L[type].include({
      nametag: type.toLowerCase()
   })
})

//  Adding new options to the default options of a popup
L.Popup.mergeOptions({
   removable: false,
   editable: false,
   // wanted to add these but won't work
   userType: undefined,
   cropTypes: [],
   LayersPayload: {},
   dispatch: undefined
})

let shownFields = [];
let removedGridCell, clickedLayer;

// Modifying the popup mechanics
L.Popup.include({

   // modifying the _initLayout method to include edit and remove buttons, if those options are enabled

   //  ----------------    Source code  ---------------------------- //
   // original from https://github.com/Leaflet/Leaflet/blob/master/src/layer/Popup.js
   _initLayout: function () {
      var prefix = 'leaflet-popup',
          container = this._container = L.DomUtil.create('div',
         prefix + ' ' + (this.options.className || '') +
         ' leaflet-zoom-animated');

      var wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
      this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);

      L.DomEvent.disableClickPropagation(wrapper);
      L.DomEvent.disableScrollPropagation(this._contentNode);
      L.DomEvent.on(wrapper, 'contextmenu', L.DomEvent.stopPropagation);

      this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
      this._tip = L.DomUtil.create('div', prefix + '-tip', this._tipContainer);

      if (this.options.closeButton) {
         var closeButton = this._closeButton = L.DomUtil.create('a', prefix + '-close-button', container);
         closeButton.href = '#close';
         closeButton.innerHTML = '&#215;';

         L.DomEvent.on(closeButton, 'click', this._onCloseButtonClick, this);
      }

      //  ----------------    Source code  ---------------------------- //


      //  ---------------    My additions  --------------------------- //

      var nametag

      if (this.options.nametag){
         nametag = this.options.nametag
      } else if (this._source) {
         nametag =  this._source.nametag
      } else {
         nametag = "popup"
      }

      if (this.options.removable && !this.options.editable){
         var userActionButtons = this._userActionButtons = L.DomUtil.create('div', prefix + '-useraction-buttons', wrapper);
         let removeButton = this._removeButton = L.DomUtil.create('a', prefix + '-remove-button', userActionButtons);
         removeButton.href = '#close';
         if (this._source.feature.properties.count) {
            removeButton.innerHTML = `Show fields`;
         } else {
            removeButton.innerHTML = `Remove this ${nametag}`;
         }
         this.options.minWidth = 110;

         L.DomEvent.on(removeButton, 'click', this._onRemoveButtonClick, this);
      }

      if (this.options.editable && !this.options.removable){
         let userActionButtons = this._userActionButtons = L.DomUtil.create('div', prefix + '-useraction-buttons', wrapper);
         let editButton = this._editButton = L.DomUtil.create('a', prefix + '-edit-button', userActionButtons);
         editButton.href = '#save';
         editButton.innerHTML = 'Save';

         L.DomEvent.on(editButton, 'click', this._saveButton, this);
      }

      if (this.options.editable && this.options.removable){
         let userActionButtons = this._userActionButtons = L.DomUtil.create('div', prefix + '-useraction-buttons', wrapper);
         let removeButton = this._removeButton = L.DomUtil.create('a', prefix + '-remove-button', userActionButtons);
         removeButton.href = '#close';
         removeButton.innerHTML = `Remove this ${nametag}`;
         let editButton = this._editButton = L.DomUtil.create('a', prefix + '-edit-button', userActionButtons);
         editButton.href = '#save';
         editButton.innerHTML = 'Save';
         this.options.minWidth = 160;

         L.DomEvent.on(removeButton, 'click', this._onRemoveButtonClick, this);
         L.DomEvent.on(editButton, 'click', this._onSaveButtonClick, this);
      }
   },

   _onRemoveButtonClick: async function (e) {
      let deleted_layer = this._source
      if (deleted_layer.feature.properties.count) {

         let leafletGeoJSON = JSON.parse(localStorage.getItem("gridCellFields"))
         leafletGeoJSON = new L.GeoJSON(leafletGeoJSON)

         if (removedGridCell) {
            deleted_layer._map.addLayer(removedGridCell)
         }
         shownFields.forEach(fieldInstance => {
            deleted_layer._map.removeLayer(fieldInstance)
         })
         leafletGeoJSON.eachLayer(fieldLayer => {
            fieldLayer.setStyle({ weight: 1, color: "grey" });
            fieldLayer.on("click", () => {

               this.options.dispatch({
                  type: GET_ALL_FIELD_DATA_INITIATED,
                  payload: true
               });
               this.options.dispatch(getcreateputGraphData(
                  {}, 'GET', fieldLayer.feature.properties.field_id,
                  fieldLayer.feature.properties.CropType,
                  this.options.cropTypes, leafletGeoJSON.toGeoJSON()
               ));
               let attr_list = attrCreator(fieldLayer, this.options.cropTypes, this.options.userType)

               if (clickedLayer) {
                  clickedLayer.setStyle({ weight: 1, color: "grey" });
                }
                document.getElementById("grid-info").innerHTML = attr_list;
                fieldLayer.setStyle({ weight: 1, color: "#e15b26" });
                clickedLayer = fieldLayer

            });
            if (this.options.userType === "EDITOR") {
               fieldLayer.bindPopup(
                 null, {editable: true, removable: true}
               );
            }
            // this should be added to the FeatureGroup. -- bb_ron
            deleted_layer._map.eachLayer(mapLayer => {
               // get featuregroup instance below
               if (mapLayer._events && mapLayer._events.contextmenu) {
                  mapLayer.addLayer(fieldLayer)
                  shownFields.push(fieldLayer)
               }
            })
         })
         deleted_layer.remove();
         removedGridCell = deleted_layer
      } else {
         deleted_layer.remove();
         axiosInstance
         .delete(`/layers/getupdatedeletelayer/${deleted_layer.feature.properties.field_id}/`)
         .then(() => {
             console.log("Layer has been deleted")
         })
         .catch(error => {
         console.log(error)
         });
      }
      L.DomEvent.stop(e);
   },

   _onSaveButtonClick: function (e) {
      let changed_layer = this._source.toGeoJSON()
      let field_id = changed_layer.properties.field_id
      let call_toast = (message_, glanceTime) => toast(message_, {
        position: "bottom-center",
        hideProgressBar: true,
        draggable: false,
        closeOnClick: false,
        autoClose: glanceTime,
        pauseOnHover: true,
        })

      let cropType = document.getElementById(`CropType_${field_id}`);
      let cropTypeSelection = cropType.options[
         localStorage.getItem('cropType')
      ].text;
      let dataCollectedTime = document.getElementById(`data_collected_${field_id}`)
      if (dataCollectedTime.value === "") {
         call_toast(
            `Ensure that
            Data Collected is selected before saving.`,
            5000
         )
      } else if (dataCollectedTime.value !== "") {

         dataCollectedTime.setAttribute("value", dataCollectedTime.value)

         for (let i = 0; i < cropType.options.length; i++) {
            cropType.options[i].removeAttribute("selected")
         }
         cropType.options[
            localStorage.getItem('cropType')
         ].setAttribute("selected", true)

         let newInnerHTML =
         `CropType: ${cropType.outerHTML} <br/>
         Data Collected: ${dataCollectedTime.outerHTML} <br/>`
         this.setContent(newInnerHTML)

         let content_obj = {
            dataCollectedTime: dataCollectedTime.value,
            CropType: cropTypeSelection
         }
         changed_layer.properties = {...changed_layer.properties, ...content_obj}
         axiosInstance
            .put(`/layers/getupdatedeletelayer/${changed_layer.properties.field_id}/`, changed_layer)
            .then(response => {
               call_toast(
                  "Changes to attributes saved",
                  3000
               )
            })
            .catch(error => {
            console.log(error)
            });
      }

      L.DomEvent.stop(e);

      //  ---------------------End my additions --------------------------------------- //


   }
})
