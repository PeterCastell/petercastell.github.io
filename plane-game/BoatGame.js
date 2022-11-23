
const MaxParticles = 100;
const MaxCoins = 20;
const MaxMissiles = 20;
const ParticlesPerSource = 5;

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
uniform sampler2D uScoreboard;
uniform sampler2D uMissile;
uniform sampler2D uMissiles;
uniform float uNumMissiles;
uniform sampler2D uInactive;
uniform float uActiveFade;
uniform bool uPlaneDead;

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
  float n = octaveNoise((gl_FragCoord.xy-uBGPos)/100.+vec2(-1000, 1000));
  vec3 color;
  if(n < 0.35) {
    color = vec3(0.0, 0.0, n+0.5);
  }
  else if(n < 0.4) {
    color = vec3(194./255., 178./255., 128./255.);
  }
  else if(n < 0.65) {
    color = vec3(0.0, 1.4-n*1.4, 0.0);
  }
  else {
    float c = n-0.1;
    color = vec3(c, c, c);
  }
  gl_FragColor = vec4(color, 1.0);
}

void coins() {
  if(uNumCoins < 1.0) {
    return;
  }
  const float cw1 = 20.;
  const float cw2 = 5.;
  const vec4 lightGold = vec4(236./255.,186./255.,74./255., 1.0);
  const vec4 darkGold = vec4(170./255.,108./255.,57./255., 1.0);
  vec2 st = gl_FragCoord.xy;
  for(float c = 0.; c < ${MaxCoins}.; c++) {
    if(c == uNumCoins) {
      return;
    }
    vec2 size = vec2(4, ${MaxCoins});
    float x = valueFromTexture2D(uCoins, size, vec2(0, c));
    float y = valueFromTexture2D(uCoins, size, vec2(1, c));
    float d = valueFromTexture2D(uCoins, size, vec2(3, c));
    x -= x*sq(d)/sq(20.);
    y -= y*sq(d)/sq(20.);
    x = st.x - x;
    y = st.y - y;
    if(abs(x) < cw1 && abs(y) < cw1) {
      float t = valueFromTexture2D(uCoins, size, vec2(2, c));
      t /= 10.;
    
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
void missiles() {
  if(uNumMissiles < 1.0) {
    return;
  }
  vec2 st = gl_FragCoord.xy;
  for(float m = 0.; m < ${MaxMissiles}.; m++) {
    if(m == uNumMissiles) {
      return;
    }
    vec2 size = vec2(3, ${MaxMissiles});
    float x = valueFromTexture2D(uMissiles, size, vec2(0, m)) - 100.;
    float y = valueFromTexture2D(uMissiles, size, vec2(1, m)) - 100.;
    float a = valueFromTexture2D(uMissiles, size, vec2(2, m));
    a /= 10000.;
    a += 3.14159;
    
    vec2 coord = gl_FragCoord.xy;
    coord -= vec2(x, y);
    coord = vec2(coord.x*cos(-a) - coord.y*sin(-a), coord.y*cos(-a) + coord.x*sin(-a));
    coord = coord/uResolution*(uResolution/vec2(120, 58));
    coord *= 2.;
    coord += 0.5;
    if(coord.x > 0. && coord.y > 0. && coord.x < 1. && coord.y < 1.) {
      vec4 col = texture2D(uMissile, coord);
      gl_FragColor = col.a*vec4(0.0, 0.0, 0.0, 1.0) + (1.-col.a)*gl_FragColor;
    }
  }
}

void particles() {
  if(uNumParticles < 1.0) {
    return;
  }
  vec2 st = gl_FragCoord.xy;
  for(float p = 0.; p < ${MaxParticles}.; p++) {
    if(p == uNumParticles) {
      return;
    }
    vec2 size = vec2(6, ${MaxParticles});
    float x = valueFromTexture2D(uParticles, size, vec2(0, p));
    float y = valueFromTexture2D(uParticles, size, vec2(1, p));
    if(abs(st.x-x) < 50.0 && abs(st.y-y) < 50.0) {
      float t = valueFromTexture2D(uParticles, size, vec2(2, p));
      float s = valueFromTexture2D(uParticles, size, vec2(3, p));
      float sp = valueFromTexture2D(uParticles, size, vec2(4, p));
      vec4 col = exactTexture2D(uParticles, size, vec2(5, p));
      for(float i = 0.; i < ${ParticlesPerSource}.; i++) {
        float life = random(vec2(x+i, y+20.)*s)*30.+30.;
        float scale = -exp(t-life)+1.;
        if(scale <= 0.) {
          continue;
        }
        float angle = random(vec2(x+i, y+5.)*s)*2.*3.14;
        float speed = random(vec2(x+i, y+10.)*s)*sp+sp;
        float size = random(vec2(x+i, y+15.)*s)*5.+5.;
        float distance = 1.-(1./exp2(t/15.));
        float px = cos(angle)*distance*speed;
        float py = sin(angle)*distance*speed;
        if(sq(px+x-st.x)+sq(py+y-st.y) < sq(size*scale)) {
          gl_FragColor = col;
          return;
        }
      }
    }
  }
}
void plane() {
  if(uPlaneDead) {
    return;
  }
  float a = uPlaneAngle;
  vec2 coord = gl_FragCoord.xy;
  coord -= uPlanePos;
  coord = coord/uResolution*(uResolution/vec2(225, 225));
  coord *= 1.5;
  coord = vec2(coord.x*cos(a) - coord.y*sin(a), coord.y*cos(a) + coord.x*sin(a));
  vec2 propCoord = coord / vec2(1, sin(uTime/2.)*1.2);
  coord += 0.5;
  propCoord += 0.5;
  if(coord.x > 0. && coord.y > 0. && coord.x < 1. && coord.y < 1.) {
    vec4 col = texture2D(uPlane, coord);
    gl_FragColor = col.a*vec4(1.0, 1.0, 1.0, 1.0) + (1.-col.a)*gl_FragColor;
    col = texture2D(uPlaneProp, propCoord);
    gl_FragColor = col.a*vec4(1.0, 1.0, 1.0, 1.0) + (1.-col.a)*gl_FragColor;
  }
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
void scoreboard() {
  vec2 coord = gl_FragCoord.xy/uResolution*vec2(1., uResolution.y/30.);
  coord = vec2(coord.x, 1.-coord.y);
  if(coord.y > 0.) {
    vec4 col = texture2D(uScoreboard, coord);
    gl_FragColor = col.a*col + (1.-col.a)*gl_FragColor;
  }
}
void inactive() {
  if(uActiveFade < 0.1) {
    return;
  }
  float bgfade = uActiveFade/2.;
  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0)*bgfade + (1.-bgfade)*gl_FragColor;
  vec2 coord = gl_FragCoord.xy/uResolution;
  coord = vec2(coord.x, 1.-coord.y);
  vec4 col = texture2D(uInactive, coord);
  float alpha = col.a * uActiveFade;
  gl_FragColor = alpha*col + (1.-alpha)*gl_FragColor;
}

void main() {
  background();
  coins();
  particles();
  missiles();
  plane();
  scoreboard();
  inactive();
}
`;

var theShader;
var particles = [];
var coins = [];
var time;
var plane;
var missiles = [];
var missileImg;
var PAImg, CAImg, MAImg;
var difficulty;
var missileSpawn;
var active = false;
var inactiveText;
var activeFade = 0;

function resetGame() {
  time = 0;
  plane = {
    x: width/2,
    y: height/2,
    a: -PI/2,
    bgx: 0,
    bgy: 0,
    img: loadImage('plane.png'),
    propImg: loadImage('plane_prop.png'),
    dead: -1
  };
  score = 0;
  pointCoins = [];
  loadScore();
  loadDifficulty();
  
  missiles = [];
  missileSpawn = 300;
}
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  document.title = "Plane Game";
  frameRate(30);
  theShader = createShader(vert, frag);
  for(let i = 0; i < 10; i++) {
    coins.push(newCoin());
  }
  resetGame();
  
  missileImg = loadImage('missile.png');
  sbGraphics = createGraphics(width, 30, P2D);
  inactiveText = createGraphics(width, height, P2D);
  
  PAImg = new ArrayImage(6, MaxParticles);
  CAImg = new ArrayImage(4, MaxCoins);
  MAImg = new ArrayImage(3, MaxCoins);
}
function loadScore() {
  score = localStorage.getItem('plane-game-score');
  let s = score;
  let i = 0;
  while(s > 0) {
    let c = s % 3;
    for(let j = 0; j < c; j++) {
      addPointCoin(i);
    }
    i++;
    s -= c;
    s /= 3;
  }
}
function loadDifficulty() {
  difficulty = localStorage.getItem('plane-game-difficulty');
}
function keyPressed() {
  active = !active;
}
function newParticle(_x, _y, _sp, _col) {
  return {x: _x, y: _y, t: 0, s: random(1, 100), sp: _sp, col: _col};
}
function newCoin() {
  let x = 0;
  let y = 0;
  do {
    x = random(-1, 1);
    y = random(-1, 1);
  }
  while(x*x*x*x + y*y*y*y > 0.6);
  return {x: x*width/2+width/2, y: y*height/2+height/2, t: 0, d: 0};
}
function newMissile() {
  let x, y;
  switch(floor(random(0, 4))) {
    case 0: x = -10; y = random(10, height-10); break;
    case 1: x = width+10; y = random(10, height-10); break;
    case 2: y = -10; x = random(10, width-10); break;
    case 3: y = height+10; x = random(10, width-10); break;
  }
  return {x: x, y: y, a: atan2(plane.y-y, plane.x-x), t: 0};
}
class ArrayImage {
  constructor(_size, _max) {
    this.size = _size;
    this.max = _max;
    this.image = createImage(this.size, this.max);
    this.image.loadPixels();
  }
  setValue(index, pos, value) {
    if(index >= max) {
      return;
    }
    let v1 = int(value/65536)%256;
    let v2 = int(value/256)%256;
    let v3 = int(value)%256;
    this.image.pixels[index*4*this.size + pos*4 + 0] = v1;
    this.image.pixels[index*4*this.size + pos*4 + 1] = v2;
    this.image.pixels[index*4*this.size + pos*4 + 2] = v3;
    this.image.pixels[index*4*this.size + pos*4 + 3] = 255;
  }
  setColor(index, pos, col) {
    if(index >= max) {
      return;
    }
    this.image.pixels[index*4*this.size + pos*4 + 0] = red(col);
    this.image.pixels[index*4*this.size + pos*4 + 1] = green(col);
    this.image.pixels[index*4*this.size + pos*4 + 2] = blue(col);
    this.image.pixels[index*4*this.size + pos*4 + 3] = alpha(col);
  }
  getImage(len) {
    this.image.updatePixels();
    return this.image;
  }
}

function draw() {
  if(active) {
    activeFade = lerp(activeFade, 0, 0.5);
  }
  else {
    activeFade = lerp(activeFade, 1, 0.5);
  }
  if(active) {
    time++;
    missileSpawn--;
    if(missileSpawn <= 0) {
      missiles.push(newMissile());
      const s = 100;
      difficulty++;
      localStorage.setItem('plane-game-difficulty', difficulty);
      missileSpawn = 60*3*s/(difficulty+s);
    }
    if(plane.dead == -1) {
      let mouse = {x: mouseX, y: mouseY};
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
      if(time % 3 == 0) {
        particles.push(newParticle(plane.x, height-plane.y, 10, color(255)));
      }
      for(let i = coins.length-1; i >= 0; i--) {
        if(coins[i].d > 0) {
          coins[i].d++;
          if(coins[i].d == 20) {
            coins.splice(i, 1);
            score++;
            localStorage.setItem('plane-game-score', score)
            addPointCoin(0);
          }
        }
        else if(sq(plane.x-coins[i].x) + sq(plane.y-(height-coins[i].y)) < sq(45)) {
          for(let j = 0; j < 5; j++) {
            let a = random(0, TWO_PI);
            let d = random(5, 15);
            particles.push(newParticle(coins[i].x+cos(a)*d, coins[i].y + sin(a)*d, 25, color(236,186,74)));
          }
          coins[i].d = 1;
          coins.push(newCoin());
        }
      }
      for(let i = missiles.length-1; i >= 0; i--) {
        if(missiles[i].x < 15 || missiles[i].y < 15 || missiles[i].x > width+15 || missiles[i].y > height+15) {
          missiles.splice(i, 1);
          continue;
        }
        if(sq(plane.x-missiles[i].x) + sq(plane.y-(height-missiles[i].y)) < sq(45)) {
          for(let j = 0; j < 5; j++) {
            let a = random(0, TWO_PI);
            let d = random(5, 15);
            particles.push(newParticle(missiles[i].x+cos(a)*d, missiles[i].y + sin(a)*d, 25, color(0)));
          }
          missiles.splice(i, 1);
          score = 0;
          difficulty = 0;
          localStorage.setItem('plane-game-score', score);
          localStorage.setItem('plane-game-difficulty', difficulty);
          plane.dead = 0;
        }
      }
    }
    else {
      plane.dead++;
      if(plane.dead == 60) {
        resetGame();
      }
    }
    if(missiles.length > 0) {
      for(let i = missiles.length-1; i >= 0; i--) {
        if(missiles[i].t < 80) {
          missiles[i].a = lerpAngle(missiles[i].a, atan2((height-plane.y)-missiles[i].y, plane.x-missiles[i].x), 0.05);
          missiles[i].x += cos(missiles[i].a)*2;
          missiles[i].y += sin(missiles[i].a)*2;
          if(missiles[i].t % 5 == 0) {
            particles.push(newParticle(missiles[i].x, missiles[i].y, 20, color(0)));
          }
        }
        else {
          missiles[i].x += cos(missiles[i].a)*10;
          missiles[i].y += sin(missiles[i].a)*10;
          if(missiles[i].t % 3 == 0) {
            particles.push(newParticle(missiles[i].x, missiles[i].y, 10, color(0)));
          }
        }
        MAImg.setValue(i, 0, missiles[i].x + 100);
        MAImg.setValue(i, 1, missiles[i].y + 100);
        MAImg.setValue(i, 2, (missiles[i].a+PI)*10000);
        if(active) {
          missiles[i].t++;
        }
      }
      theShader.setUniform('uMissiles', MAImg.getImage(coins.length));
    }
    if(particles.length > 0) {
      for(let i = particles.length-1; i >= 0; i--) {
        PAImg.setValue(i, 0, particles[i].x);
        PAImg.setValue(i, 1, particles[i].y);
        PAImg.setValue(i, 2, particles[i].t);
        PAImg.setValue(i, 3, particles[i].s);
        PAImg.setValue(i, 4, particles[i].sp);
        PAImg.setColor(i, 5, particles[i].col);
        particles[i].t++;
      }
      theShader.setUniform('uParticles', PAImg.getImage(particles.length));
    }
    if(coins.length > 0) {
      for(let i = coins.length-1; i >= 0; i--) {
        CAImg.setValue(i, 0, coins[i].x);
        CAImg.setValue(i, 1, coins[i].y);
        CAImg.setValue(i, 2, coins[i].t);
        CAImg.setValue(i, 3, coins[i].d);
        coins[i].t++;
      }
      theShader.setUniform('uCoins', CAImg.getImage(coins.length));
    }
  }
  theShader.setUniform('uTime', time);
  theShader.setUniform('uNumParticles', particles.length);
  theShader.setUniform('uNumCoins', coins.length);
  theShader.setUniform('uNumMissiles', missiles.length);
  theShader.setUniform('uResolution', [width, height]);
  theShader.setUniform('uPlanePos', [plane.x, height-plane.y]);
  theShader.setUniform('uBGPos', [plane.bgx, height-plane.bgy]);
  theShader.setUniform('uMissile', missileImg);
  theShader.setUniform('uPlane', plane.img);
  theShader.setUniform('uPlaneProp', plane.propImg);
  theShader.setUniform('uPlaneAngle', plane.a);
  theShader.setUniform('uPlaneDead', plane.dead != -1);
  
  sbGraphics.noStroke();
  sbGraphics.ellipseMode(CENTER);
  sbGraphics.fill(255);
  sbGraphics.rect(0, 0, sbGraphics.width, sbGraphics.height);
  let x = 15;
  for(let i = pointCoins.length-1; i >= 0 ; i--) {
    x += pointCoins[i].draw(sbGraphics, x);
  }
  for(let i = pointCoins.length-1; i >= 0 ; i--) {
    if(pointCoins[i].type == 'merge' && pointCoins[i].time == 60) {
      let ind = pointCoins[i].index;
      pointCoins.splice(i, 1);
      addPointCoin(ind + 1);
    }
  }
  sbGraphics.textSize(25);
  sbGraphics.fill(pointColors[floor(max(log3(score), 0))]);
  sbGraphics.textAlign(RIGHT, CENTER);
  sbGraphics.text(""+score, width-5, 15);
  theShader.setUniform('uScoreboard', sbGraphics);
  
  inactiveText.fill(255);
  inactiveText.textAlign(CENTER, CENTER);
  inactiveText.textSize(30);
  inactiveText.text("This game demonstrates GPU shaders\nas well as other game elements", width/2, 200);
  inactiveText.text("Collect the coins while avoiding the missiles.\n\nPress any key to play or pause.", width/2, height-200);
  theShader.setUniform('uInactive', inactiveText);
  theShader.setUniform('uActiveFade', activeFade);
  
  rect(0, 0, 100, 100);
  shader(theShader);
  noStroke();
  fill(0, 0, 200);
  rect(0, 0, width, height);
  resetShader();
  while(particles.length > 0) {
    if(particles[0].t >= 60) {
      particles.shift();
    }
    else {
      break;
    }
  }
}
function log3(n) {return log(n)/log(3);}
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
  sbGraphics = createGraphics(width, 30, P2D);
  inactiveText = createGraphics(width, height, P2D);
  if(plane.x > width) {
    plane.x = width;
  }
  if(plane.y > height) {
    plane.y = height;
  }
  for(let i = coins.length-1; i >= 0; i--) {
    if(coins[i].x > width) {
      coins[i].x = width;
    }
    if(coins[i].y > height) {
      coins[i].y = height;
    }
  }
}
let score = 0;
let pointCoins = [];
let pointColors = [
  'red',
  'orange',
  'yellow',
  'lime',
  'cyan',
  'blue',
  'purple',
  'magenta',
  'black'
];
let sbGraphics;

function addPointCoin(ind) {
  let count = 0;
  for(let coin of pointCoins) {
    if(coin.index == ind && coin.type == 'coin') {
      count ++;
    }
  }
  if(count == 2) {
    for(let i = pointCoins.length-1; i >=0 ; i--) {
      if(pointCoins[i].index == ind && pointCoins[i].type == 'coin') {
        pointCoins.splice(i, 1);
      }
    }
    let index = 255;
    let pos = pointCoins.length;
    for(let i = pointCoins.length-1; i >= 0; i--) {
      if(pointCoins[i].index <= index && pointCoins[i].index >= ind) {
        pos = i;
      }
    }
    pointCoins.splice(pos, 0, new PointCoinMerge(ind));
  }
  else {
    let index = 255;
    let pos = pointCoins.length;
    for(let i = pointCoins.length-1; i>= 0; i--) {
      if(pointCoins[i].index <= index && pointCoins[i].index >= ind) {
        pos = i;
      }
    }
    pointCoins.splice(pos, 0, new PointCoin(ind));
  }
}

class PointCoin {
  constructor(i) {
    this.index = i;
    this.type = 'coin';
  }
  draw(g, x) {
    g.fill(pointColors[this.index]);
    g.circle(x, 15, 30);
    return 30;
  }
}
class PointCoinMerge {
  constructor(i) {
    this.index = i;
    this.time = 0;
    this.type = 'merge';
  }
  draw(g, x) {
    this.time++;
    g.fill(pointColors[this.index]);
    g.circle(x, 15, 30);
    g.circle(x + 30 - this.time/2, 15, 30);
    g.circle(x + 60 - this.time, 15, 30);
    return 90 - this.time;
  }
}
