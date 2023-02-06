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
        {context.role == 'student' ? (
          <View style={styles.welcomeCard}>
            <Text>Need to talk to someone?</Text>
            <TouchableOpacity style={styles.button}>
              <Text>Message my teacher</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // <View className="flex-1 items-center justify-center bg-black">
          //   <Text>Open up App.js to start working on your app!</Text>
          // </View>
          <>
            <View className="block pt-6 rounded-lg shadow-lg bg-white max-w-sm">
              <View className="px-6 py-4">
                <Text className="font-bold text-xl mb-2">
                  Have you checked-in on your students today?
                </Text>
                <Text className="text-gray-700 text-base">
                  Send out a broadcast and see how they are doing.
                </Text>
                <TouchableOpacity className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out">
                  <Text style={{textAlign: 'center'}}>Send a broadcast</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
      <Button title="Logout " onPress={() => auth().signOut()}>
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
    fontFamily: 'LexendDeca-Medium',
  },
  welcome: {
    margin: 25,
    alignContent: 'flex-start',
  },
  welcomeCard: {
    marginTop: 25,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    //borderColor: rgba(255, 0, 0, 0.5),
  },
  button: {
    marginTop: 15,
    alignSelf: 'center',
    backgroundColor: 'lightblue',
    borderRadius: 5,
    padding: 5,
    width: 150,
    textAlign: 'center',
  },
});

export default Dashboard;
