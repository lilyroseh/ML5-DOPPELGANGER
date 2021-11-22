class App {
  videoIsReady;
  video;
  canvas;
  video_wrapper;
  ctx;
  MESH_COLOR = "rgb(0,0,255,0.3)";
  manLeft;

  constructor() {
    this.videoIsReady = false;
    this.initializeVideo();
  }

  initializeVideo() {
    if (!this.videoIsReady) {
      this.video = document.createElement("video");
      this.video_wrapper = document.getElementById("video");
      this.video_wrapper.appendChild(this.video);

      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d");
      this.video_wrapper.appendChild(this.canvas);

      this.video.width = this.canvas.width = 640;
      this.video.height = this.canvas.height = 480;

      this.loadVideo();
      this.loadPoseNetModel();

      //neural net
      // this.modelIsTrained = false;
      // this.customNeuralNet = new NeuralNet(POSENET_POINTS, PARAMS.length);

      // this.manLeft = new Man(0,0,this.ctx);
      // this.manRight = new Man(300,0,this.ctx);
      // this.sequence = [];
    }
  }

  loadVideo() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        // this.video.src = window.URL.createObjectURL(stream);
        this.video.srcObject = stream;
        this.video.play();
        this.videoIsReady = true;
      });
    }
  }

  loadPoseNetModel() {
    this.poseNet = ml5.poseNet(this.video, this.modelLoaded.bind(this));
  }

  modelLoaded() {
    console.log("model loaded");

    this.poseNet.on("pose", (results) => {
      this.ctx.fillStyle = this.MESH_COLOR;
      this.poses = results;

      console.log(results);
      this.manLeft = new Man(0, 0, this.ctx);
      if (this.poses.length > 0) {
        const keypoints = this.manLeft.draw(results);
        
      }
    
    });
  }
}

window.onload = () => {
  new App();
};
