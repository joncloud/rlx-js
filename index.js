((exports) => {
    class OptionPromiseLike {
        constructor(promise) {
            this.__promise = promise;
        }

        async __use(fn) {
            const option = await this.__promise;
            return fn(option);
        }

        __select(fn) {
            const promise = this.__promise.then(fn);
            return new OptionPromiseLike(promise);
        }

        async toSync() { return await this.__promise; }

        unwrap() { return this.__use(option => option.unwrap()); }
        unwrapOr(def) { return this.__use(option => option.unwrapOr(def)); }
        unwrapOrElse(fn) { return this.__use(option => option.unwrapOrElse(fn)); }
        expect(msg) { return this.__use(option => option.expect(msg)); }
        map(fn) { return this.__use(option => option.map(fn)); }
        mapOr(def, fn) { return this.__use(option => option.mapOr(def, fn)); }
        mapOrElse(def, fn) { return this.__use(option => option.mapOrElse(def, fn)); }
        okOr(error) { throw new Error('test') }
        okOrElse(fn) { throw new Error('test') }
        map(fn) { return this.__select(option => option.map(fn)); }
        and(optionB) { return this.__select(option => option.and(optionB)); }
        andThen(fn) { return this.__select(option => option.andThen(fn)); }
        or(optionB) { return this.__select(option => option.or(optionB)); }
        orElse(fn) { return this.__select(option => option.orElse(fn)); }
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

    class NoneOption {
        constructor() {
            this.__value = {};
        }

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
        
        valueOf() { return 'none' + this.__value.valueOf(); }
    }

    const IsOption = (maybe) => {
        return maybe instanceof SomeOption
            || maybe instanceof NoneOption;
    };

    const ToOption = (value) => {
        return value === null || value === undefined
            ? None()
            : IsOption(value) ? value : Some(value);
    };

    const Some = (value) => {
        return value instanceof Promise
            ? new OptionPromiseLike(value.then(ToOption))
            : new SomeOption(value);
    }

    const noneOption = new NoneOption();
    const None = () => {
        return noneOption;
    };
    
    class ResultPromiseLike {
        constructor(promise) {
            this.__promise = promise;
        }

        async __use(fn) {
            const result = await this.__promise;
            return fn(result);
        }

        async toSync() { return await this.__promise; }
        
        ok() { return this.__use(result => result.Ok()); }
        err() { return this.__use(result => result.err()); }
        map(fn) { return this.__use(result => result.map(fn)); }
        mapErr(fn) { return this.__use(result => result.mapErr(fn)); }
        and(res) { return this.__use(result => result.and(res)); }
        andThen(fn) { return this.__use(result => result.andThen(fn)); }
        or(res) { return this.__use(result => result.or(res)); }
        orElse(fn) { return this.__use(result => result.orElse(fn)); }
        unwrap() { return this.__use(result => result.unwrap()); }
        unwrapErr() { return this.__use(result => result.unwrapErr()); }
        unwrapOr(optionB) { return this.__use(result => result.unwrapOr(optionB)); }
        unwrapOrElse(fn) { return this.__use(result => result.unwrapOrElse(fn)); }
        expect(msg) { return this.__use(result => result.expect(msg)); }
        expectErr(msg) { return this.__use(result => result.expectErr(msg)); }
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

    const Ok = (value) => {
        return value instanceof Promise
            ? new ResultPromiseLike(value)
            : new OkResult(value);
    }

    const Err = (error) => {
        return error instanceof Promise
            ? new ResultPromiseLike(error)
            : new ErrorResult(error);
    }

    exports.ToOption = ToOption;
    exports.Some = Some;
    exports.None = None;
    exports.Err = Err;
    exports.Ok = Ok;
})(typeof exports === 'undefined'? this['rlx']={}: exports);
