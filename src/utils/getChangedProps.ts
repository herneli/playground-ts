import { StringMap } from "../models/common.model";

export function getChangedProperties(
  obj1: StringMap<any>,
  obj2: StringMap<any>
) {
  const changedProps = [];
  // Check for properties in obj1 that are different in obj2
  for (const key in obj1) {
    if (
      obj1.hasOwnProperty(key) &&
      obj2.hasOwnProperty(key) &&
      obj1[key] !== obj2[key]
    ) {
      changedProps.push(key);
    }
  }
  // Optionally, check for properties in obj2 that are not in obj1
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key) && !obj1.hasOwnProperty(key)) {
      changedProps.push(key);
    }
  }
  return changedProps;
}
