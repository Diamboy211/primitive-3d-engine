let canvas = document.getElementById("canvas");
let engine = new Engine(canvas);
let frameRate = 60;
let m;
let x = 0.004 * Math.PI,
  y = 0.005 * Math.PI,
  z = 0.006 * Math.PI;

let loadMesh = async url => {
  let m = await fetch(url);
  let m2 = await m.text();
  let m3 = m2.split("\n\n");

  let newMesh = [];
  for (let i = 0; i < m3.length; i++) {
    let m4 = m3[i].split("\n");
    let m5 = [
      m4[0].split(" ").map(Number),
      m4[1].split(" ").map(Number),
      m4[2].split(" ").map(Number)
    ];
    log(m5.toString());
    let tri = new Triangle([
      new Vec3d(m5[0][0], m5[0][1], m5[0][2]),
      new Vec3d(m5[1][0], m5[1][1], m5[1][2]),
      new Vec3d(m5[2][0], m5[2][1], m5[2][2])
    ]);
    newMesh[i] = tri;
  }
  return new Mesh(newMesh);
};

function record(canvas, time) {
  var recordedChunks = [];
  return new Promise(function(res, rej) {
    var stream = canvas.captureStream(frameRate /*fps*/);
    var mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9"
    });

    //ondataavailable will fire in interval of `time || 4000 ms`
    mediaRecorder.start(time || 4000);

    mediaRecorder.ondataavailable = function(e) {
      recordedChunks.push(event.data);
      if (mediaRecorder.state === "recording") {
        // after stop data avilable event run one more time
        mediaRecorder.stop();
      }
    };

    mediaRecorder.onstop = function(event) {
      var blob = new Blob(recordedChunks, {
        type: "video/webm"
      });
      var url = URL.createObjectURL(blob);
      res(url);
    };
  });
}

async function main() {
  engine.context.strokeStyle = "#FFFFFF";
  engine.context.lineCap = "round";
  m = await loadMesh("./mesh/cube.mesh");

  setInterval(loop, 1000 / frameRate);
  //let url = await record(canvas, 15000);
  //document.getElementById("b").innerHTML = `<a href="${url}">eee</a>`;
}

async function r() {
  let url = await record(canvas, 15000);
  document.getElementById("b").innerHTML = `<a href="${url}">eee</a>`;
}

function loop() {
  //m.rotateX(x)
  //  .rotateY(y)
  //  .rotateZ(z);
  //x += (Math.random() - 0.5) / 500;
  //y += (Math.random() - 0.5) / 500;
  //z += (Math.random() - 0.5) / 500;
  frames++;
  log(frames);
  engine.background(127, 0, 0);
  engine.drawMesh(m);
}

main();
