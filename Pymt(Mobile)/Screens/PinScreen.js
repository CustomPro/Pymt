import React, { Component } from 'react';

import { AppRegistry, StyleSheet, TextInput, View, Image, TouchableOpacity, Text, ScrollView } from 'react-native';
import { Button } from 'native-base';
import InputButton from './../Components/InputButton';
import Style from './../Components/style';
import style from './../Components/style';
const inputButtons = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ['', '0', 'Del']

];
export default class PinCreen extends Component {

    static navigationOptions = {
        header: null,
    };
    constructor(props) {
        super(props);

        this.initialState = {
            previousInputValue: 0,
            inputValue: 0,
            selectedSymbol: null
        };

        this.state = this.initialState;
    }

    render() {
        const { navigate } = this.props.navigation;
        return (

            <View style={Style.rootContainer}>
                <View>
                    <Text style={Style.textcenter} >Enter user pin</Text>
                </View>
                <View style={Style.displayContainer}>
                    {/* <TextInput
                        style={Style.displayText}                       
                        underlineColorAndroid="transparent"
                        secureTextEntry={true}
                        onChangeText={(inputValue) => this.setState({ inputValue })}
                    /> */}
                    <Text secureTextEntry={true} style={Style.displayText}>{this.state.inputValue}</Text>
                </View>
                <View style={Style.inputContainer}>
                    {this._renderInputButtons()}
                </View>
                <Button block
                    onPress={() => { navigate("MainScreen") }}
                    color="#187FD7"
                    style={{ margin: 20, backgroundColor: '#10d0a0' }}
                >
                    <Text style={{ color: '#fff' }} >Continue</Text>
                </Button>
            </View>

        );
    }

    _renderInputButtons() {

        let views = inputButtons.map((row, idx) => {
            let inputRow = row.map((buttonVal, columnIdx) => {
                return <InputButton
                    value={buttonVal}
                    highlight={this.state.selectedSymbol === buttonVal}
                    onPress={this._onInputButtonPressed.bind(this, buttonVal)}
                    key={'butt-' + columnIdx} />;
            });

            return <View style={Style.inputRow} key={'row-' + idx}>{inputRow}</View>;
        });

        return views;
    }

    _onInputButtonPressed(input) {
        switch (typeof input) {
            case 'number':
                return this._handleNumberInput(input);
            default:
                return this._handleStringInput(input);
        }
    }

    _handleNumberInput(num) {
        let inputValue = (this.state.inputValue * 10) + num;

        this.setState({
            inputValue: inputValue
        });
    }

    _handleStringInput(str) {
        switch (str) {


            case 'Del':

                inputValue = this.state.inputValue.substring(0, this.state.inputValue.length - 1);
                // this.state.inputValue.lenght-1,


                this.setState({
                    previousInputValue: 0,
                    inputValue: inputValue,
                    selectedSymbol: null
                });
                break;


        }
    }
}
