/**
 * Debugging data for development/testing
 */
APP.Debug = {

    enabled: false,
    letters: null,

    // Enable debugging, if url is set to some variation of 'debug'
    enable: function (url) {
        var self = APP.Debug;

        // Checking if already enabled or based on url entry:
        if (typeof url != 'undefined') {

            // Enable (or not) based on URL
            self.enabled = false;
            if (url.toLowerCase() == 'debug') {
                APP.log('DEBUG: ENABLED');

                self.enabled = true;

                // Set up letters for random names
                self.letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()1234567890-+_={}[]\\|"\';:,<.>/?   ';
                self.letters+= self.letters + self.letters;
                self.letters = self.letters.split("");

                APP.Config.url = url;
                chrome.storage.local.set({config: APP.Config});
            }

        }

        return self.enabled;
    },

    fetch: function (type, callback, params) {
        var self = APP.Debug;
        APP.log('DEBUG: APP.Debug.fetch:'+type);
        APP.log('DEBUG: artificial delay of .5 seconds...');

        return setTimeout(function __use_debug_data() {
            type_data = self.generate[type](params);
            APP.Data.fetch_finalize(type, type_data, params, callback);
        }, 500);
    },

    /**
     * Generate random data for debugging/testing/development
     */
    generate: {
        'projects': function (params) {
            var self = APP.Debug,
                project_count = APP.random(0,10),
                projects = [],
                id, name;

            for (p=0;p<project_count;p++) {
                id = self.randomID(),
                name = self.randomName();
                projects.push({
                    "company": {
                        "id": self.randomID(),
                        "name": self.randomName() + ' Inc.'
                    },
                    "created-on": "2000-01-01",
                    "id": id,
                    "last-changed-on": "2000-01-01T00:00:00Z",
                    "name": 'Project&nbsp;&nbsp;&amp; ' + name,
                    "start-page": "todos",
                    "url": "http://example.com/#" + name
                });
            }

            return projects;
        },

        'project-todo-lists': function (params) {
            var self = APP.Debug,
                list_count = APP.random(0,10),
                lists = [],
                project_id = params.id,
                name,complete_count,uncomplete_count;

                for (l=0;l<list_count;l++) {
                    name = self.randomName();
                    complete_count = APP.random(0,10);
                    uncomplete_count = APP.random(0,10);

                    lists.push({
                        "id": self.randomID(),
                        "url": "http://example.com/#" + name,
                        "name": 'List ' + name,
                        "description": "Lorem Ipsum Debugi",
                        "position": APP.random(1,list_count),
                        "completed": (uncomplete_count == 0),
                        "uncompleted-count": uncomplete_count,
                        "completed-count": complete_count
                    });
                }

                return {
                    'project': APP.Data.data['projects']
                        .filter(function (project) {
                            return project.id == project_id
                        }),
                    'lists': lists
                };
        }
    },

    /**
     * Generate a random name based on letters
     * either call with (min,max) - inclusive
     * or just (min) - inclusive, will assume max = letters length
     * or () = assume min 0, max = letters length
     */
    randomName: function (min, max) {
        var self = APP.Debug;
        
        if (typeof max == 'undefined') {
            max = self.letters.length;
        }
        if (typeof min == 'undefined') {
            min = 0;
        }

        return self.letters
            .shuffle()
            .slice( 0,
                APP.random( min, max - 1)
            )
            .join("")
        ;

    },

    /**
     * Generate random ID
     */
    randomID: function () {
        return APP.random(1000000, 9999999);
    }

}
