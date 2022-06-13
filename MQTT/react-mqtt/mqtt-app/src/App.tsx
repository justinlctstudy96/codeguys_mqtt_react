import React, {useEffect, useState, useRef} from 'react';
import logo from './logo.svg';
import './App.css';
import MQTT from 'async-mqtt';
import NFCrecordPanel, {InfcRecord, NFC_UID_COLOR} from './components/NFCrecordPanel';
import ChatRoomPanel, {IMessage, IChatPanelProps} from './components/ChatRoomPanel';

export let mqtt_client: any;
// const MQTT_BROKER_URL = "ws://18.162.55.224:9001"
let connect_options = {
  port: '8083',
  hostname: 'codeguys-mqtt.lol',
  rejectUnauthorized: false,
  username: 'codeguys-justin',
  password: 'codeguys',
  clientId: 'mqttjs_' + Math.random().toString(16).substr(2,8),
  protocol: 'wss',
  protocolId: 'MQTT',
  clean: false,
  // keepalive:3
  connectTimeout:2*1000
}
export const MQTT_TOPIC_NFC = "nfc/#"
export const MQTT_TOPIC_CHAT = "chat"



function App() {
  // const [ip, setIP] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [user, setUser] = useState<string>("");
  const [connect, setConnect] = useState<boolean>(false);
  const [nfcRecord1, setNfcRecord1] = useState<InfcRecord>({nfc_no: 1, color: 3, record: ""})
  const [nfcRecord2, setNfcRecord2] = useState<InfcRecord>({nfc_no: 2, color: 3, record: ""})
  const [nfcRecord3, setNfcRecord3] = useState<InfcRecord>({nfc_no: 3, color: 3, record: ""})
  const [messages, setMessages] = useState<IMessage[]>([]);

  const userRef:any = useRef(null);
  userRef.current = user;

  // const getIP = async () => {
  //   const res = await axios.get('https://geolocation-db.com/json/')
  //   console.log(res.data)
  //   setIP(res.data.IPv4)
  // }

  let setNfcRecord:any = {
    1: setNfcRecord1,
    2: setNfcRecord2,
    3: setNfcRecord3
  }

  const localStorageLoadMsg = () => {
    let msg_json_string = localStorage.getItem("messages");
    if(msg_json_string!=null) {
        setMessages(JSON.parse(msg_json_string))
    }
  }

  const isJsonString = (str:string) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  const jsonMsgTypeCheck = (msg:any) => {
    return msg["user"] && msg["message"] && msg["timestamp"]
  }

  const appendNewMsg = (msg:IMessage) => {
    setMessages(messages => [...messages, msg]);
  }

  const connectMQTT = async () => {
    // const res = await axios.get('https://geolocation-db.com/json/')
    connect_options["clientId"] = user
    mqtt_client = await MQTT.connectAsync(connect_options);
    setConnect(true);
    console.log(`connected as ${connect_options["clientId"]}`)
    mqtt_client.subscribe({[MQTT_TOPIC_NFC]:{qos:0},[MQTT_TOPIC_CHAT]:{qos:1}})
    console.log(`subscribed to ${MQTT_TOPIC_NFC} and ${MQTT_TOPIC_CHAT}`)
    onMessageMQTT();
  }
  
  const onMessageMQTT = () => {
    try {
      mqtt_client.on("message", (topic:any, payload:any) => {
        let topic_array = topic.split("/");
        let mqtt_msg:any;
        let mqtt_json: any;
        switch(topic_array[0]) {
          case "nfc":
            switch(topic_array[2]) {
              case "record":
                mqtt_msg = new TextDecoder().decode(payload);
                if (isJsonString(mqtt_msg)) {
                  mqtt_json = JSON.parse(mqtt_msg);
                  let color_id = mqtt_json["uid"] in NFC_UID_COLOR ? NFC_UID_COLOR[mqtt_json["uid"]] : 3;
                  setNfcRecord[topic_array[1]]({nfc_no: topic_array[1], color: color_id, record: mqtt_json["record"]});
                } else {
                  console.log("non json format string at " + topic);
                }
                break;
              case "error":
                mqtt_msg = new TextDecoder().decode(payload);
                if (isJsonString(mqtt_msg)) {
                  mqtt_json = JSON.parse(mqtt_msg);
                  let error_msg = "- " + mqtt_json["error"] + " -";
                  setNfcRecord[topic_array[1]]({nfc_no: topic_array[1], color: 3, record: error_msg});
                } else {
                  console.log("non json format string at " + topic);
                }
                break;
              default:
                console.log("unknown \"nfc\" subtopic " + topic + ": " + mqtt_msg);
            }
            break;
          case "chat":
            mqtt_msg = new TextDecoder().decode(payload);
            if (isJsonString(mqtt_msg)) {
              mqtt_json = JSON.parse(mqtt_msg);
              if (jsonMsgTypeCheck(mqtt_json)) {
                appendNewMsg(mqtt_json);
              }
            } else {
              console.log("non json format string at " + topic);
            }
            break;
          default:
            console.log("unknown topic " + topic + ": " + mqtt_msg);
        }

      })
    } catch(e) {
      console.log(e);
    }
  }

  useEffect(() => {
    const handleTabClose = (event:any) => {
      event.preventDefault();
      console.log("closing....")
      mqtt_client.end();
      localStorage.setItem("messages", JSON.stringify(messages));
    }
    window.addEventListener('beforeunload', handleTabClose);
    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
    }
  },[messages])

  // useEffect(()=>{
  //   if (connect){
  //     if (user!=""){
  //       localStorageLoadMsg();
  //       connectMQTT();
  //     } else {
  //       console.log("unknown user")
  //     }
  //   } else {
  //     mqtt_client.end();
  //     console.log("disconnected")
  //   }
  // }, [user, connect])
  useEffect(() => {
    if (user!="") {
      localStorageLoadMsg();
      connectMQTT();
    }
  }, [user])

  useEffect(() => {
    if (!connect && user!="") {
      mqtt_client.end();
      console.log("disconnected")
    }
  }, [connect])

  return (
    <div className="App">
      <header className="App-header">
        {
          user == "" ?
          <div className="logon-container">
            CodeGuys MQTT
            <div>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
              <button onClick={()=>{setUser(input);}}>Logon</button>
            </div>
          </div> 
          :
          <>
            <div className="navbar">
              <div className="navbar-title">
                CodeGuys MQTT
              </div>
              <div className="navbar-connection">
                <div className="navbar-connected">
                  {connect?`connected as ${user}`:"disconnected"}
                </div>
                <div className="navbar-buttons">
                  <button onClick={() => {
                      if(connect) {
                        setConnect(false);
                      } else {
                        connectMQTT();
                      }
                    }}>
                    {connect ? "disconnect" : `reconnect as ${user}`}
                  </button>
                  <button onClick={() => {window.location.reload()}}>
                    switch user
                  </button>
                </div>
              </div>
            </div>
            <div className="panel-container">
              <div>
                <NFCrecordPanel connect={connect} nfc_no={nfcRecord1.nfc_no} color={nfcRecord1.color} record={nfcRecord1.record} />
                <NFCrecordPanel connect={connect} nfc_no={nfcRecord2.nfc_no} color={nfcRecord2.color} record={nfcRecord2.record} />
                <NFCrecordPanel connect={connect} nfc_no={nfcRecord3.nfc_no} color={nfcRecord3.color} record={nfcRecord3.record} />
              </div>
              <ChatRoomPanel connect={connect} user={user} messages={messages} />
            </div>
          </>
        }
      </header>
    </div>
  );
}

export default App;
