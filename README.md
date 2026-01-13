# PathAtlas

![Github code size in bytes](https://img.shields.io/github/languages/code-size/lsuhsc-caipp-core-b/pathatlas?style=flat-square)
![GitHub package.json version](https://img.shields.io/github/package-json/v/lsuhsc-caipp-core-b/pathatlas?style=flat-square)

> A small, yet slow, application that tracks and stores file paths along with their hashes. 


## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Yarn](https://yarnpkg.com/)

### Build Testing

```sh
$ yarn buildTest
```

### Development

```sh
$ yarn dev
```

### Environment Variables

| Variable             | Description                                                     | Default Value  |
|:--------------------:|-----------------------------------------------------------------|:--------------:|
| `DATABASE_PROTOCOL`  | The Protocol of the MongoDB database                            | `mongodb`      |
| `DATABASE_URL`       | The IP / Hostname of the MongoDB database                       | ` `            |
| `DATABASE_USER`      | The database username                                           | ` `            |
| `DATABASE_PASS`      | The database password                                           | ` `            |
| `DATABASE_NAME`      | The database name                                               | ` `            |
| `TARGET_DIRECTORY`   | The folder that contains the project paths to save              | `.` (current)  |
| `INDEX_FILES`        | The file name to index the paths and hashes                     | `indexes.json` |
| `LIMIT_FILES_TO_LOG` | The limit of files to log to console                            | `10`           |


## :open_file_folder: License
GPL-3.0 License © 2025


