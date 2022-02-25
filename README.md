# [Alcides](https://www.npmjs.com/package/alcides)

Yet another node based JavaScript TDD framework.

[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
![license](https://img.shields.io/github/license/augustinesaidimu/alcides)
![tag](https://img.shields.io/github/v/tag/augustinesaidimu/alcides?sort=semver)
![build](https://img.shields.io/github/workflow/status/augustinesaidimu/alcides/Release)
![tests](https://img.shields.io/github/workflow/status/augustinesaidimu/alcides/Test?label=tests)
![chai](https://img.shields.io/npm/dependency-version/alcides/chai)
![@types/chai](https://img.shields.io/npm/dependency-version/alcides/@types/chai)
![@types/alcides](https://img.shields.io/npm/dependency-version/alcides/@types/alcides)

## Re-inventing the wheel

There exists better and more featured unit testing frameworks in the JavaScript
ecosystem; Why then, would I go about creating another? **Academics**. <br/>

This project is purely an academic endeavor.

## What's in a name ?

See the [Labors of Hercules](https://en.wikipedia.org/wiki/Labours_of_Hercules)<br/>

## Contributing

Contributions are welcome, and encouraged.
See [here](https://github.com/asaidimu/alcides/blob/main/CONTRIBUTING.md) on how to contribute.

## License

This project is released under the [MIT](https://choosealicense.com/licenses/mit/) License.

<hr/>

## Usage

-   [Installation](#installation)
-   [Writing tests](#writing-tests)
-   [Running tests](#running-tests)
-   [Configuration](#configuration)

### Installation

Install with your preferred package manager.

```
yarn install -D alcides
```

```
npm install --save-dev alcides
```

### Writing tests

Assertions are provided internally from [Chai](https://www.npmjs.com/package/chai).

```typescript
/* tests/example.test.ts */
suite('Example test suite.', () => {
    interface State {
        message?: string
    }

    /* Called before each test is run */
    setUp((): State => {
        return { message: 'QWERTY' }
    })

    /* Called after each test is run */
    tearDown((state: State) => {
        delete state.message
    })

    /* defines a test case */
    test('Message equals QWERTY', ({ message }: State) => {
        assert.deepEqual(message, 'QWERTY')
    })
})
```

```javascript
/* tests/example.test.js */
suite('Example test suite.', () => {
    setUp(() => {
        return { message: 'QWERTY' }
    })

    tearDown((state) => {
        delete state.message
    })

    test('Message equals QWERTY', ({ message }) => {
        assert.deepEqual(message, 'QWERTY')
    })
})
```

### Running tests

Execute the test runner with your package manager

```
npm exec alcides
```

```
yarn alcides
```

You might consider adding a test script to your package.json

```json
{
  "scripts": {
    "test": "alcides"
}
```

### Configuration

Several options are offered to configure the runner. This can be done via command-line arguments or in a file.

```typescript
/* The config interface. */
interface Config {
    /* a list of test files or globs use to match test files */
    include: string | Array<string>

    /* Set to false to show errors only.*/
    verbose: boolean

    /* maximum run time for each test.*/
    timeout: number

    /* determines whether tests should be run in parallel.*/
    parallel: boolean

    /* number of workers used when runnning in parallel.*/
    workers: number

    /* determines whether the runner should run once or monitor for changes.*/
    watch: boolean

    /* a list of files to watch. */
    files: string | Array<string>
}
```

The following are the defaults for all options.

```typescript
/* Defaults */
const config: Config = {
    include: ['tests/**/*.js', 'test/**/*.js'],
    verbose: true,
    timeout: 1000,

    watch: false,
    files: [],

    parallel: false,
    workers: 0,
}
```

#### Configuration via files

These options can be set in one of the following files:

-   A JSON file named `.alcides.json` or `alcides.json`.
    ```json
    {
        "include": "tests"
    }
    ```
-   A JavaScript file named `.alcides.js` or `alcides.config.js` exporting the values. <br/>
    CommonJs modules.
    ```javascript
    module.exports = {
        // options ...
    }
    ```
    ES Modules. Projects with `"type"="module"` set in their package.json
    ```javascript
    export default {
        // options ...
    }
    ```
-   In the project's `package.json` with the key `alcides`.
    ```json
    {
        "alcides": {
            "timeout": 2000
        }
    }
    ```

#### Configuration via arguments

All the options can be overridden via command-line arguments.
Run the following command for reference.

```bash
alcides --help
```
