


// https://gist.github.com/RonKbS/de2fc33bcbb591aef1024b92b9610de4
export const localGroupBy = function(data, key) { 
  return data.reduce(function(storage, item) {
      let group = item[key];
      storage[group] = storage[group] || [];
      storage[group].push(item);
      return storage;
  }, {});
};

export const perfChartLabelsValues = (fields_, selectedIndicator) => {
  let totalFields = [...new Set(Object.values(fields_)[0].map(row_ => row_.field_id))]
  let avgWeeklyData = {};
  [
    "field_evapotranspiration", "field_ndvi", "field_ndwi",
    "field_precipitation", "field_temperature"
  ].forEach(kator => {

    // sum for each date for each indicator
    Object.keys(fields_).forEach(date_ => {
      fields_[date_].reduce((storage_, item) => {
        storage_[date_] = storage_[date_] ? storage_[date_] : {};
        storage_[date_][kator] = storage_[date_][kator] ?
          storage_[date_][kator] + item[kator] : item[kator];
        return storage_;
      }, avgWeeklyData)
    })

    // average each date for each indicator
    Object.keys(avgWeeklyData).forEach(date_ => {
      avgWeeklyData[date_][kator] = (
        avgWeeklyData[date_][kator] / totalFields.length
      ).toFixed(4)
    })
  })

  let chartValues = Object.keys(avgWeeklyData).map(
    key_ => avgWeeklyData[key_][selectedIndicator]
  );
  let chartLabels = Object.keys(avgWeeklyData);
  return [chartLabels, chartValues]
}
