import L from 'leaflet';


export let attrCreator = (layer, cropTypes, userType) => {
  let feature_ = layer.feature;
  let attr_list = ""
  let user_ = localStorage.getItem('user')
  let { memberOf } = JSON.parse(user_)
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
  } else if (memberOf === "61c04ad2d9f9ae000a05e963") {
    attr_list += `
      <strong>Field Identifier: </strong><small> ${feature_.properties.field_id} </small> <br/>
      <strong>Farmer Name:</strong> <br/>
      <strong>Cotton Yield:</strong> ${feature_.properties["Raw Cotton"]}<br/>
      <strong>Field Size:</strong> ${feature_.properties["Total Area"]}<br/>`
  } else {
    attr_list += `
      <strong>Field Identifier: </strong><small> ${feature_.properties.field_id} </small> <br/>
      <strong>CropType:</strong> ${feature_.properties.CropType}<br/>`
    attr_list += `
      <strong>Date Collected:</strong> ${
        feature_.properties.DataCollected ?
         feature_.properties.DataCollected : ""
      }`
  }
  
  return attr_list
}
