import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Button,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import auth from '@react-native-firebase/auth';
import {SafeAreaView} from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import AppContext from '../components/AppContext';

const Dashboard = () => {
  const [role, setRole] = useState('');

  const context = useContext(AppContext);

  //Get User Info
  useEffect(() => {
    //var messagesArray = [];
    console.log(JSON.stringify(context));
    // const userProfile = firestore()
    //   .collection('users')
    //   .doc(auth().currentUser.uid)
    //   .get()
    //   .then(documentSnapshot => {
    //     console.log('User exists: ', documentSnapshot.exists);

    //     if (documentSnapshot.exists) {
    //       console.log('User data: ', documentSnapshot.data().role);
    //       setRole(documentSnapshot.data().role);
    //     }
    //   });

    // console.log(userProfile);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.welcome}>
        <Text style={styles.header}>Hello, {context.name}</Text>
      </View>
      <Button title="Logout" onPress={() => auth().signOut()}>
        {' '}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    //alignItems: 'center',
    //justifyContent: 'center',
  },
  header: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  welcome: {
    margin: 25,
    alignContent: 'flex-start',
  },
});

export default Dashboard;
