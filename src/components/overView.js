import React from 'react';

import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from "react-bootstrap-table2-paginator";

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

  const options = {
    sizePerPage: 10,
    hideSizePerPage: true,
    hidePageListOnlyOnePage: true,
  };

  return (
    <React.Fragment>
      <BootstrapTable keyField='cropType' data={ graphData } columns={ columns } pagination={paginationFactory(options) }/>
    </React.Fragment> 
  );

}
