# Alcides

Yet another Node.js based JavaScript Test-Driven Development (TDD) framework.

[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI Build Status](https://github.com/asaidimu/alcides/actions/workflow/status/asaidimu/alcides/SemanticRelease.yml)](https://github.com/asaidimu/alcides/actions/workflows/SemanticRelease.yml)
[![Tests Status](https://github.com/asaidimu/alcides/actions/workflow/status/asaidimu/alcides/Test.yml)](https://github.com/asaidimu/alcides/actions/workflows/Test.yml)
[![Chai Version](https://img.shields.io/npm/dependency-version/alcides/chai)](https://www.npmjs.com/package/alcides)
[![TypeScript types for Alcides](https://img.shields.io/npm/dependency-version/alcides/@types/alcides)](https://www.npmjs.com/package/alcides)
[![Latest Tag](https://img.shields.io/github/v/tag/asaidimu/alcides?sort=semver)](https://github.com/asaidimu/alcides/releases)

---

## 📚 Table of Contents

*   [Overview & Features](#overview--features)
*   [Installation & Setup](#installation--setup)
*   [Usage Documentation](#usage-documentation)
    *   [Basic Usage](#basic-usage)
    *   [CLI Commands](#cli-commands)
    *   [Testing API](#testing-api)
    *   [Configuration Examples](#configuration-examples)
    *   [Common Use Cases](#common-use-cases)
*   [Project Architecture](#project-architecture)
    *   [Directory Structure](#directory-structure)
    *   [Core Components](#core-components)
    *   [Data Flow](#data-flow)
    *   [Extension Points](#extension-points)
*   [Development & Contributing](#development--contributing)
    *   [Development Setup](#development-setup)
    *   [Available Scripts](#available-scripts)
    *   [Testing](#testing)
    *   [Contributing Guidelines](#contributing-guidelines)
    *   [Issue Reporting](#issue-reporting)
*   [Additional Information](#additional-information)
    *   [Troubleshooting](#troubleshooting)
    *   [Why Re-invent the Wheel?](#why-re-invent-the-wheel)
    *   [What's in a name?](#whats-in-a-name)
    *   [Changelog & Roadmap](#changelog--roadmap)
    *   [License](#license)
    *   [Acknowledgments](#acknowledgments)

---

## 🚀 Overview & Features

Alcides is a lightweight yet comprehensive unit testing framework designed for Node.js environments, emphasizing a Test-Driven Development (TDD) approach. It provides a straightforward API for defining test suites and individual test cases, complete with setup and teardown hooks to manage test state.

Built with modern JavaScript practices in mind, Alcides supports asynchronous tests, configurable timeouts, and leverages worker threads for parallel test execution, significantly speeding up your test runs. Its rich command-line interface offers detailed, styled output, and a watch mode for continuous feedback during development. Alcides also integrates a Language Server Protocol (LSP) provider, enabling enhanced developer experience within compatible IDEs by offering real-time diagnostics for test failures.

### ✨ Key Features

*   **Intuitive Testing API**: Define tests using simple `suite`, `test`, `setUp`, and `tearDown` global functions, powered by `chai` for expressive assertions.
*   **Asynchronous Test Support**: Seamlessly write and run tests involving promises or `async/await`.
*   **Configurable Timeouts**: Prevent long-running tests from hanging your CI/CD pipeline with per-test or global timeout settings.
*   **Parallel Execution**: Boost test performance by running test suites concurrently across multiple worker threads.
*   **Watch Mode**: Automatically re-run tests upon file changes, providing instant feedback during development.
*   **Flexible Configuration**: Configure Alcides via command-line arguments or dedicated configuration files (`.alcidesrc`, `alcides.json`, `alcides.config.js`, etc.) or directly within your `package.json`.
*   **Language Server Protocol (LSP) Integration**: Provides real-time diagnostics and feedback for test failures directly in your IDE.
*   **Rich CLI Output**: Enjoy a clean, colored, and verbose console output with test statuses, durations, and summaries.
*   **Source Map Support**: Accurate error reporting by mapping stack traces back to original TypeScript or transpiled source files.

---

## 📦 Installation & Setup

### Prerequisites

To use Alcides, you need:

*   **Node.js**: Version 14 or higher (recommended: LTS 16+).
*   **npm** or **Yarn**: A package manager for Node.js.

### Installation Steps

Alcides can be installed globally for command-line access or locally as a development dependency for project-specific use.

#### Global Installation (Recommended for CLI)

```bash
npm install -g alcides
# OR
yarn global add alcides
```

#### Local Installation (For project dependency)

```bash
npm install --save-dev alcides
# OR
yarn add --dev alcides
```

### Configuration

Alcides can be configured through command-line arguments or configuration files. Arguments take precedence over file configurations.

#### Command-Line Arguments

Run `alcides --help` to see all available options:

```bash
alcides [opts..]

Usage:
  alcides [opts..]

Options:
  --verbose,                   Show verbose reports.                        [boolean]
  --watch,                     Run in watch mode.                           [boolean]
  --parallel,                  Run tests in parallel.                       [boolean]
  -f, --files,                 Files to watch.                              [array]
  -i, --include,               Path or glob to test files.                  [array]
  -r, --workers,               Number of workers.                           [number]
  -t, --timeout,               Test timeout in ms.                          [number]
  -c, --config,                Path to alcides configuration                [string]
  --lsp,                       Start alcides as an LSP provider.            [boolean]
  -h, --help                   Show help                                    [boolean]

Documentation at https://www.npmjs.com/package/alcides
```

#### Configuration Files

Alcides automatically looks for configuration in the following files (in order of precedence, from highest to lowest):

1.  `.alcidesrc`
2.  `.alcides.json`
3.  `.alcides.js`
4.  `alcides.json`
5.  `alcides.config.js`
6.  `package.json` (under the `alcides` key)

**Example `alcides.config.js`:**

```javascript
export default {
    include: ['tests/**/*.js', 'tests/**/*.ts'], // Globs for test files
    workers: 4,                                 // Number of parallel workers
    timeout: 5000,                              // Default test timeout in ms
    parallel: true,                             // Enable parallel execution
    watch: false,                               // Enable watch mode by default
    files: [],                                  // Specific files to watch in watch mode
    verbose: true,                              // Show verbose test results
};
```

**Example `package.json` configuration:**

```json
{
    "name": "my-project",
    "version": "1.0.0",
    "alcides": {
        "include": ["test/**/*.js"],
        "timeout": 2000
    },
    "scripts": {
        "test": "alcides"
    }
}
```

### Verification

To verify that Alcides is installed correctly, run:

```bash
alcides --help
```

This command should display the help output with all available options.

---

## 📖 Usage Documentation

### Basic Usage

Create a test file (e.g., `my.test.js` or `my.test.ts` if you're using TypeScript):

```javascript
// my.test.js
suite('My First Suite', () => {
    setUp(() => {
        // Optional setup before each test in this suite
        console.log('Setting up...')
        return { value: 10 }; // State can be passed to tests
    });

    tearDown((state) => {
        // Optional teardown after each test in this suite
        console.log('Tearing down...', state.value);
    });

    test('it should assert true is true', ({ value }) => {
        // 'assert' is globally available, provided by Chai
        assert.isTrue(true);
        assert.equal(value, 10);
    });

    test('it should handle asynchronous tests', async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        assert.equal(1 + 1, 2);
    });

    test('it should demonstrate a failing test', () => {
        assert.equal(1, 2, '1 is not equal to 2'); // This test will fail
    });
});
```

Run your tests:

```bash
alcides my.test.js
```

Expected (simplified) output for `my.test.js`:

```
  My First Suite
    ✓ it should assert true is true (0.XX)
    ✓ it should handle asynchronous tests (1XX.XX)
    ✗ it should demonstrate a failing test (0.XX)

  @ my.test.js:XX:XX
  Error: 1 is not equal to 2
      at Context.<anonymous> (my.test.js:XX:XX)
      ...

  Running...

  12:34:56
    2 passed
    1 failed
```

### CLI Commands

Alcides is primarily a CLI tool. Here are common ways to use it:

*   **`alcides`**: Runs tests with default configuration or settings from `package.json` / config files.
*   **`alcides --include <glob>` or `alcides -i <glob>`**: Specifies a glob pattern for test files. Can be used multiple times.
    ```bash
    alcides -i "tests/**/*.js" -i "spec/**/*.ts"
    ```
*   **`alcides --files <path>` or `alcides -f <path>`**: Specifies individual test files to run. Can be used multiple times.
    ```bash
    alcides -f "tests/unit/my-module.test.js" "tests/e2e/login.test.js"
    ```
*   **`alcides --watch`**: Runs tests in watch mode, automatically re-executing them when included files change.
    ```bash
    alcides --watch -i "src/**/*.ts"
    ```
*   **`alcides --parallel`**: Enables parallel execution of test suites using worker threads.
    ```bash
    alcides --parallel --workers 4
    ```
*   **`alcides --workers <number>` or `alcides -r <number>`**: Sets the number of worker threads for parallel execution. Defaults to 0 (no workers / main thread).
    ```bash
    alcides --parallel -r 8
    ```
*   **`alcides --timeout <ms>` or `alcides -t <ms>`**: Sets the maximum time (in milliseconds) a test case can run before timing out.
    ```bash
    alcides -t 5000
    ```
*   **`alcides --verbose`**: Displays detailed results for individual tests, including passing tests.
    ```bash
    alcides --verbose
    ```
*   **`alcides --config <path>` or `alcides -c <path>`**: Specifies a custom path to an Alcides configuration file.
    ```bash
    alcides -c ./configs/my-custom-alcides.json
    ```
*   **`alcides --lsp`**: Starts Alcides as a Language Server Protocol provider, enabling IDE integration for real-time diagnostics. This is typically used by IDE extensions.
    ```bash
    # This command is usually run by an LSP client (e.g., VS Code extension)
    alcides --lsp
    ```

### Testing API

Alcides exposes a few global functions to define your tests:

*   `suite(description: string, callback: () => void): void`
    Defines a test suite. All `test`, `setUp`, and `tearDown` calls within this callback will be associated with this suite.
    ```typescript
    suite('User Authentication', () => {
        // ... tests and hooks for authentication
    });
    ```
*   `test(description: string, callback: (state?: any) => void | Promise<void>): void`
    Defines an individual test case. The `callback` can be synchronous or asynchronous (return a Promise or use `async/await`). If `setUp` provides state, it will be passed as the first argument to the `test` callback.
    ```typescript
    test('should allow user login', async () => {
        const user = await login('testuser', 'password');
        assert.isNotNull(user);
    });
    ```
*   `setUp(callback: () => any | Promise<any>): void`
    Defines a setup hook that runs **before each test** in the current suite. The return value of this hook (which can be a Promise) is passed as state to the `test` function.
    ```typescript
    suite('Database Operations', () => {
        let dbConnection;
        setUp(async () => {
            dbConnection = await connectToDatabase();
            return { db: dbConnection };
        });
        test('should insert new record', async ({ db }) => {
            await db.insert({ id: 1, name: 'test' });
            assert.exists(await db.find(1));
        });
    });
    ```
*   `tearDown(callback: (state?: any) => void | Promise<void>): void`
    Defines a teardown hook that runs **after each test** in the current suite. The state returned by `setUp` (if any) is passed as the first argument to the `tearDown` callback.
    ```typescript
    suite('File System Tests', () => {
        let tempFilePath;
        setUp(() => {
            tempFilePath = createTempFile();
            return { filePath: tempFilePath };
        });
        tearDown(({ filePath }) => {
            cleanupTempFile(filePath);
        });
        test('should write to file', ({ filePath }) => {
            writeToFile(filePath, 'data');
            assert.equal(readFromFile(filePath), 'data');
        });
    });
    ```
*   `assert: Chai.AssertStatic`
    A global instance of Chai's `assert` interface is provided for writing assertions. You can use any of Chai's assertion styles (e.g., `assert.equal`, `assert.isTrue`, `assert.deepEqual`).

### Configuration Examples

Here are some common ways to configure Alcides:

**1. `alcides.config.js` for complex setups:**

```javascript
// alcides.config.js
export default {
    include: ['tests/**/*.test.js'],
    files: [], // Use this if you want to run specific files instead of globs
    workers: 4,
    timeout: 3000,
    parallel: true,
    watch: false,
    verbose: true,
    // Add custom settings here if Alcides supported more
};
```

**2. `alcides.json` for simpler JSON configuration:**

```json
// alcides.json
{
    "include": ["tests/unit/**/*.js", "tests/integration/**/*.js"],
    "timeout": 2500,
    "parallel": true,
    "verbose": false
}
```

**3. `package.json` integration:**

```json
{
    "name": "my-app",
    "version": "1.0.0",
    "type": "module",
    "scripts": {
        "test": "alcides",
        "test:watch": "alcides --watch",
        "test:parallel": "alcides --parallel --workers 8"
    },
    "devDependencies": {
        "alcides": "^1.x.x",
        "chai": "^4.x.x",
        "@types/chai": "^4.x.x"
    },
    "alcides": {
        "include": ["src/**/*.test.ts"],
        "timeout": 1500
    }
}
```

### Common Use Cases

*   **Run all tests**:
    ```bash
    alcides
    ```
*   **Run tests in watch mode for development**:
    ```bash
    alcides --watch
    ```
*   **Run tests in parallel with verbose output**:
    ```bash
    alcides --parallel --verbose
    ```
*   **Run a specific test file**:
    ```bash
    alcides -f "path/to/my-specific.test.js"
    ```
*   **Run tests from multiple glob patterns**:
    ```bash
    alcides -i "tests/unit/**/*.js" -i "tests/cli/*.test.ts"
    ```
*   **Debug a test with Node.js inspector (requires `dist` build)**:
    ```bash
    yarn debug # or node --inspect-brk ./dist/index.js --no-watch
    ```

---

## 🏗️ Project Architecture

Alcides is built with a modular and extensible architecture, designed for clear separation of concerns and maintainability.

```
.
├── src/
│   ├── config/             # Handles application configuration (CLI args, file loading)
│   │   ├── Arguments.ts    # Defines CLI arguments using yargs
│   │   ├── Config.ts       # Main config aggregator
│   │   └── File.ts         # Utility for reading config files
│   ├── core/               # Core test runner logic
│   │   ├── Constants.ts    # Defines constants for hooks, events, error codes
│   │   ├── Errors.ts       # Custom error definitions (timeout, invalid action)
│   │   ├── File.ts         # Utilities for finding and watching test files
│   │   ├── Results.ts      # Logic for combining and processing test results
│   │   ├── SourceMap.ts    # Handles source map resolution for error positions
│   │   ├── TestCase.ts     # Decorators for enhancing test functions (timeout, timer, error handling, hooks)
│   │   ├── TestCaseRunner.ts # Runs individual test cases with decorators
│   │   ├── TestCollector.ts  # Discovers and structures test suites (suite, test, setUp, tearDown)
│   │   ├── TestRunner.ts     # Main orchestrator for test execution (parallel workers, watch mode)
│   │   ├── TestSuiteRunner.ts # Runs test suites, managing hooks and test cases
│   │   └── Worker.ts         # Worker thread entry point for parallel test execution
│   ├── lsp/                # Language Server Protocol implementation
│   │   ├── Diagnostics.ts  # Logic for generating LSP diagnostics
│   │   └── Server.ts       # Main LSP server
│   ├── ui/                 # Command-line user interface components
│   │   ├── Styles.ts       # Defines chalk-based styling for console output
│   │   └── UI.ts           # Manages console spinner and reporting
│   └── Main.ts             # Application entry point, initializes config and starts execution
├── tests/                  # Alcides' own test suite
│   ├── binary/
│   ├── core/
│   ├── fixtures/
│   └── ...
├── types/                  # TypeScript declaration files for Alcides' global API
│   ├── alcides-tests.ts    # Example usage for type checking
│   └── index.d.ts          # Main declaration file for global functions
├── bin/                    # Shell scripts for building and deployment
│   ├── dist.sh
│   ├── next.sh
│   └── types.sh
├── .github/                # GitHub Actions workflows
├── CHANGELOG.md            # Project changelog
├── CONTRIBUTING.md         # Guidelines for contributing to Alcides
├── dist.package.json       # package.json for the published distribution
├── FEATURELIST.md          # Internal project feature tracking
├── index.ts                # CLI executable entry
├── LICENSE.md              # Project license
├── package.json            # Project metadata and scripts
├── README.md               # This file
└── tsconfig.json           # TypeScript configuration
```

### Core Components

*   **`TestRunner`**: The central orchestrator. It discovers test files, distributes them to worker threads if parallel execution is enabled, and aggregates results.
*   **`TestCollector`**: Responsible for parsing test files and collecting `suite`, `test`, `setUp`, and `tearDown` definitions into structured `TestSuite` objects. It provides global access to `suite`, `test`, `setUp`, `tearDown`, and `assert`.
*   **`TestSuiteRunner`**: Manages the execution of an individual `TestSuite`, ensuring `setUp` and `tearDown` hooks run correctly around each test. It also handles hook-related errors.
*   **`TestCaseRunner`**: Focuses on executing a single `TestCase`. It applies a series of decorators to the test function to handle timing, timeouts, and error capturing.
*   **`Config`**: Manages application configuration, parsing both command-line arguments (using `yargs`) and configuration files, and merging them with default settings.
*   **`UI`**: Provides a user-friendly command-line interface, including spinners (`ora`) for visual feedback during execution and styled output (`chalk`) for readable test reports.
*   **`LSP Server`**: Implements the Language Server Protocol to provide rich editor features, such as real-time test failure diagnostics, directly within supported IDEs.
*   **`SourceMap`**: Crucial for accurate error reporting in transpiled environments (like TypeScript). It uses source maps to translate stack trace positions from compiled JavaScript back to the original source code.

### Data Flow

1.  **Initialization**: When `alcides` is executed, `src/Main.ts` loads the configuration from `src/config/Config.ts`, which in turn parses CLI arguments and config files.
2.  **Test Discovery**: `src/core/File.ts` uses `fast-glob` to find all test files matching the `include` patterns.
3.  **Execution Orchestration**:
    *   If `watch` mode is enabled, `src/core/TestRunner.ts` initiates a file watcher and re-runs tests on changes.
    *   If `lsp` mode is enabled, `src/lsp/Server.ts` starts an LSP connection, providing diagnostics based on test results.
    *   Otherwise, `runTests` is called for a single execution.
4.  **Parallelism (Optional)**: If `parallel` is true and `workers` > 0, `TestRunner` distributes test file paths into buckets, and each bucket is assigned to a `worker_threads` instance (`src/core/Worker.ts`).
5.  **Test Collection & Run (Worker/Main Thread)**:
    *   Within each worker (or the main thread), `src/core/TestCollector.ts` imports the test files, which execute the `suite`, `test`, `setUp`, `tearDown` globals, populating `TestSuite` objects.
    *   `src/core/TestSuiteRunner.ts` then iterates through collected `TestSuites`, executing their `setUp` hooks, then each `TestCase`, and finally `tearDown` hooks.
    *   Individual test cases are run by `src/core/TestCaseRunner.ts`, which decorates them with timeout, timer, and error handling logic.
6.  **Result Aggregation & Reporting**:
    *   Results and errors from all `TestSuiteRunner` instances (and workers) are combined by `src/core/Results.ts`. Errors are processed through `src/core/SourceMap.ts` to provide accurate source file positions.
    *   Finally, `src/ui/UI.ts` takes the aggregated results and renders them to the console using styled output, providing a comprehensive report.
7.  **Exit Status**: If any tests or runtime errors occur, `alcides` exits with a non-zero status, suitable for CI/CD environments.

### Extension Points

Alcides is designed to be extensible primarily through its native JavaScript API and its reliance on `chai` for assertions.

*   **Hooks**: `setUp` and `tearDown` hooks provide powerful ways to manage test state, set up prerequisites, and clean up resources for each test case within a suite.
*   **Chai Assertions**: By using `chai`, Alcides allows you to leverage its rich assertion library and potentially integrate custom Chai plugins.
*   **LSP**: The LSP implementation can be extended to provide more advanced IDE features by modifying `src/lsp/Diagnostics.ts` and `src/lsp/Server.ts`.

---

## 👨‍💻 Development & Contributing

Contributions are welcome and encouraged! Whether it's bug fixes, new features, documentation improvements, or type definitions, your help is appreciated.

### Development Setup

To set up Alcides for local development:

1.  **Clone the repository**:
    ```bash
    git clone git@github.com:asaidimu/alcides.git
    cd alcides
    ```
2.  **Install dependencies**: Alcides uses Yarn for package management.
    ```bash
    yarn install
    ```
3.  **Build the project**: This compiles TypeScript files to JavaScript.
    ```bash
    yarn build
    ```

You should now be ready to run tests and develop new features.

### Available Scripts

Here's a list of useful `yarn` scripts defined in `package.json`:

*   `yarn prebuild`: Cleans the `dist` directory before a build.
*   `yarn build`: Compiles TypeScript source files (`src/`) into the `dist/` directory.
*   `yarn build:watch`: Continuously compiles TypeScript files as changes are made.
*   `yarn build:dist`: Prepares the `dist/` directory for npm publication by copying `README.md`, `LICENSE.md`, and `dist.package.json`.
*   `yarn build:next`: Builds the project for local development, packaging it and installing it into `node_modules/alcides` for testing.
*   `yarn build:types`: Pushes the latest TypeScript definitions to `DefinitelyTyped`. This script is typically run via CI/CD.
*   `yarn ci`: Installs dependencies using a frozen lockfile, suitable for CI environments.
*   `yarn debug`: Runs Alcides in Node.js debug mode with `--inspect-brk`.
*   `yarn debug:loop`: Continuously runs `yarn debug` in a loop.
*   `yarn pretest:ci`: Ensures the project is built before running CI tests.
*   `yarn test`: Runs Alcides tests using its own framework (from `node_modules/alcides`).
*   `yarn test:ci`: Runs Alcides tests in a CI-friendly mode (no watch, parallel, retries, verbose).
*   `yarn test:next`: Runs Alcides using the locally built version (from `dist/`).
*   `yarn test:push`: Performs a dry-run npm publish and triggers `semantic-release`.

### Testing

Alcides uses itself to test its functionality.

*   **Run all tests**:
    ```bash
    yarn test
    ```
*   **Run tests in CI mode**:
    ```bash
    yarn test:ci
    ```

### Contributing Guidelines

We welcome contributions! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on how to contribute, including:

*   How to set up your development environment.
*   How to submit pull requests.
*   Coding standards and commit message conventions (using Conventional Commits).
*   Expectations for including tests with your contributions.

### Issue Reporting

Found a bug or have a feature request? Please open an issue on our [GitHub Issues](https://github.com/asaidimu/alcides/issues). When reporting:

*   Provide a clear and concise description of the bug or feature.
*   Include steps to reproduce the issue if it's a bug.
*   Specify your Node.js and Alcides versions.

---

## ℹ️ Additional Information

### Troubleshooting

*   **"Test timed out."**: This error indicates that a test case exceeded the configured `timeout` duration. You can increase the timeout globally via `alcides.config.js` or `package.json`, or specifically for a run using `-t <ms>`. For example: `alcides -t 5000`.
*   **"The provided path does not exist!" (Invalid config)**: If Alcides cannot find the specified configuration file or a watched file in watch mode, it will exit with `EXIT_INVALID_CONFIG` (123). Double-check the file path provided via the `-c` or `-f` arguments or in your config file.
*   **Errors in worker threads**: If you encounter errors during parallel execution, Alcides attempts to catch and report them. Ensure your test files are valid and don't have syntax errors that prevent them from loading.

### Why Re-invent the Wheel?

While there are many excellent and feature-rich unit testing frameworks available in the JavaScript ecosystem (e.g., Vitest, Jest, Mocha), Alcides was created as a learning exercise and to explore specific architectural patterns for a testing tool.
**There are better frameworks. Use them. For one, go directly to [Vitest](https://vitest.dev/)!**

### What's in a name?

The name "Alcides" is the original birth name of the Greek hero Heracles (Hercules). It's a nod to the "Labors of Hercules," symbolizing the effort and foundational work involved in building a testing framework. You can read more about the [Labors of Hercules on Wikipedia](https://en.wikipedia.org/wiki/Labours_of_Hercules).

### Changelog & Roadmap

*   **Changelog**: See the detailed history of changes in [CHANGELOG.md](CHANGELOG.md).
*   **Roadmap**: Our internal feature tracking and future plans are outlined in [FEATURELIST.md](FEATURELIST.md).

### License

This project is open-source and distributed under the [MIT License](LICENSE.md).

### Acknowledgments

*   This project was inspired by the challenge of understanding the internals of JavaScript testing frameworks.
*   The `CONTRIBUTING.md` guide was generated using the [WeAllJS `CONTRIBUTING.md` generator](https://npm.im/weallcontribute).