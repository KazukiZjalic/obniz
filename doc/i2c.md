# Peripherals I2C
I2C.
i2c0 is only available. max speed 1Mhz.

## start(mode, io_sda, io_scl, frequency, pull-up)
start i2c on given io sda, scl.
io will be set to "open-drain" automatically.
And you need to specify pull-up mode.
Three options.

1. "float"
2. "pullup"
3. "pullup5v"

You should choose "pullup" to connect 3.3v parts. "pullup5v" when 5v parts.

When you choose "pullup" or "pullup5v", speed limited up to 100khz. Because internal-pullup is not so tough.
Please add external pull-up resistor on scl/sda and choose "float" when you need more speed.

```Javascript
// Example
// master mode sda=2 scl=3 400khz no pullup
obniz.i2c0.start("master", 2, 3, 400000, "float"); 
obniz.i2c0.write(0x50, [0x00, 0x00, 0x12]);
```
## write(address, data);

send data to device which has the address.
if address is >0x7F. then obniz will send as 10bit address mode.
If you want to send data as 10bit adress mode even address <= 0x7F, then use write10bit();

```Javascript
// Example
// master mode sda=2 scl=3 400khz no pullup
obniz.i2c0.start("master", 2, 3, 400000, "float"); 
obniz.i2c0.write(0x50, [0x00, 0x00, 0x12]);
```
## write10bit(address, data);
This is same as write() function. But this function will communicate to device 10bit address mode.

```Javascript
// Example
// master mode sda=2 scl=3 400khz no pullup
obniz.i2c0.start("master", 2, 3, 400000, "float"); 
obniz.i2c0.write10bit(0x50, [0x00, 0x00, 0x12]);
```
## [await] readWait(address, length);
read the data from device. length define the length of bytes. Treatment of address is same as write() function.
This function will wait until data received.

```Javascript
// Example
// master mode sda=2 scl=3 400khz no pullup
obniz.i2c0.start("master", 2, 3, 400000, "float"); 
var ret = await obniz.i2c0.readWait(0x50, 1);
console.log("readed"+ret);
```
## [await] read10bitWait(address, length);
This function will read the data with 10bit address mode.

```Javascript
// Example
// master mode sda=2 scl=3 400khz no pullup
obniz.i2c0.start("master", 2, 3, 400000, "float"); 
var ret = await obniz.i2c0.read10bitWait(0x50, 1);
console.log("readed"+ret);
```

## end()
end i2c .

```Javascript
// Example
// master mode sda=2 scl=3 400khz no pullup
obniz.i2c0.start("master", 2, 3, 400000, "float"); 
obniz.i2c0.end();
```