AFRAME.registerComponent('player-jump', {
  init: function () {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        this.jump();
      }
    });
  },

  jump: function () {
    const player = this.el;
    if (player.body) {
      player.body.applyImpulse(
        new CANNON.Vec3(0, 10, 0),
        new CANNON.Vec3().copy(player.getAttribute('position'))
      );
    }
  }
});

AFRAME.registerComponent('disappear', {
  schema: { 
    duration: { type: 'number', default: 3000 } // 3 seconds
  },

  init: function () {
    setTimeout(() => {
      this.el.sceneEl.removeChild(this.el);
    }, this.data.duration);
  }
});

AFRAME.registerComponent('shoot', {
  init: function () {
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left mouse button
        this.shoot();
      }
    });
  },

  shoot: function () {
    const sceneEl = this.el.sceneEl;
    const camera = document.querySelector('[camera]');
    const position = camera.getAttribute('position');
    const rotation = camera.getAttribute('rotation');

    let bullet = document.createElement('a-sphere');
    bullet.setAttribute('radius', 0.1);
    bullet.setAttribute('color', 'black');
    bullet.setAttribute('position', position);

    const direction = new THREE.Vector3();
    camera.object3D.getWorldDirection(direction);

    bullet.setAttribute('dynamic-body', '');

    bullet.addEventListener('body-loaded', () => {
      const force = new CANNON.Vec3();
      const camera = document.querySelector('[camera]');
      camera.object3D.getWorldDirection(force);
      force.scale(-1000, force);
      bullet.body.applyImpulse(force, new CANNON.Vec3().copy(bullet.getAttribute('position')));
    });

    bullet.setAttribute('disappear', '');
    sceneEl.appendChild(bullet);
  }
});

AFRAME.registerComponent('game-logic', {
  init: function () {
    console.log('Game logic initialized');
    this.wave = 1;
    this.enemiesLeft = 0;
    this.spawnEnemies();
    const waveText = document.querySelector('#waveText');
    waveText.setAttribute('text', 'value', 'Wave: ' + this.wave);
  },

  tick: function() {
    if (this.enemiesLeft <= 0) {
      this.wave++;
      this.spawnEnemies();
    }
  },

  spawnEnemies: function () {
    const sceneEl = this.el.sceneEl;
    this.enemiesLeft = this.wave * 5;
    for (let i = 0; i < this.enemiesLeft; i++) {
      let enemy = document.createElement('a-box');
      enemy.setAttribute('color', 'red');
      enemy.setAttribute('position', {
        x: (Math.random() - 0.5) * 20,
        y: 1,
        z: (Math.random() - 0.5) * 20 - 5
      });
      enemy.setAttribute('dynamic-body', '');
      enemy.health = 3;
      enemy.setAttribute('class', 'enemy');
      sceneEl.appendChild(enemy);

      enemy.addEventListener('collide', (e) => {
        if (e.detail.body.el.tagName.toLowerCase() === 'a-sphere') {
          sceneEl.removeChild(e.detail.body.el); // remove bullet
          enemy.health--;
          if (enemy.health === 2) {
            enemy.setAttribute('color', 'yellow');
          } else if (enemy.health === 1) {
            enemy.setAttribute('color', 'orange');
          }
          if (enemy.health <= 0) {
            sceneEl.removeChild(enemy); // remove enemy
            this.el.components['game-logic'].enemiesLeft--;
          }
        }
      });
    }
  }
});