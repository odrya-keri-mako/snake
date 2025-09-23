let _inputs = [];

window.addEventListener("keydown", (e) => {
    if (_inputs.includes(e.key)) return;
    
    _inputs.push(e.key);
});

window.addEventListener("keyup", (e) => {
    let index = _inputs.indexOf(e.key);
    
    if (index === -1) return;

    _inputs.splice(index, 1);
});

function getInput(inputsToCheck) {
    return inputsToCheck.filter(x => _inputs.any(y => x === y));
}

function addFactory(app) {
    let inputs = [];

    app.factory("input", () => ({
        get: getInput
    }));
}