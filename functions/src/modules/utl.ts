///////////////////////// HELPER FUNCTIONS /////////////////////////










export const noNull = (obj: any) => {
  const newObj: any = {};

  Object.keys(obj).forEach(key => {
    if (obj[key] && typeof obj[key] === "object") {
      newObj[key] = noNull(obj[key]); // recurse
    } else if (obj[key] !== null) {
      newObj[key] = obj[key]; // copy value
    }
  });

  return newObj;
};










export const prim = (obj: any) => {
    const newObj: any = {};
  
    Object.keys(obj).forEach(key => {
      if (obj[key] && typeof obj[key] !== "object" && obj[key] !== null) {
        newObj[key] = obj[key]; // copy value
      }
    });
  
    return newObj;
};