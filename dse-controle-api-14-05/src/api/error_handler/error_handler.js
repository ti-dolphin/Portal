const ErrorModel = require("./error_model");

module.exports = class ErrorHandler {

	constructor() {}
	
	static resolveError(res, error) {
		if (error instanceof ErrorModel) {
			console.error(error);
			res.status(error.code).json({ message: error.message, data: error.data });
		} else {
			console.error(error);
			res.status(500).send(error.toString());
		}
	}
}