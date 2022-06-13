import React, {useEffect, useState, useRef} from 'react';
import "../styles.css"
import { mqtt_client } from '../App';
import { MQTT_TOPIC_CHAT } from '../App';
import { disconnect } from 'process';

export interface IMessage {
    user: string,
    message: string,
    timestamp: number
}

const emptyMessage: IMessage = {
    user: "",
    message: "",
    timestamp: 0
}

export interface IChatPanelProps {
    connect: boolean,
    user: string,
    messages: IMessage[]
}

const AutoScrollToBottom = () => {
    // const elementRef = useRef<HTMLDListElement>(null);
    const divRef = useRef(document.createElement("div"))
    useEffect(() => divRef.current.scrollIntoView());
    return <div ref={divRef} />;
}

const ChatRoomPanel = (props: IChatPanelProps) => {
    const [input, setInput] = useState<string>("");

    const sendMessage = (topic:string, message:string) => {
        let msg_json: IMessage = emptyMessage;
        msg_json.user = props.user;
        msg_json.message = message;
        let date = Date.now();
        msg_json.timestamp = date;
        let msg_json_string = JSON.stringify(msg_json);
        // console.log(msg_json_string);
        mqtt_client.publish(topic, msg_json_string, {qos: 1});
    }

    return (
        <div className={`msg-panel-container ${props.connect?'':'disconnected'}`}>
            <div className="msg-container">
                {props.messages.map((msg, idx) => {
                    let date = new Date(msg.timestamp);
                    let hours = date.getHours();
                    let minutes = date.getMinutes();
                    return (
                        <div key={idx} className={props.user==msg.user? "msg user" : "msg other"}>
                            <div className="msg-name">{msg.user}</div>
                            <div>{msg.message}</div>
                            <div className="time">{`${hours}:${minutes<10?"0"+minutes:minutes}`}</div>
                        </div>
                    )})
                }
                <AutoScrollToBottom />
            </div>
            <div className="msg-input">
                <input className="input" type="text" value={input} onChange={(e) => setInput(e.target.value)} />
                {
                    props.connect ?
                        <button onClick={() => {
                            sendMessage(MQTT_TOPIC_CHAT, input);
                            setInput("");
                        }}>
                            Send
                        </button>
                        :
                        <></>
}
            </div>
        </div>
    )
}

export default ChatRoomPanel;