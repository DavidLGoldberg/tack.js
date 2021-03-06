var $w = {};

var bindAllInputs = function() {
    $('input[data-w]').on('keydown keyup', function(e) {
        $w[$(this).data('w')] = $(e.target).val();
    });
};

$w.init = function(options) {

    var settings = $.extend({
        debug: false,
        globalSetup: null,
        renderings: [],
        data: {}
    }, options); 

    $w = $.extend($w, settings.data);

    $('body').find('[data-view]')
        .each(function() {
            var $this = $(this);
            var $view = $this.data('view');

            if (typeof settings.globalSetup === 'function') { 
                if (settings.debug) {
                    alert($view +': globalSetup run');
                }
                settings.globalSetup($this);
            }

            if (settings.debug) {
                alert($view +': initial run');
            }
            settings.renderings[$view]($w, $this);
        })

    var renderingDependencies = {};

    for (var prop in settings.data)
    {
        // Automatically detect dependencies:
        for (var rendering in settings.renderings) {
            var dependency;
            if (settings.renderings[rendering].toString().indexOf('$w.' + prop) > -1) {
                dependency = prop;
            }

	    if (renderingDependencies[rendering]) {
	        renderingDependencies[rendering].push(dependency);
	    }
	    else {
	        renderingDependencies[rendering] = new Array(dependency);
	    }
	}

        // Use native or polly filled .watch
        $w.watch(prop, function (key, oldval, newval) {
            
            if (settings.debug) {
                console.log(key + " changed from " + oldval + " to " + newval);
            }

            for (var viewName in settings.renderings)
            {
                var w = $.extend({}, $w);
                w[key] = newval;

                // check if rendering needs to be fired
                if ($.inArray(key, renderingDependencies[viewName]) > -1) { 
                    // Run rendering: 
                    settings.renderings[viewName](w, $('[data-view=' + viewName + ']'));

                    if (settings.debug) {
                        console.log('rendering: ' + viewName + ' called');
                    }
                }
            }

            return newval;
        });
    }

    bindAllInputs();
};
