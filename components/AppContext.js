import React, {useState} from 'react';

const AppContext = React.createContext({
  user: {},
  name: '',
  currentConversation: '',
});

export default AppContext;
