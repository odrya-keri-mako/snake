let _inputs = [];
let _toRemove = [];

window.addEventListener("keydown", (e) => {
    if (_inputs.includes(e.key)) return;
    
    _inputs.push(e.key);
});

window.addEventListener("keyup", (e) => {
    if (_toRemove.includes(e.key)) return;
    
    _toRemove.push(e.key);
});

function getInput(inputsToCheck) {
    return inputsToCheck.filter(x => _inputs.some(y => x === y));
}

function clearBuffer() {
    for (let x of _toRemove) {
        let index = _inputs.indexOf(x);

        if (index === -1) continue;

        _inputs.splice(index, 1);
    }
}

function addFactory(app) {
    app.factory("input", () => ({
        get: getInput,
        clearBuffer
    }));
}