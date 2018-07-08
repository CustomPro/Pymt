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


});

export default function Thumbcategorylist() {
    return (
        <ScrollView style={{ flex: 1, width: '100%', padding: 10 }}>
            <Container>
             
                <Content>
                    <List>
                        <ListItem>
                            <Thumbnail round size={30} source={require('./../Screens/Images/apps.png')} />
                            <Body>
                                <Text>Hot Dog</Text>
                                <Text note>$2.00</Text>
                              
                            </Body>
                            <TouchableHighlight>
                                <Text style={{ color:'#10d0a0',fontWeight:'bold',fontSize:22}}>+</Text>
                            </TouchableHighlight>
                           
                        </ListItem>
                       
                    </List>
                </Content>
            </Container>
        </ScrollView>
    );
}

