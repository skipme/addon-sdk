/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { Class } = require('api-utils/heritage');
const { tabNS } = require('api-utils/tabs/namespace');
const { defer } = require("../functional");
const { EVENTS } = require("./events");

const Tab = Class({
  initialize: function initialize(options) {
    let ns = tabNS(this);
    let window = ns.window = options.window;
    let tab = ns.tab = options.tab;

    ns.browser = tab.browser;

    return this;
  },
  destroy: function() {},

  /**
   * The title of the page currently loaded in the tab.
   * Changing this property changes an actual title.
   * @type {String}
   */
  get title() tabNS(this).browser.contentDocument.title,
  set title(value) tabNS(this).browser.contentDocument.title = String(value),

  /**
   * Location of the page currently loaded in this tab.
   * Changing this property will loads page under under the specified location.
   * @type {String}
   */
  get url() String(tabNS(this).browser.currentURI.spec),
  set url(value) defer(function(url) tabNS(this).browser.loadURI(url)),

  /**
   * URI of the favicon for the page currently loaded in this tab.
   * @type {String}
   */
  get favicon() "",

  /**
   * The index of the tab relative to other tabs in the application window.
   * Changing this property will change order of the actual position of the tab.
   * @type {Number}
   */
  get index() {
    let tabs = tabNS(this).window.BrowserApp.tabs;
    let tab = tabNS(this).tab;
    for (var i = tabs.length; i >= 0; i--) {
      if (tabs[i] === tab)
        return i;
    }
    return -1;
  },
  set index(value) {},

  /**
   * Whether or not tab is pinned (Is an app-tab).
   * @type {Boolean}
   */
  get isPinned() false,
  pin: function pin() {},
  unpin: function unpin() {},

  /**
   * Create a worker for this tab, first argument is options given to Worker.
   * @type {Worker}
   */
  attach: function attach(options) {
    /*
    let { Worker } = require("../content/worker");
    options.window = this._contentWindow;
    let worker = Worker(options);
    worker.once("detach", function detach() {
      worker.destroy();
    });
    return worker;
    */
  },

  /**
   * Make this tab active.
   * Please note: That this function is called asynchronous since in E10S that
   * will be the case. Besides this function is called from a constructor where
   * we would like to return instance before firing a 'TabActivated' event.
   */
  activate: defer(function activate() {
    if (tabNS(this).window) // Ignore if window is closed by the time this is invoked.
      tabNS(this).window.BrowserApp.selectTab(tabNS(this).tab);
  }),

  /**
   * Close the tab
   */
  close: function close(callback) {
    if (callback)
      this.once(EVENTS.close.name, callback);

    tabNS(this).window.BrowserApp.closeTab(tabNS(this).tab);
  },

  /**
   * Reload the tab
   */
  reload: function reload() {
    tabNS(this).tab.reloadWithMode(false);
  }
});
exports.Tab = Tab;
