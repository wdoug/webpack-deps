var _ = require('lodash');

function getFileTree(startFromFiles, depsMap, maxLevels) {
  maxLevels = maxLevels || Number.Infinity; // Maybe there should be a default so as to avoid stack overflows
  var cache = {};
  var rootNode = {
    label: '',
    nodes: []
  };

  (function recursivelyBuildTree(fromFiles, tree, level) {
    fromFiles.forEach(function(fileName) {
      if (!cache[fileName]) {
        var node = {
          label: fileName,
          nodes: []
        };
        cache[fileName] = node;

        var deps = depsMap[fileName];
        var nextLevel = level + 1;
        if (deps && deps.length > 0 && nextLevel <= maxLevels) {
          recursivelyBuildTree(deps, node, nextLevel);
        }
      }

      tree.nodes.push(cache[fileName]);
    });
  })(startFromFiles, rootNode, 0);

  return rootNode;
}

function normalizeFileName(fileName) {
  var parts = fileName.split('!');
  return parts[parts.length - 1];
}

function getDependenciesMap(stats) {
  var dependencyMap = Object.create(null);

  stats.modules.forEach(function (module) {
    module.reasons.forEach(function (dependant) {
      var dependantName = normalizeFileName(dependant.module);
      if (dependencyMap[dependantName]) {
        dependencyMap[dependantName].push(module.name);
      } else {
        dependencyMap[dependantName] = [module.name];
      }
    });
  });

  return dependencyMap;
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
  getAllDependentsForFiles: getAllDependentsForFiles,
  getDirectDependentsForFiles: getDirectDependentsForFiles,
  getDependenciesMap: getDependenciesMap,
  getDependentsMap: getDependentsMap,
  getFileTree: getFileTree
};
