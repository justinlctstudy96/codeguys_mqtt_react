import React, {useEffect, useState} from 'react';
import "../styles.css"
import {mqtt_client} from "../App"

export interface InfcRecord {
    nfc_no: number,
    color: number,
    record: string
}

export interface InfcPanelProps {
    connect: boolean,
    nfc_no: number,
    color: number,
    record: string
}

export const NFC_COLOR_ID:any = {
    0: "red",
    1: "blue",
    2: "green",
    3: "other"
}

export const NFC_UID_COLOR:any = {
    "53 7F 3C 27 01 8E 00": 0,
    "53 B7 28 26 01 E2 00": 0,
    "53 2F 48 24 01 AA 00": 0,
    "53 F0 27 0C 60 00 01": 1,
    "53 7F 93 0B 60 00 01": 1,
    "53 7E CC 0B 60 00 01": 1, 
    "53 07 A1 0D 01 6A 00": 2,
    "53 76 84 0C 01 16 00": 2,
    "53 66 D4 27 01 45 00": 2
}


const NFCrecordPanel = (props: InfcPanelProps) => {
    const [record, setRecord] = useState<string>("");
    const [pendingWrite, setPendingWrite] = useState<boolean>(false);

    
    const writeRecord = (topic:string, record:string) => {
        mqtt_client.publish(topic, record);
        setPendingWrite(true);
    }

    useEffect(() => {
        // if (props.record == record) {
            setRecord("");
            setPendingWrite(false);
        // }
    }, [props.record])

    return (
        <div className={`nfc-record ${NFC_COLOR_ID[props.color]} ${props.connect?'':'disconnected'}`}>
            <div>
                NFC Reader {props.nfc_no}
                <div className="nfc-annotation">(subscribe: nfc/{props.nfc_no}/record, nfc/{props.nfc_no}/error)</div>
            </div>
            <div>{props.record!=="" ? props.record : "- empty -"}</div>
            {
                pendingWrite ?
                <div>
                    Waiting for NFC tag to write "{record}"
                </div> 
                :
                <div>
                    <input type="text" value={record} onChange={(e) => setRecord(e.target.value)} />
                    {props.connect ? <button onClick={()=>{writeRecord("nfc/"+props.nfc_no+"/write", record)}}>Write</button>:<></>}
                    <div className="nfc-annotation">(publish: nfc/{props.nfc_no}/write)</div>
                </div>
            }
        </div>
    )
}

export default NFCrecordPanel;