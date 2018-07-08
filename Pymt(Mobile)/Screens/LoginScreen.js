import React, { Component } from 'react';

import _title from './../Components/_title'

import { AppRegistry, StyleSheet, TextInput, View, Image, TouchableOpacity, Text,ScrollView, Alert } from 'react-native';
import {Button } from 'native-base';
export default class LoginScreen extends Component {

  static navigationOptions = {
    header: null,
  };
  constructor(props) {
    super(props)
    this.state = { useremail: '', userpassword: '' };
    this.usersignin = this.usersignin.bind(this);
  }
  render() {
    const { navigate } = this.props.navigation;
    return (
        <ScrollView style={{ paddingTop: 100, backgroundColor: '#fff'}}>
      <View style={styles.container}>
                <View style={{ width: '100%' }}>
                    <Text style={styles.title} >Pymt</Text>
                </View>

        <View style={styles.SectionStyle}>
          <Image source={require('./Images/ic_person.png')} style={styles.ImageStyle} />
          <TextInput
            style={{ flex: 1 }}
            placeholder="Email Address"
            underlineColorAndroid="transparent"
            onChangeText={(useremail) => this.setState({ useremail })}
          />

        </View>
        <View style={styles.SectionStyle}>
          <Image source={require('./Images/ic_person.png')} style={styles.ImageStyle} />
          <TextInput
            style={{ flex: 1 }}
            placeholder="Password"
            underlineColorAndroid="transparent"
            secureTextEntry={true}
            onChangeText={(userpassword) => this.setState({ userpassword })}
          />

        </View>

        <Button block
            onPress={() => { navigate("PinScreen") }}
          color="#187FD7"
                    style={{ margin: 10, backgroundColor:'#10d0a0' }}
        >
          <Text style={{ color: '#fff' }} >Login</Text>
        </Button>
        <View style={{ width: '100%' }}>
                    <TouchableOpacity 
            onPress={() => {  }}
            style={{ width:'100%' }}
          >
            <Text style={styles.signup} >Sign up</Text>
                    </TouchableOpacity>
        </View>
      </View>
        </ScrollView>
    );
  }
  usersignin() {
    fetch('http://pymtpos.com/api/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        email: this.state.useremail,
        password: this.state.userpassword,
      }),
    }).then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.success==true)
        {
          this.props.navigate.navigation("PinScreen");
        }else
        {
          alert('Please check your username and password');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  
  },
  inputsContainer: {
    flex: 1
  },
  SectionStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: .5,
    borderColor: '#000',
    height: 45,
    borderRadius: 5,
    margin: 10

  },

  ImageStyle: {
    padding: 10,
    margin: 5,
    height: 25,
    width: 25,
    resizeMode: 'stretch',
    alignItems: 'center'
  },
    title: {
        fontWeight: 'bold',
        color:'#10d0a0',
        fontSize: 60,
        marginTop: 0,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom:30,
    },
    signup: {
       
        fontSize: 18,
        marginTop: 0,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color:'#78AEF9',
    },
});