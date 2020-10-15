import L from 'leaflet';


export let attrCreator = (layer, cropTypes) => {
  let feature_ = layer.feature;
  let attr_list = ""
  let cropOptions = cropTypes.map((type_, index) => {
    if (type_ !== feature_.properties.field_attributes.CropType) {
      return `<option value='${index}'>${type_}</option>`
    } else {
      return `<option value='${index}' selected>${type_}</option>`
    }
  })
  attr_list += `
    CropType: <select
                name=CropType
                onchange="localStorage.setItem('cropType', value)"
                id=CropType_${feature_.properties.field_id}
              >
                ${cropOptions.join("")}
              </select><br/>`
  attr_list += `
    Data Collected:
    <input
      type="month" id=data_collected_${feature_.properties.field_id}
      name=dataCollectedTime
      value=${feature_.properties.field_attributes.DataCollected}
    ><br/>`
  
  return attr_list
}
