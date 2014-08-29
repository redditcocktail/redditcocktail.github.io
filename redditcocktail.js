$(document).ready(function() {
    memory.recover();
    if (window.location.search.substring(1) === '') {
        homepage.startHomePage();
    }
    else {
        var URLParameters = window.location.search.substring(1).split('&');
        for (var i = 0; i < URLParameters.length; i++) {
            URLParameters[i] = {
                'key': URLParameters[i].split('=')[0],
                'value': URLParameters[i].split('=')[1]
            };
        }
        for (var i = 0; i < URLParameters.length; i++) {
            if (URLParameters[i].key === 'author') {
                cocktaildrinker.drinkAuthor(URLParameters[i]['value']);
                return;
            }
        }
        var ingredients = [];
        for (var i = 0; i < URLParameters.length; i++) {
            ingredients.push({
                'subreddit': URLParameters[i].key,
                'amount': Number(URLParameters[i]['value'])
            });
        }
        cocktaildrinker.drinkCocktail({
            'name': 'test',
            'ingredients': ingredients
        });
    }
});
