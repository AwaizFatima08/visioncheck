// SDK 55: babel.config.js is minimal
// babel-preset-expo handles all transforms internally
// @babel/core is still needed as devDependency
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
