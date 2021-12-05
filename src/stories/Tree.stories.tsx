import React, { useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import example from "../generated.json";

import { Table } from "../lib/Table";
import { ColumnConfig } from "../lib/types/ColumnConfig";

const columnConfig = [
  {
    field: "name",
    width: 150,
  },
  {
    field: "index",
    width: 80,
  },
  {
    field: "guid",
    width: 300,
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
] as ColumnConfig[];

const columnConfigSorted = [
  {
    field: "name",
    width: 150,
    sortIndex: 1,
  },
  {
    field: "gender",
    width: 100,
    sortIndex: 0,
  },
  {
    field: "index",
    width: 80,
  },
  {
    field: "guid",
    width: 300,
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
    field: "age",
    width: 100,
    formatterParams: {
      alignHorizontal: "left",
    },
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
] as ColumnConfig[];

export default {
  title: "Tree",
  component: Table,
  argTypes: {
    data: {
      table: {
        disable: true,
      },
    },
    columns: {
      table: {
        disable: true,
      },
    },
  },
} as ComponentMeta<typeof Table>;

const Template: ComponentStory<typeof Table> = (args) => {
  const [columnConfig, setColumnConfig] =
    useState<ColumnConfig[]>(columnConfigSorted);
  return (
    <div style={{ height: 500 }}>
      <Table
        {...args}
        columns={columnConfig}
        onColumnsChange={setColumnConfig}
      />
    </div>
  );
};

export const Basic = Template.bind({});
Basic.args = {
  data: example as any[],
  columns: columnConfig,
  options: {
    dataTree: true,
  },
};

export const MultiSort = Template.bind({});
MultiSort.args = {
  data: example as any[],
  options: {
    dataTree: true,
  },
};
