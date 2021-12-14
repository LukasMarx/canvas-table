import styled from '@emotion/styled';
import { Menu, MenuItem } from '@mui/material';
import { GridOptions, Table } from '@react-fast-table/core';
import { useMemo, useState } from 'react';
import { Columns10KPinned } from '../examples/columns/ManyCells';
import Data10k from '../examples/data/10k.json';

const TableWrapper = styled.div`
  height: 500px;
`;

function ContextMenuDemo() {
  const [columnConfig, setColumnConfig] = useState(Columns10KPinned);
  const [contextMenu, setContextMenu] = useState(null);

  const table = useMemo(
    () => (
      <Table
        data={Data10k as object[]}
        columns={columnConfig}
        onColumnsChange={setColumnConfig}
        onRowContextMenu={(rowData, column, index, clickPosition) =>
          setContextMenu({
            mouseX: clickPosition.left,
            mouseY: clickPosition.top,
          })
        }
        onColumnHeaderContextMenu={(column, index, clickPosition) => {
          setContextMenu({
            mouseX: clickPosition.left,
            mouseY: clickPosition.top,
          });
        }}
        threadCount={1}
      ></Table>
    ),
    [columnConfig]
  );

  const handleClose = () => {
    setContextMenu(null);
  };

  return (
    <TableWrapper>
      {table}{' '}
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleClose}>Copy</MenuItem>
        <MenuItem onClick={handleClose}>Print</MenuItem>
        <MenuItem onClick={handleClose}>Highlight</MenuItem>
        <MenuItem onClick={handleClose}>Email</MenuItem>
      </Menu>
    </TableWrapper>
  );
}

export default ContextMenuDemo;
