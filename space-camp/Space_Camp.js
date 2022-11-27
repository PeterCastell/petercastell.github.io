
const HEIGHT = 4200
function setup() {
  screenScale = screen.height/768;
  document.title = "Space Camp";
  document.body.style.background = '#36393F';
  createCanvas(window.innerWidth, HEIGHT*screenScale);
  
  for(let n of [
    'artemis',
    'canadarm',
    'eva',
    'graduation',
    'rocket',
    'spin',
    'team'
  ]) {
    loadSmartImage(n);
  }
  
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
  text("My trip to Space Camp", width/2, 100*screenScale);
  
  textSize(25*screenScale);
  textAlign(LEFT, BOTTOM);
  text(`
  August last summer, I travelled to Huntsville, Alabama to attend the Advanced Space Academy program at
  the U.S. Space and Rocket Center. I worked in a team of 11 to complete chalenges and activities relating
  to engineering and space flight.
  `.fm(), 50*screenScale, 275*screenScale);
  
  smartImage('team', 50*screenScale, 300*screenScale, (3300/5)*screenScale, (2550/5)*screenScale, 'My Space Camp team. (I am fourth from the right)');
  
  
  textSize(25*screenScale);
  textAlign(RIGHT, TOP);
  fill('#DCD8D9');
  text(`
  
  `.fm(), width-50*screenScale, 650*screenScale);
  
  smartImage('artemis', width-50*screenScale-(6000/8)*screenScale, 900*screenScale, (6000/8)*screenScale, (4000/8)*screenScale, 'Commanding the Artemis.');

  
  textSize(25*screenScale);
  textAlign(LEFT, TOP);
  fill('#DCD8D9');
  text(`
  One kind of activity I did with my
  group was mission simulations.
  In this mission, veryone was
  assigned a role in Mission Control,
  the Artemis rocket, or on Phobos
  station. I took the role of commander
  on the Artemis and lead the crew to
  the Mars ground base and back.
  `.fm(), 50*screenScale, 1000*screenScale);
  
  smartImage('canadarm', 50*screenScale, 1450*screenScale, (6000/10)*screenScale, (4000/10)*screenScale, 'Controlling a model of the Canadarm.');
  smartImage('eva', 50*screenScale, 1900*screenScale, (6000/10)*screenScale, (4000/10)*screenScale, 'Making repairs to a satellite from the Canadarm.');
  
  textSize(25*screenScale);
  textAlign(RIGHT, TOP);
  fill('#DCD8D9');
  text(`
  On another mission, I performed
  an Extra Vehicular Activity (EVA) to repair
  a satellite from a space shuttle. I used a
  downscaled working model of the Canadarm
  to move towards the satellite to repair it.
  `.fm(), width-50*screenScale, 1800*screenScale);
  
  smartImage('spin', width-50*screenScale-(4000/10)*screenScale, 2400*screenScale, (4000/10)*screenScale, (6000/10)*screenScale, 'In an MAT.');
  smartImage('rocket', width-100*screenScale-(8000/10)*screenScale, 2400*screenScale, (4000/10)*screenScale, (6000/10)*screenScale, 'Preparing to launch our model rocket.');
  
  textSize(25*screenScale);
  textAlign(LEFT, TOP);
  fill('#DCD8D9');
  text(`
  Other activities I did with my group
  include using Multi-Axis Trainers
  (MATs) and launching model rockets.
  Our group divided into three smaller
  groups to design, build and launch
  rockets to carry an egg as a payload
  all within a budget while competing
  against other teams.
  `.fm(), 50*screenScale, 2600*screenScale);
  
  smartImage('graduation', 50*screenScale, 3100*screenScale, (5304/8)*screenScale, (7952/8)*screenScale, 'Graduating with my certificate and awards.');
  textSize(25*screenScale);
  textAlign(RIGHT, TOP);
  fill('#DCD8D9');
  text(`
  At the end of my week at Space Camp, my team
  graduated with the outstanding team award.
  This award is given to the team that
  demonstrated the most colaboration and teamwork.
  I enjoyed my time at Space Camp and I learned
  a lot about teamwork and engineering.
  `.fm(), width-50*screenScale, 3500*screenScale);
}

function loadSmartImage(name) {
  window[`img_${name}`] = loadImage(`images/${name}.jpeg`);
  window[`img_${name}_lowres`] = loadImage(`images/${name}_lowres.jpeg`);
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
