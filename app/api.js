var harvest = require('harvest'),
    RSVP = require('rsvp'),
    woodman = require('woodman'),
    _ = require('lodash');

var logger = woodman.getLogger('api');

var options = {
    adapter: 'mongodb',
    connectionString: process.env.MONGODB_URL,
    inflect: true
};

// define 2 resources
// posts and comments
// analogue to the examples used on jsonapi.org
var harvestApp = harvest(options)
    .resource('post', {
        title: String
    })
    .onChange({
        delete: function (id) {
            logger.info('delete ' + id);
            return harvestApp.adapter.findMany('comment', {"post": id})
                .then(function (commentsToDelete) {
                    logger.info('cascading post (id=' + id + ') delete to related comments ' + JSON.stringify(commentsToDelete));
                    return RSVP.all(_.map(commentsToDelete, function (commentToDelete) {
                        return harvestApp.adapter.delete('comment', commentToDelete.id);
                    }));
                });
        },
        insert: function (id) {
            logger.info('insert ' + id);
        },
        update: function (id) {
            logger.info('update ' + id);
        }
    })
    .resource('comment', {
        body: String,
        post: 'post'
    });

module.exports = harvestApp;