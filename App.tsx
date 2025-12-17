/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View, LogBox } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';

import AppNavigator from './src/navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Ignore third-party library deprecation warnings
LogBox.ignoreLogs([
  'SafeAreaView has been deprecated',
]);
function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const html = `
  <html>
    <head>
      <script src="https://cdn.olamaps.io/map/olamaps.js"></script>
    </head>
    <body>
      <div id="map" style="width:100%;height:100%"></div>
      <script>
        const map = OLMAP.createMap("map", {
          center: [12.97, 77.59],
          zoom: 12
        });
      </script>
    </body>
  </html>`;
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AppNavigator />
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
