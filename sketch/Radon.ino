#include <Servo.h>

const int angleInDegMin = 0;
const int angleInDegMax = 180;
const int distanceInCmMax = 400;
const int servoPin = 9;
const int servoDelayMs = 10;
const int serialBaud = 9600;
const int speedOfSoundInMsPerCm = 29;
const int pulsePin = 5;
const int pulseDurationInMs = 5;

Servo servo;

void setup() {
  Serial.begin(serialBaud);
  servo.attach(servoPin);
  servo.write(angleInDegMin);
  delay(2000);
}

void loop() {
  fullSweepScan();
}

void fullSweepScan() {
  int angleInDeg;
  for (angleInDeg = angleInDegMin; angleInDeg < angleInDegMax; angleInDeg += 1) {
    singleScan(angleInDeg);
  }

  for (angleInDeg = angleInDegMax; angleInDeg > angleInDegMin; angleInDeg -= 1){
    singleScan(angleInDeg);
  }
}

void singleScan(int angleInDeg) {
  servo.write(angleInDeg);
  delay(servoDelayMs);
  long detectedDistanceInCm = getDistanceInCm(pulsePin, pulseDurationInMs);
  String values = "{\"distanceInCm\": ";
  values += detectedDistanceInCm;
  values += " ,\"distanceInCmMax\": ";
  values += distanceInCmMax;
  values += " ,\"angleInDeg\": ";
  values += angleInDeg;
  values += " ,\"angleInDegMin\": ";
  values += angleInDegMin;
  values += " ,\"angleInDegMax\": ";
  values += angleInDegMax;
  values += " }";
  
  Serial.println(values);
}

long getDistanceInCm(int pulsePin, int pulseDurationInMs) {
  pinMode(pulsePin, OUTPUT);
  digitalWrite(pulsePin, LOW);
  delay(2);
  digitalWrite(pulsePin, HIGH);
  delay(pulseDurationInMs);
  digitalWrite(pulsePin, LOW);
  
  pinMode(pulsePin, INPUT);
  long durationInMs = pulseIn(pulsePin, HIGH);
  long distanceInCm = durationInMs / speedOfSoundInMsPerCm / 2;

  return distanceInCm;
}
