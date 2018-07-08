import { AppRegistry } from 'react-native';
import { StackNavigator, } from 'react-navigation';
import App from './App';
import LoginScreen from './Screens/LoginScreen';
import PinScreen from './Screens/PinScreen';
import OpenAmountScreen from './Screens/OpenAmountScreen';
import CashdropAmmountScreen from './Screens/CashdropAmountScreen';
import categoryScreen from './Screens/CategroyScreen';
import MainScreen from './Screens/MainScreen';
import ReciptScreen from './Screens/ReciptScreen';
import SendReciptScreen from './Screens/SendReciptScreen';

const navigation = StackNavigator({
  
    LoginScreen: { screen: LoginScreen },
    PinScreen: { screen: PinScreen },
    ReciptScreen: { screen: ReciptScreen },
    SendReciptScreen: { screen: SendReciptScreen },
    MainScreen: { screen: MainScreen },
    categoryScreen: { screen: categoryScreen },
    CashdropAmmountScreen: { screen: CashdropAmmountScreen },
    OpenAmountScreen: { screen: OpenAmountScreen },


});


AppRegistry.registerComponent('Pytm', () => navigation);
