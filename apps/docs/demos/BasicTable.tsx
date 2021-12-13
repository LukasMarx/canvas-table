import styled from '@emotion/styled';
import { Table } from '@react-fast-table/core';
import { useMemo, useState } from 'react';
import { Columns10KPinned } from '../examples/columns/ManyCells';
import { ColumnsBasic } from '../examples/columns/Basic';
import Data10k from '../examples/data/10k.json';

const TableWrapper = styled.div`
  height: 500px;
`;

function BasicTable() {
  const [columnConfig, setColumnConfig] = useState(ColumnsBasic);

  const table = useMemo(
    () => (
      <Table
        data={Data10k as object[]}
        columns={columnConfig}
        threadCount={1}
        onColumnsChange={setColumnConfig}
      ></Table>
    ),
    [columnConfig]
  );

  return <TableWrapper>{table}</TableWrapper>;
}

export default BasicTable;
