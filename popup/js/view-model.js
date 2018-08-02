APP.ViewModel = function ($el) {
    var instance = this;

    instance.$el = $el;
    instance.exists = (instance.$el.length > 0);

    instance.templates = [];

    // Render HTML and set in element
    // - no args to render default, no data
    // - type arg only to render with no data
    instance.render = function (data, type) {

        data = (typeof data == 'undefined') ? {} : data;

        if (typeof type == 'undefined') {
            type = (typeof data == 'string') ? data : 'default';
        }

        if (type in instance.templates) {
            var html = Mustache.render(instance.templates[type], data);
            instance.$el.html(html);
            return true;
        }
        return false
    };

    // Render loading message
    instance.renderLoading = function () {
        instance.render({html:'Loading...'});
    }

    // Prime templates if possible
    if (instance.exists) {
        var $templates = instance.$el.find('[data-template]');
        $templates.each(function () {
            var $template = $(this),
                name = $template.data('template');

            instance.templates[name] = $template.eq(0).html();
        });
    }

    instance.renderLoading();
}
