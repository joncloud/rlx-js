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
  "rlx-js": "0.2.x"
}
```

## Samples

### Sample echo program

```javascript
import { Some, None } from 'rlx-js';

const getArg = () => process.argv.length > 2 ? Some(process.argv[2]) : None();
const message = getArg().mapOrElse(() => "Missing Argument", msg => `Echo: ${msg}`);
console.log(message);
```

### Promise helpers

```javascript
import { Ok, Err, FlattenResult } from 'rlx-js';

const fetchData = async (url) => {
  const res = await fetch(url);
  if (res.ok) {
    return Ok(res);
  }
  return Err(`Invalid status ${res.status}`);
};

const validateContentType = (res) => {
  const contentType = res.headers.get('content-type');
  if (contentType.includes('application/json')) {
    return Ok(res);
  }
  return Err(`Invalid content type ${contentType}`);
};

const loadText = async (res) => {
  const text = await res.text();
  return text;
};

const text = await FlattenResult(fetchData('...'))
  .andThen(validateContentType)
  .map(loadText)
  .unwrapOrElse(err => err);
console.log(text);
```

### Additional usage

For additional usage see [Option][] and [Result][] tests.

[Option]: option.spec.js
[Result]: result.spec.js
