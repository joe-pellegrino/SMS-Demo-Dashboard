import React, {useContext, useEffect, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Button,
  Modal,
  Pressable,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {ScrollView} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import AppContext from '../components/AppContext';

const StudentConversationList = props => {
  const [conversations, setConversations] = useState([]);
  const [text, setText] = useState('');
  const [currentUser, setCurrentUser] = useState();
  const context = useContext(AppContext);

  const navigation = useNavigation();

  useEffect(() => {
    setCurrentUser(auth().currentUser);
    if (currentUser) {
      getConversations();
    } else {
      console.log('There is no current user');
      return;
    }
  }, [currentUser]);

  function getConversations() {
    if (currentUser) {
      const conversationsCollection = firestore()
        .collection('workspace')
        .doc('e8wpuNXXSGGDfpKIJusW')
        .collection('conversations')
        .where('student', '==', currentUser.uid)
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

  function goToConversation(conversationID) {
    context.setConversation(conversationID);
    navigation.navigate('Messages');
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
        <Text style={styles.itemText}>{item.data.teacher_name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{flex: 1}}>
      {/* <Text>{currentUser && currentUser.uid}</Text> */}
      {/* <Text>UID {JSON.stringify(context)}</Text> */}

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
  button: {
    position: 'absolute',
    right: 0,
    alignItems: 'center',
    bborderColor: 'black',
    borderStyle: 'solid',
    borderWidth: 1,
    margin: 5,
    borderRadius: 5,
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

export default StudentConversationList;
