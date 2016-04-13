var _ = require('lodash');

function normalizeFileName(fileName) {
  var parts = fileName.split('!');
  return parts[parts.length - 1];
}

function getDependentsMap(stats) {
  return stats.modules.reduce(function (obj, module) {
    obj[normalizeFileName(module.name)] = module.reasons.map(function (dependant) {
      return normalizeFileName(dependant.module);
    });
    return obj;
  }, Object.create(null));
}

function getDirectDependentsForFiles(files, dependantsMap) {
  return _.uniq(files.reduce(function (arr, file) {
    return arr.concat(dependantsMap[file] || []);
  }, []));
}

function getAllDependentsForFiles(files, dependantsMap) {
  var dependantsWeAlreadyHave = [];
  var allDependents = [];

  (function recursivelyGetDependents(files) {
    var dependants = getDirectDependentsForFiles(files, dependantsMap);
    dependantsWeAlreadyHave = allDependents;
    allDependents = allDependents.concat(dependants);

    var newDependants = _.difference(allDependents, dependantsWeAlreadyHave);

    if (newDependants.length > 0) {
      return recursivelyGetDependents(newDependants);
    }
    return;
  })(files);

  return _.uniq(allDependents);
}


module.exports = {
  getDependentsMap: getDependentsMap,
  getDirectDependentsForFiles: getDirectDependentsForFiles,
  getAllDependentsForFiles: getAllDependentsForFiles
}
