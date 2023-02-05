import React, {useState} from 'react';
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

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function loginWithFirebase() {
    console.log('Now logging in ' + email + ' with password ' + password);

    auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        console.log('User account created & signed in!');
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          console.log('That email address is already in use!');
        }

        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
        }

        console.error(error);
      });
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textfield}
        placeholder="email"
        value={email}
        onChangeText={setEmail}></TextInput>

      <TextInput
        placeholder="password"
        style={styles.textfield}
        value={password}
        onChangeText={setPassword}></TextInput>
      <Button title="Login" onPress={loginWithFirebase}></Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textfield: {
    height: 40,
    borderColor: '#000',
    borderStyle: 'solid',
    borderWidth: 1,
    padding: 5,
    width: '75%',
    borderRadius: 5,
    marginTop: 5,
  },
});

export default AuthScreen;
