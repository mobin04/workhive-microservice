// Get the wanted object from req.body.
module.exports = (reqObj, ...allowedFields) => {
  let newObj = {};
  Object.keys(reqObj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = reqObj[el];
    }
  });
  return newObj;
};
