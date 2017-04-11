module.exports.log = (...args) => {
  /* eslint-disable no-console */
  console.log(`${new Date()}:`, ...args);
};

module.exports.jsonFormat = (value) => {
  try {
    return JSON.stringify(value, null, 2);
  } catch (e) {
    return value;
  }
};
