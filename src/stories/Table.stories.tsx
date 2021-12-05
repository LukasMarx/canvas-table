import React from "react";
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

const columnConfigLocked = [
  {
    field: "name",
    width: 150,
    sortIndex: 1,
    pinned: true,
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
    pinned: true,
  },

  {
    field: "isActive",
    width: 100,
  },
  {
    field: "balance",
    width: 100,
    pinned: true,
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
  title: "Table",
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

const Template: ComponentStory<typeof Table> = (args) => (
  <div style={{ height: 500 }}>
    <Table {...args} />
  </div>
);

export const Basic = Template.bind({});
Basic.args = {
  data: example as any[],
  columns: columnConfig,
};

export const DarkTheme = Template.bind({});
DarkTheme.args = {
  data: example as any[],
  columns: columnConfig,
  options: {
    theme: {
      font: {
        size: 14,
      },
      palette: {
        backgroundColor: "#121212",
        backgroundColorSelected: "#616161",
        headerBackgroundColor: "#121212",
        headerTextColor: "#fff",
        textColor: "#fff",
        textColorSelected: "#fff",
        lineColor: "#212121",
      },
    },
  },
};

export const MultiSort = Template.bind({});
MultiSort.args = {
  data: example as any[],
  columns: columnConfigSorted,
};

export const PinnedColumns = Template.bind({});
PinnedColumns.args = {
  data: example as any[],
  columns: columnConfigLocked,
};
