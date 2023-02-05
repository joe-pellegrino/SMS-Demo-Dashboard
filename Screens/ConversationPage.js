import React, {useEffect, useState, useContext} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Button,
  TouchableWithoutFeedback,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {ScrollView} from 'react-native-gesture-handler';
import auth from '@react-native-firebase/auth';
import AppContext from '../components/AppContext';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faSadTear,
  faSmile,
  faFrown,
  faFaceLaugh,
} from '@fortawesome/free-solid-svg-icons';
import functions from '@react-native-firebase/functions';

const ConversationPage = () => {
  const [messages, setMessages] = useState([]);
  const [userInfo, setUserInfo] = useState();
  const [text, setText] = useState('');
  const context = useContext(AppContext);
  const [animation, setAnimation] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fromName, setFromName] = useState('');
  const [toName, setToName] = useState('');

  // useEffect(() => {
  //   if (user) {
  //     const userProfile = firestore()
  //       .collection('users')
  //       .doc(auth().currentUser.uid)
  //       .get()
  //       .then(documentSnapshot => {
  //         console.log('User exists: ', documentSnapshot.exists);

  //         if (documentSnapshot.exists) {
  //           console.log('User data: ', documentSnapshot.data().role);
  //           setRole(documentSnapshot.data().role);
  //         }
  //       });
  //   }
  // }, []);

  useEffect(() => {
    setTimeout(() => {
      setAnimation(true);
    }, 1000);
  }, []);

  // Set the from and to
  useEffect(() => {
    if (context != '') {
      var role = context.role;
      console.log('context: ' + JSON.stringify(context));

      firestore()
        .collection('workspace')
        .doc('e8wpuNXXSGGDfpKIJusW')
        .collection('conversations')
        .doc(context.conversation)
        .get()
        .then(documentSnapshot => {
          if (documentSnapshot.exists) {
            console.log(
              'Found conversation ' + JSON.stringify(documentSnapshot.data()),
            );

            if (role == 'Student') {
              console.log('Role is student');

              setFrom(documentSnapshot.data().student);
              setTo(documentSnapshot.data().teacher);
              setFromName(documentSnapshot.data().student_name);
              setToName(documentSnapshot.data().teacher_name);

              console.log('From: ' + documentSnapshot.data().student);
              console.log('To: ' + documentSnapshot.data().teacher);
            } else {
              console.log('Role is teacher');
              setTo(documentSnapshot.data().student);
              setFrom(documentSnapshot.data().teacher);
              setToName(documentSnapshot.data().student_name);
              setFromName(documentSnapshot.data().teacher_name);

              console.log('From: ' + documentSnapshot.data().teacher);
              console.log('To: ' + documentSnapshot.data().student);
            }
          }
        });
    }
  }, []);

  useEffect(() => {
    //var messagesArray = [];
    if (context != '') {
      firestore()
        .collection('workspace')
        .doc('e8wpuNXXSGGDfpKIJusW')
        .collection('conversations')
        .doc(context.conversation)
        .collection('messages')
        .orderBy('dt_sent', 'asc')
        //.get()
        .onSnapshot(querySnapshot => {
          var messagesArray = [];
          if (querySnapshot) {
            querySnapshot.forEach(documentSnapshot => {
              //console.log(documentSnapshot.data());
              messagesArray.push(documentSnapshot.data());
            });

            setMessages([]);
            setMessages(messagesArray);
          }
          // console.log('Messages count: ' + messagesArray.length);
        });
    } else {
      console.log('context is null');
    }
  }, []);

  function sendMessage() {
    firestore()
      .collection('workspace')
      .doc('e8wpuNXXSGGDfpKIJusW')
      .collection('conversations')
      .doc(context.conversation)
      .collection('messages')
      .add({
        text: text,
        dt_sent: Date.now().toString(),
        from: from,
        to: to,
      })
      .then(() => {
        console.log('Message sent added!');

        fetch(
          'https://us-central1-shclone-1b236.cloudfunctions.net/trigger-notifications?to=' +
            to +
            '&from=' +
            fromName +
            '&text=' +
            text,
          {
            method: 'GET',
          },
        );

        //setLoading(false);

        // functions()
        //   .httpsCallable('trigger-notifications')({
        //     to: to,
        //     from: from,
        //     text: text,
        //   })
        //   .then(response => {
        //     console.log(response);
        //     setLoading(false);
        //   });

        setText('');
      });
  }

  function sendSpecialMessage(specialIcon, color) {
    firestore()
      .collection('workspace')
      .doc('e8wpuNXXSGGDfpKIJusW')
      .collection('conversations')
      .doc(context.conversation)
      .collection('messages')
      .add({
        special: true,
        special_icon: specialIcon,
        special_icon_color: color,
        dt_sent: Date.now().toString(),
        from: from,
        to: to,
      })
      .then(() => {
        console.log('Emotional Message sent added!');

        fetch(
          'https://us-central1-shclone-1b236.cloudfunctions.net/trigger-notifications?to=' +
            to +
            '&from=' +
            fromName +
            '&text=' +
            text,
          {
            method: 'GET',
          },
        );
      });
  }

  return (
    <View style={{flex: 1}}>
      {/* <KeyboardAwareScrollView contentContainerStyle={{flex: 1}}> */}
      {/* <ScrollView
          ref={ref => {
            this.scrollView = ref;
          }}
          onContentSizeChange={() =>
            this.scrollView.scrollToEnd({animated: true})
          }
          > */}
      {/* <Text>{context.conversation}</Text> */}
      <FlatList
        ref={ref => {
          this.scrollView = ref;
        }}
        onContentSizeChange={() =>
          this.scrollView.scrollToEnd({animated: animation})
        }
        maxToRenderPerBatch={999999}
        style={{backgroundColor: '#eeeeee', flex: 1, marginBottom: 5}}
        data={messages}
        renderItem={({item, index}) => {
          var fai;

          if (item.special) {
            if (item.special_icon == 'faSmile') {
              fai = faSmile;
            }

            if (item.special_icon == 'faFaceLaugh') {
              fai = faFaceLaugh;
            }

            if (item.special_icon == 'faFrown') {
              fai = faFrown;
            }

            if (item.special_icon == 'faSadTear') {
              fai = faSadTear;
            }
          }

          if (item.from == context.user.uid) {
            return item.special_icon ? (
              <View
                style={{
                  backgroundColor: 'white',
                  padding: 10,
                  marginLeft: '45%',
                  borderRadius: 5,
                  marginTop: 5,
                  marginRight: '5%',
                  maxWidth: '50%',
                  alignSelf: 'flex-end',
                  borderRadius: 20,
                }}
                key={index}>
                <Text style={{fontSize: 16, color: '#fff'}} key={index}>
                  {' '}
                  <FontAwesomeIcon
                    size={50}
                    icon={fai}
                    style={styles.specialIcons}
                    color={item.special_icon_color}
                  />
                </Text>

                <View style={styles.rightArrowSpecial}></View>
                <View style={styles.rightArrowOverlapSpecial}></View>
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: '#0078fe',
                  padding: 10,
                  marginLeft: '45%',
                  borderRadius: 5,
                  marginTop: 5,
                  marginRight: '5%',
                  maxWidth: '50%',
                  alignSelf: 'flex-end',
                  borderRadius: 20,
                }}
                key={index}>
                <Text style={{fontSize: 16, color: '#fff'}} key={index}>
                  {item.text}
                </Text>

                <View style={styles.rightArrow}></View>
                <View style={styles.rightArrowOverlap}></View>
              </View>
            );
          } else {
            return item.special_icon ? (
              <View
                style={{
                  backgroundColor: 'white',
                  padding: 10,
                  borderRadius: 5,
                  marginTop: 5,
                  marginLeft: '5%',
                  maxWidth: '50%',
                  alignSelf: 'flex-start',
                  borderRadius: 20,
                }}
                key={index}>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#000',
                    justifyContent: 'center',
                  }}
                  key={index}>
                  {' '}
                  <FontAwesomeIcon
                    size={50}
                    icon={fai}
                    style={styles.specialIcons}
                    color={item.special_icon_color}
                  />
                </Text>
                <View style={styles.leftArrowSpecial}></View>
                <View style={styles.leftArrowOverlapSpecial}></View>
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: '#dedede',
                  padding: 10,
                  borderRadius: 5,
                  marginTop: 5,
                  marginLeft: '5%',
                  maxWidth: '50%',
                  alignSelf: 'flex-start',
                  borderRadius: 20,
                }}
                key={index}>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#000',
                    justifyContent: 'center',
                  }}
                  key={index}>
                  {' '}
                  {item.text}
                </Text>
                <View style={styles.leftArrow}></View>
                <View style={styles.leftArrowOverlap}></View>
              </View>
            );
          }
        }}
      />
      {/* </ScrollView> */}
      {/* </KeyboardAwareScrollView> */}
      <View style={styles.specialButtonsContainer}>
        <TouchableWithoutFeedback
          onPress={() => sendSpecialMessage('faFaceLaugh', 'gold')}>
          <View style={styles.specialButton}>
            <FontAwesomeIcon
              size={50}
              icon={faFaceLaugh}
              style={styles.specialIcons}
              color="gold"
            />
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPress={() => sendSpecialMessage('faSmile', 'orange')}>
          <View style={styles.specialButton}>
            <FontAwesomeIcon
              size={50}
              icon={faSmile}
              style={styles.specialIcons}
              color="orange"></FontAwesomeIcon>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPress={() => sendSpecialMessage('faFrown', 'lightcoral')}>
          <View style={styles.specialButton}>
            <FontAwesomeIcon
              size={50}
              icon={faFrown}
              style={styles.specialIcons}
              color="lightcoral"
            />
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPress={() => sendSpecialMessage('faSadTear', 'firebrick')}>
          <View style={styles.specialButton}>
            <FontAwesomeIcon
              size={50}
              icon={faSadTear}
              style={styles.specialIcons}
              color="firebrick"
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
      <View
        style={{
          borderColor: '#bbbfbb',
          borderStyle: 'solid',
          borderWidth: 1,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <TextInput
          style={{margin: 5, height: 25, width: '85%'}}
          onChangeText={text => setText(text)}
          value={text}
        />
        <TouchableOpacity style={styles.button} onPress={sendMessage}>
          <Text style={{margin: 5}}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  specialIcons: {
    //fontSize: 50,
  },
  specialButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  specialButton: {
    flex: 1,
    alignItems: 'center',
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

  rightArrowSpecial: {
    position: 'absolute',
    backgroundColor: '#FFF',
    //backgroundColor:"red",
    width: 20,
    height: 25,
    bottom: 0,
    borderBottomLeftRadius: 25,
    right: -10,
  },

  rightArrowOverlapSpecial: {
    position: 'absolute',
    backgroundColor: '#eeeeee',
    //backgroundColor:"green",
    width: 20,
    height: 35,
    bottom: -6,
    borderBottomLeftRadius: 18,
    right: -20,
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

  leftArrowSpecial: {
    position: 'absolute',
    backgroundColor: '#FFF',
    //backgroundColor:"red",
    width: 20,
    height: 25,
    bottom: 0,
    borderBottomRightRadius: 25,
    left: -10,
  },

  leftArrowOverlapSpecial: {
    position: 'absolute',
    backgroundColor: '#eeeeee',
    //backgroundColor:"green",
    width: 20,
    height: 35,
    bottom: -6,
    borderBottomRightRadius: 18,
    left: -20,
  },
});

export default ConversationPage;
