import { WorkspaceConfig } from "./dashboard.model";

export type WidgetProps<T = any> = {
  id: string;
  workspaceConfig: WorkspaceConfig;
  attributes: T;
};
