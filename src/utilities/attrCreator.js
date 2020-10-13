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
  feature_.properties.field_attributes.Area = 
    L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]).toFixed(2);
  attr_list += `Area: ${feature_.properties.field_attributes.Area}<br/>`
  attr_list += `
    Planting Time:
    <input
      type="date" id=plant_${feature_.properties.field_id}
      name=plantingTime
      value=${feature_.properties.field_attributes.plantingTime}
    ><br/>
  `
  attr_list += `
    Harvest Time:
    <input
      type="date" id=harvest_${feature_.properties.field_id}
      name=harvestTime
      value=${feature_.properties.field_attributes.harvestTime}
    ><br/>`
  
  return attr_list
}
