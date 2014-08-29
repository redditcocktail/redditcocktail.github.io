var homepage = (function() {


var startHomePage = function() {
    if (localStorage.getItem('cocktails') === null)
        localStorage.setItem('cocktails', JSON.stringify({}));
    $('#home-page').css('display', 'block');
    $('#cocktail-drinker').css('display', 'none');
    $('#cocktail-editor').css('display', 'none');
    $('#cocktail-select').empty();
    var cocktails = JSON.parse(localStorage.getItem('cocktails'));
    $('<option>', {'value': ''})
        .attr('selected', 'selected')
        .appendTo($('#cocktail-select'));
    for (var cocktail in cocktails) {
        $('<option>', {'value': cocktail})
            .text(cocktails[cocktail].name)
            .appendTo($('#cocktail-select'));
    }
    $('#cocktail-select').change(function() {
        if ($('#cocktail-select option:selected').length !== 1) return;
        if ($('#cocktail-select').val() === '') return;
        cocktaildrinker.drinkCocktail(cocktails[$('#cocktail-select').val()]);
    });
    $('#create-edit-cocktail-button').click(function() {
        cocktaileditor.startCocktailEditor();
    });
};


return {
    startHomePage: startHomePage
};

})();
