export type StringMap<T> = { [key: string]: T };

export type PrimaryType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "date"
  | "datetime";
