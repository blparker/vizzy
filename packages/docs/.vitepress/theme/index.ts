import DefaultTheme from 'vitepress/theme';
import VizzyExample from './components/VizzyExample.vue';
import ExampleGallery from './components/ExampleGallery.vue';

export default {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        app.component('VizzyExample', VizzyExample);
        app.component('ExampleGallery', ExampleGallery);
    },
};
