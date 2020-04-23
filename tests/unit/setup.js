import { mount, shallowMount, createLocalVue } from '@vue/test-utils';
import Vue from 'vue';
import Vuex from 'vuex';
import Vuetify from 'vuetify';
import VueRouter from 'vue-router';
import VueCookies from 'vue-cookies';
import BrowserSupportPlugin from './../../src/plugins/browserSupport';

global.mount = mount;
global.shallowMount = shallowMount;
global.createLocalVue = createLocalVue;
global.Vue = Vue;
global.Vuex = Vuex;
global.Vuetify = Vuetify;
global.VueRouter = VueRouter;
global.VueCookies = VueCookies;
global.BrowserSupportPlugin = BrowserSupportPlugin;

// So Vuetify doesn't yell about missing data-app
const el = document.createElement('div');
el.setAttribute('data-app', true);
document.body.appendChild(el);
