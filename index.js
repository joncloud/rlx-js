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
    }

    class SomeOption {
        constructor(value) {
            this.__value = value;
        }

        isSome() { return true; }
        isNone() { return false; }
        expect(msg) { return this.__value; }
        unwrap() { return this.__value; }
        unwrapOr(def) { return this.__value; }
        unwrapOrElse(fn) { return this.__value; }
        map(fn) { return Some(fn(this.__value)); }
        mapOr(def, fn) { return fn(this.__value); }
        mapOrElse(def, fn) { return fn(this.__value); }
        okOr(error) { return Ok(this.__value); }
        okOrElse(fn) { return Ok(this.__value); }
        *iter() {
            yield this.__value;
        }
        and(optionB) { return optionB; }
        andThen(fn) { return fn(this.__value); }
        or(optionB) { return this; }
        orElse(fn) { return this; }

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
        map(fn) { return this; }
        mapOr(def, fn) { return def; }
        mapOrElse(def, fn) { return def(); }
        okOr(error) { return Err(error); }
        okOrElse(fn) { return Err(fn()); }
        *iter() { }
        and(optionB) { return this; }
        andThen(fn) { return this; }
        or(optionB) { return optionB; }
        orElse(fn) { return fn(); }

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
    }

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
        mapErr(fn) { return this; }
        *iter() {
            yield this.__value;
        }
        and(res) { return res; }
        andThen(fn) { return fn(this.__value); }
        or(res) { return this; }
        orElse(fn) { return this; }
        unwrap() { return this.__value; }
        unwrapErr() { throw new Error(this.__value); }
        unwrapOr(optionB) { return this.__value; }
        unwrapOrElse(fn) { return this.__value; }
        expect(msg) { return this.__value; }
        expectErr(msg) { throw new Error(`${msg}: ${this.__value}`); }

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
        map(fn) { return this; }
        mapErr(fn) { return Err(fn(this.__error)); }
        *iter() { }
        and(res) { return this; }
        andThen(fn) { return this; }
        or(res) { return res; }
        orElse(fn) { return fn(this.__error); }
        unwrap() { throw new Error(this.__error); }
        unwrapErr() { return this.__error; }
        unwrapOr(optionB) { return optionB; }
        unwrapOrElse(fn) { return fn(this.__error); }
        expect(msg) { throw new Error(`${msg}: ${this.__error}`); }
        expectErr(msg) { return this.__error; }

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

    exports.ToOption = ToOption;
    exports.Some = Some;
    exports.None = None;
    exports.ToOk = ToOk;
    exports.ToErr = ToErr;
    exports.Err = Err;
    exports.Ok = Ok;
})(typeof exports === 'undefined'? this['rlx']={}: exports);
