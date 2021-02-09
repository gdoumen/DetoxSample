import React,{Component} from 'react';
import { RefreshControl} from 'react-native'

import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import Header from '../Header/Header'
import ChuckNorrisJokes from '../../api/ChuckNorrisJokes'

const styles = StyleSheet.create({
    scrollView: {
      backgroundColor: Colors.lighter,
    },
    engine: {
      position: 'absolute',
      right: 0,
    },
    body: {
      backgroundColor: Colors.white,
      flex:4
    },
    sectionContainer: {
      marginTop: 32,
      paddingHorizontal: 24,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '600',
      color: Colors.black,
    },
    sectionDescription: {
      marginTop: 8,
      fontSize: 20,
      fontWeight: '600',
      color: Colors.dark,
    },
    highlight: {
      fontWeight: '700',
    },
    footer: {
      color: Colors.dark,
      fontSize: 12,
      fontWeight: '600',
      padding: 4,
      paddingRight: 12,
      textAlign: 'right',
    },
  });
  
  
export default class MainScren extends Component {

    constructor(props) {
        super(props)

        this.state = {
            isLoading : false,
            joke: 'This app presents the joke of the day'
        }
        this.api = new ChuckNorrisJokes();
    }

    componentDidMount() {
        //
        this.load();
    }

    onRefresh() {
      if (!this.state.isLoading)
        this.load();
    }

    load() {
        this.setState( {isLoading:true})
        this.api.get()
        .then( joke => { this.setState({joke})}) 
        .catch( (err) => console.log(err) ) 
        .finally( ()=> {this.setState({ isLoading:false}) })
    }

    render() {
        const {isLoading,joke} = this.state;

        return (
        <>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView>
              <ScrollView
                  testID="scrollView"
                  contentInsetAdjustmentBehavior="automatic"
                  refreshControl= {                  
                    <RefreshControl refreshing={this.state.isLoading} onRefresh={ ()=> this.onRefresh()}/ >
                  }
                  style={styles.scrollView}>
                  <Header testID='welcome' text="Welcome to \n'Joke of the day'"/>

                  <View style={styles.body}>

                      <View style={styles.sectionContainer}>
                          {!isLoading &&  
                          <View style={styles.sectionTitle}>
                              <Text style={styles.sectionDescription} testID='joke'>{joke}</Text>
                          </View>
                          }
                      </View>
                  </View>
              </ScrollView>
  
           </SafeAreaView>
        </>  
        )
    }
}