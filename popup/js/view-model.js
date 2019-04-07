APP.ViewModel = function ($el) {
    var instance = this;

    instance.$el = $el;
    instance.exists = (instance.$el.length > 0);
    instance.name;

    instance.actions = {};
    instance.listeners = {
        'render': []
    };

    instance.templates = [];

    // Render HTML and set in element
    // - no args to render default, no data
    // - type arg only to render with no data
    instance.render = function (data, type) {
        data = (typeof data == 'undefined') ? {} : data;

        if (typeof type == 'undefined') {
            type = (typeof data == 'string') ? data : 'default';
        }

        APP.log('Rendering "' + instance.name + '" view with template "' + type + '" and data:')
        APP.log(data);

        if (type in instance.templates) {
            instance.setupData(data);
            var html = Mustache.render(instance.templates[type], data);
            instance.$el.html(html);
            instance.trigger('render', {
                'type': type,
                'data': data
            });
            return true;
        }
        return false
    };

        /**
        * Set up methods for template use
        */
        instance.setupData = function (data) {
            data._excerpt = function () { return instance._excerpt }
        };

        instance._excerpt = function(text, render) {
            text = render(text);
            if (matches = text.match(/^(\d+),(.*)$/)) {
                text = matches[2].substr(0, Math.max(matches[1]-1,0)).trim();
                if (text.length < matches[2].length) {
                    text+='&#8230;'
                }
                return text;
            } else {
                return "<b>ERROR:</b> _excerpt requires: length,text";
            }
        };

    // Render loading message
    instance.renderLoading = function () {
        instance.render({html:'Loading...'});
    };

    // Register event listener
    instance.on = function (event, callback) {
        if (event in instance.listeners) {
            instance.listeners[event].push(callback);
        } else {
            throw new Error('Invalid event - ' + event);
        }
    };

    // Trigger an event
    instance.trigger = function (event, data) {
        if (event in instance.listeners) {
            if (instance.listeners[event].length > 0) {
                APP.log('Triggering "' + event + '" events in "' + instance.name + '" view');
                $.each(instance.listeners[event], function (l, callback) {
                    callback(data);
                });
            }
        } else {
            throw new Error('Invalid event - ' + event);
        }
    };

    // Add action - based on listening for clicks/submits to js-*
    instance.addAction = function (target, callback) {
        if ( ! (target in instance.actions) ) {
            instance.actions[target] = [];
        }
        instance.actions[target].push(callback);
    };

    // Run set actions
    instance.runActions = function (target, event) {
        if (target in instance.actions) {
            if (instance.actions[target].length > 0) {
                APP.logLine();
                APP.log('Running "' + target + '" actions in "' + instance.name + '" view');
                $.each(instance.actions[target], function (a, callback) {
                    callback(event);
                });
            }
        }
    };

    // Listen to parent $el for events
    $el.on('click', '[href^="js-"]', function (event) {
        var target = $(this).attr('href').substr(3);
        event.preventDefault();
        instance.runActions(target, event);
    });
    $el.on('input', '[data-input^="js-"]', function (event) {
        var target = $(this).data('input').substr(3);
        event.preventDefault();
        instance.runActions(target, event);
    });
    $el.on('submit', '[action^="js-"]', function (event) {
        var target = $(this).attr('action').substr(3);
        event.preventDefault();
        instance.runActions(target, event);
    });

    // Prime templates if possible
    if (instance.exists) {
        var $templates = instance.$el.find('[data-template]');
        $templates.each(function () {
            var $template = $(this),
                name = $template.data('template');

            instance.templates[name] = $template.eq(0).html();
        });

        instance.name = instance.$el.data('view');
    }

    instance.renderLoading();
}
