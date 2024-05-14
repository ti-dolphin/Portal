module.exports = class ErrorModel {
    constructor(code, message, data) {
        this.message = message;
        this.data = data;
        this.code = code;
    }
}