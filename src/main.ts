import { createApp } from 'vue';
import { createPinia } from 'pinia'
import 'primeicons/primeicons.css'

import App from './App.vue';

import '../node_modules/@mobilon-dev/chotto/dist/chotto.css';
import './assets/style.css';

const pinia = createPinia();

const app = createApp(App);

app.use(pinia)
app.mount('#app');
