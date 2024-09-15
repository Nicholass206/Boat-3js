import { Vector } from "./vector";

export class Boat {
  constructor() {
    this.position = new Vector(0, 0, 0);
    this.velocity = new Vector(0, 0, 0);
    this.acceleration = new Vector();
    this.omegaY = 0;
    this.svdAngle = 0;
    this.mass = 20;
    this.nicola = 180;
    this.efficiency = 0.3;
    this.power = 0;

    this.L = 0.34;
    this.W = 0.6;
    this.H = 0.5;
    this.H2 = 0.1;
  }

  RadToDeg(rad){
    return (rad * 180)/Math.PI;
  }
  degToRad(deg){
    return (deg * Math.PI)/180;
  }
  calc() {
    var dt = 0.01;
   // console.log("velocity = " + this.velocity.x, this.velocity.y, this.velocity.z);
   // console.log("position = " + this.position.x, this.position.y, this.position.z);

    this.acceleration = this.tforce().division(this.mass);
    this.velocity = this.acceleration.mult(dt).sum(this.velocity);
    this.position = this.velocity.mult(dt).sum(this.position);
  }

  weight() {
    let g = 10;
    let w = new Vector();
    w.y = -this.mass * g;
    return w;
  }

  waterDensity() {
    return 1000;
  }

  getVolume() {
    let V = this.L * this.W * this.H;
    let h = this.H2 - this.position.y;
    let r = h / this.H;
    if (r <= 0) return 0;
    if (r >= 1) return V;
    return V * r;
  }

  Archimedes() {
    let g = 10;
    let B = new Vector();
    B.y = this.waterDensity() * g * this.getVolume();
    // console.log("Volume ", this.getVolume());
    // console.log("ar ", B.y);
    //console.log("w ", this.weight().y);
    //console.log("--------------- ");
    return B;
  }

  StartVector() {
    let Sv = new Vector();
    Sv.z = Math.cos(this.degToRad(this.nicola));
    Sv.x = Math.sin(this.degToRad(this.nicola));
    return Sv;
  }


  getCd() {
    return 0.3 * this.getAngleOfAttack() + 0.3;
  }


  getAngleOfAttack() {
    let a = this.velocity.multNum(this.StartVector());
    let b = this.velocity.length() * this.StartVector().length();
   // console.log("aoa: vel: ",this.velocity,"\nsv: ",this.StartVector());
    
    let epsilon = 0.0001;
    if (b < epsilon) {
      return 0;
    }
    let cosAlfa = a / b;
    let rad = Math.acos(cosAlfa);
    return this.RadToDeg(rad);
  }

  getAngleOfAttackDaffe() {
    let a = this.getVRU().multNum(this.StartVectorDaffe());
    let b = this.getVRU() * this.StartVectorDaffe();
    let epsilon = 0.0001;
    if (b < epsilon) {
      return 0;
    }
    let cosAlfa = a / b;
    let rad = Math.acos(cosAlfa);
    return this.RadToDeg(rad);
  }


  getDirAoa() {
    let epsilon = 0.00001;
    if (this.getAngleOfAttack() < epsilon) {
      return 0;
    }
    let c = this.velocity.multVec(this.StartVector());
    if (c.y > 0) {
      this.getAngleOfAttack();
    }
    return -this.getAngleOfAttack();
  }

  getCl() {
    // y = 7E-07x4 - 7E-05x3 + 0.002x2 + 0.0034x + 0.0041
    let x = this.getDirAoa();
    var x2 = x * x;
    var x3 = x2 * x;
    var x4 = x3 * x;

    return 7E-07 * x4 - 7E-05 * x3 + 0.002 * x2 + 0.0034 * x + 0.0041;
  }

  getVRU() {
    let j = new Vector(0, 1, 0);
    let vrU = this.StartVector().multVec(j);
    let vr = this.omegaY * (this.L / 2);
    return this.velocity.sum(vrU.mult(vr));
  }

  StartVectorDaffe() {
    let Svd = new Vector();
    Svd.z = Math.cos(this.degToRad(this.svdAngle + this.nicola));
    Svd.x = Math.sin(this.degToRad(this.svdAngle + this.nicola));
    return Svd;
  }


  getAoa_d() {
    let epsilon = 0.00001;
    if (this.getAngleOfAttackDaffe() < epsilon) {
      return 0;
    }
    let c = this.getVRU().multVec(this.StartVectorDaffe());
    if (c.y > 0) {
      this.getAngleOfAttackDaffe();
    }
    return -this.getAngleOfAttackDaffe();
  }

  Thrust() {
    let val = 2 * 3.14 * this.power * this.efficiency;
    return this.StartVector().mult(val);
  }
  Drag() {
    let d = new Vector();
    let s = this.getVolume() / this.L;
    d = -0.5 * this.waterDensity() * s * this.getCd() * this.velocity.length();
    return this.velocity.mult(d);
  }

  Lift() {
    let l = new Vector();
    let j = new Vector(0, 1, 0);
    let c = new Vector();
    l = this.velocity.clone();
    l.y = 0;
    l = l.unit();
    l = l.multVec(j);
    let s = this.getVolume() / this.L;
    let d = -0.5 * this.waterDensity() * s * this.getCl() * this.velocity.length() * this.velocity.length();

    c = l.mult(d);
   // console.log("lift: ", this.getCl());
    return c;
  }

  tforce() {
    let tf = new Vector();
    tf = this.weight()
      .sum(this.Archimedes())
      .sum(this.Thrust())
      .sum(this.Drag())
      .sum(this.Lift());
    return tf;
  }
}