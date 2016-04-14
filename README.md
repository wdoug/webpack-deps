# Webpack Deps

Small utility to get the list of files that depend on other files in a webpack environment.

## Install
```shell
npm install -g webpack-deps
```

## Get Webpack Stats

In order to use this utility you will first need a webpack stats json file.
This can be created from the command line with:
```shell
webpack --profile --json > webpack-stats.json
```

## Running from the CLI

From the command line `webpack-deps` will take the webpack stats json file as the first argument (defaults to `webpack-stats.json`), and will take a list of files either following the `--files` arg, or piped in via stdin.

Examples:
```shell
webpack-deps stats.json -f components/Home.js components/App.js
```

```shell
echo 'components/Home.js components/App.js' | webpack-deps stats.json
```

### Arguments

| arg | description |
|:---: |:----:|
| first unflagged arg | webpack-stats.json file |
| `--from`, `-f`, or piped in list | starting file list |
|  `--dependencies`, `-d` | show dependency files |
| `--dependents`, `-D` | show dependent files |
| `--count` or `-c` | option to just show count for immediate dependencies / dependents |
| `--levels` or `-l` | option to only go so many levels in the tree |
| `--tree` or `-t` | output ascii tree |

### Usage with Git

The ability to pipe in a list of files can be useful in particular when dealing with git. For example, you can see the files that depend on all the changed files between two different git commits:

```shell
git diff master --name-only | webpack-deps stats.json
```

## License

ISC
