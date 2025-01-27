const N76_ADDR = 0x10
//% weight=0 color=#ff0000 icon="\uf1ba" block="BitRacer"

namespace BitRacer {
    //% ad enum Motors
    export enum Motors {
        //% blockId="left motor" block="left"
        M_R = 0,
        //% blockId="right motor" block="right"
        M_L = 1,
        //% blockId="all motor" block="all"
        All = 2
    }
    export enum IR_Sensors {
        //% blockId="IR1_Sensors" block="IR1"
        IR1 = 0x03,
        //% blockId="IR2_Sensors" block="IR2"
        IR2 = 0x04,
        //% blockId="IR3_Sensors" block="IR3"
        IR3 = 0x05,
        //% blockId="IR4_Sensors" block="IR4"
        IR4 = 0x06,
        //% blockId="IR5_Sensors" block="IR5"
        IR5 = 0x07
    }
    export enum LineColor {
        //% blockId="White" block="White"
        White = 0x0A,
        //% blockId="Black" block="Black"
        Black = 0x0B
    }
    export enum LEDs {
        //% blockId="LED_right" block="right"
        LED_R = 8,
        //% blockId="LED_left" block="left"
        LED_L = 16
    }
    export enum LEDswitch {
        //% blockId="on" block="on"
        on = 0,
        //% blockId="off" block="off"
        off = 1
    }

    //% weight=100
    //% blockId=motor_MotorRun block="motor|%index|PWM value|%PWM"
    //% PWM.min=-1000 PWM.max=1000
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=3
    export function motorRun(index: Motors, PWM: number): void {
        let i2cbuf = pins.createBuffer(3);
        if (index == 0) {
            i2cbuf[0] = 0x02;
            i2cbuf[1] = (PWM >> 8);
            i2cbuf[2] = PWM;
            pins.i2cWriteBuffer(N76_ADDR, i2cbuf);
        }
        if (index == 1) {
            i2cbuf[0] = 0x00;
            i2cbuf[1] = (PWM >> 8);
            i2cbuf[2] = PWM;
            pins.i2cWriteBuffer(N76_ADDR, i2cbuf);
        }
        if (index == 2) {
            i2cbuf[0] = 0x00;
            i2cbuf[1] = (PWM >> 8);
            i2cbuf[2] = PWM;
            pins.i2cWriteBuffer(N76_ADDR, i2cbuf);
            i2cbuf[0] = 0x02;
            pins.i2cWriteBuffer(N76_ADDR, i2cbuf);
        }
    }

    //% weight=90
    //% blockId=sensor_readIR block="read |%SensorID sensor"
    //% SensorID.fieldEditor="gridpicker" SensorID.fieldOptions.columns=3
    export function readIR(SensorID: IR_Sensors): number {
        pins.i2cWriteNumber(
            N76_ADDR,
            SensorID,
            NumberFormat.UInt8LE,
            false
        )
        return pins.i2cReadNumber(N76_ADDR, NumberFormat.UInt16BE, false)
    }
    //% weight=85
    //% blockId=sensor_readIR2 block="read IRsensor |%SensorID"
    //% SensorIDs.min=0 SensorIDs.max=4
    export function readIR2(SensorIDs: number): number {
        pins.i2cWriteNumber(
            N76_ADDR,
            SensorIDs + 3,
            NumberFormat.UInt8LE,
            false
        )
        return pins.i2cReadNumber(N76_ADDR, NumberFormat.UInt16BE, false)
    }
    //% weight=80
    //% blockId=LED_Set block="LED|%LedPin|%status"
    //% LedPin.fieldEditor="gridpicker" LedPin.fieldOptions.columns=1
    //% status.fieldEditor="gridpicker" status.fieldOptions.columns=1
    export function LED(LedPin: LEDs, status: LEDswitch): void {
        if (LedPin == LEDs.LED_R) {
            pins.digitalWritePin(DigitalPin.P8, status)
        }
        else if (LedPin == LEDs.LED_L) {
            pins.digitalWritePin(DigitalPin.P16, status)
        }
    }


    //% color=#2080ff
    //% weight=30
    //% blockId=sensor_StartSampling block="Calibrate Begin"
    export function CalibrateBegin(): void {
        pins.i2cWriteNumber(
            N76_ADDR,
            0x09,
            NumberFormat.UInt8LE,
            false
        )
    }

    //% color=#2080ff
    //% weight=20
    //% blockId=sensor_EndSampling block="Calibrate End|%Color (Line)"
    //% Color.fieldEditor="gridpicker" Color.fieldOptions.columns=1
    export function CalibrateEnd(Color: LineColor): void {
        pins.i2cWriteNumber(
            N76_ADDR,
            Color,
            NumberFormat.UInt8LE,
            false
        )
    }

    //% color=#2080ff
    //% weight=10
    //% blockId=sensor_Line block="read Line position"
    export function readLine(): number {
        pins.i2cWriteNumber(
            N76_ADDR,
            0x08,
            NumberFormat.UInt8LE,
            false
        )
        return pins.i2cReadNumber(N76_ADDR, NumberFormat.Int16BE, false) / 1000
    }
}

//% weight=0 color=#ff9900 icon="\uf001" block="MP3 Player"
namespace dfplayer {
    serial.onDataReceived("E", () => {
    })
    let Start_Byte = 0x7E
    let Version_Byte = 0xFF
    let Command_Length = 0x06
    let End_Byte = 0xEF
    let Acknowledge = 0x00
    let CMD = 0x00
    let para1 = 0x00
    let para2 = 0x00
    let highByte = 0x00
    let lowByte = 0x00
    let MP3_tx = SerialPin.P1
    let MP3_rx = SerialPin.P2
    let dataArr: number[] = [Start_Byte, Version_Byte, Command_Length, CMD, Acknowledge, para1, para2, highByte, lowByte, End_Byte]

    export enum playType {
        //% block="Play"
        type1 = 0x0D,
        //% block="Stop"
        type2 = 0x16,
        //% block="PlayNext"
        type3 = 0x01,
        //% block="PlayPrevious"
        type4 = 0x02,
        //% block="Pause"
        type5 = 0x0E
    }

    export enum yesOrNot {
        //% block="no"
        type1 = 0,
        //% block="yes"
        type2 = 1
    }


    /**
     * @param pinRX to pinRX ,eg: SerialPin.P2
     * @param pinTX to pinTX ,eg: SerialPin.P1
    */
    //% blockId="MP3_setSerial" block="set DFPlayer mini RX to %pinTX| TX to %pinRX"
    //% weight=100 blockGap=20
    export function MP3_setSerial(pinTX: SerialPin, pinRX: SerialPin): void {
        MP3_tx = pinTX;
        MP3_rx = pinRX;
        serial.redirect(
            MP3_tx,
            MP3_rx,
            BaudRate.BaudRate9600
        )
        basic.pause(100)
    }

    //% blockId="MP3_serialReconnect" block="set DFPlayer reconnect to micro:bit serial"
    //% weight=99 blockGap=20
    export function MP3_serialReconnect(): void {
        serial.redirect(
            MP3_tx,
            MP3_rx,
            BaudRate.BaudRate9600
        )
        basic.pause(20)
    }

    function checkSum(): void {
        let total = 0;
        for (let i = 1; i < 7; i++) {
            total += dataArr[i]
        }
        total = 65536 - total
        lowByte = total & 0xFF;
        highByte = total >> 8;
        dataArr[7] = highByte
        dataArr[8] = lowByte
    }
    //% blockId="execute" block="execute procedure:%myType"
    //% weight=90 blockExternalInputs=true blockGap=20
    export function execute(myType: playType): void {
        CMD = myType
        para1 = 0x00
        para2 = 0x00
        dataArr[3] = CMD
        dataArr[5] = para1
        dataArr[6] = para2
        checkSum()
        sendData()
    }

    //% blockId="setTracking" block="play the mp3 on the track:%tracking|repeat:%myAns"
    //% weight=85 blockGap=20 tracking.min=1 tracking.max=255
    export function setTracking(tracking: number, myAns: yesOrNot): void {
        CMD = 0x03
        para1 = 0x00
        para2 = tracking
        dataArr[3] = CMD
        dataArr[5] = para1
        dataArr[6] = para2
        checkSum()
        sendData()
        execute(0x0D)
        if (myAns == 1)
            execute(0x19)
    }


    //% blockId="folderPlay" block="play the mp3 in the folder:%folderNum|filename:%fileNum|repeat:%myAns"
    //% weight=80 blockGap=20 folderNum.min=1 folderNum.max=99 fileNum.min=1 fileNum.max=255
    export function folderPlay(folderNum: number, fileNum: number, myAns: yesOrNot): void {
        CMD = 0x0F
        para1 = folderNum
        para2 = fileNum
        dataArr[3] = CMD
        dataArr[5] = para1
        dataArr[6] = para2
        checkSum()
        sendData()
        if (myAns == 1)
            execute(0x19)
    }

    //% blockId="setLoop" block="loop play all the MP3s in the SD card"
    //% weight=75 blockGap=20 
    export function setLoop(): void {
        CMD = 0x11
        para1 = 0
        para2 = 0x01
        dataArr[3] = CMD
        dataArr[5] = para1
        dataArr[6] = para2
        checkSum()
        sendData()
    }

    //% blockId="setLoopFolder" block="loop play all the MP3s in the folder:%folderNum"
    //% weight=73 blockGap=20 folderNum.min=1 folderNum.max=99
    export function setLoopFolder(folderNum: number): void {
        CMD = 0x17
        para1 = 0
        para2 = folderNum
        dataArr[3] = CMD
        dataArr[5] = para1
        dataArr[6] = para2
        checkSum()
        sendData()
    }


    //% blockId="setVolume" block="set volume(0~30):%volume"
    //% weight=70 blockGap=20 volume.min=0 volume.max=30
    export function setVolume(volume: number): void {
        CMD = 0x06
        para1 = 0
        para2 = volume
        dataArr[3] = CMD
        dataArr[5] = para1
        dataArr[6] = para2
        checkSum()
        sendData()
    }

    function sendData(): void {
        let myBuff = pins.createBuffer(10);
        for (let i = 0; i < 10; i++) {
            myBuff.setNumber(NumberFormat.UInt8BE, i, dataArr[i])
        }
        serial.writeBuffer(myBuff)
        basic.pause(100)
    }

}
