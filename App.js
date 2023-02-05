import React, {useContext} from 'react';
import {Text, View, Button} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ConversationPage from './Screens/ConversationPage';
import TeacherConversationList from './Screens/TeacherConversationsList';
import StudentConversationList from './Screens/StudentConversationsList';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import AuthScreen from './Screens/AuthScreen';
import {useSafeAreaFrame} from 'react-native-safe-area-context';
import {useState, useEffect} from 'react';
import Dashboard from './Screens/Dashboard';
import firestore from '@react-native-firebase/firestore';
import AppContext from './components/AppContext';
import messaging from '@react-native-firebase/messaging';

const TeacherConversationStack = createNativeStackNavigator();
const StudentConversationStack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState();
  const [role, setRole] = useState('');
  const [conversation, setConversation] = useState();
  const [name, setName] = useState();
  const context = useContext(AppContext);

  if (global.__fbBatchedBridge) {
    const origMessageQueue = global.__fbBatchedBridge;
    const modules = origMessageQueue._remoteModuleTable;
    const methods = origMessageQueue._remoteMethodTable;
    global.findModuleByModuleAndMethodIds = (moduleId, methodId) => {
      console.log(
        `The problematic line code is in: ${modules[moduleId]}.${methods[moduleId][methodId]}`,
      );
    };
  }
  //global.findModuleByModuleAndMethodIds(54, 8);
  //global.findModuleByModuleAndMethodIds(24, 1);

  function TeacherConversationStackScreen() {
    return (
      <TeacherConversationStack.Navigator>
        <TeacherConversationStack.Screen
          name="Conversations"
          component={TeacherConversationListScreen}
        />
        <TeacherConversationStack.Screen
          name="Messages"
          component={ConversationScreen}
        />
      </TeacherConversationStack.Navigator>
    );
  }

  function StudentConversationStackScreen() {
    return (
      <StudentConversationStack.Navigator>
        <StudentConversationStack.Screen
          name="Conversations"
          component={StudentConversationListScreen}
        />
        <StudentConversationStack.Screen
          name="Messages"
          component={ConversationScreen}
        />
      </StudentConversationStack.Navigator>
    );
  }

  function DashboardScreen() {
    return <Dashboard />;
  }

  function ConversationScreen() {
    return <ConversationPage />;
  }

  function TeacherConversationListScreen() {
    return <TeacherConversationList />;
  }

  function StudentConversationListScreen() {
    return <StudentConversationList />;
  }

  async function saveTokenToDatabase(token) {
    // Assume user is already signed in
    const userId = auth().currentUser.uid;

    // Add the token to the users datastore
    await firestore()
      .collection('users')
      .doc(userId)
      .update({
        tokens: firestore.FieldValue.arrayUnion(token),
      });
  }

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    //if (initializing) setInitializing(false);
  }

  useEffect(() => {
    requestUserPermission();
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  useEffect(() => {
    if (user) {
      const userProfile = firestore()
        .collection('users')
        .doc(auth().currentUser.uid)
        .get()
        .then(documentSnapshot => {
          console.log('User exists: ', documentSnapshot.exists);

          if (documentSnapshot.exists) {
            console.log('User data: ', documentSnapshot.data());
            setRole(documentSnapshot.data().role);

            var name = documentSnapshot.data().name;
            console.log('Now writing ' + name + ' to the context');
            //context.name = name;
            setName(name);
          }
        });

      messaging()
        .getToken()
        .then(token => {
          return saveTokenToDatabase(token);
        });

      return messaging().onTokenRefresh(token => {
        saveTokenToDatabase(token);
      });
    }
  }, [user]);

  if (!user) {
    return <AuthScreen />;
  } else {
    if (role == 'Teacher') {
      return (
        <AppContext.Provider
          value={{
            user,
            setUser,
            role,
            setRole,
            conversation,
            setConversation,
            name,
            setName,
          }}>
          <NavigationContainer>
            <Tab.Navigator>
              <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                  headerRight: () => (
                    <Button
                      onPress={() => alert('This is a button!')}
                      title="Info"
                      color="#fff"
                    />
                  ),
                }}
              />
              <Tab.Screen
                name="Teacher"
                options={{headerShown: false}}
                component={TeacherConversationStackScreen}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </AppContext.Provider>
      );
    } else if (role == 'Student') {
      return (
        <AppContext.Provider
          value={{
            user,
            setUser,
            role,
            setRole,
            conversation,
            setConversation,
            name,
            setName,
          }}>
          <NavigationContainer>
            <Tab.Navigator>
              <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                  headerRight: () => (
                    <Button
                      onPress={() => alert('This is a button!')}
                      title="Info"
                      color="#000"
                    />
                  ),
                }}
              />
              <Tab.Screen
                name="Student"
                options={{headerShown: false}}
                component={StudentConversationStackScreen}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </AppContext.Provider>
      );
    }
  }
}
