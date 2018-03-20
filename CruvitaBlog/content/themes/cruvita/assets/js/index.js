/**
 * Main JS file for Cruvita behaviours
 */

/* globals jQuery, document */
(function ($, undefined) {
    "use strict";

    var $document = $(document);

    $document.ready(function () {

        var $postContent = $(".post-content");
        $postContent.fitVids();

        $(".scroll-down").arctic_scroll();

        $(".menu-button, .nav-cover, .nav-close").on("click", function(e){
            e.preventDefault();
            $("body").toggleClass("nav-opened nav-closed");
        });

    });

    //Related Posts
    $('.related-posts').ghostRelated({
        titleClass: '.post-title',
        tagsClass: '.post-tags',
        limit: 5,
        debug: true
    });


    //Ghost Hunter
    $("#search-field").ghostHunter({
        results   : "#results",
        result_template : "<article class='post catalog'><header class='post-header'><h2 class='post-title'><a href='{{link}}'>{{title}}</a></h2></header><section class='post-excerpt'><p>{{description}} <a class='read-more' href='{{link}}'>&raquo;</a></p></section><footer class='post-meta'>{{pubDate}}</footer></article>",
        onKeyUp         : true,
        before          : function(){
            $("#catalog").hide();
        },
        info_template   : "<p>Posts found: {{amount}}</p>"
    });


    // Arctic Scroll by Paul Adam Davis
    // https://github.com/PaulAdamDavis/Arctic-Scroll
    $.fn.arctic_scroll = function (options) {

        var defaults = {
            elem: $(this),
            speed: 500
        },

        allOptions = $.extend(defaults, options);

        allOptions.elem.click(function (event) {
            event.preventDefault();
            var $this = $(this),
                $htmlBody = $('html, body'),
                offset = ($this.attr('data-offset')) ? $this.attr('data-offset') : false,
                position = ($this.attr('data-position')) ? $this.attr('data-position') : false,
                toMove;

            if (offset) {
                toMove = parseInt(offset);
                $htmlBody.stop(true, false).animate({scrollTop: ($(this.hash).offset().top + toMove) }, allOptions.speed);
            } else if (position) {
                toMove = parseInt(position);
                $htmlBody.stop(true, false).animate({scrollTop: toMove }, allOptions.speed);
            } else {
                $htmlBody.stop(true, false).animate({scrollTop: ($(this.hash).offset().top) }, allOptions.speed);
            }
        });

    };
})(jQuery);
