import L from 'leaflet';


export let attrCreator = (layer, cropTypes, userType) => {
  let feature_ = layer.feature;
  let attr_list = ""
  if (userType === "EDITOR") {
    let cropOptions = cropTypes.map((type_, index) => {
      if (type_ !== feature_.properties.field_attributes.CropType) {
        return `<option value='${index}'>${type_}</option>`
      } else {
        return `<option value='${index}' selected>${type_}</option>`
      }
    })
    attr_list += `
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
        value=${feature_.properties.field_attributes.DataCollected}
      >`
  } else {
    attr_list += `
      <strong>CropType:</strong> ${feature_.properties.field_attributes.CropType}<br/>`
    attr_list += `
      <strong>Data Collected:</strong> ${feature_.properties.field_attributes.DataCollected}`
  }
  
  return attr_list
}
