# Peripherals PWM
Output PWM.
Maximum current is depends on driving mode. see [io](./io).
pwm0 to pwm5 are available.

## obniz.getpwm()
it reutrn pwm module which currently not used.

```Javascript
// Example
var pwm = obniz.getpwm();
```
It will throw Error when no free pwm.

## start(io)
start a pwm on given io.
No pulse output on start.

```Javascript
// Example
var pwm = obniz.getpwm();
pwm.start(11); // start pwm. output at io11
```
## freq(frequency)
set frequency. Not pulse duration.
For example, this value will be 1khz with DC motor.

```Javascript
// Example
var pwm = obniz.getpwm();
pwm.start(11); // start pwm. output at io11
pwm.freq(1000); // set pwm. frequency to 1khz
```
## pulse(width ms)
set pulse duty with ms.

```Javascript
// Example
var pwm = obniz.getpwm();
pwm.start(11); // start pwm. output at io11
pwm.freq(2000); // set pwm frequency to 2khz
pwm.pulse(0.5) // set pwm pulse 0.5msec.  so this is  25% ratio.
```
## duty(ratio)
set duty with ratio.

```Javascript
// Example
var pwm = obniz.getpwm();
pwm.start(11); // start pwm. output at io11
pwm.freq(2000); // set pwm frequency to 2khz
pwm.duty(50) // set pwm pulse witdh 50%
```
## forceWorking(true/false)
obniz has overcurrent protection when outputType is "push-pull" 1A mode. Possibly, obniz will stop pwm when small DC motor or small coil is connected.
In that case, set forceWorking(true).
It let obniz to retry output pwm.
This will work but it makes pulse shape dirty.
So this setting will be used when pulse shape is not import such as dc motor and coils.

Important. forceWorking never cancel overcurrent protection on "push-pull" mode.
It just resetting it periodically. It still safe.

```Javascript
// Example
var pwm = obniz.getpwm();
pwm.start(11); // start pwm. output at io11
pwm.freq(1000); // set pwm frequency to 1khz
pwm.duty(50) // set pwm pulse witdh 50%
pwm.forceWorking(true)
```
## modulate(modulation type, interval sec, data)
modulate pwm with datas
modulation can be choosed from below.

1. "am"

In am modulation, data "1" measn output the pwm with duty 50%. "0" means stop pwm. io will be 0.
You can configure symbol length.

```Javascript
// Example
var pwm = obniz.getpwm();
pwm.start(11);   // start pwm. output at io11
pwm.freq(38000); // set pwm frequency to 38khz

// signal for room heater's remote signal
var arr = [255,0,0,0,0,0,0,255,255,254,1,192,62,3,255,254,3,192,63,255,192,60,3,224,62,3,255,254,3,255,254,3,224,62,3,224,63,255,192,63,255,224,62,3,224,62,3,224,62,3,224,62,3,240,31,3,240,31,1,240,31,1,255,255,1,240,31,1,240,31,1,248,31,129,240,31,255,248,31,129,248,15,128,248,15,255,248,15,128,248,15,128,248,15,128,252,15,255,255];

pwm.modulate("am", 0.00007, arr); // am modulate. symbol length = 70usec.
```
## end();
stop pwm. It will release io.

```Javascript
// Example
pwm.end();
```