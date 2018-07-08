import { StyleSheet } from 'react-native';

var Style = StyleSheet.create({
    rootContainer: {
        flex: 1,
      
        backgroundColor:'#fff'
    },

    displayContainer: {
        flex: 2,
        backgroundColor: '#fff',
        justifyContent: 'center'
    },

    displayText: {
        color: '#000',
        fontSize: 38,
        fontWeight: 'bold',
        textAlign: 'right',
        padding: 20,
        textAlign:'center'
    },

    inputContainer: {
        flex: 8,
        backgroundColor: '#fff'
    },

    inputButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: '#434343'
    },

    inputButtonHighlighted: {
        backgroundColor: '#fff'
    },

    inputButtonText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000'
    },

    inputRow: {
        flex: 1,
        flexDirection: 'row'
    },
    textcenter: {

        marginTop:40,
        fontSize: 18,
      
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',color:'#000'
       
    },

});

export default Style;