(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
    window.requestAnimationFrame = requestAnimationFrame;
})();


var background = document.getElementById("bgCanvas");
var bgCtx = background.getContext("2d");
var width = window.innerWidth;
var height = document.body.offsetHeight;
  
(height < 500) ? height = 500 : height;

background.width = width;
background.height = height;  


function Terrain(options) {
    options = options || {};
    this.terrain = document.createElement("canvas");
    this.terCtx = this.terrain.getContext("2d");
    this.scrollDelay = options.scrollDelay || 90;
    this.lastScroll = new Date().getTime();
    this.terrain.width = width;
    this.terrain.height = height;
    this.fillStyle = options.fillStyle || "#191D4C";
    this.mHeight = options.mHeight || height;
    this.points = [];

    var displacement = options.displacement || 140, power = Math.pow(2, Math.ceil(Math.log(width) / (Math.log(2))));

      // set the start height and end height for the terrain
    this.points[0] = this.mHeight;(this.mHeight - (Math.random() * this.mHeight / 2)) - displacement;
    this.points[power] = this.points[0];

      // create the rest of the points
    for (var i = 1; i < power; i *= 2) {
        for (var j = (power / i) / 2; j < power; j += power / i) {
            this.points[j] = ((this.points[j - (power / i) / 2] + this.points[j + (power / i) / 2]) / 2) + Math.floor(Math.random() * -displacement + displacement);
        }
        displacement *= 0.6;
    }

    document.body.appendChild(this.terrain);
  }


Terrain.prototype.update = function () {
      // draw the terrain
    this.terCtx.clearRect(0, 0, width, height);
    this.terCtx.fillStyle = this.fillStyle;
      
    if (new Date().getTime() > this.lastScroll + this.scrollDelay) {
        this.lastScroll = new Date().getTime();
        this.points.push(this.points.shift());
    }

    this.terCtx.beginPath();
    for (var i = 0; i <= width; i++) {
        if (i === 0) {
            this.terCtx.moveTo(0, this.points[0]);
        } else if (this.points[i] !== undefined) {
            this.terCtx.lineTo(i, this.points[i]);
        }
    }

    this.terCtx.lineTo(width, this.terrain.height);
    this.terCtx.lineTo(0, this.terrain.height);
    this.terCtx.lineTo(0, this.points[0]);
    this.terCtx.fill();
}

bgCtx.fillStyle = '#05004c';
bgCtx.fillRect(0, 0, width, height);

function Star(options) {
    this.size = Math.random() * 2;
    this.speed = Math.random() * .05;
    this.x = options.x;
    this.y = options.y;
}

Star.prototype.reset = function () {
    this.size = Math.random() * 2;
    this.speed = Math.random() * .05;
    this.x = width;
    this.y = Math.random() * height;
}

Star.prototype.update = function () {
    this.x -= this.speed;
    if (this.x < 0) {
        this.reset();
    } else {
        bgCtx.fillRect(this.x, this.y, this.size, this.size);
    }
}

function ShootingStar() {
    this.reset();
}

ShootingStar.prototype.reset = function () {
    this.x = Math.random() * width;
    this.y = 0;
    this.len = (Math.random() * 80) + 10;
    this.speed = (Math.random() * 10) + 6;
    this.size = (Math.random() * 1) + 0.1;
    this.waitTime = new Date().getTime() + (Math.random() * 3000) + 500;
    this.active = false;
}

ShootingStar.prototype.update = function () {
    if (this.active) {
        this.x -= this.speed;
        this.y += this.speed;
        
        if (this.x < 0 || this.y >= height) {
            this.reset();
        } else {
            bgCtx.lineWidth = this.size;
            bgCtx.beginPath();
            bgCtx.moveTo(this.x, this.y);
            bgCtx.lineTo(this.x + this.len, this.y - this.len);
            bgCtx.stroke();
        }
    } else {
        if (this.waitTime < new Date().getTime()) {
            this.active = true;
        }
    }
}

var entities = [];

for (var i = 0; i < height; i++) {
    entities.push(new Star({
        x: Math.random() * width,
        y: Math.random() * height
    }));
}

entities.push(new ShootingStar());
entities.push(new ShootingStar());
entities.push(new Terrain({mHeight : (height/2)-120}));
entities.push(new Terrain({displacement : 120, fillStyle : "rgb(17,20,40)", mHeight : (height/2)-60}));
entities.push(new Terrain({displacement : 100, fillStyle : "rgb(10,10,5)", mHeight : height/2}));

function animate() {
    bgCtx.fillStyle = '#110E19';
    bgCtx.fillRect(0, 0, width, height);
    bgCtx.fillStyle = '#ffffff';
    bgCtx.strokeStyle = '#ffffff';

    var entLen = entities.length;

    while (entLen--) {
        entities[entLen].update();
    }
      
    requestAnimationFrame(animate);
}

animate();

//end of animation

//start of loading page

function loading(){
    document.getElementById('preload').style.display="none";
}

var keys = {37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
  e.preventDefault();
}

function preventDefaultForScrollKeys(e) {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

var supportsPassive = false;
try {
  window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
    get: function () { supportsPassive = true; } 
  }));
} catch(e) {}

var wheelOpt = supportsPassive ? { passive: false } : false;
var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

function disableScroll() {
  window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
  window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
  window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
  window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

function enableScroll() {
  window.removeEventListener('DOMMouseScroll', preventDefault, false);
  window.removeEventListener(wheelEvent, preventDefault, wheelOpt); 
  window.removeEventListener('touchmove', preventDefault, wheelOpt);
  window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}

disableScroll()

window.onload = function() {
    setTimeout(loading, 2500);
    setTimeout(enableScroll, 2500);
}

window.onbeforeunload = function () {
  window.scrollTo(0, 0);
}

//end of loading page


  function submit() {
      const name = document.getElementById('name').value
      const email = document.getElementById('email').value
      const subject = document.getElementById('subject').value
      const message = document.getElementById('message').value
      
      if(document.getElementById("name").value.length == 0) {
        alert("Name is not filled out");
      } else if(document.getElementById("email").value.length == 0) {
        alert("Email is not filled out")
      } else if(document.getElementById("subject").value.length == 0) {
        alert("Subject is not filled out")
      } else if(document.getElementById("message").value.length == 0) {
        alert("Message is not filled out")
      } else {
              window.open('mailto:rkchan06@icloud.com?subject=' + subject + '&body=From: ' + name + '%0D%0AEmail: ' + email + '%0D%0A_______________________%0D%0A%0D%0A' + message,
            '_blank'
          );
      }
      
  }

function menuToggle() {
    var nav = document.getElementById("menu-overlay");
    nav.classList.toggle('active');
    var nav = document.getElementById("toggleicon");
    nav.classList.toggle('active')
}

  function linkedin() {
      window.open(
        'https://www.linkedin.com/in/rykchan/',
        '_blank'
      );
  }

  function github() {
      window.open(
        'https://github.com/rkchan77',
        '_blank'
      );
  }

  function contactme() {
      window.open(
        'contact.html', '_self'
      );
  }

  function simul() {
      alert("Currently in development. Check back soon")
  }

  function neighbournet() {
      alert("NeighbourNet was liquidated in June 2021. Thanks for joining us on our journey!")
  }

  function internx() {
      alert("InternX was liquidated in September 2020. Thanks for joining us on our journey! Our website is still up but it is not completely functional")
      window.open(
        'https://internx.ca',
        '_blank'
      );
  }

  function waterconnect() {
      window.open(
        'https://rkchan77.github.io/waterconnect/',
        '_blank'
      );
  }

  function uccstem() {
      window.open(
        'https://uccstem.com/',
        '_blank'
      );
  }

  function tutoringtown() {
      window.open(
        'https://rkchan06.github.io/tutoringtown/index.html#!',
        '_blank'
      );
  }

  function tradingbot() {
      alert("My personal trading bot tracks arbitrage on decentralized exchanges and automates trades. If you're interested, contact me and I can show you a live demo")
  }

  function ethtracker() {
      window.open(
        'https://github.com/rkchan77/ETH-transaction-tracker',
        '_blank'
      );
  }

  function cryptotrack() {
      window.open(
        'https://github.com/rkchan77/cryptotrack',
        '_blank'
      );
  }

  function shyppio() {
      alert("Currently in development. Check back soon")
  }

  function kyckd() {
      window.open(
        'https://rkchan77.github.io/kyckd/',
        '_blank'
      );
  }

  function socialblockr() {
      window.open(
        'https://github.com/rkchan77/socialblockr',
        '_blank'
      );
  }






