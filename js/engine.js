class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
    this.context.lineWidth = 1;
    this.margin = 400;
    this.camera = {
      x: 0,
      y: 0,
      z: -5
    };
  }
  background(r, g, b) {
    //let t = this.context.fillStyle;
    this.context.fillStyle = `#000000`;
    this.context.fillRect(0, 0, this.width, this.height);
    //this.context.fillStyle = t;
  }
  drawMesh(mesh) {
    for (let i = 0; i < mesh.triangles.length; i++) {
      let tri = mesh.triangles[i];
      this.context.beginPath();
      let projTri = [];
      if (tri.normal().dot(new Vec3d(0, 0, 1)) > 0) {
        for (let j = 0; j < 3; j++) {
          // projection
          let vertex = tri.vertices[j];
          let x =
            (100 * (vertex.x - this.camera.x)) /
              ((vertex.z - this.camera.z) / 5) +
            this.width / 2;
          let y =
            (100 * (vertex.y - this.camera.y)) /
              ((vertex.z - this.camera.z) / 5) +
            this.height / 2;
          if (vertex.z - this.camera.z < 0) {
            this.context.beginPath();
            break;
          }
          projTri.push({ x: x, y: y });
          this.context.lineTo(x, y);
        }
      }
      // draw
      this.context.fillStyle = "#FFFFFF00";
      this.context.strokeStyle = "#FFFFFF";
      this.context.closePath();
      this.context.stroke();
      //this.context.fill();

      // draw normals
      let mid = [
        (tri.vertices[0].x + tri.vertices[1].x + tri.vertices[2].x) / 3,
        (tri.vertices[0].y + tri.vertices[1].y + tri.vertices[2].y) / 3,
        (tri.vertices[0].z + tri.vertices[1].z + tri.vertices[2].z) / 3
      ];
      let what = [
        mid[0] - tri.normal().x,
        mid[1] - tri.normal().y,
        mid[2] - tri.normal().z
      ];
      let x1 =
        (100 * (mid[0] - this.camera.x)) / ((mid[2] - this.camera.z) / 5) +
        this.width / 2;
      let y1 =
        (100 * (mid[1] - this.camera.y)) / ((mid[2] - this.camera.z) / 5) +
        this.height / 2;
      let x2 =
        (100 * (what[0] - this.camera.x)) / ((what[2] - this.camera.z) / 5) +
        this.width / 2;
      let y2 =
        (100 * (what[1] - this.camera.y)) / ((what[2] - this.camera.z) / 5) +
        this.height / 2;

      this.context.beginPath();
      this.context.lineTo(x1, y1);
      this.context.lineTo(x2, y2);
      this.context.closePath();
      this.context.stroke();
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
    for (let i = 0; i < this.triangles.length; i++) {
      for (let j = 0; j < 3; j++) {
        let v = Engine.rotVecX(this.triangles[i].vertices[j], angle);
        this.triangles[i].vertices[j].x = v.x;
        this.triangles[i].vertices[j].y = v.y;
        this.triangles[i].vertices[j].z = v.z;
      }
    }
    // the line to spaghettify code
    return this;
  }
  rotateY(angle) {
    for (let i = 0; i < this.triangles.length; i++) {
      for (let j = 0; j < 3; j++) {
        let v = Engine.rotVecY(this.triangles[i].vertices[j], angle);
        this.triangles[i].vertices[j].x = v.x;
        this.triangles[i].vertices[j].y = v.y;
        this.triangles[i].vertices[j].z = v.z;
      }
    }
    return this;
  }
  rotateZ(angle) {
    for (let i = 0; i < this.triangles.length; i++) {
      for (let j = 0; j < 3; j++) {
        let v = Engine.rotVecZ(this.triangles[i].vertices[j], angle);
        this.triangles[i].vertices[j].x = v.x;
        this.triangles[i].vertices[j].y = v.y;
        this.triangles[i].vertices[j].z = v.z;
      }
    }
    return this;
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
