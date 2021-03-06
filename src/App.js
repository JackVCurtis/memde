import { useState, useEffect } from 'react';
import useIpfsFactory from './hooks/use-ipfs-factory.js'
import './App.css';

function App() {
  const { ipfs, isIpfsReady, ipfsInitError } = useIpfsFactory({ commands: ['id'] })
  const [messages, setMessages] = useState([])
  const [subscribed, setSubscribed] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const channel = 'a-random-channel-name-1803764rh'
  useEffect(() => {
    if (!ipfs) return

    if (!subscribed) {
      ipfs.pubsub.subscribe(channel, (msg) => {
        console.log('subscription fired')
        const msgText =  new TextDecoder().decode(msg.data)
        if (messages.length >= 20) {
          setMessages(messages.slice(1).concat([msgText]))
        } else {
          setMessages(messages.concat([msgText]))
        }
      }).then(() => {
        setSubscribed(true)
      })
    }


    return () => ipfs.pubsub.unsubscribe(channel, () => {})
  }, [ipfs, messages, setMessages, subscribed, setSubscribed])

  const sendMessage = async (e) => {
    e.preventDefault()
    await ipfs.pubsub.publish(channel, new TextEncoder().encode(newMessage))
  }

  if (ipfsInitError) {
    return <h1>Failed to start IPFS</h1>
  }

  return (
    <div>
      {
        isIpfsReady && subscribed && <form onSubmit={sendMessage}>
        <input type='text' onChange={(e) => setNewMessage(e.target.value)} value={newMessage}></input>
        <button type='submit'>Send</button>
      </form>
      }
      {
        messages.map((text, i) => {
          return <p key={`message-${i}`}>{text}</p>
        })
      }
    </div>
  );
}
export default App;
