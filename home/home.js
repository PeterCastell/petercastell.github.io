function setup() {
  document.title = "SHAD Application";
  createCanvas(window.innerWidth, window.innerHeight);
  document.body.style.background = '#36393F';
  screenScale = screen.height/768;
  buttons = [
    new Button('../inky-text', 'Inky Text', `
    A graphical representation of
    distance fields that blends text
    by rendering the sum of the 
    reciprocals of distances from
    pixels to multiple objects.`),
    new Button('../plane-game', 'Plane Flight', `
    A game that demonstates
    shader-based graphics and
    gameplay logic.`),
    new Button('../go-kart', 'Go-Kart', `
    Photos and a description
    of a go-kart I made out of
    a hoverboard and arduino.`),
    new Button('../space-camp', 'Space Camp', `
    Photos and a description of
    my time in space camp at the
    US Space and Rocket Center.`)
  ];
  
  describingButton = buttons[0];
}
function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}

function mouseMoved() {
  for(let button of buttons) {
    button.hover();
  }
}
function mousePressed() {
  for(let button of buttons) {
    button.click();
  }
}

function draw() {
  background('#36393F');
  textAlign(CENTER, CENTER);
  fill('#DCD8D9');
  textSize(80*screenScale);
  let x = width/2;
  let y = 100*screenScale;
  let a = atan2(mouseY-y, mouseX-x);
  let d = sqrt(sq(mouseX-x) + sq(mouseY-y))/10;
  x += cos(a) * d*screenScale;
  y += sin(a) * d*screenScale;
  text("Peter's SHAD Website", x, y);
  textSize(30*screenScale);
  text(`
  My name is Peter and I like to
  program games, visual effects and
  other small projects as experiments.`, width/2, height-150*screenScale);
  let spacing = 60;
  for(let i = 0; i < buttons.length; i++) {
    buttons[i].draw(width/2, height/2-((buttons.length-1)/2*60*screenScale) + i*spacing*screenScale);
  }
  translate(width/2 + 100*screenScale, height/2);
  scale(describingButton.lerp, 1);
  textAlign(LEFT, CENTER);
  text(describingButton.description, 0, 0);
}

class Button {
  constructor(_link, _text, _description) {
    this.link = _link;
    this.text = _text;
    this.description = _description;
    this.margin = 0;
    this.lerp = 0;
    this.hovered = false;
    textSize(30*screenScale);
    this.textWidth = textWidth(this.text);
  }
  draw(x, y) {
    this.x = x;
    this.y = y;
    textAlign(CENTER, CENTER);
    textSize(30*screenScale);
    rectMode(CENTER);
    fill('#536AF1');
    noStroke();
    let target = this.hovered? 1: 0;
    this.lerp += (target - this.lerp) * 0.1;
    this.margin = (1+this.lerp)*10*screenScale;
    rect(x, y, this.textWidth+this.margin, 30*screenScale+this.margin, this.margin);
    fill('#DCD8D9');
    text(this.text, x, y);
    if(this.hovered) {
      describingButton = this;
    }
  }
  hover() {
    this.hovered = abs(mouseX-this.x) < (this.textWidth+this.margin)/2 && abs(mouseY-this.y) < (30+this.margin)/2;
  }
  click() {
    if(this.hovered) {
      location.href = this.link;
    }
  }
}
