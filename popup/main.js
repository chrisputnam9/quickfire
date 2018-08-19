APP = {};

APP.Main = {

    view: null,
    header_view: null,
    footer_view: null,

    search_value: "",
    search_timer: null,

    // Get this show on the road
    init: function () {
        var self = this;

        APP.log('Main.init');

        // Remove focus styling after any buttonish item is clicked
        $('html').on('click', 'a.button, a.col, button', function () { $(this).blur(); });

        // Set up views
        self.view = new APP.ViewModel($('[data-view="main"]'));
        self.header_view = new APP.ViewModel($('[data-view="header"]'));
        self.footer_view = new APP.ViewModel($('[data-view="footer"]'));

        // Set up events on views
        self.view.addAction('show-projects', self.showProjects);
        self.view.addAction('show-project-todo-lists', self.showProjectTodoLists);
        self.view.addAction('save-config', self.saveConfig);

        self.header_view.addAction('refresh', self.refresh);
        self.header_view.addAction('search', function (event) {
            window.e = event;
            self.search_value = $(event.target).val();
            clearTimeout(self.search_timer);
            self.search_timer = setTimeout(self.search, APP.Config.debounce);
        });

        self.footer_view.addAction('settings', self.showConfig);

        // Initial Rendering
        self.footer_view.render('menu');

        // Load config data
        chrome.storage.local.get(['config'], function (data) {

            if ('config' in data) {

                APP.Config = data.config;

                if ( ! APP.Config.url ) {
                    self.showConfig();
                    return;
                }

                // Debugging mode enabled? If not, proceed to get more data
                if ( ! APP.Debug.enable(APP.Config.url) ) {


                    // Get User ID from a simple page
                    if ( ! APP.Config.user_id ) {
                        self.showConfigError('Basecamp user id not found in saved data');
                        return;
                    }

                    // Get API Key from settings page
                    if ( ! APP.Config.api_key ) {
                        self.showConfigError('Basecamp API key not found in saved data');
                        return;
                    }

                }

                self.showProjects();
                return;
            }

            self.showConfig();

        });
    },

    showConfig: function () {
        var self = APP.Main;

        self.header_view.render({html:'<h1>Settings</h1>'});
        self.view.render(APP.Config, 'config');
    },

    showConfigError: function (specific) {
        specific = (typeof specific == 'undefined') ? '' : specific + '.<br>';
        APP.Config.error = specific + 'Double-check URL, and make sure you are currently logged in.<br>If issues persist, <a href="https://github.com/chrisputnam9/quickfire/blob/master/README.md" target="_blank">click here for help.</a>';
        APP.Main.showConfig();
        delete APP.Config.error;
    },

    saveConfig: function (event) {
        var self = APP.Main,
            url = $('[name="url"]').val(),
            debug = false,
            matches = url.match(/(^|\s|\/)([^\/]+\.[^\/]+\.([^\/]+)?)(\/|$|\s)/);

        event.preventDefault();
        self.view.render({html:'Saving...'});

        // Debugging enabled?
        if (APP.Debug.enable(url)) {
            self.refresh();
            self.showProjects();
            return;
        }
        else if (matches) {
            url = matches[2];
        } else {
            self.showConfigError('Invalid URL, "'+url+'", please try again');
            return;
        }

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

            APP.Config.user_id = user_id;
            chrome.storage.local.set({config: APP.Config});

            $.get('https://' + url + '/people/' + user_id + '/edit')
            .done( function (html) {
                var api_key = $(html).find('#token').html();
                if (api_key == '' || api_key == undefined) {
                    self.showConfigError('Unable to get Basecamp API key');
                    return;
                }

                APP.Config.api_key = api_key;
                chrome.storage.local.set({config: APP.Config});

                self.refresh();
                self.showProjects();
            })
            .error(function (jqXHR, status, error) {
                APP.Main.showConfigError('Unable to get Basecamp API key');
            });

        })
        .error(function (jqXHR, status, error) {
            APP.Main.showConfigError('Unable to get Basecamp user id');
        });
    },

    // Show Project Listing
    showProjects: function (event) {
        var self = APP.Main;

        self.header_view.render('search');
        self.header_view.$el.find('[name="search"]').focus();

        // Focus on load
        var $search = $('[name="search"]');
        $search.focus();

        // Initial loading of data
        self.loadProjects();
    },

    // Show Project Listing
    showProjectTodoLists: function (event) {
        var self = APP.Main,
            $target = $(event.target),
            project_id = $target.data('id');

        if (typeof project_id == 'undefined') {
            $target = $target.closest('[data-id]');
            project_id = $target.data('id');
        }

        self.header_view.render('search');
        self.header_view.$el.find('[name="search"]').focus();

        // Initial loading of data
        self.loadProjectTodoLists(project_id);
    },

    // Load projects
    loadProjects: function () {
        var self = APP.Main;

        self.view.renderLoading();
        APP.Data.get('projects', self.view.render);
    },

    // Load project todo lists
    loadProjectTodoLists: function (id) {
        var self = APP.Main;

        self.view.renderLoading();
        APP.Data.getById('project-todo-lists', self.view.render, id);
    },

    // Refresh data - via Ajax
    refresh: function () {
        var self = APP.Main;

        self.view.renderLoading();

        APP.Data.clear('projects');
        APP.Data.clear('project-todo-lists');

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
