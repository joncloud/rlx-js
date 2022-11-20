'use strict';

const { Ok, Some, None, Err, ToOption } = require('./index.js');
const assert = require('./test-helpers.js').assert;

exports.fn = async () => {
  /**
   * @template T
   * @param {T} value
   */
  const OkPromise = (value) => ToOption(Promise.resolve(Some(value))).okOr(undefined);
  /**
   * @template E
   * @param {E} error
   */
  const ErrPromise = (error) => ToOption(Promise.resolve(None())).okOr(error);

  // isOk
  assert.eq(Ok(-3).isOk(), true);
  assert.eq(Err('Some error message').isOk(), false);

  // isErr
  assert.eq(Ok(-3).isErr(), false);
  assert.eq(Err('Some error message').isErr(), true);

  // ok
  assert.eq(Ok(2).ok(), Some(2));
  assert.eq(Err('Nothing here').ok(), None());

  // err
  assert.eq(Ok(2).err(), None());
  assert.eq(Err('Nothing here').err(), Some('Nothing here'));

  // map
  assert.eq(Ok('1').map(text => +text), Ok(1));
  assert.eq(await OkPromise('1').map(text => +text), Ok(1));
  assert.eq(
    await OkPromise('1')
      .map(text => Promise.resolve(+text))
      .map(val => Promise.resolve(val * 2)),
    Ok(2)
  );

  // mapErr
  const stringify = x => `error code: ${x}`;
  assert.eq(Ok(2).mapErr(stringify), Ok(2));
  assert.eq(Err(13).mapErr(stringify), Err('error code: 13'));
  assert.eq(await OkPromise(2).mapErr(stringify), Ok(2));
  assert.eq(await ErrPromise(13).mapErr(stringify), Err('error code: 13'));
  assert.eq(
    await ErrPromise(13)
      .mapErr(num => Promise.resolve(stringify(num)))
      .mapErr(text => Promise.resolve(text.length)),
    Err(14)
  );

  /**
   * @template T
   * @param {AsyncIterable<T>} iterable
   * @returns {Promise<T[]>}
   */
  const toArray = async (iterable) => {
    const array = [];
    for await (const item of iterable) {
      array.push(item);
    }
    return array;
  };

  // iter
  assert.arrayEq([...Ok(7).iter()], [7]);
  assert.arrayEq(await toArray(OkPromise(7).iter()), [7]);
  assert.empty([...Err('nothing!').iter()]);
  assert.empty(await toArray(ErrPromise(7).iter()));

  // and
  assert.eq(Ok(2).and(Err('late error')), Err('late error'));
  assert.eq(Err('early error').and(Ok('foo')), Err('early error'));
  assert.eq(Err('not a 2').and(Err('late error')), Err('not a 2'));
  assert.eq(Ok(2).and(Ok('different result type')), Ok('different result type'));
  assert.eq(await OkPromise(2).and(Err('late error')), Err('late error'));
  assert.eq(await ErrPromise('early error').and(Ok('foo')), Err('early error'));
  assert.eq(await ErrPromise('not a 2').and(Err('late error')), Err('not a 2'));
  assert.eq(await OkPromise(2).and(Ok('different result type')), Ok('different result type'));

  // andThen
  const sq = (x) => Ok(x * x);
  const err = (x) => Err(x);

  assert.eq(Ok(2).andThen(sq).andThen(sq), Ok(16));
  assert.eq(Ok(2).andThen(sq).andThen(err), Err(4));
  assert.eq(Ok(2).andThen(err).andThen(sq), Err(2));
  assert.eq(Err(3).andThen(sq).andThen(sq), Err(3));
  assert.eq(await OkPromise(2).andThen(sq).andThen(sq), Ok(16));
  assert.eq(await OkPromise(2).andThen(sq).andThen(err), Err(4));
  assert.eq(await OkPromise(2).andThen(err).andThen(sq), Err(2));
  assert.eq(await ErrPromise(3).andThen(sq).andThen(sq), Err(3));

  // or
  assert.eq(Ok(2).or(Err('late error')), Ok(2));
  assert.eq(Err('early error').or(Ok(2)), Ok(2));
  assert.eq(Err('not a 2').or(Err('late error')), Err('late error'));
  assert.eq(Ok(2).or(Ok(100)), Ok(2));
  assert.eq(await OkPromise(2).or(Err('late error')), Ok(2));
  assert.eq(await ErrPromise('early error').or(Ok(2)), Ok(2));
  assert.eq(await ErrPromise('not a 2').or(Err('late error')), Err('late error'));
  assert.eq(await OkPromise(2).or(Ok(100)), Ok(2));

  // orElse
  assert.eq(Ok(2).orElse(sq).orElse(sq), Ok(2));
  assert.eq(Ok(2).orElse(err).orElse(sq), Ok(2));
  assert.eq(Err(3).orElse(sq).orElse(err), Ok(9));
  assert.eq(Err(3).orElse(err).orElse(err), Err(3));
  assert.eq(await OkPromise(2).orElse(sq).orElse(sq), Ok(2));
  assert.eq(await OkPromise(2).orElse(err).orElse(sq), Ok(2));
  assert.eq(await ErrPromise(3).orElse(sq).orElse(err), Ok(9));
  assert.eq(await ErrPromise(3).orElse(err).orElse(err), Err(3));

  // unwrapOr
  assert.eq(Ok(9).unwrapOr(2), 9);
  assert.eq(Err('error').unwrapOr(2), 2);
  assert.eq(await OkPromise(9).unwrapOr(2), 9);
  assert.eq(await ErrPromise('error').unwrapOr(2), 2);

  // unwrapOrElse
  const count = x => x.length;

  assert.eq(Ok(2).unwrapOrElse(count), 2);
  assert.eq(Err('foo').unwrapOrElse(count), 3);
  assert.eq(await OkPromise(2).unwrapOrElse(count), 2);
  assert.eq(await ErrPromise('foo').unwrapOrElse(count), 3);

  // unwrap
  assert.eq(Ok(2).unwrap(), 2);
  assert.throws('emergency failure', () => Err('emergency failure').unwrap());
  assert.eq(await OkPromise(2).unwrap(), 2);
  assert.throwsAsync('emergency failure', () => ErrPromise('emergency failure').unwrap());

  // expect
  assert.throws('Testing expect: emergency failure', () => Err('emergency failure').expect('Testing expect'));
  assert.throwsAsync('Testing expect: emergency failure', () => ErrPromise('emergency failure').expect('Testing expect'));

  // unwrapErr
  assert.throws('2', () => Ok(2).unwrapErr());
  assert.eq(Err('emergency failure').unwrapErr(), 'emergency failure');
  assert.throwsAsync('2', () => OkPromise(2).unwrapErr());
  assert.eq(await ErrPromise('emergency failure').unwrapErr(), 'emergency failure');

  // expectErr
  assert.throws('Testing expect_err: 10', () => Ok(10).expectErr('Testing expect_err'));
  assert.throwsAsync('Testing expect_err: 10', () => OkPromise(10).expectErr('Testing expect_err'));

  // match
  assert.eq(Ok(123).match({ ok: x => x, err: x => x.length }), 123);
  assert.eq(await Ok(123).match({ ok: x => Promise.resolve(x), err: x => Promise.resolve(x.length) }), 123);
  assert.eq(await OkPromise(123).match({ ok: x => x, err: x => x.length }), 123);
  assert.eq(await OkPromise(123).match({ ok: x => Promise.resolve(x), err: x => Promise.resolve(x.length) }), 123);
  assert.eq(Err('foo').match({ ok: x => x, err: x => x.length }), 3);
  assert.eq(await Err('foo').match({ ok: x => Promise.resolve(x), err: x => Promise.resolve(x.length) }), 3);
  assert.eq(await ErrPromise('foo').match({ ok: x => x, err: x => x.length }), 3);
  assert.eq(await ErrPromise('foo').match({ ok: x => Promise.resolve(x), err: x => Promise.resolve(x.length) }), 3);
};
