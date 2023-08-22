(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('video.js')) :
  typeof define === 'function' && define.amd ? define(['video.js'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.videojsSettingsMenu = factory(global.videojs));
})(this, (function (videojs) {
  'use strict';

  var videojs__default = videojs["default"];

  var Plugin = videojs__default.getPlugin('plugin');
  var Component = videojs__default.getComponent('Component');
  var Button = videojs__default.getComponent('MenuButton');

  var defaults = {
    items: ["AudioTrackButton", "SubsCapsButton", "PlaybackRateMenuButton", "RatesButton"],
    languages: {
      settings: "Settings",
      loading: "Loading",
      back: "Back",
      captions_off: "Captions Off",
      default_audio: "Default Audio",
      audio: "Audio",
      subtitles: "Subtitles",
      chapters: "Chapters",
      speed: "Speed",
      quality: "Quality"
    }
  };

  var SettingsMenu = /*#__PURE__*/(function (_Plugin) {
    inheritsLoose(SettingsMenu, _Plugin);

    function SettingsMenu(player, options) {
      var _this;

      _this = _Plugin.call(this, player) || this;

      var self = assertThisInitialized(_this);

      self.playerId = _this.player.id();
      _this.options = videojs__default.mergeOptions(defaults, options);

      _this.player.ready(function () {
        _this.player.addClass('vjs-settings-menu');

        _this.buildUI();

        if (videojs__default.browser.IS_IOS || videojs__default.browser.IS_ANDROID) {
          _this.mobileBuildUI();
        }
      });

      _this.player.on("playbackRateSwitched", function (e) {
        var rate = e.target.player.playbackRateSwitched;
        this.getChild('controlBar').getChild('settingsMenuButton').controlText(rate.height + "p, " + self.formatBps(rate.bitrate));
      });

      _this.player.on('userinactive', function () {
        document.getElementById(self.playerId).querySelectorAll('.vjs-menu').forEach(function (element) {
          element.classList.remove('vjs-lock-open');
        });
      });

      _this.player.on('click', function (evt) {
        if (evt.target.tagName === 'VIDEO') {
          document.getElementById(self.playerId).querySelectorAll('.vjs-menu').forEach(function (element) {
            element.classList.remove('vjs-lock-open');
          });
        }
      });

      _this.player.on('loadstart', function (_event) {
        this.one('canplaythrough', function (_evt) {
          self.removeElementsByClass('vjs-setting-menu-clear');

          if (videojs__default.browser.IS_IOS || videojs__default.browser.IS_ANDROID) {
            self.mobileBuildTopLevelMenu();
          } else {
            self.buildTopLevelMenu();
          }
        });
      });

      return _this;
    }

    var _proto = SettingsMenu.prototype;

    _proto.buildUI = function buildUI() {
      var self = this;

      var SettingsMenuButton = /*#__PURE__*/(function (_Button) {
        inheritsLoose(SettingsMenuButton, _Button);

        function SettingsMenuButton(player, options) {
          var _this2;

          _this2 = _Button.call(this, player, options) || this;

          _this2.addClass('vjs-settings-menu');

          _this2.controlText(self.options.languages.loading);

          var that = assertThisInitialized(_this2);

          self.player.one('canplaythrough', function (_event) {
            that.controlText(self.options.languages.settings);
          });

          _this2.menu.contentEl_.id = self.playerId + '-vjs-settings-menu-default';
          return _this2;
        }

        var _proto2 = SettingsMenuButton.prototype;

        _proto2.handleClick = function handleClick() {
          if (videojs__default.browser.IS_IOS || videojs__default.browser.IS_ANDROID) {
            self.player.getChild('settingsMenuMobileModal').el().style.display = 'block';
          } else {
            this.el().classList.toggle('vjs-toogle-btn');
            this.menu.el().classList.toggle('vjs-lock-open');
          }
        };

        return SettingsMenuButton;
      })(Button);

      videojs__default.registerComponent('settingsMenuButton', SettingsMenuButton);
      this.player.getChild('controlBar').addChild('settingsMenuButton');

      if (this.player.getChild("controlBar").getChild("fullscreenToggle")) {
        this.player.getChild('controlBar').el().insertBefore(this.player.getChild('controlBar').getChild('settingsMenuButton').el(), this.player.getChild('controlBar').getChild('fullscreenToggle').el());
      }
    };

    _proto.mobileBuildUI = function mobileBuildUI() {
      var self = this;

      var SettingsMenuMobileModal = /*#__PURE__*/(function (_Component) {
        inheritsLoose(SettingsMenuMobileModal, _Component);

        function SettingsMenuMobileModal(player, options) {
          return _Component.call(this, player, options) || this;
        }

        var _proto3 = SettingsMenuMobileModal.prototype;

        _proto3.createEl = function createEl() {
          return videojs__default.createEl('div', {
            className: 'vjs-settings-menu-mobile'
          });
        };

        return SettingsMenuMobileModal;
      })(Component);

      videojs__default.registerComponent('settingsMenuMobileModal', SettingsMenuMobileModal);
      videojs__default.dom.prependTo(self.player.addChild('settingsMenuMobileModal').el(), document.body);
    };

    _proto.mobileBuildTopLevelMenu = function mobileBuildTopLevelMenu() {
      var _this3 = this;

      var self = this;
      var settingsButton = this.player.getChild('settingsMenuMobileModal');
      var menuTopLevel = document.createElement('ul');
      menuTopLevel.className = 'vjs-sm-mob-top-level vjs-setting-menu-clear';
      settingsButton.el().appendChild(menuTopLevel);

      var menuTitle = document.createElement('li');
      menuTitle.className = 'vjs-setting-menu-mobile-top-header';
      menuTitle.innerHTML = this.options.languages.settings;
      menuTopLevel.appendChild(menuTitle);

      var comps = [];
      var chapter = false;
      var subtitles = false;

      if (self.player.textTracks().tracks_) {
        self.player.textTracks().tracks_.forEach(function (ele) {
          if (ele.kind === 'chapters') {
            chapter = true;
          }

          if (ele.kind === 'subtitles' || ele.kind === 'captions') {
            subtitles = true;
          }
        });
      }

      if (!chapter) {
        comps.push('ChaptersButton');
      }

      if (!subtitles) {
        comps.push('SubsCapsButton');
      }

      self.options.items.filter(function (item) {
        return !comps.includes(item);
      }).forEach(function (component) {
        if (self.player.getChild('controlBar').getChild(component)) {
          self.player.getChild('controlBar').getChild(component).addClass('vjs-hide-settings-menu-item');
          var textContent = self.setInitialStates(component);
          var settingItem = document.createElement('li');
          settingItem.setAttribute('data-component', component.toLowerCase());
          settingItem.innerHTML = textContent.language;
          settingItem.className = 'vjs-sm-top-level-item';
          var settingItemSpan = document.createElement('span');
          settingItemSpan.id = self.playerId + '-setting-menu-child-span-' + component.toLowerCase();
          settingItemSpan.innerHTML = textContent.default;
          settingItem.appendChild(settingItemSpan);
          menuTopLevel.appendChild(settingItem);

          setTimeout(function () {
            self.mobileBuildSecondLevelMenu(component, settingsButton.el());
          }, component === 'ChaptersButton' ? 1000 : 0);
        }
      });

      var settingMenuItems = document.querySelectorAll('.vjs-sm-top-level-item');
      Array.from(settingMenuItems).forEach(function (link) {
        link.addEventListener('click', function (event) {
          event.preventDefault();
          var clickComponent = this.getAttribute('data-component');
          document.querySelectorAll('.vjs-sm-mob-top-level').forEach(function (element) {
            element.classList.add('vjs-hidden');
          });
          document.getElementById(self.playerId + '-mb-comp-' + clickComponent).classList.remove('vjs-hidden');
        });
      });

      var menuClose = document.createElement('li');
      menuClose.innerHTML = 'Close';

      menuClose.onclick = function (e) {
        _this3.player.getChild('settingsMenuMobileModal').el().style.display = 'none';
      };

      menuClose.className = 'setting-menu-footer-default';
      menuTopLevel.appendChild(menuClose);
    };

    _proto.mobileBuildSecondLevelMenu = function mobileBuildSecondLevelMenu(component, item) {
      var self = this;
      this.player.getChild('controlBar').getChild('settingsMenuButton');

      if (this.player.getChild('controlBar').getChild(component)) {
        var componentMenu = this.player.getChild('controlBar').getChild(component).menu.contentEl_;

        for (var i = 0; i < componentMenu.children.length; i++) {
          var classCheck = componentMenu.children[i].getAttribute('class');

          if (classCheck === 'setting-menu-header' || classCheck === 'vjs-menu-title') {
            componentMenu.children[i].remove();
          }
        }

        componentMenu.id = self.playerId + '-mb-comp-' + component.toLowerCase();
        componentMenu.classList.add('vjs-hidden');
        componentMenu.classList.add('vjs-sm-mob-second-level');
        componentMenu.classList.add('vjs-setting-menu-clear');
        var backBtn = document.createElement('li');
        backBtn.className = 'setting-menu-header';
        backBtn.setAttribute('data-component', component.toLowerCase());
        var backBtnArrow = document.createElement('i');
        backBtnArrow.className = 'setting-menu-list-arrow setting-menu-list-arrow-left';
        backBtn.appendChild(backBtnArrow);

        backBtn.onclick = function (_evt) {
          document.querySelectorAll('.vjs-sm-mob-top-level').forEach(function (element) {
            element.classList.remove('vjs-hidden');
          });
          document.querySelectorAll('.vjs-menu-content').forEach(function (element) {
            element.classList.add('vjs-hidden');
          });
          var set_state = document.getElementById(self.playerId + '-mb-comp-' + this.getAttribute('data-component')).querySelectorAll('.vjs-selected');

          if (set_state !== undefined && set_state.length > 0) {
            if (set_state[0].textContent) {
              document.getElementById(self.playerId + '-setting-menu-child-span-' + this.getAttribute('data-component')).innerText = self.cleanDefault(set_state[0].textContent);
            }
          }

          document.querySelectorAll('.vjs-sm-list-item').forEach(function (element) {
            element.classList.remove('vjs-hidden');
          });
          document.querySelectorAll('.vjs-menu-content').forEach(function (element) {
            if (element.classList.value.includes('vjs-lock')) {
              element.classList.remove('vjs-lock');
              element.classList.add('vjs-hidden');
            }
          });
        };

        var backBtnInner = document.createElement('span');
        backBtnInner.innerHTML = self.options.languages.back;
        backBtn.appendChild(backBtnInner);
        componentMenu.insertBefore(backBtn, componentMenu.firstChild);
        item.appendChild(componentMenu);
      }
    };

    _proto.buildMenuList = function buildMenuList(component) {
      var self = this;
      var settingsButton = this.player.getChild('controlBar').getChild('settingsMenuButton');

      if (this.player.getChild('controlBar').getChild(component)) {
        var componentMenu = this.player.getChild('controlBar').getChild(component).menu.contentEl_;

        for (var i = 0; i < componentMenu.children.length; i++) {
          var classCheck = componentMenu.children[i].getAttribute('class');

          if (classCheck === 'setting-menu-header' || classCheck === 'vjs-menu-title') {
            componentMenu.children[i].remove();
          }
        }

        componentMenu.id = self.playerId + '-setting-menu-child-menu-' + component.toLowerCase();
        componentMenu.classList.add('vjs-hidden');
        componentMenu.classList.add('vjs-setting-menu-clear');
        var backBtn = document.createElement('li');
        backBtn.className = 'setting-menu-header';
        backBtn.setAttribute('data-component', component.toLowerCase());
        var backBtnArrow = document.createElement('i');
        backBtnArrow.className = 'setting-menu-list-arrow setting-menu-list-arrow-left';
        backBtn.appendChild(backBtnArrow);

        backBtn.onclick = function (_evt) {
          var set_state = document.getElementById(self.playerId + '-setting-menu-child-menu-' + this.getAttribute('data-component')).querySelectorAll('.vjs-selected');

          if (set_state !== undefined && set_state.length > 0) {
            if (set_state[0].textContent) {
              document.getElementById(self.playerId + '-setting-menu-child-span-' + this.getAttribute('data-component')).innerText = self.cleanDefault(set_state[0].textContent);
            }
          }

          document.querySelectorAll('.vjs-sm-top-level').forEach(function (element) {
            element.classList.remove('vjs-hidden');
          });
          document.querySelectorAll('.vjs-menu-content').forEach(function (element) {
            if (element.classList.value.includes('vjs-lock')) {
              element.classList.remove('vjs-lock');
              element.classList.add('vjs-hidden');
            }
          });
        };

        var backBtnInner = document.createElement('span');
        backBtnInner.innerHTML = self.options.languages.back;
        backBtn.appendChild(backBtnInner);
        componentMenu.insertBefore(backBtn, componentMenu.firstChild);
        settingsButton.menu.el().appendChild(componentMenu);
      }
    };

    _proto.setInitialStates = function setInitialStates(component) {
      switch (component) {
        case 'RatesButton':
          return {
            default: 'auto',
            language: this.options.languages.quality
          };

        case 'PlaybackRateMenuButton':
          return {
            default: '1x',
            language: this.options.languages.speed
          };

        case 'ChaptersButton':
          return {
            default: '',
            language: this.options.languages.chapters
          };

        case 'AudioTrackButton':
          var audioTracks = this.player.audioTracks();
          var defaultAudio = this.options.languages.defaultAudio;
          var x = audioTracks.length;

          while (x--) {
            if (audioTracks[x].enabled) {
              defaultAudio = audioTracks[x].label;
            }
          }

          return {
            default: defaultAudio,
            language: this.options.languages.audio
          };

        case 'SubsCapsButton':
          var captionTracks = this.player.textTracks();
          var defaultCaptions = this.options.languages.captions_off;
          var z = captionTracks.length;

          while (z--) {
            if (captionTracks[z].kind === 'subtitles' && captionTracks[z].mode === 'showing') {
              defaultCaptions = captionTracks[z].label;
            }
          }

          return {
            default: defaultCaptions,
            language: this.options.languages.subtitles
          };

        default:
          return {
            default: '',
            language: 'Menu'
          };
      }
    };

    _proto.removeElementsByClass = function removeElementsByClass(className) {
      document.querySelectorAll('.vjs-sm-top-level').forEach(function (element) {
        element.classList.remove('vjs-hidden');
      });
      var elements = document.getElementsByClassName(className);

      while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
      }
    };

    _proto.cleanDefault = function cleanDefault(state) {
      state = state.replace(/\s\s+/g, ' ');
      var stateComma = state.indexOf(',');
      state = state.substring(0, stateComma != -1 ? stateComma : state.length);
      state = state.replace(/(<([^>]+)>)/ig, "");
      return state;
    };

    _proto.formatBps = function formatBps(bits) {
      var i = -1;
      var byteUnits = [' kbps', ' Mbps', ' Gbps', ' Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps'];

      do {
        bits = bits / 1024;
        i++;
      } while (bits > 1024);

      return Math.max(bits, 0.1).toFixed(1) + byteUnits[i];
    };

    return SettingsMenu;
  })(Plugin);

  SettingsMenu.defaultState = {};
  SettingsMenu.VERSION = version;

  videojs__default.registerPlugin('settingsMenu', SettingsMenu);

  return SettingsMenu;
}));
