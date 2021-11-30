class PlaybackPlayer {


    constructor() {
        this.isPlaying = false;
        this.doLoop = false;
        this.timeoutID = null;
        this.record = null;
    }

    loadPoseFiles(poseJsonUrls) {
        
    }

    isPlaying() {
        return this.isPlaying;
    }

    selectPose(poseName) {        
        this.startTime = 0;
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
            }, this.startTime + pose.timestamp);
        }
    }

    getNextPose() {
        let ms = this.startTime;
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

        return null;
    }
}