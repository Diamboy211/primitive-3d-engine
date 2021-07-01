let log = str => (document.getElementById("a").innerHTML = str);
let frames = 0;
class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
    this.context.lineWidth = 1;
    this.context.strokeStyle = "#FFFFFF";
    this.aspectRatio = this.width / this.height;
    this.fov = 90;
    this.zf = 1000;
    this.zn = 0.1;
    this.fov2 = 1 / Math.tan(((this.fov * 0.5) / 180) * Math.PI);
    this.projMat = [
      [(this.height / this.width) * this.fov2, 0, 0, 0],
      [0, this.fov2, 0, 0],
      [0, 0, this.zf / (this.zf - this.zn), 1],
      [0, 0, (-this.zf * this.zn) / (this.zf - this.zn), 0]
    ];
    //log(this.projMat.toString());
    this.camera = new Vec3d(0, 0, -3);
    this.lightDirection = new Vec3d(0, 0, -1);
    (() => {
      const l =
        1 /
        Math.sqrt(
          this.lightDirection.x ** 2 +
            this.lightDirection.y ** 2 +
            this.lightDirection.z ** 2
        );
      this.lightDirection.x *= l;
      this.lightDirection.y *= l;
      this.lightDirection.z *= l;
    })();
  }
  background(r, g, b) {
    //let t = this.context.fillStyle;
    this.context.fillStyle = `#000000`;
    this.context.fillRect(0, 0, this.width, this.height);
    //this.context.fillStyle = t;
  }
  drawMesh(mesh) {
    let nm = mesh.rotateZ(frames / 120).rotateX(frames / 240);
    for (let i = 0; i < nm.triangles.length; i++) {
      let trix = nm.triangles[i];
      let triTrans = trix.copy();
      triTrans.vertices[0].x = trix.vertices[0].x - this.camera.x;
      triTrans.vertices[1].x = trix.vertices[1].x - this.camera.x;
      triTrans.vertices[2].x = trix.vertices[2].x - this.camera.x;
      triTrans.vertices[0].y = trix.vertices[0].y - this.camera.y;
      triTrans.vertices[1].y = trix.vertices[1].y - this.camera.y;
      triTrans.vertices[2].y = trix.vertices[2].y - this.camera.y;
      triTrans.vertices[0].z = trix.vertices[0].z - this.camera.z;
      triTrans.vertices[1].z = trix.vertices[1].z - this.camera.z;
      triTrans.vertices[2].z = trix.vertices[2].z - this.camera.z;
      /*let u = new Vec3d(
        triTrans.vertices[1].x - triTrans.vertices[0].x,
        triTrans.vertices[1].y - triTrans.vertices[0].y,
        triTrans.vertices[1].z - triTrans.vertices[0].z
      );
      let v = new Vec3d(
        triTrans.vertices[2].x - triTrans.vertices[0].x,
        triTrans.vertices[2].y - triTrans.vertices[0].y,
        triTrans.vertices[2].z - triTrans.vertices[0].z
      );
      let normal = new Vec3d(
        u.y * v.z - u.z * v.y,
        u.x * v.z - u.z * v.x,
        u.x * v.y - u.y * v.x
      );
      let l = Math.sqrt(
        normal.x * normal.x + normal.y * normal.y + normal.z * normal.z
      );
      normal.x /= l;
      normal.y /= l;
      normal.z /= l;
      let res =
        normal.x * (triTrans.vertices[0].x - this.camera.x) +
        normal.y * (triTrans.vertices[0].y - this.camera.y) +
        normal.z * (triTrans.vertices[0].z - this.camera.z);*/

      let triProj = new Triangle([
        Engine.mulMatVec(triTrans.vertices[0], this.projMat),
        Engine.mulMatVec(triTrans.vertices[1], this.projMat),
        Engine.mulMatVec(triTrans.vertices[2], this.projMat)
      ]);
      let u = new Vec3d(
        triProj.vertices[1].x - triProj.vertices[0].x,
        triProj.vertices[1].y - triProj.vertices[0].y,
        triProj.vertices[1].z - triProj.vertices[0].z
      );
      let v = new Vec3d(
        triProj.vertices[2].x - triProj.vertices[0].x,
        triProj.vertices[2].y - triProj.vertices[0].y,
        triProj.vertices[2].z - triProj.vertices[0].z
      );
      let normal = new Vec3d(
        u.y * v.z - u.z * v.y,
        u.x * v.z - u.z * v.x,
        u.x * v.y - u.y * v.x
      );
      let l = Math.sqrt(
        normal.x * normal.x + normal.y * normal.y + normal.z * normal.z
      );
      normal.x /= l;
      normal.y /= l;
      normal.z /= l;
      let disp =
        normal.x * (triTrans.vertices[0].x - this.camera.x) +
          normal.y * (triTrans.vertices[0].y - this.camera.y) +
          normal.z * (triTrans.vertices[0].z - this.camera.z) >
        0;
      if (disp) {
        let lum = Math.floor(-255*normal.z);
        log(lum)
        triProj.vertices[0].x += 1;
        triProj.vertices[0].y += 1;
        triProj.vertices[1].x += 1;
        triProj.vertices[1].y += 1;
        triProj.vertices[2].x += 1;
        triProj.vertices[2].y += 1;
        triProj.vertices[0].x *= 0.5 * this.width;
        triProj.vertices[0].y *= 0.5 * this.height;
        triProj.vertices[1].x *= 0.5 * this.width;
        triProj.vertices[1].y *= 0.5 * this.height;
        triProj.vertices[2].x *= 0.5 * this.width;
        triProj.vertices[2].y *= 0.5 * this.height;
        this.context.fillStyle = `rgb(${lum},${lum},${lum})`;
        this.context.strokeStyle = this.context.fillStyle;
        this.context.beginPath();
        this.context.lineTo(triProj.vertices[0].x, triProj.vertices[0].y);
        this.context.lineTo(triProj.vertices[1].x, triProj.vertices[1].y);
        this.context.lineTo(triProj.vertices[2].x, triProj.vertices[2].y);
        this.context.closePath();
        this.context.fill();
        this.context.stroke();
      }
    }
  }
  static rotVecX(vec, angle) {
    return new Vec3d(
      vec.x,
      vec.y * Math.cos(angle) - vec.z * Math.sin(angle),
      vec.y * Math.sin(angle) + vec.z * Math.cos(angle)
    );
  }
  static rotVecY(vec, angle) {
    return new Vec3d(
      vec.x * Math.cos(angle) - vec.z * Math.sin(angle),
      vec.y,
      vec.x * Math.sin(angle) + vec.z * Math.cos(angle)
    );
  }
  static rotVecZ(vec, angle) {
    return new Vec3d(
      vec.x * Math.cos(angle) - vec.y * Math.sin(angle),
      vec.x * Math.sin(angle) + vec.y * Math.cos(angle),
      vec.z
    );
  }
  static mulMatVec(vec, mat) {
    let o = new Vec3d(
      vec.x * mat[0][0] + vec.y * mat[1][0] + vec.z * mat[2][0] + mat[3][0],
      vec.x * mat[0][1] + vec.y * mat[1][1] + vec.z * mat[2][1] + mat[3][1],
      vec.x * mat[0][2] + vec.y * mat[1][2] + vec.z * mat[2][2] + mat[3][2]
    );
    let w =
      vec.x * mat[0][3] + vec.y * mat[1][3] + vec.z * mat[2][3] + mat[3][3];
    if (w != 0) {
      o.x /= w;
      o.y /= w;
      o.z /= w;
    }
    return o;
  }
}

class Vec3d {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  copy() {
    return new Vec3d(this.x, this.y, this.z);
  }
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }
}

class Triangle {
  constructor(vertices) {
    this.vertices = vertices;
  }
  copy() {
    let vexs = [];
    for (let i = 0; i < this.vertices.length; i++) {
      vexs[i] = this.vertices[i].copy();
    }
    return new Triangle(vexs);
  }
  normal() {
    let u = new Vec3d(
      this.vertices[1].x - this.vertices[0].x,
      this.vertices[1].y - this.vertices[0].y,
      this.vertices[1].z - this.vertices[0].z
    );
    let v = new Vec3d(
      this.vertices[2].x - this.vertices[0].x,
      this.vertices[2].y - this.vertices[0].y,
      this.vertices[2].z - this.vertices[0].z
    );
    // cross product stuff
    let t = [
      u.y * v.z - u.z * v.y,
      u.z * v.x - u.x * v.z,
      u.x * v.y - u.y * v.x
    ];
    let l = 1 / Math.sqrt(t[0] * t[0] + t[1] * t[1] + t[2] * t[2]);
    t[0] *= l;
    t[1] *= l;
    t[2] *= l;
    return new Vec3d(...t);
  }
}

class Mesh {
  constructor(triangles) {
    this.triangles = triangles;
  }
  rotateX(angle) {
    const mat = [
      [1, 0, 0, 0],
      [0, Math.cos(angle), Math.sin(angle), 0],
      [0, -Math.sin(angle), Math.cos(angle), 0],
      [0, 0, 0, 1]
    ];
    let n = new Mesh([]);
    for (let i = 0; i < this.triangles.length; i++) {
      n.triangles.push(
        new Triangle([
          Engine.mulMatVec(this.triangles[i].vertices[0], mat),
          Engine.mulMatVec(this.triangles[i].vertices[1], mat),
          Engine.mulMatVec(this.triangles[i].vertices[2], mat)
        ])
      );
    }
    return n;
    // the line to spaghettify code
    //return this;
  }
  rotateY(angle) {
    const mat = [
      [Math.cos(angle), 0, Math.sin(angle), 0],
      [0, 1, 0, 0],
      [-Math.sin(angle), 0, Math.cos(angle), 0],
      [0, 0, 0, 1]
    ];
    let n = new Mesh([]);
    for (let i = 0; i < this.triangles.length; i++) {
      n.triangles.push(
        new Triangle([
          Engine.mulMatVec(this.triangles[i].vertices[0], mat),
          Engine.mulMatVec(this.triangles[i].vertices[1], mat),
          Engine.mulMatVec(this.triangles[i].vertices[2], mat)
        ])
      );
    }
    return n;
  }
  rotateZ(angle) {
    const mat = [
      [Math.cos(angle), -Math.sin(angle), 0, 0],
      [Math.sin(angle), Math.cos(angle), 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];
    let n = new Mesh([]);
    for (let i = 0; i < this.triangles.length; i++) {
      n.triangles.push(
        new Triangle([
          Engine.mulMatVec(this.triangles[i].vertices[0], mat),
          Engine.mulMatVec(this.triangles[i].vertices[1], mat),
          Engine.mulMatVec(this.triangles[i].vertices[2], mat)
        ])
      );
    }
    return n;
  }
  translate(x, y, z) {
    for (let i = 0; i < this.triangles.length; i++) {
      for (let j = 0; j < 3; j++) {
        this.triangles[i].vertices[j].x += x;
        this.triangles[i].vertices[j].y += y;
        this.triangles[i].vertices[j].z += z;
      }
    }
    return this;
  }
  copy() {
    let tris = [];
    for (let i = 0; i < this.triangles.length; i++) {
      tris[i] = this.triangles[i].copy();
    }
    return new Mesh(tris);
  }
  toString() {
    let t = [];
    for (let i = 0; i < this.triangles.length; i++) {
      let v = [];
      for (let j = 0; j < 3; j++) {
        let vec = [
          this.triangles[i].vertices[j].x,
          this.triangles[i].vertices[j].y,
          this.triangles[i].vertices[j].z
        ];
        let vec2 = vec.map(val => {
          if (val < 0) return val.toFixed(2);
          else return val.toFixed(3);
        });
        v[j] = "[" + vec2.toString() + "]";
      }
      t[i] = "[" + v.toString() + "]";
    }
    return "[" + t.toString().replace('"', "") + "]";
  }
}
