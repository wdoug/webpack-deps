var _ = require('lodash');

function getDependentsMap(stats) {
  return stats.modules.reduce(function (obj, module) {
    obj[module.name] = module.reasons.map(function (dependant) { return dependant.module; });
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
