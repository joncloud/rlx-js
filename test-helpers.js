((exports) => {
    const fail = () => {
        process.exitCode = 1;
    };

    // TODO migrate to testing framework.
    const assertEq = (left, right) => {
        if (left.valueOf() != right.valueOf()) {
            console.log(`left (${left}) <> right (${right})`);
            fail();
        }
    };

    const assertThrows = (msg, fn) => {
        try {
            fn();
            console.log(`fn (${fn}) doesn\'t throw error ${msg}`)
            fail();
        }
        catch (err) {
            assertEq(err.message, msg);
        }
    };

    const assertArrayEq = (left, right) => {
        assertEq(left.length, right.length);
        for (let index = 0; index < left.length; index++) {
            assertEq(left[0], right[0]);
        }
    };

    const assertEmpty = (array) => {
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
    };

    exports.assertArrayEq = assertArrayEq;
    exports.assertEmpty = assertEmpty;
    exports.assertEq = assertEq;
    exports.assertThrows = assertThrows;
})(typeof exports === 'undefined'? this['rlx']={}: exports);
