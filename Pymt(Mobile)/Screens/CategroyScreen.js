import React, { Component } from 'react';
import { Container, Header, Content, Footer, FooterTab, Button, Text, Left, Icon, Body, Title, Right, Input, Item } from 'native-base';
const SideMenu = require('react-native-side-menu');
export default class FooterTabsExample extends Component {
    static navigationOptions = {
        header: null,
    };
    render() {
        return (
            <Container>
                <Header>
                    <Left>
                        <Button transparent>
                            <Icon name='menu' />
                        </Button>
                    </Left>
                    <Body>
                        <Title>Pytm</Title>
                    </Body>
                    <Right />
                </Header>
                <Header searchBar rounded>
                    <Item>

                        <Input placeholder="Search" />
                        <Icon name="ios-search" />
                    </Item>
                    <Button transparent>
                        <Text>Search</Text>
                    </Button>
                </Header>
                <Content />
                <Footer>
                    <FooterTab>
                        <Button transparent>
                            <Icon name='ios-cube-outline' />
                        </Button>
                        <Button transparent>
                            <Icon name='ios-apps-outline' />
                        </Button>
                        <Button transparent>
                            <Icon name='ios-camera-outline' />
                        </Button>
                        <Button transparent >
                            <Icon name='ios-cart-outline' />
                        </Button>
                    </FooterTab>
                </Footer>
            </Container>
        );
    }
}