import {ImageBackground, StyleSheet, Text, useColorScheme} from 'react-native';
import React from 'react';
import {Colors } from 'react-native/Libraries/NewAppScreen';

const deleteExpectedProps = ( props, expected ) => {
  Object.keys(expected).forEach ( key => delete props[key])  
}


const Header = (props)  => {
  const isDarkMode = useColorScheme() === 'dark';

  const viewProps = {...props};
  
  deleteExpectedProps(viewProps,['text'])
  if ( props.text===undefined) {
    props.text = 'Welcome to React Native';
  }
  
  return (
    <ImageBackground
      {...viewProps}
      accessibilityRole="image"
      source={require('./logo.png')}
      style={[
        styles.background,
        {
          backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
        },
      ]}
      imageStyle={styles.logo}>
      <Text
        style={[
          styles.text,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {props.text.split('\\n').map ( (text,i) => {
          return (            
            <Text key={i}>{i>0 && '\n'}{text}</Text>
          )
        })}
      </Text>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    paddingBottom: 40,
    paddingTop: 96,
    paddingHorizontal: 32,
  },
  logo: {
    opacity: 0.2,
    overflow: 'visible',
    resizeMode: 'cover',
    /*
     * These negative margins allow the image to be offset similarly across screen sizes and component sizes.
     *
     * The source logo.png image is 512x512px, so as such, these margins attempt to be relative to the
     * source image's size.
     */
    marginLeft: -128,
    marginBottom: -192,
  },
  text: {
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default Header;