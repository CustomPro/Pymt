import React from 'react';
import PropTypes from 'prop-types';
import {
    Dimensions,
    StyleSheet,
    ScrollView,
    View,
    Image,
    TouchableHighlight

} from 'react-native';

import { Container, Header, Content, Card, CardItem, Body, Text } from 'native-base';



const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20

    },

    Card: {
        padding: 30,
        marginRight: 30,
        marginLeft: 30,
        backgroundColor: '#78aef9',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#fff',
        width: '100%',
        height: 150,
        marginBottom: 10

    },

});

export default function categorylist() {

    return (
        <ScrollView style={{ flex: 1, width: '100%', padding: 10 }}>
            <View style={styles.container}>
                {categorylist()}
                {/* <TouchableHighlight style={styles.Card}>
          <Text style={{fontSize:22,fontWeight:'bold',color:'#fff'}} >Catergory</Text>
            </TouchableHighlight>
            <TouchableHighlight style={styles.Card}>
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }} >Catergory</Text>
            </TouchableHighlight>
            <TouchableHighlight style={styles.Card}>
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }} >Catergory</Text>
            </TouchableHighlight>
                <TouchableHighlight style={styles.Card}>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }} >Catergory</Text>
                </TouchableHighlight> */}
            </View>
        </ScrollView>
    );

}

 function categorylist() {
    try {
        var api1 = 'http://localhost:3000/api/category';
        fetch(api1)
            .then((response) => response.json())
            .then((responseJson) => {
                var catelist = [];
                responseJson.data.map((cate) => {
                    catelist.push(
                        <TouchableHighlight style={styles.Card}  >
                            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }} >cate.CategoryName</Text>
                        </TouchableHighlight>
                    );
                });
                // for (w in this.state.wifiList) {

                // }
                return catelist;

            })
            .catch(() => {

            });
    } catch (e) {
        return false;
    }
    return true;
}

