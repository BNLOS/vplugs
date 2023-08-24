/*! @name @samueleastdev/videojs-settings-menu @version 0.0.9 @license MIT */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('video.js')) :
  typeof define === 'function' && define.amd ? define(['video.js'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.videojsSettingsMenu = factory(global.videojs));
})(this, (function (videojs) {
  'use strict';

  var Plugin = videojs.getPlugin('plugin');
  var Component = videojs.getComponent('Component');
  var Button = videojs.getComponent('MenuButton');

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

  class SettingsMenu extends Plugin {
    constructor(player, options) {
      super(player);
      this.options = videojs.mergeOptions(defaults, options);

      this.player.ready(() => {
        this.player.addClass('vjs-settings-menu');
        this.buildUI();
        if (videojs.browser.IS_IOS || videojs.browser.IS_ANDROID) {
          this.mobileBuildUI();
        }
      });

      this.player.on('playbackRateSwitched', (e) => {
        const rate = e.target.player.playbackRateSwitched;
        this.getChild('controlBar').getChild('settingsMenuButton').controlText(`${rate.height}p, ${this.formatBps(rate.bitrate)}`);
      });

      this.player.on('userinactive', () => {
        document.getElementById(this.playerId).querySelectorAll('.vjs-menu').forEach((element) => {
          element.classList.remove('vjs-lock-open');
        });
      });

      this.player.on('click', (evt) => {
        if (evt.target.tagName === 'VIDEO') {
          document.getElementById(this.playerId).querySelectorAll('.vjs-menu').forEach((element) => {
            element.classList.remove('vjs-lock-open');
          });
        }
      });

      this.player.on('loadstart', (_event) => {
        this.one('canplaythrough', (_evt) => {
          this.removeElementsByClass('vjs-setting-menu-clear');
          if (videojs.browser.IS_IOS || videojs.browser.IS_ANDROID) {
            this.mobileBuildTopLevelMenu();
          } else {
            this.buildTopLevelMenu();
          }
        });
      });
    }

    buildUI() {
      const settingsButton = this.player.getChild('controlBar').getChild('settingsMenuButton');

      settingsButton.menu;
      const main = settingsButton.menu.contentEl_;

      main.innerHTML = "";
      main.classList.add('vjs-sm-top-level');

      const menuTitle = document.createElement('li');
      menuTitle.className = 'vjs-sm-top-level-header';
      const menuTitleInner = document.createElement("span");
      menuTitleInner.innerHTML = this.options.languages.settings;
      menuTitle.appendChild(menuTitleInner);
      main.appendChild(menuTitle);

      const comps = [];
      let chapter = false;
      let subtitles = false;

      if (this.player.textTracks().tracks_) {
        this.player.textTracks().tracks_.forEach((ele) => {
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

      this.options.items.filter((item) => !comps.includes(item)).forEach((component) => {
        if (this.player.getChild('controlBar').getChild(component)) {
          const textContent = this.setInitialStates(component);
          this.player.getChild('controlBar').getChild(component).addClass('vjs-hide-settings-menu-item');

          const settingItem = document.createElement('li');
          settingItem.innerHTML = textContent.language;
          settingItem.setAttribute('data-component', component.toLowerCase());
          settingItem.className = 'vjs-sm-list-item';

          const settingItemArrow = document.createElement('i');
          settingItemArrow.className = 'setting-menu-list-arrow setting-menu-list-arrow-right';
          settingItem.appendChild(settingItemArrow);

          const settingItemSpan = document.createElement('span');
          settingItemSpan.id = `${this.playerId}-setting-menu-child-span-${component.toLowerCase()}`;
          settingItemSpan.innerHTML = textContent.default;
          settingItem.appendChild(settingItemSpan);

          main.appendChild(settingItem);

          setTimeout(() => {
            this.buildMenuList(component);
          }, component === 'ChaptersButton' ? 1000 : 0);
        }
      });

      const settingMenuItems = document.querySelectorAll('.vjs-sm-list-item');
      Array.from(settingMenuItems).forEach((link) => {
        link.addEventListener('click', (event) => {
          document.querySelectorAll('.vjs-sm-top-level').forEach((element) => {
            element.classList.add('vjs-hidden');
          });

          const active = document.getElementById(`${this.playerId}-setting-menu-child-menu-${link.getAttribute('data-component')}`);
          active.classList.remove('vjs-hidden');
          active.classList.add('vjs-lock');

          event.preventDefault();
        });
      });
    }

    mobileBuildUI() {
      const settingsButton = this.player.getChild('settingsMenuMobileModal');

      class SettingsMenuMobileModal extends Component {
        createEl() {
          return videojs.createEl('div', {
            className: 'vjs-settings-menu-mobile'
          });
        }
      }

      videojs.registerComponent('settingsMenuMobileModal', SettingsMenuMobileModal);
      videojs.dom.prependTo(this.player.addChild('settingsMenuMobileModal').el(), document.body);
    }

    mobileBuildTopLevelMenu() {
      const settingsButton = this.player.getChild('settingsMenuMobileModal');
      const menuTopLevel = document.createElement('ul');
      menuTopLevel.className = 'vjs-sm-mob-top-level vjs-setting-menu-clear';
      settingsButton.el().appendChild(menuTopLevel);

      const menuTitle = document.createElement('li');
      menuTitle.className = 'vjs-setting-menu-mobile-top-header';
      menuTitle.innerHTML = this.options.languages.settings;
      menuTopLevel.appendChild(menuTitle);

      const comps = [];
      let chapter = false;
      let subtitles = false;

      if (this.player.textTracks().tracks_) {
        this.player.textTracks().tracks_.forEach((ele) => {
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

      this.options.items.filter((item) => !comps.includes(item)).forEach((component) => {
        if (this.player.getChild('controlBar').getChild(component)) {
          this.player.getChild('controlBar').getChild(component).addClass('vjs-hide-settings-menu-item');
          const textContent = this.setInitialStates(component);

          const settingItem = document.createElement('li');
          settingItem.setAttribute('data-component', component.toLowerCase());
          settingItem.innerHTML = textContent.language;
          settingItem.className = 'vjs-sm-top-level-item';

          const settingItemSpan = document.createElement('span');
          settingItemSpan.id = `${this.playerId}-setting-menu-child-span-${component.toLowerCase()}`;
          settingItemSpan.innerHTML = textContent.default;
          settingItem.appendChild(settingItemSpan);

          menuTopLevel.appendChild(settingItem);

          setTimeout(() => {
            this.mobileBuildSecondLevelMenu(component, settingsButton.el());
          }, component === 'ChaptersButton' ? 1000 : 0);
        }
      });

      const settingMenuItems = document.querySelectorAll('.vjs-sm-top-level-item');
      Array.from(settingMenuItems).forEach((link) => {
        link.addEventListener('click', function (event) {
          event.preventDefault();
          const clickComponent = this.getAttribute('data-component');

          document.querySelectorAll('.vjs-sm-mob-top-level').forEach((element) => {
            element.classList.add('vjs-hidden');
          });

          document.getElementById(`${this.playerId}-mb-comp-${clickComponent}`).classList.remove('vjs-hidden');
        });
      });

      const menuClose = document.createElement('li');
      menuClose.innerHTML = 'Close';
      menuClose.onclick = (e) => {
        this.player.getChild('settingsMenuMobileModal').el().style.display = 'none';
      };
      menuClose.className = 'setting-menu-footer-default';
      menuTopLevel.appendChild(menuClose);
    }

    mobileBuildSecondLevelMenu(component, item) {
      const componentMenu = this.player.getChild('controlBar').getChild(component).menu.contentEl_;

      for (let i = 0; i < componentMenu.children.length; i++) {
        const classCheck = componentMenu.children[i].getAttribute('class');
        if (classCheck === 'setting-menu-header' || classCheck === 'vjs-menu-title') {
          componentMenu.children[i].remove();
        }
      }

      componentMenu.id = `${this.playerId}-mb-comp-${component.toLowerCase()}`;
      componentMenu.classList.add('vjs-hidden');
      componentMenu.classList.add('vjs-sm-mob-second-level');
      componentMenu.classList.add('vjs-setting-menu-clear');

      const backBtn = document.createElement('li');
      backBtn.className = 'setting-menu-header';
      backBtn.setAttribute('data-component', component.toLowerCase());

      const backBtnArrow = document.createElement('i');
      backBtnArrow.className = 'setting-menu-list-arrow setting-menu-list-arrow-left';
      backBtn.appendChild(backBtnArrow);

      backBtn.onclick = function (_evt) {
        const set_state = document.getElementById(`${this.playerId}-mb-comp-${this.getAttribute('data-component')}`).querySelectorAll('.vjs-selected');
        if (set_state !== undefined && set_state.length > 0) {
          if (set_state[0].textContent) {
            document.getElementById(`${this.playerId}-setting-menu-child-span-${this.getAttribute('data-component')}`).innerText = this.cleanDefault(set_state[0].textContent);
          }
        }

        document.querySelectorAll('.vjs-sm-mob-top-level').forEach((element) => {
          element.classList.remove('vjs-hidden');
        });

        document.querySelectorAll('.vjs-menu-content').forEach((element) => {
          element.classList.add('vjs-hidden');
        });

        document.querySelectorAll('.vjs-sm-list-item').forEach((element) => {
          element.classList.remove('vjs-hidden');
        });

        document.querySelectorAll('.vjs-menu-content').forEach((element) => {
          if (element.classList.value.includes('vjs-lock')) {
            element.classList.remove('vjs-lock');
            element.classList.add('vjs-hidden');
          }
        });
      };

      const backBtnInner = document.createElement('span');
      backBtnInner.innerHTML = this.options.languages.back;
      backBtn.appendChild(backBtnInner);

      componentMenu.insertBefore(backBtn, componentMenu.firstChild);
      item.appendChild(componentMenu);
    }

    buildTopLevelMenu() {
      const self = this;
      const settingsButton = self.player.getChild('controlBar').getChild('settingsMenuButton');
      const main = settingsButton.menu.contentEl_;

      main.innerHTML = "";
      main.classList.add('vjs-sm-top-level');

      const menuTitle = document.createElement('li');
      menuTitle.className = 'vjs-sm-top-level-header';
      const menuTitleInner = document.createElement("span");
      menuTitleInner.innerHTML = self.options.languages.settings;
      menuTitle.appendChild(menuTitleInner);
      main.appendChild(menuTitle);

      const comps = [];
      let chapter = false;
      let subtitles = false;

      if (self.player.textTracks().tracks_) {
        self.player.textTracks().tracks_.forEach((ele) => {
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

      self.options.items.filter((item) => !comps.includes(item)).forEach((component) => {
        if (self.player.getChild('controlBar').getChild(component)) {
          const textContent = self.setInitialStates(component);
          self.player.getChild('controlBar').getChild(component).addClass('vjs-hide-settings-menu-item');

          const settingItem = document.createElement('li');
          settingItem.innerHTML = textContent.language;
          settingItem.setAttribute('data-component', component.toLowerCase());
          settingItem.className = 'vjs-sm-list-item';

          const settingItemArrow = document.createElement('i');
          settingItemArrow.className = 'setting-menu-list-arrow setting-menu-list-arrow-right';
          settingItem.appendChild(settingItemArrow);

          const settingItemSpan = document.createElement('span');
          settingItemSpan.id = `${self.playerId}-setting-menu-child-span-${component.toLowerCase()}`;
          settingItemSpan.innerHTML = textContent.default;
          settingItem.appendChild(settingItemSpan);

          main.appendChild(settingItem);

          setTimeout(() => {
            self.buildMenuList(component);
          }, component === 'ChaptersButton' ? 1000 : 0);
        }
      });

      const settingMenuItems = document.querySelectorAll('.vjs-sm-list-item');
      Array.from(settingMenuItems).forEach((link) => {
        link.addEventListener('click', function (event) {
          document.querySelectorAll('.vjs-sm-top-level').forEach((element) => {
            element.classList.add('vjs-hidden');
          });

          const active = document.getElementById(`${self.playerId}-setting-menu-child-menu-${this.getAttribute('data-component')}`);
          active.classList.remove('vjs-hidden');
          active.classList.add('vjs-lock');

          event.preventDefault();
        });
      });
    }

    buildMenuList(component) {
      const self = this;
      const settingsButton = self.player.getChild('controlBar').getChild('settingsMenuButton');

      if (self.player.getChild('controlBar').getChild(component)) {
        const componentMenu = self.player.getChild('controlBar').getChild(component).menu.contentEl_;

        for (let i = 0; i < componentMenu.children.length; i++) {
          const classCheck = componentMenu.children[i].getAttribute('class');
          if (classCheck === 'setting-menu-header' || classCheck === 'vjs-menu-title') {
            componentMenu.children[i].remove();
          }
        }

        componentMenu.id = `${self.playerId}-setting-menu-child-menu-${component.toLowerCase()}`;
        componentMenu.classList.add('vjs-hidden');
        componentMenu.classList.add('vjs-setting-menu-clear');

        const backBtn = document.createElement('li');
        backBtn.className = 'setting-menu-header';
        backBtn.setAttribute('data-component', component.toLowerCase());

        const backBtnArrow = document.createElement('i');
        backBtnArrow.className = 'setting-menu-list-arrow setting-menu-list-arrow-left';
        backBtn.appendChild(backBtnArrow);

        backBtn.onclick = function (_evt) {
          const set_state = document.getElementById(`${self.playerId}-setting-menu-child-menu-${this.getAttribute('data-component')}`).querySelectorAll('.vjs-selected');
          if (set_state !== undefined && set_state.length > 0) {
            if (set_state[0].textContent) {
              document.getElementById(`${self.playerId}-setting-menu-child-span-${this.getAttribute('data-component')}`).innerText = self.cleanDefault(set_state[0].textContent);
            }
          }

          document.querySelectorAll('.vjs-sm-top-level').forEach((element) => {
            element.classList.remove('vjs-hidden');
          });

          document.querySelectorAll('.vjs-menu-content').forEach((element) => {
            if (element.classList.value.includes('vjs-lock')) {
              element.classList.remove('vjs-lock');
              element.classList.add('vjs-hidden');
            }
          });
        };

        const backBtnInner = document.createElement('span');
        backBtnInner.innerHTML = self.options.languages.back;
        backBtn.appendChild(backBtnInner);

        componentMenu.insertBefore(backBtn, componentMenu.firstChild);
        settingsButton.menu.el().appendChild(componentMenu);
      }
    }

    setInitialStates(component) {
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
          let defaultAudio = this.options.languages.default_audio;
          const audioTracks = this.player.audioTracks();
          for (let x = audioTracks.length - 1; x >= 0; x--) {
            if (audioTracks[x].enabled) {
              defaultAudio = audioTracks[x].label;
              break;
            }
          }
          return {
            default: defaultAudio,
            language: this.options.languages.audio
          };

        case 'SubsCapsButton':
          let defaultCaptions = this.options.languages.captions_off;
          const captionTracks = this.player.textTracks();
          for (let z = captionTracks.length - 1; z >= 0; z--) {
            if (captionTracks[z].kind === 'subtitles' && captionTracks[z].mode === 'showing') {
              defaultCaptions = captionTracks[z].label;
              break;
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
    }

    removeElementsByClass(className) {
      document.querySelectorAll('.vjs-sm-top-level').forEach((element) => {
        element.classList.remove('vjs-hidden');
      });

      const elements = document.getElementsByClassName(className);
      while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
      }
    }

    cleanDefault(state) {
      state = state.replace(/\s\s+/g, ' ');
      const stateComma = state.indexOf(',');
      state = state.substring(0, stateComma !== -1 ? stateComma : state.length);
      state = state.replace(/(<([^>]+)>)/ig, "");
      return state;
    }

    formatBps(bits) {
      let i = -1;
      const byteUnits = [' kbps', ' Mbps', ' Gbps', ' Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps'];

      do {
        bits = bits / 1024;
        i++;
      } while (bits > 1024);

      return Math.max(bits, 0.1).toFixed(1) + byteUnits[i];
    }
  }

  videojs.registerPlugin('settingsMenu', SettingsMenu);

  return SettingsMenu;
}));
