const { Ok, Some, None, Err } = require('./index.js');
const { assertArrayEq, assertEmpty, assertEq, assertThrows } = require('./test-helpers.js');

exports.fn = async () => {
    // isSome
    assertEq(Some(2).isSome(), true);
    assertEq(None().isSome(), false);

    // isNone
    assertEq(Some(2).isNone(), false);
    assertEq(None().isNone(), true);

    // expect
    assertEq(Some('value').expect('the world is ending'), 'value');
    assertEq(await Some(Promise.resolve('value')).expect('the world is ending'), 'value');
    assertThrows('the world is ending', () => None().expect('the world is ending'));
    // assertThrows('the world is ending', () => {
        
    // })
    
    // unwrap
    assertEq(Some('air').unwrap(), 'air');
    assertThrows('Option does not contain value', () => None().unwrap());

    // unwrapOr
    assertEq(Some('car').unwrapOr('bike'), 'car');
    assertEq(None().unwrapOr('bike'), 'bike');

    // unwrapOrElse
    assertEq(Some(4).unwrapOrElse(() => 2 * 10), 4);
    assertEq(None().unwrapOrElse(() => 2 * 10), 20);

    // map
    assertEq(Some('Hello, World!').map(s => s.length), Some(13));

    // mapOr
    assertEq(Some('foo').mapOr(42, v => v.length), 3);
    assertEq(None().mapOr(42, v => v.length), 42);

    // mapOrElse
    assertEq(Some('foo').mapOrElse(() => 2 * 21, v => v.length), 3);
    assertEq(None().mapOrElse(() => 2 * 21, v => v.length), 42);

    // okOr
    assertEq(Some('foo').okOr(0), Ok('foo'));
    assertEq(None().okOr(0), Err(0));

    // okOrElse
    assertEq(Some('foo').okOrElse(() => 0), Ok('foo'));
    assertEq(None().okOrElse(() => 0), Err(0));

    // iter
    assertArrayEq([...Some(4).iter()], [4]);
    assertEmpty([...None().iter()]);

    // and
    assertEq(Some(2).and(None()), None());
    assertEq(None().and(Some('foo')), None());
    assertEq(Some(2).and(Some('foo')), Some('foo'));
    assertEq(None().and(None()), None());

    // andThen
    const sq = (x) => Some(x * x);
    const nope = (_) => None();

    assertEq(Some(2).andThen(sq).andThen(sq), Some(16));
    assertEq(Some(2).andThen(nope).andThen(sq), None());
    assertEq(None().andThen(sq).andThen(sq), None());

    // or
    assertEq(Some(2).or(None()), Some(2));
    assertEq(None().or(Some(2)), Some(2));
    assertEq(Some(2).or(Some(100)), Some(2));
    assertEq(None().or(None()), None());

    // orElse
    const nobody = () => None();
    const vikings = () => Some('vikings');

    assertEq(Some('barbarians').orElse(vikings), Some('barbarians'));
    assertEq(None().orElse(vikings), Some('vikings'));
    assertEq(None().orElse(nobody), None());
};
