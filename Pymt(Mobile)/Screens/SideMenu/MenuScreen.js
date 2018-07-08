import React from 'react';
import PropTypes from 'prop-types';
import {
    Dimensions,
    StyleSheet,
    ScrollView,
    View,
    Image,
    Text,
} from 'react-native';
import { Button, Left, Icon } from 'native-base';

const window = Dimensions.get('window');

const uri = 'https://pickaface.net/gallery/avatar/Opi51c74d0125fd4.png';

const styles = StyleSheet.create({
    menu: {
        flex: 1,
        width: window.width,
        height: window.height,
        backgroundColor: '#78aef9',
        padding: 20,


    },
    avatarContainer: {
        marginBottom: 20,
        marginTop: 20,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        flex: 1,
    },
    name: {
        position: 'absolute',
        left: 70,
        top: 10,
        color: '#fff'
    },
    item: {
        fontSize: 14,
        fontWeight: '300',
        paddingTop: 5,
        marginBottom: 10,
        color: '#fff'
    },
    icons:
        {
            color: '#fff',
            fontWeight: 'bold'
        }
});

export default function Menu({ onItemSelected }) {
    return (
        <ScrollView scrollsToTop={false} style={styles.menu}>
            <View style={styles.avatarContainer}>
                <Image
                    style={styles.avatar}
                    source={{ uri }}
                />
                <Text style={styles.name}>Your name</Text>
                <Text style={{
                    fontSize: 10, position: 'absolute',
                    left: 70,
                    top: 35, color: '#fff'
                }}>Your name</Text>
            </View>
            <Button transparent>
                <Icon name='ios-home-outline' style={styles.icons} />
                <Text
                    onPress={() => onItemSelected('home')}
                    style={styles.item}
                >
                    PAYMENT
      </Text>
            </Button>
            <Button transparent>
                <Icon name='ios-podium-outline' style={styles.icons} />

                <Text
                    onPress={() => onItemSelected('transaction')}
                    style={styles.item}
                >
                    TRANSACTIONS
      </Text>
            </Button>
            <Button transparent>
                <Icon name='logo-usd' style={styles.icons} />
                <Text
                    onPress={() => onItemSelected('cash')}
                    style={styles.item}
                >
                    CASH DROP
      </Text>
            </Button>
            <Button transparent>
                <Icon name='logo-usd' style={styles.icons} />
                <Text
                    onPress={() => onItemSelected('tips')}
                    style={styles.item}
                >
                    TIPS
      </Text>
            </Button>
            <Button transparent>
                <Icon name='ios-print-outline' style={styles.icons} />
                <Text
                    onPress={() => onItemSelected('endofday')}
                    style={styles.item}
                >
                    END OF DAYS
      </Text>
            </Button>
            <Button transparent>
                <Icon name='ios-time-outline' style={styles.icons} />
                <Text
                    onPress={() => onItemSelected('peripherals')}
                    style={styles.item}
                >
                    PERIPHERALS
      </Text>
            </Button>
            <Button transparent>
                <Icon name='ios-settings-outline' style={styles.icons} />
                <Text
                    onPress={() => onItemSelected('account')}
                    style={styles.item}
                >
                    ACCOUNT
      </Text>
            </Button>
            <Button transparent>
                <Icon name='ios-log-out-outline' style={styles.icons} />
                <Text
                    onPress={() => onItemSelected('signout')}
                    style={styles.item}
                >
                    SIGN OUT
      </Text>
            </Button>
        </ScrollView>
    );
}

Menu.propTypes = {
    onItemSelected: PropTypes.func.isRequired,
};