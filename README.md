# PathAtlas

![Github code size in bytes](https://img.shields.io/github/languages/code-size/lsuhsc-caipp-core-b/pathatlas?style=flat-square)
![GitHub package.json version](https://img.shields.io/github/package-json/v/lsuhsc-caipp-core-b/pathatlas?style=flat-square)

> PathAtlas is a file indexing and inventory platform that scans project
> directories, records file metadata, and stores content hashes for efficient
> tracking, analysis, and change detection.

## Features

- Recursive file discovery and indexing
- Content hashing for file integrity verification
- Persistent path storage using MongoDB
- Project-based organization
- Designed for large codebases and file collections

## Quick Start

### Prerequisites

Before getting started, ensure the following software is installed:

- Node.js (v18 or newer recommended)
- Yarn
- MongoDB

### Installation

Clone the repository and install dependencies:

```sh
git clone https://github.com/LSUHSC-CAIPP-Core-B/PathAtlas.git
cd PathAtlas
yarn install
```

### Development

Start the development environment:

```sh
yarn dev
```

### Build Validation

Run a full build test:

```sh
yarn buildTest
```

## Configuration

PathAtlas is configured through environment variables.

| Variable             | Description                                               | Default        |
| -------------------- | --------------------------------------------------------- | -------------- |
| `DATABASE_PROTOCOL`  | MongoDB connection protocol                               | `mongodb`      |
| `DATABASE_URL`       | MongoDB hostname or IP address                            | —              |
| `DATABASE_USER`      | Database username                                         | —              |
| `DATABASE_PASS`      | Database password                                         | —              |
| `DATABASE_NAME`      | Database name                                             | —              |
| `TARGET_DIRECTORY`   | Root directory to scan and index                          | `.`            |
| `INDEX_FILES`        | Filename used to store generated indexes                  | `indexes.json` |
| `LIMIT_FILES_TO_LOG` | Maximum number of discovered files written to the console | `10`           |

### Example

```env
DATABASE_PROTOCOL=mongodb
DATABASE_URL=localhost:27017
DATABASE_NAME=pathatlas
DATABASE_USER=management
DATABASE_PASS=<password>

TARGET_DIRECTORY=.
INDEX_FILES=indexes.json
LIMIT_FILES_TO_LOG=10
```

## How It Works

PathAtlas scans a target directory and generates an inventory of discovered
files. Each file is analyzed and assigned a content hash, allowing the system
to:

- Detect file modifications
- Track project contents over time
- Identify duplicate files
- Verify file integrity
- Build searchable project indexes

Indexed data is persisted to MongoDB for efficient retrieval and analysis.

## License

Licensed under the GPL-3.0 License.

© 2025 LSUHS
