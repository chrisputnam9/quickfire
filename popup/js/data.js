APP.Data = {

    // Data from previous fetches
    data: {},

    // Clear Data for a type
    clear: function (type) {
        APP.log('APP.Data.clear:'+type);
        var self = APP.Data,
            type_created = type+'_created';

        delete self.data[type];
        delete self.data[type_created];

        chrome.storage.local.remove(type);
        chrome.storage.local.remove(type_created);
    },

    // Get data of a given type, cache, then pass to callback
    get: function (type, callback) {
        APP.log('APP.Data.get:'+type);
        var self = APP.Data,
            now = new Date(),
            now_stamp = now.getTime(),
            type_created = type+'_created';

        // See if we already have data
        if (type in self.data && type_created in self.data) {

            // and it hasn't expired
            if ( (now_stamp - self.data[type_created]) < APP.Config.cache_expire ) {
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

                    callback(data, type);
                    return; // Stop before running more
                }
            }

            // Storage incomplete or expired, fetch fresh
            self.fetch(type, callback);

        });
    },

    // Get data of a given type, keyed by an ID, cache, then pass to callback
    getById: function (type, callback, id) {
        APP.log('APP.Data.getById:'+type+','+id);
        var self = APP.Data,
            now = new Date(),
            now_stamp = now.getTime(),
            type_created = type+'_created';

        // Update working data
        if ( ! (type in self.data) ) {
            self.data[type] = {};
        }
        if ( ! (type_created in self.data) ) {
            self.data[type_created] = {};
        }

        // See if we already have data
        if (
            id in self.data[type]
            && id in self.data[type_created]
        ) {

            // and it hasn't expired
            if ( (now_stamp - self.data[type_created][id]) < APP.Config.cache_expire ) {
                callback(self.data[type][id], type);
                return; // Stop before running more
            }
        }

        // Don't already have it, or it expired, so check storage
        chrome.storage.local.get([type, type_created], function (data) {

            // Make sure we have everything we should
            if (
                type in data
                && type_created in data
                && id in data[type]
                && id in data[type_created]
            ) {

                // And it hasn't expired
                if ( (now_stamp - data[type_created][id]) < APP.Config.cache_expire) {

                    // Update our working data
                    self.data[type][id] = data[type][id];
                    self.data[type_created][id] = data[type_created][id];

                    callback(self.data[type][id], type);
                    return; // Stop before running more
                }
            }

            // Storage incomplete or expired, fetch fresh
            self.fetch(type, callback, {'id':id});

        });
    },

    // Fetch Methods for various types
    fetch: function (type, callback, params) {
        APP.log('APP.Data.fetch:'+type);
        var self = APP.Data;

        params = (typeof params == 'undefined') ? {} : params;

        // Use debug data?
        if (APP.Debug.enable()) {
            return APP.Debug.fetch(type, callback, params);
        }

        return $.ajax({
            url: self.fetch_url[type](params),
            dataType: 'xml'
        })
        .done(function (xml) {
            var $xml = $(xml);

            type_data = self.fetch_parse[type]($xml, params);

            self.fetch_finalize(type, type_data, params, callback);
        })
        .error(function (jqXHR, status, error) {
            APP.Main.showConfigError('Error fetching ' + type + ' - ' + error);
        });

    },

        // Fetch/Ajax URLs for each type
        fetch_url: {
            _: function () {
                return 'https://'+APP.Config.api_key+':X@'+APP.Config.url;
            },
            'projects': function () {
                return APP.Data.fetch_url._()+'/projects.xml';
            },
            'project-todo-lists': function (params) {
                if ( ! ('id' in params) ) {
                    throw new Error('Missing ID - required to fetch project todo lists');
                }
                return APP.Data.fetch_url._()+'/projects/'+params.id+'/todo_lists.xml';
            },
        },

        // Fetch/Ajax Data parsing for each type
        fetch_parse: {
            'projects': function ($xml) {
                var self = APP.Data,
                    projects = [];

                $xml.find('projects project').each(function () {
                    var $project = $(this),
                        id = parseInt($project.find('id').html()),
                        $company = $project.find('company'),
                        project = {
                            'id': id,
                            'url': 'https://'+APP.Config.url+'/projects/'+id,
                            'created-on': $project.find('created-on').html(),
                            'last-changed-on': $project.find('last-changed-on').html(),
                            'name': $project.find('name').html(),
                            'start-page': $project.find('start-page').html(),
                            'company': {
                                'id': parseInt($company.find('id').html()),
                                'name': $company.find('name').html()
                            }
                        };
                    projects.push(project);
                });

                return projects;
            },
            'project-todo-lists': function ($xml, params) {
                var self = APP.Data,
                    lists = [],
                    project_id;

                if ( ! ('id' in params) ) {
                    throw new Error('Missing ID - required to fetch project todo lists');
                }

                project_id = params.id;

                $xml.find('todo-lists todo-list').each(function () {
                    var $list = $(this),
                        id = parseInt($list.find('id').html()),
                        list = {
                            'id': id,
                            'url': 'https://'+APP.Config.url+'/todo_lists/'+id,
                            'name': $list.find('name').html(),
                            'description': $list.find('description').html(),
                            'position': parseInt($list.find('position').html()),
                            'completed': $list.find('completed').html() == 'true',
                            'uncompleted-count': parseInt($list.find('uncompleted-count').html()),
                            'completed-count': parseInt($list.find('completed-count').html()),
                        };
                    lists.push(list);
                });

                return {
                    'project': self.data['projects'].filter(function (project) { return project.id == project_id}),
                    'lists': lists
                };
            }
        },

        // Finalize - sort, save, callback for fetched data
        fetch_finalize: function (type, type_data, params, callback) {
            var self = APP.Data,
                type_created = type+'_created';
                now = new Date(),
                now_stamp = now.getTime();

            self.sort[type](type_data);

            if ('id' in params) {
                self.data[type][params.id] = type_data;
                self.data[type_created][params.id] = now_stamp;
            } else {
                // Update working data
                self.data[type] = type_data;
                self.data[type_created] = now_stamp;
            }

            // Update local storage
            chrome.storage.local.set(self.data);

            if ('id' in params) {
                callback(self.data[type][params.id], type);
            } else {
                callback(self.data, type);
            }
        },

        sort: {
            'projects': function (data) {
                APP.log('App.Data.sort:projects');

                data.sort(function (a,b) {
                    if (a.name < b.name) return -11;
                    if (a.name > b.name) return 1;
                    return 0;
                });

                return data;
            },
            'project-todo-lists': function (data) {
                APP.log('App.Data.sort:project-todo-lists');

                data.lists.sort(function (a,b) {
                    if (a.completed && ! b.completed) return 1;
                    if (b.completed && ! a.completed) return -1;
                    return a.position - b.position;
                });

                return data;
            },
        },

    // Filter data by search text
    filter: function (type, search, callback) {
        APP.log('APP.Data.filter:'+type+','+search);
        var self = APP.Data,
            matches;

        // search - start and end with / - treat as regex
        if (matches = search.match(/^\/(.*)\/$/)) {
            search = new RegExp( matches[1], 'i');
        } else {
            search = search.toLowerCase();
        }

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
};
