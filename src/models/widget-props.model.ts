import { StringMap } from "./common.model";
import { WorkspaceConfig } from "./dashboard.model";

export type WidgetProps<T = StringMap<any>> = {
  id: string;
  workspaceConfig: WorkspaceConfig;
  attributes: T;
};
