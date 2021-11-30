let currentPose;

function setup() {
    new App();
}

class App {
    MESH_COLOR = "#13f8e7";
    MESH_COLOR_DOUBLE = "#f8134c";

    videoIsReady = false;

    posenetRecordingPlayer;

    poseMenu;

    selectedPose = "";

    isPlaying = false;
    doLoop = false;
    timeoutID;
    record;
    startTime;
    replayButton;

    constructor() {
        this.isPlaying = false;
        this.doLoop = false;
        this.timeoutID = null;
        this.record = null;

        this.videoIsReady = false;

        this.onDrawVideo();

        this.poseMenu = document.getElementById("recordings-select");

        this.loadPoseFiles([
            "./assets/raise_hands.json",
            "./assets/standing-pose.json",
            "./assets/hands-up-pose.json",
            "./assets/hands-out-pose.json",
        ]);

        this.replayButton = document.getElementById("replayPose");
        this.replayButton.addEventListener("click", (event) => {
            if (this.selectPose) {
                this.selectPose(this.selectedPose);
            }
        });
    }

    loadPoseFiles(jsonUrls) {
        const poseNameFromUrl = (url) =>
            url
                .replace(/.*\//, "")
                .replace(/\.json$/, "")
                .replace(/^pose-|-pose$/g, "")
                .replace(/[_-]/g, " ");

        this.recordedPoses = jsonUrls.map((url) => ({
            name: poseNameFromUrl(url),
            url,
            data: null,
        }));

        this.recordedPoses.forEach((pose) => {
            let fetchResponse;

            fetch(pose.url)
                .then((respone) => respone.json())
                .then((data) => {
                    fetchResponse = data;

                    pose.data = fetchResponse;
                });
        });

        let poseMenu = document.getElementById("recordings-select");

        // let initialOption = document.createElement("option");
        // initialOption.value = "Camera";
        // initialOption.text = "Camera";

        // poseMenu.appendChild(initialOption);

        this.recordedPoses.forEach((pose) => {
            let poseOption = document.createElement("option");
            poseOption.value = pose.name;
            poseOption.text = pose.name;

            poseMenu.appendChild(poseOption);
        });

        this.selectedPose = this.recordedPoses[0].name;

        poseMenu.addEventListener("change", (event) => {
            this.selectedPose = event?.target?.value;
            this.selectPose(this.selectedPose);
        });
    }

    isPlaying() {
        return this.isPlaying;
    }

    selectPose(poseName) {
        this.startTime = millis();
        this.record = this.recordedPoses.find(({ name }) => name === poseName);
        this.isPlaying = Boolean(this.record);
        this.index = 0;
        if (this.isPlaying) {
            this.scheduleNextPose();
        } else if (this.timeoutID) {
            clearTimeout(this.timeoutID);
            this.timeoutID = null;
        }
    }

    scheduleNextPose() {
        let pose = this.getNextPose();

        if (pose) {
            this.timeoutID = setTimeout(() => {
                this.timeoutID = null;
                this.scheduleNextPose();
                currentPose = pose;
                this.drawPose(currentPose);
            }, this.startTime + pose.timestamp - millis());
        }

        if (!this.isPlaying) {
            // this.ctx.width = this.ctx.width;
            this.ctx.clearRect(0, 0, this.ctx.width, this.ctx.height);
        }
    }

    getNextPose() {
        let ms = millis() - this.startTime;
        let poses = this.record.data.poses;
        for (let i = 0; i < poses.length; i++) {
            this.index = i;
            let pose = poses[i];
            if (pose?.timestamp >= ms) {
                return pose;
            }
        }

        if (this.doLoop) {
            this.index = 0;
            return poses[0];
        }

        this.isPlaying = false;

        return null;
    }

    onDrawVideo() {
        // Draw the webcam video
        if (!this.videoIsReady) {
            this.video = document.createElement("video");
            this.video.classList.add("inverted");
            // this.video.classList.add("invisible");
            this.video_wrapper = document.getElementById("video");
            this.video_wrapper.appendChild(this.video);

            this.canvas = document.createElement("canvas");
            this.canvas.classList.add("inverted");
            this.ctx = this.canvas.getContext("2d");
            this.video_wrapper.appendChild(this.canvas);

            this.video.width = this.canvas.width = 640;
            this.video.height = this.canvas.height = 480;

            this.loadVideo();
            this.loadPoseNetModel();

            // this.video_double = document.createElement("video");
            this.video_wrapper_double = document.getElementById("video-double");
            // this.video_wrapper_double.appendChild(this.video_double);

            this.canvas_double = document.createElement("canvas");
            this.ctx_double = this.canvas_double.getContext("2d");
            this.video_wrapper_double.appendChild(this.canvas_double);

            this.video.width = this.canvas.width = 640;
            this.video.height = this.canvas.height = 480;

            this.canvas_double.width = 640;
            this.canvas_double.height = 480 * 2;

            //TODO: Neural model

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.skeletonLeft = new Skeleton(0, 0, this.ctx);

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.skeletonRight = new Skeleton(300, 0, this.ctx);

            this.ctx_double.clearRect(
                0,
                0,
                this.canvas_double.width,
                this.canvas_double.height
            );
        }
    }

    loadPoseNetModel() {
        this.posenet = ml5.poseNet(this.video, this.modelLoaded.bind(this));
    }

    modelLoaded() {
        console.log(`Model loaded`);

        this.posenet.on("pose", (results) => {
            // console.log(`Results: ${JSON.stringify(results, null, 2)}`);
            if (!this.isPlaying) {
                if (results) {
                    this.ctx.fillStyle = this.MESH_COLOR;
                    this.poses = results;
                    this.ctx.clearRect(
                        0,
                        0,
                        this.canvas.width,
                        this.canvas.height
                    );
                    const keypoints = results[0].pose.keypoints;
                    keypoints.forEach((point) => {
                        const x = point.position.x;
                        const y = point.position.y;
                        this.ctx.beginPath();
                        this.ctx.arc(x, y, 10, 0, Math.PI * 2, false);
                        this.ctx.fill();
                        this.ctx.closePath();
                    });

                    for (let i = 0; i < results.length; i++) {
                        let skeleton = results[i].skeleton;
                        // For every skeleton, loop through all body connections
                        for (let j = 0; j < skeleton.length; j++) {
                            let partA = skeleton[j][0];
                            let partB = skeleton[j][1];
                            stroke(255, 0, 0);
                            line(
                                partA.position.x,
                                partA.position.y,
                                partB.position.x,
                                partB.position.y
                            );
                        }
                    }
                }
            }
        });
    }

    drawPose() {
        if (currentPose) {
            this.ctx_double.fillStyle = this.MESH_COLOR_DOUBLE;

            this.ctx_double.clearRect(
                0,
                0,
                this.canvas_double.width,
                this.canvas_double.height
            );

            const keypoints = currentPose.pose.keypoints;

            keypoints.forEach((point) => {
                const x = point.position.x;
                const y = point.position.y;

                this.ctx_double.beginPath();
                this.ctx_double.arc(x, y, 10, 0, Math.PI * 2, false);
                this.ctx_double.fill();
                this.ctx_double.closePath();
            });
        }
    }

    loadVideo() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({ video: true })
                .then((stream) => {
                    this.video.srcObject = stream;
                    this.video.play();
                    this.videoIsReady = true;
                });
        }
    }
}
