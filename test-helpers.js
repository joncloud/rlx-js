((exports) => {
    const fail = () => {
        process.exitCode = 1;
    };

    // TODO migrate to testing framework.
    class Assert {
        arrayEq(left, right) {
            this.eq(left.length, right.length);
            for (let index = 0; index < left.length; index++) {
                this.eq(left[index], right[index]);
            }
        }

        empty(array) {
            if (!array) {
                console.log('array is not defined');
                fail();
            }
            else if (array.length == undefined) {
                console.log(`array ${array} does not have length`);
                fail();
            }
            else if (array.length) {
                console.log(`array (${array}) is not empty (${array.length})`);
                fail();
            }
        }

        eq(left, right) {
            if (left.valueOf() != right.valueOf()) {
                console.log(`left (${left}) <> right (${right})`);
                fail();
            }
        }

        throws(msg, fn) {
            try {
                fn();
                console.log(`fn (${fn}) doesn\'t throw error ${msg}`)
                fail();
            }
            catch (err) {
                this.eq(err.message, msg);
            }
        }

        async throwsAsync(msg, fn) {
            try {
                await fn();
                console.log(`fn (${fn}) doesn\'t throw error ${msg}`)
                fail();
            }
            catch (err) {
                this.eq(err.message, msg);
            }
        }
    }

    const assert = new Assert();
    exports.assert = assert;
    exports.assertArrayEq = (left, right) => assert.arrayEq(left, right);
    exports.assertEmpty = (array) => assert.empty(array);
    exports.assertEq = (left, right) => assert.eq(left, right);
    exports.assertThrows = (msg, fn) => assert.throws(msg, fn);
})(typeof exports === 'undefined'? this['rlx']={}: exports);
