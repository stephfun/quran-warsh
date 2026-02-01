import { createRoot } from 'react-dom/client';
import { AppRegistry } from 'react-native';
import App from '../App.web';

// Register the app
AppRegistry.registerComponent('QuranWarshApp', () => App);

// Mount to DOM
const rootTag = document.getElementById('root');
if (rootTag) {
  const root = createRoot(rootTag);
  root.render(<App />);
}
