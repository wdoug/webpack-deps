var _ = require('lodash');

var defaultMaxLevels = Infinity;

function getFileTree(startFromFiles, depsMap, maxLevels) {
  maxLevels = typeof maxLevels === "undefined" ? defaultMaxLevels : maxLevels;
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
        if (deps && deps.length > 0 && nextLevel < maxLevels) {
          recursivelyBuildTree(deps, node, nextLevel);
        }
      }

      tree.nodes.push(cache[fileName]);
    });
  })(startFromFiles, rootNode, -1);

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
        dependencyMap[dependantName].push(normalizeFileName(module.name));
      } else {
        dependencyMap[dependantName] = [normalizeFileName(module.name)];
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

function getAllDependentsForFiles(files, dependantsMap, maxLevels) {
  maxLevels = typeof maxLevels === "undefined" ? defaultMaxLevels : maxLevels;
  var dependantsWeAlreadyHave = [];
  var allDependents = [];

  if (maxLevels === 0) {
    return [];
  }

  (function recursivelyGetDependents(files, level) {
    var dependants = getDirectDependentsForFiles(files, dependantsMap);
    dependantsWeAlreadyHave = allDependents;
    allDependents = allDependents.concat(dependants);

    var newDependants = _.difference(allDependents, dependantsWeAlreadyHave);

    if (newDependants.length > 0 && level < maxLevels) {
      recursivelyGetDependents(newDependants, level + 1);
    }
  })(files, 1);

  return _.uniq(allDependents);
}


module.exports = {
  getAllDependentsForFiles: getAllDependentsForFiles,
  getDirectDependentsForFiles: getDirectDependentsForFiles,
  getDependenciesMap: getDependenciesMap,
  getDependentsMap: getDependentsMap,
  getFileTree: getFileTree
};
