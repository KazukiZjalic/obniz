class WSCommand {

  constructor(delegate) {
    this.delegate = delegate;

    //constants
    this.COMMAND_FUNC_ID_ERROR = 0xFF
    this.ioNotUsed = 0xFF;
  }

  static get CommandClasses() {
    return {
      WSCommand_System,
      WSCommand_Directive,
      WSCommand_IO,
      WSCommand_PWM,
      WSCommand_UART,
      WSCommand_AD,
      WSCommand_SPI,
      WSCommand_I2C,
      WSCommand_LogicAnalyzer,
      WSCommand_Display,
      WSCommand_Switch,
      WSCommand_Ble,
      WSCommand_Measurement
    };
  }
  
  static framed(module, func, payload) {
    var payload_length = 0;
    if (payload) {
      payload_length = payload.length;
    }
    var length_type;
    if (payload_length <= 0x3F) {
      length_type = 0;
    } else if (payload_length <= 0x3FFF) {
      length_type = 1;
    } else if (payload_length <= 0x3FFFFFFF) {
      length_type = 2;
    } else {
      throw new Error("too big payload");
      return null;
    }
    var length_extra_bytse = (length_type == 0) ? 0 : ( (length_type == 1) ? 1 : 3 );
    var header_length = 3 + length_extra_bytse;
    var result = new Uint8Array(header_length + payload_length);
    var index = 0;
    result[index++] = module & 0x7F;
    result[index++] = func;
    result[index++] = (length_type << 6) | (payload_length >> (length_extra_bytse*8));
    while(length_extra_bytse > 0) {
      length_extra_bytse--;
      result[index++] = payload_length >> (length_extra_bytse*8);
    }
    if (payload_length == 0) {
      return result;
    } else {
      result.set(payload, header_length);
      return result;
    }
  }

  static dequeueOne(buf) {
    if (!buf || buf.byteLength == 0) return null;
    if (buf.byteLength < 3) {
      throw new Eror("something wrong. buf less than 3");
      return null;
    }
    if (buf[0] & 0x80) {
      throw new Eror("reserved bit 1");
      return null;
    }
    var module = 0x7F & buf[0];
    var func = buf[1];
    var length_type = (buf[2] >> 6) & 0x3;
    var length_extra_bytse = (length_type == 0) ? 0 : ( (length_type == 1) ? 1 : 3 );
    if (length_type == 4) {
      throw new Eror("invalid length");
      return null;
    }
    var length = (buf[2] & 0x3F) << (length_extra_bytse*8);
    var index = 3;
    var shift = length_extra_bytse;
    while(shift > 0) {
      shift--;
      length += buf[index] << (shift*8);
      index++;
    }

    return {
      module: module,
      func: func,
      payload: buf.slice(3+length_extra_bytse, 3+length_extra_bytse+length),
      next: buf.slice(3+length_extra_bytse+length)
    };
  }

  static compress(wscommands, json) {
    var ret;
    function append(module, func, payload) {
      var frame = WSCommand.framed(module, func, payload);
      if (ret) {
        var combined = new Uint8Array(ret.length + frame.length);
        combined.set(ret, 0);
        combined.set(frame, ret.length);
        ret = combined;
      } else {
        ret = frame;
      }
    }
    for (let i=0; i<wscommands.length; i++) {
      const wscommand = wscommands[i];
      wscommand.parsed = append;
      wscommand.parseFromJson(json);
    }
    return ret;
  }

  sendCommand(func, payload) {
    if (this.delegate && this.delegate.onParsed) {
      this.delegate.onParsed(this.module, func, payload);
    }
    if (this.parsed) {
      this.parsed(this.module, func, payload);
    }
  }

  parseFromJson(json) {

  }

  notifyFromBinary(objToSend, func, payload) {

    switch(func) {
      case this.COMMAND_FUNC_ID_ERROR:
        if (!objToSend.debug) objToSend.debug = {};
        if (!objToSend.debug.errors) objToSend.debug.errors = [];
        var err = {
          module: this.module,
          _args: [... payload]
        };
        err.message = "Error at " + this.module + " with " + err._args;
        if (payload.byteLength == 3) {
          err.err0 = payload[0];
          err.err1 = payload[1];
          err.function = payload[2];
        }
        objToSend.debug.errors.push(err)
        break;

      default:
        // unknown
        break;
    }
  }

  envelopWarning(objToSend, module_key, obj) {
    if (!objToSend[module_key]) objToSend[module_key] = {};
    if (!objToSend[module_key].warnings) objToSend[module_key].warnings = [];
    objToSend[module_key].warnings.push(obj);
  }

  envelopError(objToSend, module_key, obj) {
    if (!objToSend[module_key]) objToSend[module_key] = {};
    if (!objToSend[module_key].errors) objToSend[module_key].errors = [];
    objToSend[module_key].errors.push(obj);
  }

  isValidIO(io) {
    return (typeof(io) === "number" && 0 <= io && io <= 11) 
  }
}