const { Ok, Some, None, Err } = require('./index.js');

// TODO migrate to testing framework.
const assertEq = (left, right) => {
    if (left.valueOf() != right.valueOf()) {
        console.log('left (', left, ') <> right (', right, ')');
        process.exitCode = 1;
    }
}

const assertThrows = (msg, fn) => {
    try {
        fn();
    }
    catch (err) {
        assertEq(err.message, msg);
    }
}

// isOk
assertEq(Ok(-3).isOk(), true);
assertEq(Err('Some error message').isOk(), false);

// isErr
assertEq(Ok(-3).isErr(), false);
assertEq(Err('Some error message').isErr(), true);

// ok
assertEq(Ok(2).ok(), Some(2));
assertEq(Err('Nothing here').ok(), None());

// err
assertEq(Ok(2).err(), None());
assertEq(Err('Nothing here').err(), Some('Nothing here'));

// map
assertEq(Ok('1').map(text => +text), Ok(1));

// mapErr
const stringify = x => `error code: ${x}`;
assertEq(Ok(2).mapErr(stringify), Ok(2));
assertEq(Err(13).mapErr(stringify), Err('error code: 13'));

// iter
for (var x in Ok(7).iter()) {
    assertEq(x, Some(7));
}

// and
assertEq(Ok(2).and(Err('late error')), Err('late error'));
assertEq(Err('early error').and(Ok('foo')), Err('early error'));
assertEq(Err('not a 2').and(Err('late error')), Err('not a 2'));
assertEq(Ok(2).and(Ok('different result type')), Ok('different result type'));

// andThen
const sq = (x) => Ok(x * x);
const err = (x) => Err(x);

assertEq(Ok(2).andThen(sq).andThen(sq), Ok(16));
assertEq(Ok(2).andThen(sq).andThen(err), Err(4));
assertEq(Ok(2).andThen(err).andThen(sq), Err(2));
assertEq(Err(3).andThen(sq).andThen(sq), Err(3));

// or
assertEq(Ok(2).or('late error'), Ok(2));
assertEq(Err('early error').or(Ok(2)), Ok(2));
assertEq(Err('not a 2').or(Err('late error')), Err('late error'));
assertEq(Ok(2).or(Ok(100)), Ok(2));

// orElse
assertEq(Ok(2).orElse(sq).orElse(sq), Ok(2));
assertEq(Ok(2).orElse(err).orElse(sq), Ok(2));
assertEq(Err(3).orElse(sq).orElse(err), Ok(9));
assertEq(Err(3).orElse(err).orElse(err), Err(3));

// unwrapOr
assertEq(Ok(9).unwrapOr(2), 9);
assertEq(Err('error').unwrapOr(2), 2);

// unwrapOrElse
const count = x => x.length;

assertEq(Ok(2).unwrapOrElse(count), 2);
assertEq(Err('foo').unwrapOrElse(count), 3);

// unwrap
assertEq(Ok(2).unwrap(), 2);
assertThrows('emergency failure', () => Err('emergency failure').unwrap());

// expect
assertThrows('Testing expect: emergency failure', () => Err('emergency failure').expect('Testing expect'));

// unwrapErr
assertThrows('2', () => Ok(2).unwrapErr());
assertEq(Err('emergency failure').unwrapErr(), 'emergency failure');

// expectErr
assertThrows('Testing expect_err: 10', () => Ok(10).expectErr('Testing expect_err'));
