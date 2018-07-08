import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TouchableHighlight,
  ScrollView
} from 'react-native';
import SideMenu from 'react-native-side-menu';
import Menu from './SideMenu/MenuScreen';
import  Categorylst  from './../Components/CategoryList';
// import ThumbCategorylst from './../Components/Thumbcategorylist';
import Itemcategorylist from './../Components/Itempricelist';
import Itemtotal from './../Components/ItemTotal';
const image = require('./Images/airplane.png');
import { Container, Header, Content, Footer, FooterTab, Button, Left, Icon, Body, Title, Right, Input, Item } from 'native-base';

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 20,
    padding: 10,
  },
  caption: {
    fontSize: 20,
    fontWeight: 'bold',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  catcontainer: {
    flex: 1,
    flexDirection: 'row',
    // justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',



  },

  catCard: {
    padding: 20,
    marginRight: 5,
    backgroundColor: '#78aef9',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#fff',
    width: '30%',
    height: 100,
    marginBottom: 10

  },
  
});

export default class Basic extends Component {
  static navigationOptions = {
    header: null,
  };
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.funcategorylist = this.funcategorylist.bind(this);
    this.funItemlist = this.funItemlist.bind(this);

    this.state = {
      isOpen: false,
      selectedItem: 'About',
      listcat:[],
      itemlistprice:[]
    };
  }
componentDidMount()
{
  this.funcategorylist();
}

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  updateMenuState(isOpen) {
    this.setState({ isOpen });
  }
  onMenuItemSelected = item =>
    this.setState({
      isOpen: false,
      selectedItem: item,
    });

 funcategorylist() {
   var catelist = [];
  try {
    var api1 = 'http://pymtpos.com/api/category';
    fetch(api1)
      .then((response) => response.json())
      .then((responseJson) => {      
     
        this.setState({ listcat: responseJson.data});

      })
      .catch(() => {

      });
  } catch (e) {
   
  }
}

  funItemlist(catid) {
    var catelist = [];
    try {
      var api1 = 'http://pymtpos.com/api/getItemByCategory/'+catid;
      fetch(api1)
        .then((response) => response.json())
        .then((responseJson) => {

          this.setState({ itemlistprice: responseJson.data });

        })
        .catch(() => {

        });
    } catch (e) {

    }
  }


  RenderPage() {
    switch (this.state.selectedItem)
    {
      case 'home':
      {
                return (
            <Categorylst />
          );
      }
      case 'transaction':
        {
      
          var boxlit=[];
          var boxcount=0;
          this.state.listcat.map(function (item) {            
              boxlit.push(

                <TouchableHighlight style={styles.catCard} onPress={() => { 
                  var catid = item["CategoryID"];
                  this.funItemlist(catid);
                  this.setState({ selectedItem:'itemprice'});
                  this.RenderPage();
                }}  >
                  <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }} >{item["CategoryName"]}</Text>
                </TouchableHighlight>
              );         
          })

         
          return (
            <ScrollView style={{ flex: 1, width: '100%', padding: 10 }}>
              <View style={styles.catcontainer}>
                {boxlit}
              </View>
            
            </ScrollView>
          );
        }
      case 'cash':
        {
          return (<Itemcategorylist></Itemcategorylist>);
        }
      case 'tips':
        {
          return (<Itemtotal></Itemtotal>);
        }
      case 'endofday':
        {
          return (<View><Text>ebd of days</Text></View>);
        }
      case 'peripherals':
        {
          return (<View><Text>Peripherals</Text></View>);
        }
      case 'account':
        {
          return (<View><Text>account</Text></View>);
        }
      case 'signout':
        {
          break;
        }
      case 'itemprice':
        {
          var pricelit = [];
       
          this.state.itemlistprice.map(function (item) {
            pricelit.push(
              <ListItem>
                <Thumbnail round size={30} source={require('./../Screens/Images/apps.png')} />
                <Body>
                  <Text>{item["item_name"]}</Text>
                  <Text note>${item["price"]}</Text>

                </Body>
                <TouchableHighlight>
                  <Text style={{ color: '#10d0a0', fontWeight: 'bold', fontSize: 22 }}>+</Text>
                </TouchableHighlight>

              </ListItem>

            );
          })


          return (
            <ScrollView style={{ flex: 1, width: '100%', padding: 10 }}>
              <Container>

                <Content>
                  <List>
                    {pricelit}

                  </List>
                </Content>
              </Container>
            </ScrollView>
          );
        }
    }
  }


  render() {
    const menu = <Menu onItemSelected={this.onMenuItemSelected} />;
    const { navigate } = this.props.navigation;
    return (

      <SideMenu
        menu={menu}
        isOpen={this.state.isOpen}
        onChange={isOpen => this.updateMenuState(isOpen)}
      >
        <Header>
          <Left>
            <Button transparent>
              <Icon name='menu' />
            </Button>
          </Left>
          <Body>
            <Title>Pymt</Title>
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

        <View style={styles.container}>
          {this.RenderPage()}
        </View>
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
            <Button transparent onPress={() => { navigate("ReciptScreen")}} >
              <Icon name='ios-cart-outline' />
            </Button>
          </FooterTab>
        </Footer>
        <TouchableOpacity
          onPress={this.toggle}
          style={styles.button}
        >
          <Text>Menu</Text>
        </TouchableOpacity>
      </SideMenu>
    );
  }
}