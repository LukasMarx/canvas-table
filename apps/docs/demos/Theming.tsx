import styled from '@emotion/styled';
import { GridOptions, Table } from '@react-fast-table/core';
import { useMemo, useState } from 'react';
import { Columns10KPinned } from '../examples/columns/ManyCells';
import Data10k from '../examples/data/10k.json';

const TableWrapper = styled.div`
  height: 500px;
`;

const options: Partial<GridOptions> = {
  theme: {
    palette: {
      backgroundColor: '#121212',
      backgroundColorSelected: '#616161',
      headerBackgroundColor: '#121212',
      headerTextColor: '#fff',
      textColor: '#fff',
      textColorSelected: '#fff',
      lineColor: '#212121',
      headerBackgroundColorDragging: '#eee',
      headerTextColorDragging: '#212121',
      groupHeaderBackgroundColor: '#333333',
      groupHeaderTextColor: '#fff',
    },
  } as any,
};

function Theming() {
  const [columnConfig, setColumnConfig] = useState(Columns10KPinned);

  const table = useMemo(
    () => (
      <Table
        data={Data10k as object[]}
        columns={columnConfig}
        options={options}
        onColumnsChange={setColumnConfig}
        threadCount={1}
      ></Table>
    ),
    [columnConfig]
  );

  return <TableWrapper>{table}</TableWrapper>;
}

export default Theming;
