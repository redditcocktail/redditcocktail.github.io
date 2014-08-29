var memory = (function() {
    var memory = [];
    var recover = function() {
        if (localStorage.getItem('memory') === null) {
            reset();
            return;
        }
        memory = JSON.parse(localStorage.getItem('memory')).ids;
    };
    var remembers = function(id) {
        return memory.indexOf(id) !== -1;
    };
    var save = function() {
        localStorage.setItem('memory', JSON.stringify({'ids': memory}));
    };
    var reset = function() {
        memory = [];
        save();
    };
    var add = function(id) {
        if (!remembers(id)) {
            memory.push(id);
            save();
        }
    };
    return {
        recover: recover,
        remembers: remembers,
        reset: reset,
        add: add
    };
})();
