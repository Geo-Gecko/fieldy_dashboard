import React from 'react';


import BootstrapTable from 'react-bootstrap-table-next';


let colours;
let commafy = (value) => {
  value += '';
  let x = value.split('.');
  let x1 = x[0];
  let x2 = x.length > 1 ? '.' + x[1] : '';
  let rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }
  return `${x1 + x2}`;
}

export const OAVisitsTable = ({ visitsPerDate, monthPeriod }) => {

  let totalVisits = 0;
  totalVisits = visitsPerDate.reduce(
      (summn, row_) => summn + row_.fieldCount, totalVisits
  )

  return (
    <div className='row'>
      <div className='col-md-6'>
        <strong>{`Fields visited in last ${monthPeriod.split(" ").slice(0, 2)}`}</strong>
      </div>
      <div className='col-md-6'>
        <strong>{totalVisits}</strong>
      </div>
    </div> 
  );
}

export const OAStatusTable = ({ status, value }) => {
  if (status.length > 0){
    let selected_status = status[0].filter(val => val.OAFStatus == value);
    selected_status[0].area = commafy(status[2].toFixed(2).toString());
    selected_status[0].fieldCount = commafy(selected_status[0].fieldCount.toString());
    const columns = [
      { dataField: 'OAFStatus', text: 'Status' },
      { dataField: 'area', text: 'Area (sq m)' },
      { dataField: 'fieldCount', text: 'Number of Fields' },
    ];
    return (
      <React.Fragment>
        <BootstrapTable keyField='OAFStatus' data={ selected_status } columns={ columns } />
      </React.Fragment> 
      );
  } else {
    return <React.Fragment />
  }
}

export const OverViewTable = ({ graphData }) => {

  graphData.sort((row1, row2) => {
    if (parseFloat(row1.area) > parseFloat(row2.area)) {
      return -1
    } else if (parseFloat(row1.area) < parseFloat(row2.area)) {
      return 1
    }
    return 0
  })

  graphData.forEach(row => {
    if (Object.keys(row).length) {
      row.area = commafy(row.area.toString())
      row.count = commafy(row.count.toString())
    }
  })
  delete graphData.colours
  const columns = [
    { dataField: 'cropType', text: 'Crop Type' },
    { dataField: 'area', text: 'Crop Area Coverage (sq m)' },
    { dataField: 'count', text: 'Total Number of fields'}
  ];
  return (
    <React.Fragment>
      <BootstrapTable keyField='cropType' data={ graphData } columns={ columns } />
    </React.Fragment> 
  );

}
