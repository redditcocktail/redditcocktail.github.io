$(document).ready(function() {
    memory.recover();
    if (window.location.search.substring(1) === '') {
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
                drinkAuthor(URLParameters[i]['value']);
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
        drinkCocktail({
            'name': 'test',
            'ingredients': ingredients
        });
    }
});


var drinkCocktail = function(cocktail) {
    var UNIT = 5;
    $('#home-page').css('display', 'none');
    $('#cokctail-editor').css('display', 'none');
    var scrapers = [],
        $lastLink = null,
        loadingLinks = false,
        linksBottomAndId = [];
    for (var i = 0; i < cocktail.ingredients.length; i++) {
        scrapers.push(new SubredditScraper(cocktail.ingredients[i].subreddit));
    }
    var addMoreLinks = function(callback) {
        loadingLinks = true;
        var newLinks = [];
        for (var i = 0; i < scrapers.length; i++) {
            (function(i) { // Closure over 'i'.
            newLinks.push(undefined);
            scrapers[i].scrape(
                UNIT * Number(cocktail.ingredients[i].amount),
                function(links) {
                    if (links === []) { // The scraper is exhausted.
                        newLinks[i] = null;
                    }
                    else {
                        newLinks[i] = [];
                        for (var j = 0; j < links.length; j++) {
                            newLinks[i].push(links[j]);
                        }
                    }
                    // If all scrapers have yielded a result:
                    if (newLinks.indexOf(undefined) === -1) addLinks();
                },
                function() {
                    newLinks[i] = null;
                    // If all scrapers have yielded a result:
                    if (newLinks.indexOf(undefined) === -1) addLinks();
                }
            );
            })(i); // End of closure over 'i'.
        }
        var addLinks = function() {
            // Create small bundles of links, with the same amount of links
            // per subreddit per bundle.
            var bundles = [];
            for (var __ = 0; __ < UNIT; __++) {
                bundles.push([]);
                for (var i = 0; i < newLinks.length; i++) {
                    if (newLinks[i] === null) continue;
                    var amount = Number(cocktail.ingredients[i].amount);
                    for (var _ = 0; _ < amount; _++) {
                        bundles[bundles.length-1].push(newLinks[i].shift());
                    }
                }
            }
            // For each bundle, shuffle it and display its links.
            while (bundles.length > 0) {
                var bundle = bundles.shift();
                bundle = shuffleArray(bundle);
                while (bundle.length > 0) {
                    var newLink = bundle.shift();
                    $lastLink = addLink(newLink);
                    linksBottomAndId.push({
                        bottom: $lastLink.position().top + $lastLink.height(),
                        id: newLink.id
                    });
                }
            }
            loadingLinks = false;
            var windowBottom = $(window).scrollTop() + $(window).height(),
                loadMoreLinksLimit = $(document).height()-20*$lastLink.height();
            if (windowBottom >= loadMoreLinksLimit) {
                addMoreLinks();
            }
        };
    };
    addMoreLinks();
    $(window).scroll(function() {
        // Remember the links that have been scrolled out.
        while (linksBottomAndId.length > 0 &&
                linksBottomAndId[0].bottom < $(window).scrollTop()) {
            memory.add(linksBottomAndId.shift().id);
        }
        // Load more links if the user has scrolled down too much.
        if (loadingLinks) return;
        if ($lastLink === null) return;
        var windowBottom = $(window).scrollTop() + $(window).height(),
            loadMoreLinksLimit = $(document).height() - 20*$lastLink.height();
        if (windowBottom >= loadMoreLinksLimit) {
            addMoreLinks();
        }
    });
};


var SubredditScraper = function(subreddit) {
    this.subreddit = subreddit;
    this.after = '';
    this.top = 'day';
    this.topScore = 0;
    this.links = [];
    this.requestURL = '';
    this.idsOfYieldedLinks = [];
    this.LIMIT = 50;
    // Links the scores of which are below QUALITY multiplied against
    // the best score in the current top so far are discarded.
    // For example, if the scraper is browsing the 'week' top of its
    // subreddit, and the highest score it has seen in this 'week' top
    // is 2500, then links of score lesser than QUALITY*2500 will not be
    // yielded.
    this.QUALITY = .10;
};
SubredditScraper.prototype.buildRequestURL = function() {
    this.requestURL = [
        'http://www.reddit.com/r/',
        this.subreddit,
        '/top.json?limit=',
        this.LIMIT,
        '&after=',
        this.after,
        '&t=',
        this.top,
        '&jsonp=?'
    ].join('');
};
SubredditScraper.prototype.changeTop = function() {
    if (this.top === 'day') this.top = 'week';
    else if (this.top === 'week') this.top = 'month';
    else if (this.top === 'month') this.top = 'all';
    this.after = '';
    this.topScore = 0;
};
SubredditScraper.prototype.scrape = function(amount, success, error) {
    if (amount === undefined) amount = this.LIMIT;
    if (success === undefined) success = function(links) {};
    if (error === undefined) error = function(links) {};
    if (this.after === null) { // The subreddit is exhausted.
        success([]);
        return;
    }
    this.buildRequestURL();
    var scraper = this;
    $.getJSON(this.requestURL, function(json) {
        if (json.data === undefined || json.data.children === undefined) {
            error();
            return;
        }
        for (var i = 0; i < json.data.children.length; i++) {
            // Check if this link has already been seen.
            if (scraper.idsOfYieldedLinks.indexOf(
                        json.data.children[i].data.id) !== -1 ||
                    memory.remembers(json.data.children[i].data.id)) {
                continue;
            }
            // Update the top score of the current top if it needs be.
            if (Number(json.data.children[i].data.score) > scraper.topScore) {
                scraper.topScore = Number(json.data.children[i].data.score);
            }
            // Change top if the current link (and consequently all the
            // following links) does not have a high enough score.
            if (Number(json.data.children[i].data.score) < scraper.QUALITY*
                        scraper.topScore &&
                    scraper.top !== 'all') {
                scraper.changeTop();
                scraper.scrape(amount, success, error);
                return;
            }
            // If the current link has passed the precedent test, then put
            // it among the links to be yielded, and register it id in order
            // not to yield it twice.
            scraper.links.push(json.data.children[i].data);
            scraper.idsOfYieldedLinks.push(json.data.children[i].data.id);
            if (scraper.links.length === amount) {
                // When enough links have been scraped, send them, and stop
                // the scraping.
                scraper.after = json.data.children[i].data.name;
                success(scraper.links);
                scraper.links = [];
                return;
            }
        }
        // If the code goes down there, then not enough links have been yielded.
        if (json.data.after !== null) {
            // If there are still links to scrape in the current top.
            scraper.after = json.data.after;
            scraper.scrape(amount, success, error);
        }
        else if (scraper.top !== 'all') {
            // If there are not links to scrape in the current top anymore.
            scraper.changeTop();
            scraper.scrape(amount, success, error);
        }
        else {
            // If there are not links to scrape at all anymore.
            scraper.after = null;
            success(scraper.links);
            scraper.links = [];
        }
    })
    .error(function(jqXHR, textStatus, errorThrown) { error(); });
};


var drinkAuthor = function(author) {
    var scraper = new AuthorScraper(author);
    scraper.scrape(function(links) {
        for (var i = 0; i < links.length; i++) {
            addLink(links[i], true);
        }
    });
};


var AuthorScraper = function(author) {
    this.author = author;
    this.links = [];
    this.after = '';
};
AuthorScraper.prototype.scrape = function(callback) {
    if (callback === undefined) callback = function(links) {};
    if (this.after === null) {
        callback([]);
        return;
    }
    var requestURL = [
        'http://www.reddit.com/user/',
        this.author,
        '/submitted.json?limit=100&after=',
        this.after
    ].join('');
    var scraper = this;
    $.getJSON(requestURL, function(json) {
        if (json.data === undefined || json.data.children === undefined) {
            callback();
            return;
        }
        for (var i = 0; i < json.data.children.length; i++) {
            scraper.links.push(json.data.children[i].data);
        }
        if (json.data.after !== null) {
            scraper.after = json.data.after;
            scraper.scrape(callback);
        }
        else {
            scraper.after = null;
            callback(scraper.links);
        }
    })
    .error(function(jqXHR, textStatus, errorThrown){callback(scraper.links);});
};


var addLink = function(link, drinkingAuthor) {
    if (drinkingAuthor === undefined) drinkingAuthor = false;
    var $link = $('<a>', {
        'class': 'link',
        'href': link.url,
        'target': '_blank'
    });
    if (!link.is_self) $('<img>', {'src': link.thumbnail}).appendTo($link);
    var $description = $('<div>', {'class': 'link-description'});
    $('<h2>').text(link.title).appendTo($description);
    if (!drinkingAuthor) {
        var $authorP = $('<p>'),
            authorHRef = [
                window.location.protocol,
                '//',
                window.location.hostname,
                window.location.pathname,
                '?author=',
                link.author
            ].join('');
        $authorP.text('Author: ');
        $('<a>', {
            'href': authorHRef,
            'target': '_blank'
        }).text(link.author).appendTo($authorP).click(function() {
            memory.add(link.id);
        });
        $authorP.appendTo($description);
    }
    else {
        $('<p>').text('Author: ' + link.author).appendTo($description);
    }
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
    if (!drinkAuthor) {
        $link.click(function() {
            memory.add(link.id);
        });
    }
    return $link;
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

/* Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 */
var shuffleArray = function(a) {
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    }
    return a;
}
