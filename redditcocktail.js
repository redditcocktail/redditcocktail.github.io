$(document).ready(function() {
    drinkCocktail({
        'name': 'test',
        'ingredients': [
            {'subreddit': 'askreddit', 'amount': 1},
            {'subreddit': 'earthporn', 'amount': 1},
            {'subreddit': 'cityporn', 'amount': 2}
        ]
    });
});


var drinkCocktail = function(cocktail) {
    $('#home-page').css('display', 'none');
    $('#cokctail-editor').css('display', 'none');
    var tmp = function() {
        addLink({
            'domain': 'farm6.staticflickr.com', 
            'banned_by': null,
            'media_embed': {},
            'subreddit': 'CityPorn',
            'selftext_html': null,
            'selftext': '',
            'likes': null,
            'secure_media': null,
            'link_flair_text': null,
            'id': '2evcxo',
            'gilded': 0,
            'secure_media_embed': {},
            'clicked': false,
            'stickied': false,
            'author': 'mojave955',
            'media': null,
            'score': 50,
            'approved_by': null,
            'over_18': false,
            'hidden': false,
            'thumbnail': 'http://b.thumbs.redditmedia.com/65jJnvhn9ZC-66EYLpigbSvvRtG1IIwvO0Ko2zDXt1Q.jpg',
            'subreddit_id': 't5_2scjs',
            'edited': false,
            'link_flair_css_class': null,
            'author_flair_css_class': 'Camera',
            'downs': 0,
            'saved': false,
            'is_self': false,
            'permalink': '/r/CityPorn/comments/2evcxo/view_from_my_grandparents_house_in_daegu_south/',
            'name': 't3_2evcxo',
            'created': 1409298046.0,
            'url': 'https://farm6.staticflickr.com/5555/15046967545_8d4a39b76e_h.jpg',
            'author_flair_text': null,
            'title': 'View from my grandparents\' house in Daegu, South Korea [2048 x 1365]',
            'created_utc': 1409269246.0,
            'ups': 50,
            'num_comments': 12,
            'visited': false,
            'num_reports': null,
            'distinguished': null
        });
    };
    tmp();
    tmp();
    tmp();
    tmp();
};


var addLink = function(link) {
    var $link = $('<a>', {
        'class': 'link',
        'href': link.url,
        'target': '_blank'
    });
    $('<img>', {'src': link.thumbnail}).appendTo($link);
    var $description = $('<div>', {'class': 'link-description'});
    $('<h2>').text(link.title).appendTo($description);
    $('<p>').text('Author: ' + link.author).appendTo($description);
    $('<p>').text('Subreddit: /r/' + link.subreddit).appendTo($description);
    $('<p>').text('Score: ' + String(link.score)).appendTo($description);
    var creationDate = new Date(link.created * 1000);
    $('<p>').text([
        'Published ',
        timeSince(creationDate),
        ' ago (',
        creationDate.toLocaleString(),
        ')'
    ].join('')).appendTo($description);
    $description.appendTo($link);
    $link.appendTo($('#cocktail-drinker'));
};


var timeSince = function(date) {
    var seconds = Math.floor((new Date() - date) / 1000),
        interval = Math.floor(seconds / 31536000);
    if (interval > 1)
        return interval + ' years';
    interval = Math.floor(seconds / 2592000);
    if (interval > 1)
        return interval + ' months';
    interval = Math.floor(seconds / 86400);
    if (interval > 1)
        return interval + ' days';
    interval = Math.floor(seconds / 3600);
    if (interval > 1)
        return interval + ' hours';
    interval = Math.floor(seconds / 60);
    if (interval > 1)
        return interval + ' minutes';
    return Math.floor(seconds) + ' seconds';
}
