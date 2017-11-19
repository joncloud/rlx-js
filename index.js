((exports) => {
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

    const Some = (value) => {
        return new SomeOption(value);
    }

    const noneOption = new NoneOption();
    const None = () => {
        return noneOption;
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
        return new OkResult(value);
    }

    const Err = (error) => {
        return new ErrorResult(error);
    }

    exports.Some = Some;
    exports.None = None;
    exports.Err = Err;
    exports.Ok = Ok;
})(typeof exports === 'undefined'? this['rlx']={}: exports);
