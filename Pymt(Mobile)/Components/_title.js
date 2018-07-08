import React, { Component } from 'react';

import { AppRegistry, StyleSheet, View, Text } from 'react-native';

class _title extends Component {

    render() {

        return (

            <View style={{ width: '100%' }}>
                <Text style={styles.headline} >Pytm</Text>
            </View>



        );
    }

}
const styles = StyleSheet.create({

    title: {
        fontWeight: 'bold',
        color: '#10d0a0',
        fontSize: 55,
        marginTop: 0,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },

});


