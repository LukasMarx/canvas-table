import React, { useMemo, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Table } from "./lib/Table";
import data from "./generated.json";
import { ColumnConfig } from "./lib/types/ColumnConfig";

function App() {
  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>([
    {
      field: "name",
      width: 150,
      // pinned: true,
    },
    {
      field: "index",
      width: 80,
    },
    {
      field: "guid",
      width: 300,
      // pinned: true,
    },

    {
      field: "isActive",
      width: 100,
    },
    {
      field: "balance",
      width: 100,
    },
    {
      field: "gender",
      width: 100,
    },
    {
      field: "age",
      width: 100,
      formatterParams: {
        alignHorizontal: "left",
      },
      // pinned: true,
    },
    {
      field: "eyeColor",
      width: 100,
    },
    {
      field: "company",
      width: 100,
    },
    {
      field: "email",
      width: 250,
    },
    {
      field: "phone",
      width: 150,
    },
    {
      field: "address",
      width: 400,
    },
    {
      field: "latitude",
      width: 100,
    },
    {
      field: "longitude",
      width: 100,
    },
  ]);

  return (
    <div className="App" style={{ padding: 128, boxSizing: "border-box" }}>
      <Table
        data={data as any}
        columns={columnConfig}
        onColumnsChange={setColumnConfig}
        threadCount={1}
        useSingleWorker={false}
        options={{ dataTree: false, groupBy: ["age"] }}
      />
    </div>
  );
}

export default App;
