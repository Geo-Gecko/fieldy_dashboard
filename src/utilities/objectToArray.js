
let objToArray = (obj_, months_) => {

  let fieldCsvData = [
    ["field_id", "indicator", ...months_]
  ]
  obj_.forEach(row_ => {
    let indicators_ = [
      "field_ndvi", "field_ndwi", "field_rainfall", "field_temperature"
    ]
    indicators_.forEach(indi_ => {
      let mth_data = (() => {
        let indi_mth_array = []
        months_.forEach(mth => {
          indi_mth_array.push(parseFloat(row_[indi_][mth]))
        })
        return indi_mth_array;
      })();

      fieldCsvData.push([row_.field_id, indi_, ...mth_data])
    })
  })
  return fieldCsvData
}

export default objToArray;
