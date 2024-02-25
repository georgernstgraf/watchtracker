class CustomError extends Error {
    constructor(message) {
        super(message);
    }
}

try {
    // Some code that might throw an error...
    throw new CustomError('Something went wrong');
} catch (err) {
    console.error(err.constructor.name, err.message);
}
