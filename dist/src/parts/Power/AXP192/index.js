"use strict";
/**
 * @packageDocumentation
 * @module Parts.AXP192
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class AXP192 {
    constructor() {
        this.requiredKeys = [];
        this.keys = ["sda", "scl", "i2c"];
    }
    static info() {
        return {
            name: "AXP192",
        };
    }
    wired(obniz) {
        this.params.mode = "master"; // for i2c
        this.params.clock = 400 * 1000; // for i2c
        this.i2c = obniz.getI2CWithConfig(this.params);
    }
    // Module functions
    set(address, data) {
        this.i2c.write(AXP192_ADDRESS, [address, data]);
    }
    getWait(address) {
        return __awaiter(this, void 0, void 0, function* () {
            this.i2c.write(AXP192_ADDRESS, [address]);
            return yield this.i2c.readWait(AXP192_ADDRESS, 1);
        });
    }
    setLDO2Voltage(voltage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (voltage < 1.8) {
                voltage = 1.8;
            }
            if (voltage > 3.3) {
                voltage = 3.3;
            }
            let set = yield this.getWait(REG_VOLT_SET_LDO2_3);
            let offset = (voltage - 1.8) * 10;
            if (offset > 15) {
                offset = 15;
            }
            set = (set & 0x0f) | (offset << 4);
            console.log("set voltage to ", set);
            this.set(REG_VOLT_SET_LDO2_3, set);
        });
    }
    setLDO3Voltage(voltage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (voltage < 1.8) {
                voltage = 1.8;
            }
            if (voltage > 3.3) {
                voltage = 3.3;
            }
            let set = yield this.getWait(REG_VOLT_SET_LDO2_3);
            let offset = (voltage - 1.8) * 10;
            if (offset > 15) {
                offset = 15;
            }
            set = (set & 0xf0) | offset;
            this.set(REG_VOLT_SET_LDO2_3, set);
        });
    }
    set3VLDO2_3() {
        this.set(REG_VOLT_SET_LDO2_3, 0xcc);
    }
    enableLDO2_3() {
        this.set(REG_EN_DC1_LDO2_3, 0x4d);
    }
    toggleLDO2(val) {
        return __awaiter(this, void 0, void 0, function* () {
            const bit = val ? 1 : 0;
            let state = yield this.getWait(REG_EN_DC1_LDO2_3);
            state = (state & LDO2_EN_MASK) | (bit << 2);
            this.set(REG_EN_DC1_LDO2_3, state);
        });
    }
    toggleLDO3(val) {
        return __awaiter(this, void 0, void 0, function* () {
            const bit = val ? 1 : 0;
            let state = yield this.getWait(REG_EN_DC1_LDO2_3);
            state = (state & LDO3_EN_MASK) | (bit << 3);
            this.set(REG_EN_DC1_LDO2_3, state);
        });
    }
    initM5StickC() {
        this.i2c.write(AXP192_ADDRESS, [REG_EN_EXT_DC2, 0xff]);
        this.i2c.write(AXP192_ADDRESS, [REG_VOLT_SET_LDO2_3, 0xcc]);
        this.i2c.write(AXP192_ADDRESS, [REG_ADC_EN1, 0xff]);
        this.i2c.write(AXP192_ADDRESS, [REG_CHARGE_CTRL1, 0xc0]);
        this.i2c.write(AXP192_ADDRESS, [REG_CCOUNTER, 0x80]);
        this.i2c.write(AXP192_ADDRESS, [REG_EN_DC1_LDO2_3, 0x4d]);
        this.i2c.write(AXP192_ADDRESS, [REG_PEK, 0x0c]);
        this.i2c.write(AXP192_ADDRESS, [REG_GPIO0, 0x02]);
        this.i2c.write(AXP192_ADDRESS, [REG_VBUS_IPSOUT, 0xe0]);
        this.i2c.write(AXP192_ADDRESS, [REG_CHARGE_OVTEMP, 0xfc]);
        this.i2c.write(AXP192_ADDRESS, [REG_BCKUP_BAT, 0xa2]);
    }
    getVbat() {
        return __awaiter(this, void 0, void 0, function* () {
            this.i2c.write(AXP192_ADDRESS, [REG_VBAT_LSB]);
            const vbat_lsb = yield this.i2c.readWait(AXP192_ADDRESS, 1);
            this.i2c.write(AXP192_ADDRESS, [REG_VBAT_MSB]);
            const vbat_msb = yield this.i2c.readWait(AXP192_ADDRESS, 1);
            return (vbat_lsb << 4) + vbat_msb;
        });
    }
}
exports.default = AXP192;
const AXP192_ADDRESS = 0x34;
const REG_EN_EXT_DC2 = 0x10;
const REG_EN_DC1_LDO2_3 = 0x12;
const REG_VOLT_SET_LDO2_3 = 0x28;
const REG_VBUS_IPSOUT = 0x30;
const REG_CHARGE_CTRL1 = 0x33;
const REG_BCKUP_BAT = 0x35;
const REG_PEK = 0x36;
const REG_CHARGE_OVTEMP = 0x39;
const REG_VBAT_LSB = 0x78;
const REG_VBAT_MSB = 0x79;
const REG_ADC_EN1 = 0x82;
const REG_GPIO0 = 0x90;
const REG_CCOUNTER = 0xb8;
const LDO2_EN_MASK = 0xfb;
const LDO3_EN_MASK = 0xf7;

//# sourceMappingURL=index.js.map
