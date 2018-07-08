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
import { Container, Header, Content, List, ListItem, Thumbnail, Text, Body } from 'native-base';



const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    Pricepanel:{
    height:150,
        justifyContent: 'center',
        alignItems:'center',
    }


});

export default function Itemtotal() {
    return (
        
        <View style={{ flex: 1, width: '100%'}}>
            <View style={styles.Pricepanel}>
                <Text style={{fontSize:28,fontWeight:'bold'}} >$500</Text>
                <Text>$500</Text>
            </View>
            <ScrollView style={{flex:1, width: '100%',padding:5 }}>
           
                    <List>
                        <ListItem>
                            <Thumbnail round size={30} source={require('./../Screens/Images/apps.png')} />
                            <Body>
                                <Text>Hot Dog</Text>
                                <Text note>$2.00</Text>

                            </Body>
                            <TouchableHighlight>
                                <Text style={{ color: '#10d0a0', fontWeight: 'bold', fontSize: 22 }}>+</Text>
                            </TouchableHighlight>
                            <Text>1</Text>
                        <TouchableHighlight>
                            <Text style={{ color: '#10d0a0', fontWeight: 'bold', fontSize: 22 }}>-</Text>
                        </TouchableHighlight>

                        </ListItem>
                    <ListItem>
                        <Thumbnail round size={30} source={require('./../Screens/Images/apps.png')} />
                        <Body>
                            <Text>Hot Dog</Text>
                            <Text note>$2.00</Text>

                        </Body>
                        <TouchableHighlight>
                            <Text style={{ color: '#10d0a0', fontWeight: 'bold', fontSize: 22 }}>+</Text>
                        </TouchableHighlight>
                        <Text>1</Text>
                        <TouchableHighlight>
                            <Text style={{ color: '#10d0a0', fontWeight: 'bold', fontSize: 22 }}>-</Text>
                        </TouchableHighlight>

                    </ListItem>
                    <ListItem>
                        <Thumbnail round size={30} source={require('./../Screens/Images/apps.png')} />
                        <Body>
                            <Text>Hot Dog</Text>
                            <Text note>$2.00</Text>

                        </Body>
                        <TouchableHighlight>
                            <Text style={{ color: '#10d0a0', fontWeight: 'bold', fontSize: 22 }}>+</Text>
                        </TouchableHighlight>
                        <Text>1</Text>
                        <TouchableHighlight>
                            <Text style={{ color: '#10d0a0', fontWeight: 'bold', fontSize: 22 }}>-</Text>
                        </TouchableHighlight>

                    </ListItem>
                    <ListItem>
                        <Thumbnail round size={30} source={require('./../Screens/Images/apps.png')} />
                        <Body>
                            <Text>Hot Dog</Text>
                            <Text note>$2.00</Text>

                        </Body>
                        <TouchableHighlight>
                            <Text style={{ color: '#10d0a0', fontWeight: 'bold', fontSize: 22 }}>+</Text>
                        </TouchableHighlight>
                        <Text>1</Text>
                        <TouchableHighlight>
                            <Text style={{ color: '#10d0a0', fontWeight: 'bold', fontSize: 22 }}>-</Text>
                        </TouchableHighlight>

                    </ListItem>
                    <ListItem>
                        <Thumbnail round size={30} source={require('./../Screens/Images/apps.png')} />
                        <Body>
                            <Text>Hot Dog</Text>
                            <Text note>$2.00</Text>

                        </Body>
                        <TouchableHighlight>
                            <Text style={{ color: '#10d0a0', fontWeight: 'bold', fontSize: 22 }}>+</Text>
                        </TouchableHighlight>
                        <Text>1</Text>
                        <TouchableHighlight>
                            <Text style={{ color: '#10d0a0', fontWeight: 'bold', fontSize: 22 }}>-</Text>
                        </TouchableHighlight>

                    </ListItem>
                    <ListItem>
                        <Thumbnail round size={30} source={require('./../Screens/Images/apps.png')} />
                        <Body>
                            <Text>Hot Dog</Text>
                            <Text note>$2.00</Text>

                        </Body>
                        <TouchableHighlight>
                            <Text style={{ color: '#10d0a0', fontWeight: 'bold', fontSize: 22 }}>+</Text>
                        </TouchableHighlight>
                        <Text>1</Text>
                        <TouchableHighlight>
                            <Text style={{ color: '#10d0a0', fontWeight: 'bold', fontSize: 22 }}>-</Text>
                        </TouchableHighlight>

                    </ListItem>
                    </List>
           
            </ScrollView>
            <View style={{ right:0}}>
                <TouchableHighlight>
                <Thumbnail round size={30} source={require('./../Screens/Images/apps.png')} />
                    </TouchableHighlight>
            </View>
            </View>
       
    );
}

