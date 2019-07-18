/**
 *This is YLWL:IoT 
 */

enum HttpMethod {
    GET,
    POST,
    PUT,
    HEAD,
    DELETE,
    PATCH,
    OPTIONS,
    CONNECT,
    TRACE
}

//% weight=10 color=#10C43D icon="\uf213" block="YLWL:IoT"
namespace ylwl_IoT {

    const NEW_LINE: string = '\u000D' + '\u000A'

    // 初始化
    const AT_RST: string = 'AT+RST'
    // 客户端模式
    const AT_CWMODE_CUR: string = 'AT+CWMODE_CUR=1'

    // 加入AP
    const AT_CWJAP_CUR: string = 'AT+CWJAP_CUR'
    // 退出AP
    const AT_CWQAO: string = 'AT+CWQAO'
    // 自动
    const AT_CWAUTOCONN: string = 'AT+CWAUTOCONN=1'

    // 连接服务器
    const AT_CIPSTART: string = 'AT+CIPSTART="TCP"'
    // 设置透传
    const AT_CIPMODE: string = 'AT+CIPMODE=1'
    // 发送数据
    const AT_CIPSEND: string = 'AT+CIPSEND'
    // 关闭
    const AT_CIPCLOSE: string = 'AT+CIPCLOSE'

    //% weigth=99
    //% blockId="ylwl_iot_wifi_init" block="connect to WiFi with tx %wifiTX rx %wifiRX baud %baudRate"
    //% wifiTX.defl=SerialPin.P16 wifiRX.defl=SerialPin.P8 baudRate=BaudRate.BaudRate115200
    export function connectToWiFi(wifiTX: SerialPin = SerialPin.P16, wifiRX: SerialPin = SerialPin.P8, baudRate: BaudRate = BaudRate.BaudRate115200): void {
        serial.redirect(wifiTX, wifiRX, baudRate)
        basic.pause(500)
        writeToSerial(AT_RST)
        writeToSerial(AT_CWMODE_CUR)
        writeToSerial(AT_CWAUTOCONN)
    }

    //% weight=98
    //% blockId="ylwl_iot_wifi_connect" block="connect to WiFi network ssid %ssid password %password"
    //% ssid.defl="ssid" password.defl="password"
    export function connectToWiFiNetwork(ssid: string, password: string): void {
        writeToSerial(`${AT_CWJAP_CUR}="${ssid}","${password}"`, 10000)
        basic.showIcon(IconNames.Yes)
    }

    //% weight=97
    //% blockId="ylwl_iot_wifi_disconnect" block="disconnect from WiFi network"
    export function diconnectWiFi(): void {
        writeToSerial(AT_CWQAO)
    }

    //% weight=96
    //% blockId="ylwl_iot_request" block="execute HTTP method: %method|host: %host|port: %port|path: %path|headers: %headers|body: %body"
    //% method.defl=HttpMethod.GET port.defl=80
    export function request(method: HttpMethod, host: string, port: number, path: string, headers?: string, body?: string) {
        let m: string
        switch (method) {
            case HttpMethod.GET: m = 'GET'; break
            case HttpMethod.POST: m = 'POST'; break
            case HttpMethod.PUT: m = 'PUT'; break
            case HttpMethod.HEAD: m = 'HEAD'; break
            case HttpMethod.DELETE: m = 'DELETE'; break
            case HttpMethod.PATCH: m = 'PATCH'; break
            case HttpMethod.OPTIONS: m = 'OPTIONS'; break
            case HttpMethod.CONNECT: m = 'CONNECT'; break
            case HttpMethod.TRACE: m = 'TRACE'; break
        }
        writeToSerial(`${AT_CIPSTART},"${host}",${port}`, 6000)
        let data = `${m} ${path} HTTP/1.1${NEW_LINE}`
        data += `Host: ${host}${NEW_LINE}`
        if (body && body.length > 0) {
            data += `Content-Length:${body.length}${NEW_LINE}`
            data += `${NEW_LINE}${body}${NEW_LINE}`
        }
        data += `${NEW_LINE}`
        writeToSerial(`${AT_CIPSEND}=${body.length + 2}`, 3000)
        writeToSerial(`${data}`, 6000)
        writeToSerial(AT_CIPCLOSE)
    }

    //% weight=95
    //% blockId="ylwl_iot_execute_command" block="execute AT command %command and then wait %waitTime"
    //% command.defl="AT" waitTime.defl=200
    export function executeCommand(command: string, waitTime: number = 200): void {
        writeToSerial(command, waitTime)
    }


    //% weight=1
    //% blockId="ylwl_iot_new_line" block="CRLF"
    export function newLine(): string {
        return NEW_LINE
    }

    function loading(): void {
        basic.showLeds(`
        . . . . .
        . . . . .
        . . # . .
        . . . . .
        . . . . .
        `)
    }

    function ok(): void {
        basic.showIcon(IconNames.Yes)
    }

    function writeToSerial(str: string, waitTime: number = 200): void {
        loading()
        let cmd: string = str + NEW_LINE
        serial.writeString(cmd)
        basic.pause(waitTime)
        ok()
    }
}