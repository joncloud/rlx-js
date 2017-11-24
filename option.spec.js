const { Ok, Some, None, Err } = require('./index.js');
const assert = require('./test-helpers.js').assert;

exports.fn = async () => {
    // isSome
    assert.eq(Some(2).isSome(), true);
    assert.eq(None().isSome(), false);

    // isNone
    assert.eq(Some(2).isNone(), false);
    assert.eq(None().isNone(), true);

    // expect
    assert.eq(Some('value').expect('the world is ending'), 'value');
    assert.eq(await Some(Promise.resolve('value')).expect('the world is ending'), 'value');
    assert.throws('the world is ending', () => None().expect('the world is ending'));
    // assert.throws('the world is ending', () => {
        
    // })
    
    // unwrap
    assert.eq(Some('air').unwrap(), 'air');
    assert.throws('Option does not contain value', () => None().unwrap());

    // unwrapOr
    assert.eq(Some('car').unwrapOr('bike'), 'car');
    assert.eq(None().unwrapOr('bike'), 'bike');

    // unwrapOrElse
    assert.eq(Some(4).unwrapOrElse(() => 2 * 10), 4);
    assert.eq(None().unwrapOrElse(() => 2 * 10), 20);

    // map
    assert.eq(Some('Hello, World!').map(s => s.length), Some(13));

    // mapOr
    assert.eq(Some('foo').mapOr(42, v => v.length), 3);
    assert.eq(None().mapOr(42, v => v.length), 42);

    // mapOrElse
    assert.eq(Some('foo').mapOrElse(() => 2 * 21, v => v.length), 3);
    assert.eq(None().mapOrElse(() => 2 * 21, v => v.length), 42);

    // okOr
    assert.eq(Some('foo').okOr(0), Ok('foo'));
    assert.eq(None().okOr(0), Err(0));

    // okOrElse
    assert.eq(Some('foo').okOrElse(() => 0), Ok('foo'));
    assert.eq(None().okOrElse(() => 0), Err(0));

    // iter
    assert.arrayEq([...Some(4).iter()], [4]);
    assert.empty([...None().iter()]);

    // and
    assert.eq(Some(2).and(None()), None());
    assert.eq(None().and(Some('foo')), None());
    assert.eq(Some(2).and(Some('foo')), Some('foo'));
    assert.eq(None().and(None()), None());

    // andThen
    const sq = (x) => Some(x * x);
    const nope = (_) => None();

    assert.eq(Some(2).andThen(sq).andThen(sq), Some(16));
    assert.eq(Some(2).andThen(nope).andThen(sq), None());
    assert.eq(None().andThen(sq).andThen(sq), None());

    // or
    assert.eq(Some(2).or(None()), Some(2));
    assert.eq(None().or(Some(2)), Some(2));
    assert.eq(Some(2).or(Some(100)), Some(2));
    assert.eq(None().or(None()), None());

    // orElse
    const nobody = () => None();
    const vikings = () => Some('vikings');

    assert.eq(Some('barbarians').orElse(vikings), Some('barbarians'));
    assert.eq(None().orElse(vikings), Some('vikings'));
    assert.eq(None().orElse(nobody), None());
};
