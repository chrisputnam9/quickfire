APP.Data = {

    // Data from previous fetches
    data: {},

    // Get data of a given type, cache, then pass to callback
    get: function (type, callback) {
        var self = APP.Data,
            now = new Date(),
            now_stamp = now.getTime(),
            type_created = type+'_created';

        // See if we already have data
        if (type in self.data && type_created in self.data) {

            // and it hasn't expired
            if ( (now_stamp - self.data[type_created]) < APP.Config.cache_expire ) {
                console.log('Using data from object');
                callback(self.data, type);
                return; // Stop before running more
            }
        }

        // Don't already have it, or it expired, so check storage
        chrome.storage.local.get([type, type_created], function (data) {

            // Make sure we have everything we should
            if ( type in data && type_created in data) {

                // And it hasn't expired
                if ( (now_stamp - data[type_created]) < APP.Config.cache_expire) {

                    // Update our working data
                    self.data[type] = data[type];
                    self.data[type_created] = data[type_created];

                    console.log('Using data from storage');
                    callback(data, type);
                    return; // Stop before running more
                }
            }

            // Storage incomplete or expired, fetch via Ajax
            self.fetch(type, callback);

        });
    },

    // Fetch Methods for various types
    fetch: function (type, callback) {
        var self = APP.Data;

        $.ajax({
            url: self.fetch_url[type](),
            dataType: 'xml'
        })
        .done(function(xml){
            var $xml = $(xml),
                now = new Date(),
                now_stamp = now.getTime();

            type_data = self.fetch_parse[type]($xml);

            // Update working data
            self.data[type] = type_data;
            self.data[type+'_created'] = now_stamp;

            // Update local storage
            chrome.storage.local.set(self.data);

            console.log('Using data from ajax');
            callback(self.data, type);
        });

    },

        // Fetch/Ajax URLs for each type
        fetch_url: {
            _: function () {
                return 'https://'+APP.Config.api_key+':X@'+APP.Config.url;
            },
            projects: function () {
                return APP.Data.fetch_url._()+'/projects.xml';
            }
        },

        // Fetch/Ajax Data parsing for each type
        fetch_parse: {
            projects: function ($xml) {
                var self = APP.Data,
                    projects = [];

                $xml.find('projects project').each(function () {
                    var $project = $(this),
                        id = $project.find('id').html(),
                        project = {
                            'id': id,
                            'url': 'https://'+APP.Config.url+'/projects/'+id,
                            'created-on': $project.find('created-on').html(),
                            'last-changed-on': $project.find('last-changed-on').html(),
                            'name': $project.find('name').html(),
                            'start-page': $project.find('start-page').html(),
                            'company': {
                                'id': $project.find('id').html(),
                                'name': $project.find('name').html()
                            }
                        };
                    projects.push(project);
                });

                return projects;
            }
        },

    // Filter data by search text
    filter: function (type, search, callback) {
        var self = APP.Data,
            matches;

        // search - start and end with / - treat as regex
        if (matches = search.match(/^\/(.*)\/$/)) {
            search = new RegExp( matches[1], 'i');
        } else {
            search = search.toLowerCase();
        }

        console.log('Filter: ' + search);

        self.get(type, function (data) {
            var type_data = data[type],
                filtered_type_data,
                filtered_data;

            filtered_data = Object.create(data);
            
            // Any search? If so, let's filter it up
            if (search != '') {
                filtered_type_data = type_data.filter(function (item) {
                    var json = JSON.stringify(item).toLowerCase();
                    return json.match(search);
                });

                filtered_data[type] = filtered_type_data;
            }

            callback(filtered_data, type);
        });
    },
}
