
var vert = `
attribute vec3 aPosition;
void main() {
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  gl_Position = positionVec4;
}
`;
const frag = `
precision mediump float;
uniform float uTime;
uniform vec2 uResolution;
uniform float uNumParticles;
uniform sampler2D uParticles;
uniform float uNumCoins;
uniform sampler2D uCoins;
uniform vec2 uPlanePos;
uniform vec2 uBGPos;
uniform sampler2D uPlane;
uniform sampler2D uPlaneProp;
uniform float uPlaneAngle;

vec4 exactTexture2D(sampler2D tex, vec2 size, vec2 pix) {
  vec2 halfPix = 0.5/size;
  vec2 coord = floor(pix);
  coord /= size;
  coord += halfPix;
  return texture2D(tex, coord);
}
float valueFromTexture2D(sampler2D tex, vec2 size, vec2 pix) {
  vec4 bytes = exactTexture2D(tex, size, pix)*255.0;
  return (bytes.r*65536.0) + (bytes.g*256.0) + (bytes.b);
}

float hash(float p) { p = fract(p * 0.011); p *= p + 7.5; p *= p + p; return fract(p); }
float hash(vec2 p) {vec3 p3 = fract(vec3(p.xyx) * 0.13); p3 += dot(p3, p3.yzx + 3.333); return fract((p3.x + p3.y) * p3.z); }

float noise(float x) {
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(hash(i), hash(i + 1.0), u);
}
float noise(vec2 x) {
    vec2 i = floor(x);
    vec2 f = fract(x);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
#define NUM_NOISE_OCTAVES 4
float octaveNoise(vec2 x) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100);
  // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
  for (int i = 0; i < NUM_NOISE_OCTAVES; ++i) {
    v += a * noise(x);
    x = rot * x * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

float random (vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}
float sq(float n) {
  return n * n;
}
float p4(float n) {
  return n*n*n*n;
}
void background() {
  float n = octaveNoise((gl_FragCoord.xy-uBGPos)/100.);
  vec3 color = vec3(0.6, 0.6, 0.6);
  if(n < 0.3) {
    color = vec3(0.0, 0.0, 1.0);
  }
  else if(n < 0.4) {
    color = vec3(194./255., 178./255., 128./255.);
  }
  else if(n < 0.65) {
    color = vec3(0.0, 1.4-n*1.4, 0.0);
  }
  gl_FragColor = vec4(color, 1.0);
}

void coins() {
  if(uNumCoins < 1.0) {
    return;
  }
  vec2 st = gl_FragCoord.xy;
  for(float c = 0.; c < 100.; c++) {
    if(c == uNumCoins) {
      return;
    }
    const float cw1 = 20.;
    const float cw2 = 5.;
    const vec4 lightGold = vec4(236./255.,186./255.,74./255., 1.0);
    const vec4 darkGold = vec4(170./255.,108./255.,57./255., 1.0);
    vec2 size = vec2(4, uNumCoins);
    float x = valueFromTexture2D(uCoins, size, vec2(0, c));
    float y = valueFromTexture2D(uCoins, size, vec2(1, c));
    float t = valueFromTexture2D(uCoins, size, vec2(2, c));
    float d = valueFromTexture2D(uCoins, size, vec2(3, c));
    x -= x*sq(d)/sq(20.);
    y -= y*sq(d)/sq(20.);
    x = st.x - x;
    y = st.y - y;
    t /= 10.;
    if(abs(x) < cw1 && abs(y) < cw1) {
      float scale = 1.-(1./exp2(t*5.));
      float w1 = cw1 * scale;
      float w2 = cw2 * scale;
      float offset = cos(t)*w2/2.;
      float spin = sin(t);
      float dist = sqrt(sq(w1)-sq(y));
      if(spin < 0.) {
        if(sq((x-offset)/spin)+sq(y) <= sq(w1)) {//green
          gl_FragColor = lightGold;
        }
        if(-abs(offset)-abs(spin*dist) < x && x < abs(offset)+abs(spin*dist)) {//blue
          gl_FragColor = darkGold;
        }
        if(sq((x+offset)/spin)+sq(y) <= sq(w1)) {//red
          gl_FragColor = lightGold;
        }
      }
      else {
        if(sq((x+offset)/spin)+sq(y) <= sq(w1)) {//red
          gl_FragColor = lightGold;
        }
        if(-abs(offset)-abs(spin*dist) < x && x < abs(offset)+abs(spin*dist)) {//blue
          gl_FragColor = darkGold;
        }
        if(sq((x-offset)/spin)+sq(y) <= sq(w1)) {//green
          gl_FragColor = lightGold;
        }
      }
    }
  }
}

void particles() {
  if(uNumParticles < 1.0) {
    return;
  }
  vec2 st = gl_FragCoord.xy;
  for(float p = 0.; p < 100.; p++) {
    if(p == uNumParticles) {
      return;
    }
    vec2 size = vec2(5, uNumParticles);
    float x = valueFromTexture2D(uParticles, size, vec2(0, p));
    float y = valueFromTexture2D(uParticles, size, vec2(1, p));
    float t = valueFromTexture2D(uParticles, size, vec2(2, p));
    float s = valueFromTexture2D(uParticles, size, vec2(3, p));
    float sp = valueFromTexture2D(uParticles, size, vec2(4, p));

    if(abs(st.x-x) < 50.0 && abs(st.y-y) < 50.0) {
      for(float i = 0.; i < 3.; i++) {
        float angle = random(vec2(x+i, y+5.)*s)*2.*3.14;
        float speed = random(vec2(x+i, y+10.)*s)*sp+sp;
        float size = random(vec2(x+i, y+15.)*s)*5.+5.;
        float life = random(vec2(x+i, y+20.)*s)*30.+30.;
        float scale = -exp(t-life)+1.;
        if(scale <= 0.) {
          continue;
        }
        float distance = 1.-(1./exp2(t/15.));
        float px = cos(angle)*distance*speed;
        float py = sin(angle)*distance*speed;
        if(sq(px+x-st.x)+sq(py+y-st.y) < sq(size*scale)) {
          gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
          return;
        }
      }
    }
  }
}
void plane() {
  vec2 pos = gl_FragCoord.xy - uPlanePos;
  float a = uPlaneAngle;
  vec2 coord = gl_FragCoord.xy;
  coord -= uPlanePos;
  coord = coord/uResolution*(uResolution/vec2(225, 225));
  coord *= 1.5;
  coord = vec2(coord.x*cos(a) - coord.y*sin(a), coord.y*cos(a) + coord.x*sin(a));
  vec2 propCoord = coord / vec2(1, sin(uTime/2.)*1.2);
  coord += 0.5;
  propCoord += 0.5;
  vec4 col = texture2D(uPlane, coord);
  gl_FragColor = col.a*vec4(1.0, 1.0, 1.0, 1.0) + (1.-col.a)*gl_FragColor;
  col = texture2D(uPlaneProp, propCoord);
  gl_FragColor = col.a*vec4(1.0, 1.0, 1.0, 1.0) + (1.-col.a)*gl_FragColor;
  if(fract(uTime / 80.) < 0.05) {
    vec2 right = vec2(8, 35);
    right = vec2(right.x*cos(-a) - right.y*sin(-a), right.y*cos(-a) + right.x*sin(-a));
    right += uPlanePos;
    float d = sqrt(sq(gl_FragCoord.x-right.x) + sq(gl_FragCoord.y-right.y));
    d = sq(15.) /  sq(d+15.);
    gl_FragColor = d*vec4(0.8, 0.0, 0.0, 1.0) + (1.-d)*gl_FragColor;
    
    vec2 left = vec2(8, -35);
    left = vec2(left.x*cos(-a) - left.y*sin(-a), left.y*cos(-a) + left.x*sin(-a));
    left += uPlanePos;
    d = sqrt(sq(gl_FragCoord.x-left.x) + sq(gl_FragCoord.y-left.y));
    d = sq(15.) /  sq(d+15.);
    gl_FragColor = d*vec4(0.0, 0.8, 0.0, 1.0) + (1.-d)*gl_FragColor;
  }
}

void main() {
  background();
  coins();
  particles();
  plane();
}
`;

var theShader;
var particles = [];
var coins = [];
var time = 0;
let plane;
function setup() {
  document.title = 'Plane Game';
  createCanvas(windowWidth, windowHeight, WEBGL);
  theShader = createShader(vert, frag);
  for(let i = 0; i < 10; i++) {
    coins.push(newCoin());
  }
  plane = {
    x: width/2,
    y: height/2,
    a: -PI/2,
    bgx: 0,
    bgy: 0,
    img: loadImage('plane.png'),
    propImg: loadImage('plane_prop.png')
  };
}
function newParticle(_x, _y, _sp) {
  return {x: _x, y: _y, t: 0, s: random(1, 100), sp: _sp};
}
function newCoin() {
  let x = 0;
  let y = 0;
  do {
    x = random(-1, 1);
    y = random(-1, 1);
  }
  while(x*x*x*x + y*y*y*y > 0.7);
  return {x: x*width/2+width/2, y: y*height/2+height/2, t: 0, d: 0};
}
class ArrayImage {
  constructor(_size, _len) {
    this.size = _size;
    this.len = _len
    this.image = createImage(this.size, this.len);
    this.image.loadPixels();
  }
  setValue(index, pos, value) {
    let v1 = int(value/65536)%256;
    let v2 = int(value/256)%256;
    let v3 = int(value)%256;
    this.image.pixels[index*4*this.size + pos*4 + 0] = v1;
    this.image.pixels[index*4*this.size + pos*4 + 1] = v2;
    this.image.pixels[index*4*this.size + pos*4 + 2] = v3;
    this.image.pixels[index*4*this.size + pos*4 + 3] = 255;
  }
  setColor(index, pos, col) {
    this.image.pixels[index*4*this.size + pos*4 + 0] = red(col);
    this.image.pixels[index*4*this.size + pos*4 + 1] = green(col);
    this.image.pixels[index*4*this.size + pos*4 + 2] = blue(col);
    this.image.pixels[index*4*this.size + pos*4 + 3] = alpha(col);
  }
  getImage() {
    this.image.updatePixels();
    return this.image;
  }
}

function draw() {
  time++;
  let mouse = closestMouse(plane.x, plane.y);
  plane.a = lerpAngle(plane.a, atan2(mouse.y-plane.y, mouse.x-plane.x), 0.05);
  plane.x += cos(plane.a) * 5;
  plane.y += sin(plane.a) * 5;
  plane.bgx -= cos(plane.a) * 0.5;
  plane.bgy -= sin(plane.a) * 0.5;
  const planeMargin = 20;
  if(plane.x < -planeMargin) {
    plane.x = width+planeMargin;
  }
  if(plane.x > width + planeMargin) {
    plane.x = -planeMargin;
  }
  if(plane.y < -planeMargin) {
    plane.y = height+planeMargin;
  }
  if(plane.y > height+planeMargin) {
    plane.y = -planeMargin;
  }
  for(let i = coins.length-1; i >= 0; i--) {
    if(coins[i].d > 0) {
      coins[i].d++;
      if(coins[i].d == 30) {
        coins.splice(i, 1);
      }
    }
    else if(sq(plane.x-coins[i].x) + sq(plane.y-(height-coins[i].y)) < sq(45)) {
      for(let j = 0; j < 5; j++) {
        let a = random(0, TWO_PI);
        let d = random(5, 15);
        particles.push(newParticle(coins[i].x+cos(a)*d, coins[i].y + sin(a)*d, 25));
      }
      coins[i].d = 1;
      coins.push(newCoin());
    }
  }
  
  particles.push(newParticle(plane.x, height-plane.y, 10));
  if(particles.length > 0) {
    let array = new ArrayImage(5, particles.length);
    for(let i = particles.length-1; i >= 0; i--) {
      array.setValue(i, 0, particles[i].x);
      array.setValue(i, 1, particles[i].y);
      array.setValue(i, 2, particles[i].t);
      array.setValue(i, 3, particles[i].s);
      array.setValue(i, 4, particles[i].sp);
      particles[i].t++;
    }
    theShader.setUniform('uParticles', array.getImage());
  }
  if(coins.length > 0) {
    let array = new ArrayImage(4, coins.length);
    for(let i = coins.length-1; i >= 0; i--) {
      array.setValue(i, 0, coins[i].x);
      array.setValue(i, 1, coins[i].y);
      array.setValue(i, 2, coins[i].t);
      array.setValue(i, 3, coins[i].d);
      coins[i].t++;
    }
    theShader.setUniform('uCoins', array.getImage());
  }
  theShader.setUniform('uTime', time);
  theShader.setUniform('uNumParticles', particles.length);
  theShader.setUniform('uNumCoins', coins.length);
  theShader.setUniform('uResolution', [width, height]);
  theShader.setUniform('uPlanePos', [plane.x, height-plane.y]);
  theShader.setUniform('uBGPos', [plane.bgx, height-plane.bgy]);
  theShader.setUniform('uPlane', plane.img);
  theShader.setUniform('uPlaneProp', plane.propImg);
  theShader.setUniform('uPlaneAngle', plane.a);
  shader(theShader);
  noStroke();
  fill(0, 0, 200);
  rect(0, 0, width, height);
  resetShader();
  while(true) {
    if(particles[0].t >= 60) {
      particles.shift();
    }
    else {
      break;
    }
  }
}

function closestMouse(x, y) {
  let m = [
    {x: mouseX, y: mouseY},
    {x: mouseX+width, y: mouseY},
    {x: mouseX-width, y: mouseY},
    {x: mouseX, y: mouseY+height},
    {x: mouseX, y: mouseY-height}
  ];
  let close = m[0];
  let dist = sq(x-m[0].x) + sq(y-m[0].y);
  for(let i = 1; i < 5; i++) {
    let d = sq(x-m[i].x) + sq(y-m[i].y);
    if(d < dist) {
      dist = d;
      close = m[i]
    }
  }
  return close;
}

function sign(n) {return n / abs(n);}

function lerpAngle(a, b, v) {
  if(a == b) {
    return a;
  }
  let x = (1-v)*cos(a)+v*cos(b);
  let y = (1-v)*sin(a)+v*sin(b);
  return atan2(y, x);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
