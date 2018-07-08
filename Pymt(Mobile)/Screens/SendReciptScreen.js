import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
} from 'react-native';

const image = require('./Images/airplane.png');
import { Container, Header, Content, Footer, FooterTab, Button, Left, Icon, Body, Title, Right, Input, Item, Form, Label } from 'native-base';
const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        bottom: 20,
        backgroundColor: '#fff',
        left: 0,
        right: 0


    },
    input: {
        position: 'absolute',
        bottom: 100,
        backgroundColor: '#fff',
        left: 20,
        right: 20


    },
    Textlable: {
        position: 'absolute',
        top: 200,

        alignItems: 'center'


    },
    Imagescreen: {
        position: 'absolute',
        top: 80,
        alignItems: 'center',
        height: 100,
        width: 100
    },

    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },

});

export default class SendReciptScreen extends Component {
    static navigationOptions = {
        header: null,
    };
    constructor(props) {
        super(props);



        this.state = {
            isOpen: false,
            selectedItem: 'About',
        };
    }


    render() {


        return (

            <View style={styles.container}>
                <Image source={require('./Images/Check.png')} style={styles.Imagescreen} ></Image>
                <View style={styles.Textlable} >
                    <Label style={{ fontSize: 22, fontWeight: 'bold', color: '#10d0a0' }} >Recipt sent!</Label>
                    <Label style={{ fontSize: 22, fontWeight: 'bold', color: '#10d0a0' }}>Please hand device back.</Label>
                   
                </View>
            </View>



        );
    }
}