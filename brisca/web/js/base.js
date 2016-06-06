$(function () {
    'use strict';
    var $window = $(window);

    $window.load(function () {
            $('#load-layer').fadeOut();
            $window.scrollTop(1);
        }
    );
});