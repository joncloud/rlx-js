const optionSpec = require('./option.spec.js').fn;
const resultSpec = require('./result.spec.js').fn;

(async () => {
    await optionSpec();
    await resultSpec();
})()
.then(() => console.log('Finished'))
.catch(reason => console.log('Failed', reason));
