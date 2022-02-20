function waitTime(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    waitTime
}

