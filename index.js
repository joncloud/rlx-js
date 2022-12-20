'use strict';

((exports) => {
  class PromiseOption {
    constructor(promise) {
      this.__promise = promise;
    }

    async __await(fn) {
      const option = await this.__promise;
      return fn(option);
    }

    __then(fn) {
      const promise = this.__promise.then(fn);
      return new PromiseOption(promise);
    }

    then(onfulfilled, onrejected) { return this.__promise.then(onfulfilled, onrejected); }

    unwrap() { return this.__await(option => option.unwrap()); }
    unwrapOr(def) { return this.__await(option => option.unwrapOr(def)); }
    unwrapOrElse(fn) { return this.__await(option => option.unwrapOrElse(fn)); }
    expect(msg) { return this.__await(option => option.expect(msg)); }
    okOr(error) {
      const promise = this.__promise.then(option => option.okOr(error));
      return new PromiseResult(promise);
    }
    okOrElse(fn) {
      const promise = this.__promise.then(option => option.okOrElse(fn));
      return new PromiseResult(promise);
    }
    async *iter() {
      const opt = await this.__promise;
      for (const item of opt.iter()) {
        yield item;
      }
    }
    map(fn) { return this.__then(option => option.map(fn)); }
    mapOr(def, fn) { return this.__then(option => option.mapOr(def, fn)); }
    mapOrElse(def, fn) { return this.__then(option => option.mapOrElse(def, fn)); }
    and(optionB) { return this.__then(option => option.and(optionB)); }
    andThen(fn) { return this.__then(option => option.andThen(fn)); }
    or(optionB) { return this.__then(option => option.or(optionB)); }
    orElse(fn) { return this.__then(option => option.orElse(fn)); }
    match(opts) { return this.__then(option => option.match(opts)); }
  }

  class SomeOption {
    constructor(value) {
      this.__value = value;
    }

    isSome() { return true; }
    isNone() { return false; }
    expect() { return this.__value; }
    unwrap() { return this.__value; }
    unwrapOr() { return this.__value; }
    unwrapOrElse() { return this.__value; }
    map(fn) { return Some(fn(this.__value)); }
    mapOr(_def, fn) { return fn(this.__value); }
    mapOrElse(_def, fn) { return fn(this.__value); }
    okOr() { return Ok(this.__value); }
    okOrElse() { return Ok(this.__value); }
    *iter() {
      yield this.__value;
    }
    and(optionB) { return optionB; }
    andThen(fn) { return fn(this.__value); }
    or() { return this; }
    orElse() { return this; }
    match({ some }) { return some(this.__value); }

    valueOf() { return 'some' + this.__value.valueOf(); }
  }

  const noneValue = {};
  class NoneOption {
    isSome() { return false; }
    isNone() { return true; }
    expect(msg) { throw new Error(msg); }
    unwrap() { this.expect('Option does not contain value'); }
    unwrapOr(def) { return def; }
    unwrapOrElse(fn) { return fn(); }
    map() { return this; }
    mapOr(def) { return def; }
    mapOrElse(def) { return def(); }
    okOr(error) { return Err(error); }
    okOrElse(fn) { return Err(fn()); }
    *iter() { }
    and() { return this; }
    andThen() { return this; }
    or(optionB) { return optionB; }
    orElse(fn) { return fn(); }
    match({ none }) { return none(this.__value); }

    valueOf() { return 'none' + noneValue.valueOf(); }
  }

  const IsOption = (maybe) => {
    return maybe instanceof SomeOption
      || maybe instanceof NoneOption
      || maybe instanceof PromiseOption;
  };

  const ToOption = (value) => {
    return value === null || value === undefined
      ? None()
      : IsOption(value) ? value : Some(value);
  };

  const Some = (value) => {
    return value instanceof Promise
      ? new PromiseOption(value.then(ToOption))
      : new SomeOption(value);
  };

  const noneOption = new NoneOption();
  const None = () => {
    return noneOption;
  };

  class PromiseResult {
    constructor(promise) {
      this.__promise = promise;
    }

    async __await(fn) {
      const result = await this.__promise;
      return fn(result);
    }

    __then(fn) {
      const promise = this.__promise.then(fn);
      return new PromiseResult(promise);
    }

    then(onfulfilled, onrejected) { return this.__promise.then(onfulfilled, onrejected); }

    ok() {
      const promise = this.__promise.then(result => result.ok());
      return new PromiseOption(promise);
    }
    err() {
      const promise = this.__promise.then(result => result.err());
      return new PromiseOption(promise);
    }
    map(fn) { return this.__then(result => result.map(fn)); }
    mapErr(fn) { return this.__then(result => result.mapErr(fn)); }
    async *iter() {
      const res = await this.__promise;
      for (const item of res.iter()) {
        yield item;
      }
    }
    and(res) { return this.__then(result => result.and(res)); }
    andThen(fn) { return this.__then(result => result.andThen(fn)); }
    or(res) { return this.__then(result => result.or(res)); }
    orElse(fn) { return this.__then(result => result.orElse(fn)); }
    unwrap() { return this.__await(result => result.unwrap()); }
    unwrapErr() { return this.__await(result => result.unwrapErr()); }
    unwrapOr(optionB) { return this.__await(result => result.unwrapOr(optionB)); }
    unwrapOrElse(fn) { return this.__await(result => result.unwrapOrElse(fn)); }
    expect(msg) { return this.__await(result => result.expect(msg)); }
    expectErr(msg) { return this.__await(result => result.expectErr(msg)); }
    match(opts) { return this.__await(result => result.match(opts)); }
  }

  class OkResult {
    constructor(value) {
      this.__value = value;
    }

    isOk() { return true; }
    isErr() { return false; }
    ok() { return Some(this.__value); }
    err() { return None(); }
    map(fn) { return Ok(fn(this.__value)); }
    mapErr() { return this; }
    *iter() {
      yield this.__value;
    }
    and(res) { return res; }
    andThen(fn) { return fn(this.__value); }
    or() { return this; }
    orElse() { return this; }
    unwrap() { return this.__value; }
    unwrapErr() { throw new Error(this.__value); }
    unwrapOr() { return this.__value; }
    unwrapOrElse() { return this.__value; }
    expect() { return this.__value; }
    expectErr(msg) { throw new Error(`${msg}: ${this.__value}`); }
    match({ ok }) { return ok(this.__value); }

    valueOf() { return 'ok' + this.__value.valueOf(); }
  }

  class ErrorResult {
    constructor(error) {
      this.__error = error;
    }

    isOk() { return false; }
    isErr() { return true; }
    ok() { return None(); }
    err() { return Some(this.__error); }
    map() { return this; }
    mapErr(fn) { return Err(fn(this.__error)); }
    *iter() { }
    and() { return this; }
    andThen() { return this; }
    or(res) { return res; }
    orElse(fn) { return fn(this.__error); }
    unwrap() { throw new Error(this.__error); }
    unwrapErr() { return this.__error; }
    unwrapOr(optionB) { return optionB; }
    unwrapOrElse(fn) { return fn(this.__error); }
    expect(msg) { throw new Error(`${msg}: ${this.__error}`); }
    expectErr() { return this.__error; }
    match({ err }) { return err(this.__error); }

    valueOf() { return 'error' + this.__error.valueOf(); }
  }

  const IsResult = (maybe) => {
    return maybe instanceof OkResult
      || maybe instanceof ErrorResult
      || maybe instanceof PromiseResult;
  };

  const ToOk = (value) => {
    return IsResult(value) ? value : Ok(value);
  };

  const Ok = (value) => {
    return value instanceof Promise
      ? new PromiseResult(value.then(ToOk))
      : new OkResult(value);
  };

  const ToErr = (value) => {
    return IsResult(value) ? value : Err(value);
  };

  const Err = (error) => {
    return error instanceof Promise
      ? new PromiseResult(error.then(ToErr))
      : new ErrorResult(error);
  };

  const FlattenResult = (promise) => {
    if (promise instanceof Promise) {
      return new PromiseResult(
        promise.then(result => {
          if (!IsResult(result)) {
            throw new Error ('Expected promise to be Promise<Result> or Result');
          }
          return result;
        })
      );
    }
    if (IsResult(promise)) {
      return promise;
    }

    throw new Error('Expected promise to be Promise<Result> or Result');
  };

  exports.ToOption = ToOption;
  exports.Some = Some;
  exports.None = None;
  exports.ToOk = ToOk;
  exports.ToErr = ToErr;
  exports.Err = Err;
  exports.Ok = Ok;
  exports.FlattenResult = FlattenResult;
})(typeof exports === 'undefined' ? this['rlx'] = {} : exports);
