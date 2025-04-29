let stars = [];
let bgMusic;
let palettes = [
  { bg: [260, 20, 10], star: [240, 20, 100], line: [240, 20, 80] },
  { bg: [260, 20, 10], star: [320, 30, 100], line: [320, 30, 80] },
  { bg: [260, 20, 10], star: [200, 30, 100], line: [200, 30, 80] },
  { bg: [260, 20, 10], star: [60, 30, 100], line: [60, 30, 80] },
  { bg: [260, 20, 10], star: [10, 30, 100], line: [10, 30, 80] },
];
let currentPalette = 0;
let mouseGravity = false;
let zoomFactor = 1;

function preload() {
  bgMusic = loadSound('experience.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  for (let i = 0; i < 200; i++) {
    stars.push(new Star());
  }
  bgMusic.setVolume(0.5);
  bgMusic.loop();
}

function draw() {
  background(...palettes[currentPalette].bg);

  translate(width / 2, height / 2);
  scale(zoomFactor + sin(frameCount * 0.002) * 0.01);
  translate(-width / 2, -height / 2);

  for (let s of stars) {
    s.update();
    s.show();
  }

  stroke(...palettes[currentPalette].line, 50);
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      let d = dist(stars[i].x, stars[i].y, stars[j].x, stars[j].y);
      if (d < 40) {
        let weight = map(d, 0, 40, 1.5, 0.3) + random(0, 0.7);
        strokeWeight(weight);
        line(stars[i].x, stars[i].y, stars[j].x, stars[j].y);
        stars[i].connected = true;
        stars[j].connected = true;
      }
    }
  }
}

class Star {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.dx = random(-0.4, 0.4);
    this.dy = random(-0.4, 0.4);
    this.size = random(1, 3);
    this.trail = [];
    this.connected = false;
  }

  update() {
    if (mouseGravity && !this.connected) {
      let mouse = createVector(mouseX, mouseY);
      let pos = createVector(this.x, this.y);
      let force = p5.Vector.sub(mouse, pos);
      force.setMag(0.5);
      this.dx += force.x * 0.02;
      this.dy += force.y * 0.02;
    }

    this.x += this.dx;
    this.y += this.dy;

    if (this.x < 0 || this.x > width) this.dx *= -1;
    if (this.y < 0 || this.y > height) this.dy *= -1;

    this.trail.push(createVector(this.x, this.y));
    if (this.trail.length > 5) {
      this.trail.shift();
    }

    this.connected = false;
  }

  show() {
    for (let i = 0; i < this.trail.length; i++) {
      let alpha = map(i, 0, this.trail.length, 0, 150);
      fill(...palettes[currentPalette].star, alpha);
      noStroke();
      ellipse(this.trail[i].x, this.trail[i].y, this.size);
    }

    let twinkle = random(0.7, 1);
    fill(
      palettes[currentPalette].star[0],
      palettes[currentPalette].star[1],
      constrain(palettes[currentPalette].star[2] * twinkle, 0, 100)
    );
    noStroke();
    ellipse(this.x, this.y, this.size);
  }
}

function mousePressed() {
  // Needed for Safari and Chrome audio restrictions
  getAudioContext().resume().then(() => {
    if (bgMusic && !bgMusic.isPlaying()) {
      bgMusic.play();
    }
  });

  for (let i = 0; i < 10; i++) {
    stars.push(new Star());
  }
}

  
function keyPressed() {
  if (key === ' ') {
    currentPalette = (currentPalette + 1) % palettes.length;
  }
  if (key === 's' || key === 'S') {
    saveCanvas('screenshot', 'png');
  }
  if (key === 'r' || key === 'R') {
    resetStars();
  }
  if (key === 'g' || key === 'G') {
    mouseGravity = !mouseGravity;
  }
}

function resetStars() {
  stars = [];
  for (let i = 0; i < 200; i++) {
    stars.push(new Star());
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mouseWheel(event) {
  zoomFactor += event.delta * -0.001;
  zoomFactor = constrain(zoomFactor, 0.5, 2);
}
