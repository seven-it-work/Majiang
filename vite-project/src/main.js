import { createApp } from 'vue';
import './style.css';
// @ts-ignore
import App from './App.vue';
import 'ant-design-vue/dist/reset.css';
import Antd from 'ant-design-vue';
import 'animate.css';
import { createPinia } from 'pinia';
createApp(App).use(Antd).use(createPinia()).mount('#app');
