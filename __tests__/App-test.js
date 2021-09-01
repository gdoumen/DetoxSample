/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        type: 'success',
        value: {
          id: 1,
          joke:
            'Chuck Norris uses ribbed condoms inside out, so he gets the pleasure.',
          categories: ['explicit'],
        },
      }),
  }),
);

it('renders correctly', () => {
  let error;
  try {
    renderer.create(<App />);
  } catch (e) {
    error = e;
  }
  expect(error).toBeUndefined();
});
