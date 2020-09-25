import ReactDOM from 'react-dom';
import L from 'leaflet';
import axiosInstance from '../actions/axiosInstance';
import { toast } from 'react-toastify';

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
})

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
         var removeButton = this._removeButton = L.DomUtil.create('a', prefix + '-remove-button', userActionButtons);
         removeButton.href = '#close';
         removeButton.innerHTML = `Remove this ${nametag}`;
         this.options.minWidth = 110;

         L.DomEvent.on(removeButton, 'click', this._onRemoveButtonClick, this);
      }

      if (this.options.editable && !this.options.removable){
         var userActionButtons = this._userActionButtons = L.DomUtil.create('div', prefix + '-useraction-buttons', wrapper);
         var editButton = this._editButton = L.DomUtil.create('a', prefix + '-edit-button', userActionButtons);
         editButton.href = '#edit';
         editButton.innerHTML = 'Edit';

         L.DomEvent.on(editButton, 'click', this._onEditButtonClick, this);
      }

      if (this.options.editable && this.options.removable){
         var userActionButtons = this._userActionButtons = L.DomUtil.create('div', prefix + '-useraction-buttons', wrapper);
         var removeButton = this._removeButton = L.DomUtil.create('a', prefix + '-remove-button', userActionButtons);
         removeButton.href = '#close';
         removeButton.innerHTML = `Remove this ${nametag}`;
         var editButton = this._editButton = L.DomUtil.create('a', prefix + '-edit-button', userActionButtons);
         editButton.href = '#edit';
         editButton.innerHTML = 'Edit';
         this.options.minWidth = 160;

         L.DomEvent.on(removeButton, 'click', this._onRemoveButtonClick, this);
         L.DomEvent.on(editButton, 'click', this._onEditButtonClick, this);
      }
   },

   _onRemoveButtonClick: function (e) {
      let deleted_layer = this._source
      deleted_layer.remove();
      axiosInstance
      .delete(`/layers/getupdatedeletelayer/${deleted_layer.feature.properties.field_id}/`)
      .then(() => {
          console.log("Layer has been deleted")
      })
      .catch(error => {
      console.log(error)
      });
      L.DomEvent.stop(e);
   },

   _onEditButtonClick: function (e) {
      //Needs to be defined first to capture width before changes are applied
      var inputFieldWidth = this._inputFieldWidth = this._container.offsetWidth - 2*19;

      this._contentNode.style.display = "none";
      this._userActionButtons.style.display = "none";

      var wrapper = this._wrapper;
      var editScreen = this._editScreen = L.DomUtil.create('div', 'leaflet-popup-edit-screen', wrapper)
      var inputField = this._inputField = L.DomUtil.create('div', 'leaflet-popup-input', editScreen);
      inputField.setAttribute("contenteditable", "true");
      inputField.innerHTML = this.getContent()


      //  -----------  Making the input field grow till max width ------- //
      inputField.style.width = inputFieldWidth + 'px';
      var inputFieldDiv = L.DomUtil.get(this._inputField);

      // create invisible div to measure the text width in pixels
      var ruler = L.DomUtil.create('div', 'leaflet-popup-input-ruler', editScreen);

      let thisStandIn = this;

      // Padd event listener to the textinput to trigger a check
      this._inputField.addEventListener("keydown", function(){
      // Check to see if the popup is already at its maxWidth
      // and that text doesnt take up whole field
         if (thisStandIn._container.offsetWidth < thisStandIn.options.maxWidth + 38
            && thisStandIn._inputFieldWidth + 5 < inputFieldDiv.clientWidth){
            ruler.innerHTML = inputField.innerHTML;

            if (ruler.offsetWidth + 20 > inputFieldDiv.clientWidth){
               console.log('expand now');
               inputField.style.width = thisStandIn._inputField.style.width = ruler.offsetWidth + 10 + 'px';
               thisStandIn.update();
            }
         }
      }, false)


      var inputActions = this._inputActions = L.DomUtil.create('div', 'leaflet-popup-input-actions', editScreen);
      var cancelButton = this._cancelButton = L.DomUtil.create('a', 'leaflet-popup-input-cancel', inputActions);
      cancelButton.href = '#cancel';
      cancelButton.innerHTML = 'Cancel';
      var saveButton = this._saveButton = L.DomUtil.create('a', 'leaflet-popup-input-save', inputActions);
      saveButton.href = "#save";
      saveButton.innerHTML = 'Save';

      L.DomEvent.on(cancelButton, 'click', this._onCancelButtonClick, this)
      L.DomEvent.on(saveButton, 'click', this._onSaveButtonClick, this)

      this.update();
      L.DomEvent.stop(e);
   },


   _onCancelButtonClick: function (e) {
      L.DomUtil.remove(this._editScreen);
      this._contentNode.style.display = "block";
      this._userActionButtons.style.display = "flex";

      this.update();
      L.DomEvent.stop(e);
   },

   _onSaveButtonClick: function (e) {
      let call_toast = () => toast(`
         One of these fields is missing:\n
         Planting month and year\n Harvest month and year\n Crop type\n Area.\n\n
         Please separate each field from its value with a ":", and from each field with a new line.
      `, {
        position: "bottom-center",
        draggable: false,
        closeOnClick: false,
        autoClose: 10000,
        pauseOnHover: true,
        })

      var inputField = this._inputField;
      let content_ = inputField.innerText
      content_ = content_.split("\n")
      content_ = content_.filter(each_ => {
         if (each_.length === 0) {
            return false
         }
         return true
      })
      let content_obj = {}
      content_.forEach(piece_ => {
         piece_ = piece_.split(":")
         try {
            content_obj[piece_[0].trim()] = piece_[1].trim()
         } catch (error) {
            call_toast()
         }
      })
      // IMPORTANT!!! still need to check the values
      function checkKeys(key_) {
         let needed_keys = [
            "Planting month and year", "Harvest month and year",
            "Crop type", "Area"
         ]
         if (needed_keys.includes(key_)) {
            return true
         }
         return false
      }
      let content_arr = Object.keys(content_obj).filter(each_key => {
         return checkKeys(each_key)
      })
      if (content_arr.length === 4){
         this.setContent(inputField.innerHTML)
         let changed_layer = this._source.toGeoJSON()
         changed_layer.properties.field_attributes = content_obj
         axiosInstance
            .put(`/layers/getupdatedeletelayer/${changed_layer.properties.field_id}/`, changed_layer)
            .then(response => {
               console.log("Layer attributes have been edited", response.data)
            })
            .catch(error => {
            console.log(error)
            });
      } else {
         call_toast()
      };

      L.DomUtil.remove(this._editScreen);
      this._contentNode.style.display = "block";
      this._userActionButtons.style.display = "flex";

      this.update();
      L.DomEvent.stop(e);

      //  ---------------------End my additions --------------------------------------- //


   }
})
