﻿module.exports = {
    devices: {
        cd_changer: 0x18,
        mfl: 0x50,
        radio: 0x68,
        ike: 0x80,
        mid: 0xc0,
        lcm: 0xbf,
        tel: 0xc8,
        obc_textbar: 0xe7
    },
    
    messages: {
        //From CD changer
        cdc_announceCd: { src: 0x18, dst: 0xff, msg: new Buffer([0x02, 0x01]) },
        cdc_respondAsCd: { src: 0x18, dst: 0x68, msg: new Buffer([0x02, 0x00]) },
        // last byte is CD #, second last byte is track # 
        cdc_playing0101: { src: 0x18, dst: 0x68, msg: new Buffer([0x39, 0x00, 0x09, 0x00, 0x3f, 0x00, 0x01, 0x01]) },
        
        //From radio
        rad_cdReqParams: { src: 0x68, dst: 0x18, msg: new Buffer([0x38, 0x00, 0x00]) },
        rad_cdReqPlay: { src: 0x68, dst: 0x18, msg: new Buffer([0x38, 0x03, 0x00]) },
        rad_cdPool: { src: 0x68, dst: 0x18, msg: new Buffer([0x01]) },
        replace_rad2mid_CD0101: { src: 0x68, dst: 0xc0, msg: new Buffer([0x24, 0x40, 0x00, 0x31, 0x2d, 0x30, 0x31, 0x20, 0x20, 0x20, 0x20]) },
        //SCAN <Buffer 68 12 c0 23 40 20 53 43 41 4e 20 03 20 20 20 20 20 20
        //CD 1-01 <Buffer 68 12 c0 23 40 20 43 44 20 03 31 2d 30 31 20 20 20 20
        replace_rad2midCDbuttons: { src: 0x68, dst: 0xc0, msg: new Buffer([0x21, 0x40, 0x00, 0x00, 0x20, 0x31, 0x05, 0x32, 0x20, 0x05, 0x20, 0x33, 0x05, 0x34, 0x20, 0x05, 0x20, 0x35, 0x05, 0x36, 0x20, 0x05, 0x05, 0x05, 0x52, 0x4e, 0x44, 0x20]) },

        //MFL buttons wheel
        previous_press: { src: 0x50, dst: 0x68, msg: new Buffer([0x3b, 0x08]) },
        previous_hold: { src: 0x50, dst: 0x68, msg: new Buffer([0x3b, 0x18]) },
        previous_release: { src: 0x50, dst: 0x68, msg: new Buffer([0x3b, 0x28]) },
        next_press: { src: 0x50, dst: 0x68, msg: new Buffer([0x3b, 0x01]) },
        next_hold: { src: 0x50, dst: 0x68, msg: new Buffer([0x3b, 0x11]) },
        next_release: { src: 0x50, dst: 0x68, msg: new Buffer([0x3b, 0x21]) },
        volume_up_press: { src: 0x50, dst: 0x68, msg: new Buffer([0x32, 0x11]) },
        volume_up_hold: { src: 0x50, dst: 0x68, msg: new Buffer([0x32, 0x21]) },
        volume_up_release: { src: 0x50, dst: 0x68, msg: new Buffer([0x32, 0x31]) },
        volume_down_press: { src: 0x50, dst: 0x68, msg: new Buffer([0x32, 0x10]) },
        volume_down_hold: { src: 0x50, dst: 0x68, msg: new Buffer([0x32, 0x20]) },
        volume_down_release: { src: 0x50, dst: 0x68, msg: new Buffer([0x32, 0x30]) },
        r_t_press: { src: 0x50, dst: 0xc8, msg: new Buffer([0x01]) },
        
        
        radio_1_press: { src: 0xC0, dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x00]) },
        radio_1_hold: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x20]) },
        radio_1_release: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x40]) },
        radio_2_press: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x01]) },
        radio_2_hold: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x21]) },
        radio_2_release: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x41]) },
        radio_3_press: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x02]) },
        radio_3_hold: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x22]) },
        radio_3_release: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x42]) },
        radio_4_press: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x03]) },
        radio_4_hold: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x23]) },
        radio_4_release: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x43]) },
        radio_5_press: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x04]) },
        radio_5_hold: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x24]) },
        radio_5_release: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x44]) },
        radio_6_press: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x05]) },
        radio_6_hold: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x25]) },
        radio_6_release: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x45]) },
        radio_fm_press: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x06]) },
        radio_fm_hold: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x26]) },
        radio_fm_release: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x46]) },
        radio_am_press: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x07]) },
        radio_am_hold: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x27]) },
        radio_am_release: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x47]) },
        radio_rds_press: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x08]) },
        radio_rds_hold: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x28]) },
        radio_rds_release: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x48]) },
        radio_tp_press: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x09]) },
        radio_tp_hold: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x29]) },
        radio_tp_release: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x49]) },
        radio_rev_press: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x00, 0x00, 0x0C]) },
        radio_rev_hold: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x00, 0x00, 0x2C]) },
        radio_rev_release: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x00, 0x00, 0x4C]) },
        radio_ff_press: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x00, 0x00, 0x0D]) },
        radio_ff_hold: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x00, 0x00, 0x2D]) },
        radio_ff_release: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x00, 0x00, 0x4D]) },
        radio_m_press: { src: 0xC0, dst: 0x68, msg: new Buffer([0x31, 0x00, 0x00, 0x0E]) },
        cd_button_press: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x0B]) },
        cd_button_hold: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x2B]) },
        cd_button_release: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x4B]) },
        radio_turnknob_off: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x22, 0x00]) },
        radio_on_1: { src: 0xC0 , dst: 0x80, msg: new Buffer([0x01]) },
        radio_on_2: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x01]) },
        cd_sc_press: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x0a]) },
        cd_sc_hold: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x2a]) },
        cd_sc_release: { src: 0xC0 , dst: 0x68, msg: new Buffer([0x31, 0x40, 0x00, 0x4a]) },

        ph7090_arrow_right: { src: 0x68 , dst: 0x18, msg: new Buffer([0x38, 0x0a, 0x00]) },
        ph7090_arrow_left: { src: 0x68 , dst: 0x18, msg: new Buffer([0x38, 0x0a, 0x01]) },

        //Test
        //test: { src: 0x80, dst: 0xe7, msg: new Buffer([0x2a, 0x00, 0x00]) }
    },
    
    messageParts: {
        mid_buttons_for_replaceStart: {
            src: 0x68, dst: 0xc0, msg: new Buffer([0x21, 0x40, 0x00, 0x09])
        },
        mid_buttons_for_replaceEnd: {
            src: 0x68, dst: 0xc0, msg: new Buffer([0x43, 0x44])
        },
        //display 1 value to replace
        //not working replace_rad2mid_CD0101Start: { src: 0x68, dst: 0xc0, msg: new Buffer([0x23, 0x40, 0x00]) },
        //from old replace_rad2mid_CD0101: { src: 0x68, dst: 0xc0, msg: new Buffer([0x23, 0x40, 0x20, 0x43, 0x44, 0x20, 0x03, 0x31, 0x2d, 0x30, 0x31, 0x20, 0x20, 0x20, 0x20]) },
    }
}


/*
IbusPacketReceived] Id: 	   1648748638336
[IbusPacketReceived] From: 	   Radio - 68
[IbusPacketReceived] To: 	   CDChanger - 18
[IbusPacketReceived] Message:  <Buffer 38 0a 00> - right arrow


[IbusPacketReceived] Id: 	   1648748763737
[IbusPacketReceived] From: 	   Radio - 68
[IbusPacketReceived] To: 	   CDChanger - 18
[IbusPacketReceived] Message:  <Buffer 38 0a 01> - left arrow

*/