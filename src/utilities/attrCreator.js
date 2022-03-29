import L from 'leaflet';


export let attrCreator = (layer, cropTypes, userType) => {
  let feature_ = layer.feature;
  let attr_list = ""
  if (userType === "EDITOR") {
    let cropOptions = cropTypes.map((type_, index) => {
      if (type_ !== feature_.properties.CropType) {
        return `<option value='${index}'>${type_}</option>`
      } else {
        return `<option value='${index}' selected>${type_}</option>`
      }
    })
    attr_list += `
      <strong>Field Identifier: </strong><small> ${feature_.properties.field_id} </small> <br/>
      <strong>CropType:</strong> <select
                  name=CropType
                  onchange="localStorage.setItem('cropType', value)"
                  id=CropType_${feature_.properties.field_id}
                >
                  ${cropOptions.join("")}
                </select><br/>`
    attr_list += `
      <strong>Data Collected:</strong>
      <input
        type="month" id=data_collected_${feature_.properties.field_id}
        name=dataCollectedTime
        value=${
          feature_.properties.DataCollected ?
           feature_.properties.DataCollected : ""
        }
      >`
  } else {
    attr_list += `
      <strong>Field Identifier: </strong><small> ${feature_.properties.field_id} </small> <br/>
      <strong>CropType:</strong> ${feature_.properties.CropType}<br/>`
    attr_list += `
      <strong>Date Collected:</strong> ${
        feature_.properties.DataCollected ?
         feature_.properties.DataCollected : ""
      }<br/>`
      attr_list += `
      <strong>Date of Last Visit:</strong> ${
        feature_.properties.LastVisit ?
         feature_.properties.LastVisit : ""
      }<br/>`
      attr_list += `
      <strong>OAF Status:</strong> ${
        feature_.properties.OAFStatus ?
         feature_.properties.OAFStatus : ""
      }`
  }
  
  return attr_list
}
