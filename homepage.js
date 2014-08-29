var homepage = (function() {


var startHomePage = function() {
    $('#home-page').css('display', 'block');
    $('#cocktail-drinker').css('display', 'none');
    $('#cocktail-editor').css('display', 'none');
};


return {
    startHomePage: startHomePage
};

})();
