import { createStore } from 'redux';


function counter(state, action) {

  if (typeof state === 'undefined') {
    return 0
  }
  switch (action.type) {
    case 'ACTION_LISTEN_START':
      return "ACTION_LISTEN_START"
    case 'ACTION_LISTEN_STOP':
      return "ACTION_LISTEN_STOP"
    default:
      return state
  }

}


let store = createStore(counter);
export default store;