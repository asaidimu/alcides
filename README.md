# Alcides

[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
![license](https://img.shields.io/github/license/augustinesaidimu/alcides)
![tag](https://img.shields.io/github/v/tag/augustinesaidimu/alcides?sort=semver)
![release](https://img.shields.io/github/workflow/status/augustinesaidimu/alcides/Release)
![tests](https://img.shields.io/github/workflow/status/augustinesaidimu/alcides/Test?label=tests)

## Re-inventing the wheel.

There exists better and more featured unit testing frameworks in the JavaScript
ecosystem; Why then, would I go about creating another? **Academics**. <br/>

This project is purely an academic endeavor and _should not be used in actual development_.

## What's in a name ?

The allegory of the [Labors of Hercules](https://en.wikipedia.org/wiki/Labours_of_Hercules) <br/>
The names _Heracles_ and _Alcaeus_ were already taken on npm, so ... _Alcides_.

## License
This project is released under the [MIT](https://choosealicense.com/licenses/mit/) License.

<hr/>

## Contents
 -  [Installation](#installation)
 -  [Configuration](#configuration)
 -  [Running tests](#running-tests)
 -  [Writing tests](#writing-tests)
 
 
### Installation
Install with your prefered package manager.
```
yarn install -D alcides
```
```
npm install --save-dev alcides
```

### Configuration
The following options are offered to configure the runner.
```javascript
const defaultConfig = {
   include: 'tests', /* where to look for test files. */
   timeout: 1000,    /* maximum run time for each test.*/
   watch: false,     /* determines whether the runner should run once or monitor for changes.*/
   files: [],         /* a list of files to watch. */
}
```
These options can be set in one of:
  -  A json file named ``.alcides.json`` or ``alcides.json`` with a single entry
      ```json 
        {
          "include": "tests"
        }
      ```
  - A javascript file name ``.alcides.js`` or ``.alcides.config.js`` exporting the values. <br/>
    CommonJs modules.
     ```javascript 
     module.exports = {
        // options ...
     }
     ```
    ES Modules. Projects with ``"type"="module"`` set in their package.json
    ```javascript
    export default {
       // options ...
    }
    ```
 - In the project's ``package.json`` with the key ``alcides``.
   ```json
    {
    
      "alcides" : { 
            "timeout": 2000,
      }
    }
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

### Writing tests.
Assertations are provided internally from [Chai](https://www.npmjs.com/package/chai).
``` typescript
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
``` javascript
/* tests/example.test.js */
suite('Example test suite.', () => {
    setUp(()=> {
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
