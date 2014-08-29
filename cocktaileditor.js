var cocktaileditor = (function() {


var startCocktailEditor = function() {
    $('#home-page').css('display', 'none');
    $('#cocktail-drinker').css('display', 'none');
    $('#cocktail-editor').css('display', 'block');
};


return {
    startCocktailEditor: startCocktailEditor
};

})();
