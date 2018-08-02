APP = {};

APP.Config = {

    url: null,
    user_id: null,
    api_key: null,

    debounce: 500, // time before acting on live input (eg. search)

    // 1 Day (24*60*60*1000)
    cache_expire: 86400000
    // cache_expire: 10000
}

APP.Main = {

    view: null,
    header_view: null,

    search_value: "",
    search_timer: null,

    // Get this show on the road
    init: function () {
        var self = this;

        // Set up views
        self.view = new APP.ViewModel($('[data-view="main"]'));
        self.header_view = new APP.ViewModel($('[data-view="header"]'));

        // Load config data
        chrome.storage.local.get(['config'], function (data) {

            if ('config' in data) {

                if ('url' in data.config && data.config.url) {
                    APP.Config.url = data.config.url;
                } else {
                    self.showConfig();
                    return;
                }

                if ('user_id' in data.config && data.config.user_id) {
                    APP.Config.user_id = data.config.user_id;
                } else {
                    self.showConfigError('Basecamp user id not found in saved data');
                    return;
                }

                if ('api_key' in data.config && data.config.api_key) {
                    APP.Config.api_key = data.config.api_key;
                } else {
                    self.showConfigError('Basecamp API key not found in saved data');
                    return;
                }

                self.showList();
                return;
            }

            self.showConfig();

        });
    },

    showConfig: function (data) {
        var self = APP.Main;
        self.header_view.render({html:'<h1>Settings</h1>'});
        self.view.render(data, 'config');
        self.view.$el.find('#continue').on('click', self.saveConfig);
    },

    showConfigError: function (specific) {
        specific = (typeof specific == 'undefined') ? '' : specific + '. ';
        APP.Main.showConfig({
            error: specific + 'Double-check URL, and make sure you are logged in',
            url: APP.Config.url
        });
    },

    saveConfig: function () {
        var self = APP.Main,
            url = $('#url').val(),
            matches = url.match(/(^|\s|\/)([^\/]+\.[^\/]+\.([^\/]+)?)(\/|$|\s)/);

        if (matches) {
            url = matches[2];
        } else {
            showConfig({error: 'Invalid URL, please try again'});
        }

        console.log('Saving URL: ' + url);
        APP.Config.url = url;
        chrome.storage.local.set({config: APP.Config});

        // Now attempt to retrieve api_key
        $.get('https://' + url + '/search')
        .done( function (html) {

            var user_id = $(html).filter('[name="current-user"]').attr('content');
            if (user_id == '') {
                self.showConfigError('Unable to get Basecamp user id');
                return;
            }

            console.log('Saving User ID: ' + user_id);
            APP.Config.user_id = user_id;
            chrome.storage.local.set({config: APP.Config});

            $.get('https://' + url + '/people/' + user_id + '/edit')
            .done( function (html) {
                var api_key = $(html).find('#token').html();
                if (api_key == '') {
                    self.showConfigError('Unable to get Basecamp API key');
                    return;
                }

                console.log('Saving API Key: ' + api_key);
                APP.Config.api_key = api_key;
                chrome.storage.local.set({config: APP.Config});

                self.showList();
            });

        });
    },

    showList: function () {
        var self = APP.Main;

        self.header_view.render('search');

        // Focus on load
        var $search = $('#search');
        $search.focus();
        $search.on('input', function () {
            self.search_value = $(this).val();
            clearTimeout(self.search_timer);
            self.search_timer = setTimeout(self.search, APP.Config.debounce);
        });

        // refresh button click action
        $('#refresh').on('click', self.refresh);

        // Initial loading of data
        self.load();
    },

    // Load data - check cache, then refresh if empty or old
    load: function () {
        var self = APP.Main;

        self.view.renderLoading();
        APP.Data.get('projects', self.view.render);
    },

    // Refresh data - via Ajax
    refresh: function () {
        var self = APP.Main;

        self.view.renderLoading();

        APP.Data.fetch('projects', self.view.render);
    },

    // Search data
    search: function () {
        var self = APP.Main;
        APP.Data.filter('projects', self.search_value, self.view.render);
    }

}

// Run init on doc ready
$(function () { APP.Main.init(); });
