var $http = require('http-as-promised'),
    RSVP = require('rsvp'),
    _ = require('lodash');

var baseUri = process.env.BASE_URI;

$http({uri: baseUri + '/posts', method: 'GET', json:true})
    .spread(function (response, posts) {

        return RSVP.all(_.map(posts.posts, function(post) {
            var postId = post.id.toString();

            return $http({
                uri: baseUri + '/posts/' + postId,
                headers: {Accept: 'application/json'},
                method: 'DELETE'
            });
        }));

    })
    .catch(function (e) {
        console.trace(e);
    });