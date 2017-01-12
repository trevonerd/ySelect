/**
 *
 *          _________      .__                 __
 *  ___.__./   _____/ ____ |  |   ____   _____/  |_
 * <   |  |\_____  \_/ __ \|  | _/ __ \_/ ___\   __\
 *  \___  |/        \  ___/|  |_\  ___/\  \___|  |
 *  / ____/_______  /\___  >____/\___  >\___  >__|
 *  \/            \/     \/          \/     \/
 *
 *
 * - ySelect -
 * Version: v1.0.1
 * Date: 12/01/2017
 * Git: https://github.com/trevonerd/ySelect
 * ---
 * Author: Marco Trevisani <marco.trevisani@ynap.com>
 * ---
 * Further changes, comments:
 * --- v1.0.1:
 * - fixed some errors!
 * --- v1.0.0:
 * - first release
 *
 *
  **** Description:
 * What does this plugin?
 * - Manage the yoox.com mobile "fake" selects.
 *
 **** Initialisation Options:
 * $({containerId}).ySelect({fake-select-class-name}, {
 *    pageElements: {
 *        mainContainer: $("#mainContainer"),               - main page container element.
 *        userBar: $("#userBar")                            - userbar container element.
 *    },
 *    subtitle: {
 *        enabled: true,                                    - enable select button subtitle.
 *        className: ".select-subtitle"                     - button subtitle class name.
 *    },
 *    selectButton: "select-button",                        - select button css class name.
 *    selectOverlay: "select-overlay",                      - options container css class name.
 *    scrollSpeed: 250,                                     - customize the scroll animation speed if selects are not in the viewport.
 *    userbarElm: $("#userBar")                             - the userbar height needed for the calculation of the scroll offset.
 * }
 *
 */

(function ($) {
    "use strict";

    var pluginName = "ySelect",
        defaults = {
            pageElements: {
                mainContainer: $("#mainContainer"),
                userBar: $("#userBar")
            },
            subtitle: {
                enabled: true,
                className: ".select-subtitle"
            },
            selectButton: "select-button",
            selectOverlay: "select-overlay",
            scrollSpeed: 250
        },
        cache = {
            userbarHeight: 0
        };

    var buildCache = function (settings) {
        cache.userbarHeight = settings.pageElements.userBar.outerHeight();
    };

    function Plugin (element, selector, options) {
        this.container = $(element);
        this.selectorClass = selector;
        this.selectorElm = $(selector);
        this.settings = $.extend({}, defaults, options);
        buildCache(this.settings);
        this.init();
    }

    Plugin.prototype = {
        init: function () {
            var self = this;

            self.container.on("click",
                self.selectorClass + " ." + self.settings.selectButton,
                function () {
                    var mainContainerOffset = self.settings.pageElements.mainContainer.offset().top;
                    var ySelectContainer = $(this).parent(self.selectorClass);

                    if (ySelectContainer.hasClass("open")) {
                        self.closeYSelectOverlay();
                        return;
                    }

                    if (window.scrollY < mainContainerOffset) {
                        $('html, body').animate({ scrollTop: mainContainerOffset - cache.userbarHeight },
                                self.settings.scrollSpeed)
                            .promise().done(function () {
                                self.openYSelectOverlay(ySelectContainer);
                            });
                        return;
                    }

                    self.openYSelectOverlay(ySelectContainer);
                }).on("click",
                function (e) {
                    if (self.selectorElm.hasClass("open") &&
                        (e.target.className.indexOf(self.settings.selectButton) < 0 &&
                            e.target.offsetParent.className.indexOf(self.settings.selectButton) < 0) &&
                        (e.target.className.indexOf(self.settings.selectOverlay) < 0 &&
                            e.target.offsetParent.className.indexOf(self.settings.selectOverlay) < 0)) {
                        self.closeYSelectOverlay();
                    }
                });
        },
        updateYSelect: function () {
            var self = this;
            if (self.settings.subtitle.enabled) {
                self.selectorElm.each(function () {
                    var ySelect = $(this);
                    ySelect.find(self.settings.subtitle.className).html(ySelect.attr("data-selected"));
                });
            }
        },
        closeYSelectOverlay: function () {
            this.selectorElm.removeClass("open closed");
        },
        openYSelectOverlay: function (ySelectContainer) {
            this.closeYSelectOverlay();
            ySelectContainer.addClass("open");
            this.selectorElm.not(".open").addClass("closed");
        },
        showLoader: function () {
            // yMask plugin needed!
            $(this.selectorClass + ".open ." + this.settings.selectOverlay).mask("");
        },
        hideLoader: function () {
            // yMask plugin needed!
            $(this.selectorClass + " ." + this.settings.selectOverlay).unmask("");
        }
    };

    $.fn[pluginName] = function (selector, options) {
        return this.each(function () {
            var dataPlugin = $.data(this, "plugin_" + pluginName);
            if (!dataPlugin) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, selector, options));
            } else {
                dataPlugin.refresh();
            }
        });
    };

}(jQuery, document));