/**
 * Recursively updates string values in a JavaScript object, replacing only part of the string
 * if it contains the `oldValue`.
 * @param obj The object to update.
 * @param oldValue The string value to search for and replace.
 * @param newValue The new string value to use in the update.
 */
export const updateObjectStrings = (
  obj: any,
  oldValue: string,
  newValue: string,
) => {
  for (let key in obj) {
    if (typeof obj[key] === 'object') {
      // if the value is an object or array, recursively call the function
      updateObjectStrings(obj[key], oldValue, newValue);
    } else if (typeof obj[key] === 'string' && obj[key].includes(oldValue)) {
      // if the value is a string and contains the old value, update it
      obj[key] = obj[key].replace(oldValue, newValue);
    }
  }
};
