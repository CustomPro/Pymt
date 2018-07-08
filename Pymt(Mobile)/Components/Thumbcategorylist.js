import React from 'react';
import PropTypes from 'prop-types';
import {
    Dimensions,
    StyleSheet,
    ScrollView,
    View,
    Image,
    TouchableHighlight,
    Alert,
    AsyncStorage,
    Platform

} from 'react-native';

import { Container, Header, Content, Card, CardItem, Body, Text } from 'native-base';



const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,


    },

    Card: {
        padding: 20,
        marginRight: 15,
        backgroundColor: '#78aef9',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#fff',
        width: '30%',
        height: 100,
        marginBottom: 10

    },

});

export default function Thumbcategorylist({catelist}) {
var data=JSON.stringify(catelist);
   
    for (var yy in catelist)
    {
        alert(data.value);
        alert(yy);
    }
   
    return (
        <ScrollView style={{ flex: 1, width: '100%', padding: 10 }}>
            <View style={styles.container}>
   

            </View>
            {/* <View style={styles.container}>
                <TouchableHighlight style={styles.Card}>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }} >A</Text>
                </TouchableHighlight>
                <TouchableHighlight style={styles.Card}>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }} >B</Text>
                </TouchableHighlight>
                <TouchableHighlight style={styles.Card}>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }} >C</Text>
                </TouchableHighlight>
              
            </View> */}
            {/* <View style={styles.container}>
                <TouchableHighlight style={styles.Card}>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }} >A</Text>
                </TouchableHighlight>
                <TouchableHighlight style={styles.Card}>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }} >B</Text>
                </TouchableHighlight>
                <TouchableHighlight style={styles.Card}>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }} >C</Text>
                </TouchableHighlight>
               
            </View> */}
            {/* <View style={styles.container}>
                <TouchableHighlight style={styles.Card}>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }} >A</Text>
                </TouchableHighlight>
                <TouchableHighlight style={styles.Card}>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }} >B</Text>
                </TouchableHighlight>
                <TouchableHighlight style={styles.Card}>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }} >C</Text>
                </TouchableHighlight>
               
            </View> */}
        </ScrollView>
    );
}


Thumbcategorylist.propTypes = {
    catlist: PropTypes.func.isRequired,
};

