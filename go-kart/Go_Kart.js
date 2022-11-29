
const HEIGHT = 1900
function setup() {
  screenScale = screen.height/768;
  document.title = "Go-Kart";
  document.body.style.background = '#36393F';
  createCanvas(window.innerWidth, HEIGHT*screenScale);
  
  img_riding_lowres = loadImage('Riding_lowres.jpg');
  img_electronics_lowres = loadImage('Electronics_lowres.jpg');
  img_Arduino_lowres = loadImage('Arduino_lowres.jpg');
  
  img_riding = loadImage('Riding.jpg');
  img_electronics = loadImage('Electronics.jpg');
  img_Arduino = loadImage('Arduino.jpg');
  
  String.prototype.fm = function() { return this.trim().replace(/  /g, ''); }
}
function windowResized() {
  resizeCanvas(window.innerWidth, HEIGHT*screenScale);
}
function draw() {
  background('#36393F');
  noStroke();
  fill('#DCD8D9');
  textSize(70*screenScale);
  textAlign(CENTER, CENTER);
  text("My Go-Kart Project", width/2, 100*screenScale);
  
  textSize(25*screenScale);
  textAlign(LEFT, BOTTOM);
  text(`
  Last summer, I dissasembled an old, broken hoverboard and used it's parts to create a go-kart.
  I used the motors, battery and motherboard in the gokart, but I didn't use any of the sensors. I reflashed
  the motherboard with new firmware to make it controllable by external input and connected a joystick.
  The go-kart has a top speed of 18 km/h and is very responsive to input.
  `.fm(), 50*screenScale, 275*screenScale);
  
  smartImage('riding', 50*screenScale, 310*screenScale, (1357/2)*screenScale, (657/2)*screenScale, 'Taking version 3 of go-kart for a test drive.');
  
  let labels = [
    {t: 'Ikea chair', x:225, y: 135},
    {t: 'Joystick', x: 290, y: 155},
    {t: 'Electronics', x: 270, y: 210},
    {t: 'Hoverboard motors', x: 255, y: 235},
    {t: 'Caster wheels', x: 340, y: 235},
  ];
  textSize(25*screenScale);
  textAlign(LEFT, TOP);
  strokeWeight(4*screenScale);
  fill('#536AF1');
  for(let i = 0; i < labels.length; i++) {
    text(labels[i].t, 750*screenScale, 380*screenScale + 30*i*screenScale);
    stroke('#536AF1');
    line(745*screenScale, 390*screenScale + 30*i*screenScale, 50*screenScale + labels[i].x*screenScale, 300*screenScale + labels[i].y*screenScale);
    noStroke();  
  }
  
  textSize(25*screenScale);
  textAlign(RIGHT, TOP);
  fill('#DCD8D9');
  text(`
  The go-kart took multiple itterations to create with improvements being made to the design over time.
  The first version was longer than the one in the photo above and had difficulty turning. That
  was solved in version two by shortening the frame. Version 3 switched the control system from a direct
  connection between the joystick and the motherboard to an Arduino in between the two. The Arduino reads data
  from the joystick and conveys it to the motherboard. While this version didn't change anything for the driver,
  it was essential in preparing for version 4.
  `.fm(), width-50*screenScale, 725*screenScale);
  
  smartImage('electronics', width-50*screenScale-(1235/2)*screenScale, 950*screenScale, (1235/2)*screenScale, (600/2)*screenScale, 'A diagram of the electronics in version 4.');
  labels = [
    {t: 'Charging port', x: 50, y: 35},
    {t: 'Joystick cable', x: 140, y: 55},
    {t: 'Power button', x: 30, y: 100},
    {t: 'Battery', x: 370, y: 150},
    {t: 'Motherboard', x: 175, y: 170},
    {t: 'Arduino and breadboard', x: 520, y:180},
  ];
  textSize(25*screenScale);
  textAlign(RIGHT, TOP);
  strokeWeight(4*screenScale);
  fill('#536AF1');
  for(let i = 0; i < labels.length; i++) {
    text(labels[i].t, width-700*screenScale, 980*screenScale + 30*i*screenScale);
    stroke('#536AF1');
    line(width-695*screenScale, 990*screenScale + 30*i*screenScale, width-50*screenScale-(1235/2)*screenScale + labels[i].x*screenScale, 950*screenScale + labels[i].y*screenScale);
    noStroke();  
  }
  
  textSize(25*screenScale);
  textAlign(LEFT, TOP);
  fill('#DCD8D9');
  text(`
  Version 4, the current version, includes a bluetooth chip connnected to the Arduino. I made an app
  that allows me to remotely control the go-kart from a phone. The Arduino decides whether
  to be controlled by the joystick or by bluetooth on the fly based on which source is supplying inputs.
  `.fm(), 50*screenScale, 1350*screenScale);
  
  smartImage('Arduino', 50*screenScale, 1500*screenScale, (1357/2)*screenScale, (657/2)*screenScale, 'Close-up diagram of the Arduino system in version 4.');
  
  labels = [
    {t: 'Input from joystick', x: 530, y: 65},
    {t: 'Digital to analog converters (DACs)', x: 230, y: 85},
    {t: 'Output to motherboard', x: 540, y: 150},
    {t: 'Bluetooth module', x: 250, y: 190},
    {t: 'Connection for batteries', x: 175, y: 280},
  ];
  textSize(25*screenScale);
  textAlign(LEFT, TOP);
  strokeWeight(4*screenScale);
  fill('#536AF1');
  for(let i = 0; i < labels.length; i++) {
    text(labels[i].t, 750*screenScale, 1550*screenScale + 30*i*screenScale);
    stroke('#536AF1');
    line(745*screenScale, 1560*screenScale + 30*i*screenScale, 50*screenScale + labels[i].x*screenScale, 1500*screenScale + labels[i].y*screenScale);
    noStroke();  
  }
}

function smartImage(name, x, y, w, h, caption) {
  if(window[`img_${name}_lowres`].get(0, 0)[3] == 0) {
    fill('#DCD8D9');
    rect(x, y, w, h);
    fill('#36393F');
    textAlign(CENTER, CENTER);
    text("Loading...", x+w/2, y+h/2);
  }
  else if(window[`img_${name}`].get(0, 0)[3] == 0) {
    image(window[`img_${name}_lowres`], x, y, w, h);
  }
  else {
    image(window[`img_${name}`], x, y ,w, h);
  }
  textSize(20*screenScale);
  textAlign(CENTER, TOP);
  fill('#DCD8D9');
  text(caption, x + w/2, y + h + 5);
}
