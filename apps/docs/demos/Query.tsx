import styled from '@emotion/styled';
import { TextField } from '@mui/material';
import { GridOptions, Table } from '@react-fast-table/core';
import { useMemo, useState } from 'react';
import { Columns10KPinned } from '../examples/columns/ManyCells';
import Data10k from '../examples/data/10k.json';

const TableWrapper = styled.div`
  height: 500px;
`;

function QueryDemo() {
  const [columnConfig, setColumnConfig] = useState(Columns10KPinned);
  const [query, setQuery] = useState('');

  const table = useMemo(
    () => (
      <Table
        data={Data10k as object[]}
        columns={columnConfig}
        onColumnsChange={setColumnConfig}
        threadCount={1}
        query={query}
      ></Table>
    ),
    [columnConfig, query]
  );

  return (
    <>
      <TextField
        label="Query"
        color="secondary"
        size="small"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      ></TextField>
      <TableWrapper>{table}</TableWrapper>
    </>
  );
}

export default QueryDemo;
