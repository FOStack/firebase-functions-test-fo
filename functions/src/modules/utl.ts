










export const prim = (obj: any) => {
    const newObj: any = {};
  
    Object.keys(obj).forEach(key => {
      if (obj[key] && typeof obj[key] !== "object" && obj[key] !== null) {
        newObj[key] = obj[key]; // copy value
      }
    });
  
    return newObj;
};