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
        height:100,
        width:100
    },
   
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#10d0a0',
    },
    
});

export default class ReciptScreen extends Component {
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

        const { navigate } = this.props.navigation;
        return (

            <View style={styles.container}>
                <Image source={require('./Images/Check.png')} style={styles.Imagescreen} ></Image>
                <View style={styles.Textlable} >
                    <Label style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }} >Thank you!</Label>
                    <Label style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }}>Your charge is $2.00</Label>               
              <View style={{top:50}}>
                        <Label style={{ fontSize: 14, color: '#fff', right:70, position:'absolute' }}>Tracation Number</Label>
                        <Label style={{ fontSize: 14,color: '#fff', left: 100, position: 'absolute' }}>1233444</Label>
              </View>
                    <View style={{ top: 120 }}>
                        <Label style={{ fontSize: 14, color: '#fff', right: 80, position: 'absolute' }}>Final Ammount</Label>
                        <Label style={{ fontSize: 14, color: '#fff', left: 100, position: 'absolute' }}>$2.00</Label>
                    </View>
                </View>
                <Form style={styles.input}>
                    <Item regular>
                        <Input placeholder='Enter Email/Text' />
                    </Item>
                </Form>

                <Button full style={styles.button}
                    onPress={() => { navigate('SendReciptScreen') }}
                >
                    <Text style={{ color:'#10d0a0'}} >SEND</Text>
                </Button>

            </View>



        );
    }
}