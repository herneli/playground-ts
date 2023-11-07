import {
  VariableFunctions,
  VariableFunctionsDefinition,
} from "../utils/variableFunctions";
import { PrimaryType, StringMap } from "./common.model";

export type Db = {
  widgets: WidgetDefinition[];
  dashboards: Dashboard[];
};

export type Variable = {
  type: PrimaryType;
  title: string;
  defaultValue?: any;
  defaultFunction?: keyof VariableFunctionsDefinition;
};

export type Variables = StringMap<Variable>;

export type AttributeVariable = {
  variable: string;
};

export type AttributeValue = {
  value: any;
};

export type Dashboard = {
  id: string;
  variables: Variables;
  widgets: WidgetConfiguration[];
};

export type WidgetConfiguration = {
  id: string;
  workspaceConfig: WorkspaceConfig;
  attributes: StringMap<AttributeValue | AttributeVariable>;
  widgetTypeId: string;
};

export type WorkspaceConfig = {
  cols: number;
  rows: number;
  x: number;
  y: number;
  language: string;
  country: string;
};

export type WidgetDefinition = {
  id: string;
  active: boolean;
  availableSizes: AvailableSize[];
  attributes: StringMap<WidgetAttribute>;
  icon: string;
  information: string;
  previewImage: string;
  productName: string;
  scriptUrl: string;
  tag: string;
  title: string;
};

export type WidgetAttribute = {
  binding: "setting" | "in" | "out" | "in_out";
  isConfig?: boolean;
  type: PrimaryType;
  title: string;
  value?: any;
};

export type AvailableSize = {
  cols: number;
  rows: number;
};
