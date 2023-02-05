import React, {useEffect, useState, useContext} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Button,
  Pressable,
  TouchableWithoutFeedback,
  Modal,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {ScrollView} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';
import auth from '@react-native-firebase/auth';
import AppContext from '../components/AppContext';
import {panGestureHandlerCustomNativeProps} from 'react-native-gesture-handler/lib/typescript/handlers/PanGestureHandler';

const {Value, onChange, call, cond, eq, abs, sub, min} = Animated;

const TeacherConversationList = () => {
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [text, setText] = useState('');
  const [currentUser, setCurrentUser] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const context = useContext(AppContext);
  const [sending, setSending] = useState(false);

  // const zeroIndex = snapPoints.length - 1;
  // const height = snapPoints[0];

  const navigation = useNavigation();

  const renderContent = () => (
    <View
      style={{
        backgroundColor: 'white',
        padding: 16,
        height: 450,
      }}>
      <Button title="Send" onPress={() => sendBroadcast()}></Button>
    </View>
  );

  const sheetRef = React.useRef(null);

  useEffect(() => {
    if (context.user.uid) {
      console.log('Context is ' + JSON.stringify(context));
      console.log('NAME: ' + context.name);
      getUsers();
      getConversations();
    } else {
      console.log('There is no current user');
      console.log(context);
      return;
    }
  }, [context]);

  function getConversations() {
    if (context.user.uid) {
      const conversationsCollection = firestore()
        .collection('workspace')
        .doc('e8wpuNXXSGGDfpKIJusW')
        .collection('conversations')
        .where('teacher', '==', context.user.uid)
        //.orderBy('name', 'asc')
        //.get()
        .onSnapshot(querySnapshot => {
          //console.log('Total documents: ', querySnapshot.size);
          var conversationsArray = [];
          querySnapshot.forEach(documentSnapshot => {
            console.log('Found ' + JSON.stringify(documentSnapshot.data()));
            conversationsArray.push({
              id: documentSnapshot.id,
              data: documentSnapshot.data(),
            });
          });

          setConversations([]);
          setConversations(conversationsArray);

          console.log('Conversationss count: ' + conversationsArray.length);
        });
      return () => conversationsCollection();
    } else {
      console.log('There is no current user');
    }
  }

  function getUsers() {
    firestore()
      .collection('workspace')
      .doc('e8wpuNXXSGGDfpKIJusW')
      .collection('moderators')
      .doc(context.user.uid)
      .collection('users')
      .orderBy('name', 'asc')
      .get()
      .then(querySnapshot => {
        if (querySnapshot) {
          var usersArray = [];
          querySnapshot.forEach(documentSnapshot => {
            console.log(
              'USERS LIST ' + JSON.stringify(documentSnapshot.data()),
            );
            usersArray.push({
              id: documentSnapshot.id,
              data: documentSnapshot.data(),
            });
          });

          setUsers([]);
          setUsers(usersArray);
        }

        // console.log('Messages count: ' + messagesArray.length);
      });
  }

  function sendMessage() {
    firestore()
      .collection('workspace')
      .doc('e8wpuNXXSGGDfpKIJusW')
      .collection('conversations')
      .doc('jAb2tbbXf5bINt8lLwYkBLdAGdL2')
      .collection('messages')
      .add({
        text: text,
        dt_sent: Date.now().toString(),
        from: 'jAb2tbbXf5bINt8lLwYkBLdAGdL2',
        to: 'i09Z1NGj3SO41oXe8sFiW4q1irs2',
        //age: 30,
      })
      .then(() => {
        console.log('Message sent added!');
      });
  }
  async function sendBroadcast() {
    setSending(true);

    var text;

    var context2 = context;

    console.log('NEW CONTEXT:  ' + JSON.stringify(context2));

    if (broadcastMessage == '') {
      text = 'How are you feeling today?';
    } else {
      text = broadcastMessage;
    }

    for (var i = 0; i < users.length; i++) {
      console.log(
        'Now sending a checkup message to ' + JSON.stringify(users[i]),
      );

      // Check for an existing conversation
      const conversation = await firestore()
        .collection('workspace')
        .doc('e8wpuNXXSGGDfpKIJusW')
        .collection('conversations')
        .where('teacher', '==', context.user.uid)
        .where('student', '==', users[i].id)
        .get();

      if (conversation.empty) {
        console.log('There is no conversation with ' + users[i].id);
        console.log(context2.name);
        console.log(users[i].data.name);

        var user2 = users[i];

        const docID = await firestore()
          .collection('workspace')
          .doc('e8wpuNXXSGGDfpKIJusW')
          .collection('conversations')
          .add({
            student: users[i].id,
            student_name: users[i].data.name,
            teacher: context2.user.uid,
            teacher_name: context2.name,
          })
          .then(document => {
            console.log(
              'New conversation has been created with the conversation ID of ' +
                document.id,
            );

            console.log('text: ' + text);
            console.log('to: ' + user2.id);
            console.log('from: ' + context2.user.uid);

            var documentID = document.id;

            console.log('Ok, lets write to that document now... ' + documentID);

            firestore()
              .collection('workspace')
              .doc('e8wpuNXXSGGDfpKIJusW')
              .collection('conversations')
              .doc(documentID)
              .collection('messages')
              .add({
                text: text,
                dt_sent: Date.now().toString(),
                from: context2.user.uid,
                to: user2.id,
                special: true,
              })
              .catch(error => {
                console.log('There was an error: ' + error);
              });

            return documentID;
          });

        console.log('DOC ID: ' + docID);
      } else {
        console.log('Found the conversation with ' + users[i].id);
        console.log('The conversation ID is ' + conversation.docs[0].id);
        firestore()
          .collection('workspace')
          .doc('e8wpuNXXSGGDfpKIJusW')
          .collection('conversations')
          .doc(conversation.docs[0].id)
          .collection('messages')
          .add({
            text: text,
            dt_sent: Date.now().toString(),
            from: context.user.uid,
            to: users[i].id,
          })
          .then(() => {
            console.log('Message sent added!');
          });
      }
    }

    setSending(false);
    setModalVisible(false);
  }

  function goToConversation(conversationID) {
    context.setConversation(conversationID);
    navigation.navigate('Messages');
  }

  function sendBroadcastMessage() {
    sendBroadcast();
    //setModalVisible(!modalVisible);
  }

  const ItemDivider = () => {
    return (
      <View
        style={{
          height: 1,
          width: '100%',
          backgroundColor: '#e6d4d3',
        }}
      />
    );
  };

  const ItemRender = ({item}) => (
    <TouchableOpacity onPress={() => goToConversation(item.id)}>
      <View style={styles.item}>
        <Text style={styles.itemText}>{item.data.student_name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{flex: 1}}>
      <Text>{context.uid}</Text>
      {/* <Button
        title="New Broadcast"
        onPress={() => sheetRef.current.snapTo(0)}></Button> */}
      {/* <Button title="Send" onPress={() => sendBroadcast()}></Button> */}

      <Pressable
        style={[
          styles.button,
          styles.buttonClose,
          {width: 200, alignSelf: 'center'},
        ]}
        onPress={() => setModalVisible(true)}>
        <Text style={[styles.buttonText, {textAlign: 'center'}]}>
          Create New Broadcast
        </Text>
      </Pressable>
      <FlatList
        // ref={ref => {
        //   this.scrollView = ref;
        // }}
        // onContentSizeChange={() =>
        //   this.scrollView.scrollToEnd({animated: true})
        // }
        maxToRenderPerBatch={999999}
        // style={{backgroundColor: '#eeeeee', flex: 1}}
        data={conversations}
        renderItem={({item}) => <ItemRender item={item} />}
        ItemSeparatorComponent={ItemDivider}
      />
      {/* <TouchableWithoutFeedback
        onPress={() => {
          console.log('pressed');
          sheetRef.current.snapTo(2);
        }}>
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            flex: 1,
            opacity,
          }}
        />
      </TouchableWithoutFeedback> */}
      {/* <BottomSheet
        ref={sheetRef}
        snapPoints={[450, 300, 0]}
        borderRadius={10}
        renderContent={renderContent}
      /> */}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalHeader}>New Broadcast</Text>
            <TextInput
              multiline
              placeholder="How are you feeling today?"
              onChangeText={setBroadcastMessage}
              style={{
                fontSize: 17,
                paddingBottom: 15,
                flexWrap: 'wrap',
              }}></TextInput>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => sendBroadcastMessage()}>
              <Text style={styles.buttonText}>Send Broadcast</Text>
            </Pressable>
            {sending ? (
              <View style={{marginTop: 25}}>
                <ActivityIndicator size="large" />
                <Text style={{textAlign: 'center'}}>
                  Sending messages. Do not close this window.
                </Text>
              </View>
            ) : (
              <></>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    margin: 25,
  },
  item: {
    paddingLeft: 45,
    paddingTop: 15,
    paddingBottom: 15,
  },

  itemText: {
    fontSize: 18,
    color: 'black',
  },
  modalHeader: {
    marginBottom: 15,
    fontWeight: 'bold',
    fontSize: 25,
    textAlign: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
    color: 'white',
  },

  rightArrow: {
    position: 'absolute',
    backgroundColor: '#0078fe',
    //backgroundColor:"red",
    width: 20,
    height: 25,
    bottom: 0,
    borderBottomLeftRadius: 25,
    right: -10,
  },

  rightArrowOverlap: {
    position: 'absolute',
    backgroundColor: '#eeeeee',
    //backgroundColor:"green",
    width: 20,
    height: 35,
    bottom: -6,
    borderBottomLeftRadius: 18,
    right: -20,
  },

  /*Arrow head for recevied messages*/
  leftArrow: {
    position: 'absolute',
    backgroundColor: '#dedede',
    //backgroundColor:"red",
    width: 20,
    height: 25,
    bottom: 0,
    borderBottomRightRadius: 25,
    left: -10,
  },

  leftArrowOverlap: {
    position: 'absolute',
    backgroundColor: '#eeeeee',
    //backgroundColor:"green",
    width: 20,
    height: 35,
    bottom: -6,
    borderBottomRightRadius: 18,
    left: -20,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
});

export default TeacherConversationList;
