var homepage = (function() {


var startHomePage = function() {
    if (localStorage.getItem('cocktails') === null)
        localStorage.setItem('cocktails', JSON.stringify({}));
    $('#home-page').css('display', 'block');
    $('#cocktail-drinker').css('display', 'none');
};


return {
    startHomePage: startHomePage
};

})();
