/* eslint-env jest */

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Icon = props => React.createElement(View, props);
  return new Proxy(
    { __esModule: true },
    {
      get(target, key) {
        if (key in target) {
          return target[key];
        }
        return Icon;
      },
    },
  );
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Mock = props => React.createElement(View, props);
  return new Proxy(
    { __esModule: true, default: Mock },
    {
      get(target, key) {
        if (key in target) {
          return target[key];
        }
        return Mock;
      },
    },
  );
});
