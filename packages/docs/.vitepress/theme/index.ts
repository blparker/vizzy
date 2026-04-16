import DefaultTheme from 'vitepress/theme';
import VizzyExample from './components/VizzyExample.vue';
import ExampleGallery from './components/ExampleGallery.vue';
import PlaygroundPage from './components/PlaygroundPage.vue';

export default {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        app.component('VizzyExample', VizzyExample);
        app.component('ExampleGallery', ExampleGallery);
        app.component('PlaygroundPage', PlaygroundPage);
    },
};
