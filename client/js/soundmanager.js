
export default class Sound {

  constructor() {
    this.ctx = null;
    this.sounds = [];
    this.sound_names = [];
    this.startup_event = null;
  }

  init() {
    if (!window.AudioContext) {
      throw "AudioContext not supported by browser";
    }

    this.ctx = new AudioContext();

    this.initSounds();
  }


  initSounds() {  
    this.loadSound('sound/marimba/c4.wav', 'c4');
    this.loadSound('sound/marimba/d4.wav', 'd4');
    this.loadSound('sound/marimba/e4.wav', 'e4');
    this.loadSound('sound/marimba/f4.wav', 'f4');
    this.loadSound('sound/marimba/g4.wav', 'g4');
    this.loadSound('sound/marimba/a4.wav', 'a4');
    this.loadSound('sound/marimba/b4.wav', 'b4');
    this.loadSound('sound/marimba/c5.wav', 'c5');
    this.loadSound('sound/marimba/d5.wav', 'd5');
    this.loadSound('sound/marimba/e5.wav', 'e5');
    this.loadSound('sound/marimba/f5.wav', 'f5');
    this.loadSound('sound/marimba/g5.wav', 'g5');
    this.loadSound('sound/marimba/a5.wav', 'a5');
    this.loadSound('sound/marimba/b5.wav', 'b5');
    this.loadSound('sound/marimba/c6.wav', 'c6');
    this.loadSound('sound/marimba/d6.wav', 'd6');
  }


  loadSound(url, name) {
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    
    xhr.onload = () => {
      this.ctx.decodeAudioData(xhr.response, (buffer) => {
        this.sound_names.push(name);
        this.sounds[name] = buffer;

        if(this.startup_event === null){
          this.startup_event = () => {
            this.playRandomSound();
            window.removeEventListener('touchstart', this.startup_event, false);
          };
          window.addEventListener('touchstart', this.startup_event, false);
        }
      });
    };

    xhr.open('GET', url);
    xhr.send();
  }


  playSound(name) {
    if (!this.sounds[name]) return;

    let sound = this.tx.createBufferSource();
    sound.buffer = this.sounds[name];

    let gain = this.createGainNode(0.8, 0.0, 0.4);

    sound.connect(gain);
    gain.connect(this.ctx.destination);

    sound.noteOn(0);
  }

  createGainNode(start, end, time) {
    let node = this.ctx.createGain();
    let now = this.ctx.currentTime;

    node.gain.linearRampToValueAtTime(start, now);
    node.gain.linearRampToValueAtTime(end, now + time);

    return gain;
  }

  playRandomSound() {
    this.playSound(this.sound_names[randomRangeInt(0, this.sound_names.length)]);
  }
}