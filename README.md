# RlxJS

[![npm](https://img.shields.io/npm/v/rlx-js.svg)](https://www.npmjs.com/package/rlx-js)

## Description

RlxJS provides error handling functions inspired by rust like Some, None, Ok, Err.

## Licensing

Released under the MIT License.  See the [LICENSE][] file for further details.

[license]: LICENSE.md

## Installation

In shell execute

```bash
npm install rlx-js
```

Or update `package.json` to include a dependency on

```json
"dependencies": {
  "rlx-js": "0.2.0"
}
```

## Usage

Sample echo program:

```javascript
const { Some, None } = require('rlx-js');

const getArg = () => process.argv.length > 2 ? Some(process.argv[2]) : None();
const message = getArg().mapOrElse(() => "Missing Argument", msg => `Echo: ${msg}`);
console.log(message);
```

For additional usage see [Option][] and [Result][] tests.

[Option]: option.spec.js
[Result]: result.spec.js
