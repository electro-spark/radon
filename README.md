
Radon
=====

Arduino driven radar with in-browser display.


Prerequisites
-------------

Node.js (including npm)
Arduino IDE
Fritzing
A modern web browser


Setup
-----

* Install the sketch /sketch/Radon.ino on an Arduino Uno R3 board using Arduino IDE.
* CD to the /web directory. Run "npm install" to install all the required packages.
* The Fritzing schematic is located under /schematics/Radon.fzz


Running
-------

* Connect the Arduino board to a computer using the serial cable.
* Go to /web directory and run the /web/server.js script using node with the serial port name as parameter.
  e.g. on Linux if the board is connected via USB port 0: "node ./server.js /dev/ttyUSB0"
* Using the browser, go to the address: http://localhost:8000
 


