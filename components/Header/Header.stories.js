import {action} from '@storybook/addon-actions';
import {text} from '@storybook/addon-knobs';
import {storiesOf} from '@storybook/react-native';
import React from 'react';
import Header from './Header';

storiesOf('Header', module).add('default', () => (
  <Header testID="welcome" text="Welcome to \n'Joke of the day'" />
));
