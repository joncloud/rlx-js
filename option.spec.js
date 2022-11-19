'use strict';

const { Ok, Some, None, Err, ToOption } = require('./index.js');
const assert = require('./test-helpers.js').assert;

exports.fn = async () => {
  /**
   * @template T
   * @param {T} value
   */
  const SomePromise = (value) => ToOption(Promise.resolve(Some(value)));
  const NonePromise = () => ToOption(Promise.resolve(None()));

  // isSome
  assert.eq(Some(2).isSome(), true);
  assert.eq(None().isSome(), false);

  // isNone
  assert.eq(Some(2).isNone(), false);
  assert.eq(None().isNone(), true);

  // expect
  assert.eq(Some('value').expect('the world is ending'), 'value');
  assert.eq(await SomePromise('value').expect('the world is ending'), 'value');
  assert.throws('the world is ending', () => None().expect('the world is ending'));
  assert.throwsAsync('the world is ending', () => NonePromise().expect('the world is ending'));

  // unwrap
  assert.eq(Some('air').unwrap(), 'air');
  assert.throws('Option does not contain value', () => None().unwrap());
  assert.eq(await SomePromise('air').unwrap(), 'air');
  assert.throwsAsync('Option does not contain value', () => NonePromise().unwrap());

  // unwrapOr
  assert.eq(Some('car').unwrapOr('bike'), 'car');
  assert.eq(None().unwrapOr('bike'), 'bike');
  assert.eq(await SomePromise('car').unwrapOr('bike'), 'car');
  assert.eq(await NonePromise().unwrapOr('bike'), 'bike');

  // unwrapOrElse
  assert.eq(Some(4).unwrapOrElse(() => 2 * 10), 4);
  assert.eq(None().unwrapOrElse(() => 2 * 10), 20);
  assert.eq(await SomePromise(4).unwrapOrElse(() => 2 * 10), 4);
  assert.eq(await NonePromise().unwrapOrElse(() => 2 * 10), 20);

  // map
  assert.eq(Some('Hello, World!').map(s => s.length), Some(13));
  assert.eq(await SomePromise('Hello, World!').map(s => s.length), Some(13));
  assert.eq(
    await SomePromise('Hello, World!')
      .map(s => Promise.resolve(s.length))
      .map(len => Promise.resolve(len ** 2)),
    Some(169)
  );

  // mapOr
  assert.eq(Some('foo').mapOr(42, v => v.length), 3);
  assert.eq(None().mapOr(42, v => v.length), 42);
  assert.eq(await SomePromise('foo').mapOr(42, v => v.length), 3);
  assert.eq(await NonePromise().mapOr(42, v => v.length), 42);

  // mapOrElse
  assert.eq(Some('foo').mapOrElse(() => 2 * 21, v => v.length), 3);
  assert.eq(None().mapOrElse(() => 2 * 21, v => v.length), 42);
  assert.eq(await SomePromise('foo').mapOrElse(() => 2 * 21, v => v.length), 3);
  assert.eq(await NonePromise().mapOrElse(() => 2 * 21, v => v.length), 42);

  // okOr
  assert.eq(Some('foo').okOr(0), Ok('foo'));
  assert.eq(None().okOr(0), Err(0));
  assert.eq(await SomePromise('foo').okOr(0), Ok('foo'));
  assert.eq(await NonePromise().okOr(0), Err(0));

  // okOrElse
  assert.eq(Some('foo').okOrElse(() => 0), Ok('foo'));
  assert.eq(None().okOrElse(() => 0), Err(0));
  assert.eq(await SomePromise('foo').okOrElse(() => 0), Ok('foo'));
  assert.eq(await NonePromise().okOrElse(() => 0), Err(0));

  /**
   * @param {AsyncIterator<T>} iterator
   * @returns {Promise<T[]>}
   */
  const toArray = async (iterator) => {
    const array = [];
    for await (const item of iterator) {
      array.push(item);
    }
    return array;
  };

  // iter
  assert.arrayEq([...Some(4).iter()], [4]);
  assert.arrayEq(await toArray(SomePromise(4).iter()), [4]);
  assert.empty([...None().iter()]);
  assert.empty(await toArray(None().iter()));

  // and
  assert.eq(Some(2).and(None()), None());
  assert.eq(None().and(Some('foo')), None());
  assert.eq(Some(2).and(Some('foo')), Some('foo'));
  assert.eq(None().and(None()), None());
  assert.eq(await SomePromise(2).and(None()), None());
  assert.eq(await NonePromise().and(Some('foo')), None());
  assert.eq(await SomePromise(2).and(Some('foo')), Some('foo'));
  assert.eq(await NonePromise().and(None()), None());

  // andThen
  const sq = (x) => Some(x * x);
  const nope = () => None();

  assert.eq(Some(2).andThen(sq).andThen(sq), Some(16));
  assert.eq(Some(2).andThen(nope).andThen(sq), None());
  assert.eq(None().andThen(sq).andThen(sq), None());
  assert.eq(await SomePromise(2).andThen(sq).andThen(sq), Some(16));
  assert.eq(await SomePromise(2).andThen(nope).andThen(sq), None());
  assert.eq(await NonePromise().andThen(sq).andThen(sq), None());

  // or
  assert.eq(Some(2).or(None()), Some(2));
  assert.eq(None().or(Some(2)), Some(2));
  assert.eq(Some(2).or(Some(100)), Some(2));
  assert.eq(None().or(None()), None());
  assert.eq(await SomePromise(2).or(None()), Some(2));
  assert.eq(await NonePromise().or(Some(2)), Some(2));
  assert.eq(await SomePromise(2).or(Some(100)), Some(2));
  assert.eq(await NonePromise().or(None()), None());

  // orElse
  const nobody = () => None();
  const nobodyAway = () => NonePromise();
  const vikings = () => Some('vikings');
  const vikingsAway = () => SomePromise('vikings');

  assert.eq(Some('barbarians').orElse(vikings), Some('barbarians'));
  assert.eq(None().orElse(vikings), Some('vikings'));
  assert.eq(None().orElse(nobody), None());
  assert.eq(await SomePromise('barbarians').orElse(vikings), Some('barbarians'));
  assert.eq(await SomePromise('barbarians').orElse(vikingsAway), Some('barbarians'));
  assert.eq(await NonePromise().orElse(vikings), Some('vikings'));
  assert.eq(await NonePromise().orElse(vikingsAway), Some('vikings'));
  assert.eq(await NonePromise().orElse(nobody), None());
  assert.eq(await NonePromise().orElse(nobodyAway).orElse(nobodyAway).orElse(vikingsAway), Some('vikings'));
};
