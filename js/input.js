let _inputs = [];
let _toRemove = [];

window.addEventListener("keydown", (e) => {
    if (_inputs.includes(e.key.toLowerCase()) || e.repeat) return;
    
    _inputs.push(e.key.toLowerCase());
});

window.addEventListener("keyup", (e) => {
    if (_toRemove.includes(e.key.toLowerCase())) return;
    
    _toRemove.push(e.key.toLowerCase());
});

function getInput(inputsToCheck) {
    return _inputs.filter(x => inputsToCheck.some(y => x === y));
}

function clearBuffer() {
    for (let x of _toRemove) {
        let index = _inputs.indexOf(x);

        if (index === -1) continue;

        _inputs.splice(index, 1);
    }

    _toRemove = [];
}

function dropInput(inputToDrop) {
    let index = _inputs.indexOf(inputToDrop);

    if (index === -1) return;

    _inputs.splice(index, 1);
}

function addFactory(app) {
    app.factory("input", () => ({
        get: getInput,
        clearBuffer
    }));
}