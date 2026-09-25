const pickFields = (source, allowed) => {
  const out = {};
  for (const field of allowed) {
    if (source[field] !== undefined) out[field] = source[field];
  }
  return out;
};

module.exports = { pickFields };