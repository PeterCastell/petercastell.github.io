
let theShader;

let vert = `
//start of vert
attribute vec3 aPosition;

// P5 provides us with texture coordinates for most shapes
attribute vec2 aTexCoord;

// This is a varying variable, which in shader terms means that it will be passed from the vertex shader to the fragment shader
varying vec2 vTexCoord;

void main() {
  // Copy the texcoord attributes into the varying variable
  vTexCoord = aTexCoord;
   
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

  gl_Position = positionVec4;
}
//end of vert
`;
let frag = `
//start of frag
precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform sampler2D uTexture3;

uniform float uWidth;
uniform float uHeight;

uniform vec2 uBall1;
uniform vec2 uBall2;
uniform vec2 uBall3;
uniform vec2 uMouse;

float sq(float n){return n*n;}

void main() {
  vec2 st = gl_FragCoord.xy;
  vec4 color1 = texture2D(uTexture1, vec2((st.x/uWidth)*(uWidth/1055.0), 1.0-(st.y/uHeight)*(uHeight/200.0)));
  vec4 color2 = texture2D(uTexture2, vec2((st.x/uWidth)*(uWidth/900.0), (1.0-(st.y/uHeight))*(uHeight/200.0)));
  vec4 color3 = texture2D(uTexture3, vec2(0.5-((uMouse.x/uWidth)-(st.x/uWidth))*(uWidth/615.0), 0.5+(1.0-(uMouse.y/uHeight)-(st.y/uHeight))*(uHeight/200.0)));
  
  float b1 = 225.0/sqrt(pow(uBall1.x-st.x, 2.0) + pow(uHeight-uBall1.y - st.y, 2.0));
  float b2 = 225.0/sqrt(pow(uBall2.x-st.x, 2.0) + pow(uHeight-uBall2.y - st.y, 2.0));
  float b3 = 225.0/sqrt(pow(uBall3.x-st.x, 2.0) + pow(uHeight-uBall3.y - st.y, 2.0));
  float v1 = 1.0/color1.r;
  float v2 = 1.0/color2.r;
  float v3 = 1.0/color3.r;
  if(v1+v2+v3+b1+b2+b3 >= 10.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
  else {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }

}
//end of frag
`;

function preload() {
  img1 = loadImage("distMap1.png");
  img2 = loadImage("distMap2.png");
  img3 = loadImage("distMap3.png");
}
function setup() {
  document.title = "I DID THIS";
  createCanvas(windowWidth, windowHeight, WEBGL);
  document.getElementById('defaultCanvas0').style.cursor = "none";
  theShader = createShader(vert, frag);
  noStroke();
  ball1 = new Ball();
  ball2 = new Ball();
  ball3 = new Ball();
}
class Ball {
  constructor() {
    this.x = width/2;
    this.y = height/2;
    this.vx = random(1, -1);
    this.vy = random(1, -1);
    this.vx += sign(this.vx);
    this.vy += sign(this.vy);
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if(this.x < 25 || this.x > width-25) {
      this.vx *= -1;
    }
    if(this.y < 25 || this.y > height-25) {
      this.vy *= -1;
    }
  }
  uniform() {
    return [this.x, this.y];
  }
}
function sign(n){return n/abs(n);}
function draw() {
  ball1.update();
  ball2.update();
  ball3.update();
  theShader.setUniform('uTexture1', img1);
  theShader.setUniform('uTexture2', img2);
  theShader.setUniform('uTexture3', img3);
  theShader.setUniform('uWidth', width);
  theShader.setUniform('uHeight', height);
  theShader.setUniform('uMouse', [mouseX, mouseY]);
  theShader.setUniform('uBall1', ball1.uniform());
  theShader.setUniform('uBall2', ball2.uniform());
  theShader.setUniform('uBall3', ball3.uniform());
  shader(theShader);
  rect(0, 0, width, height);
}

function mousePressed() {
  time = 0;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
