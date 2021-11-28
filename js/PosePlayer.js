

class PosePlayer {
    constructor() {
      this._isPlaying = false;
      this._loop = false;
    }
  
    loadPoseFiles(poseJsonUrls) {
      const poseNameFromUrl = (url) =>
        url
          .replace(/.*\//, "")
          .replace(/\.json$/, "")
          .replace(/^pose-|-pose$/g, "")
          .replace(/[_-]/g, " ");
  
      this.recordedPoses = poseJsonUrls.map((url) => ({
        name: poseNameFromUrl(url),
        data: loadJSON(url),
      }));
  
      let poseSelect = document.getElementById("poseSelect");
      for (let i = 0; i < this.recordedPoses.length; i++) {
        var option = document.createElement("option");      
        option.value = this.recordedPoses[i].name;
        option.text = this.recordedPoses[i].name;
        poseSelect.appendChild(option);
      }
  

     //let poseMenu = createSelect();
    //   poseMenu.position(10, 10);
    //   poseMenu.option("Camera");
    //   poseMenu.selected("Camera");
   
    }
  
    isPlaying() {
      return this._isPlaying;
    }
  
    selectPose(poseName) {
      this.startTime = millis();
      this.record = this.recordedPoses.find(({ name }) => name === poseName);
      this._isPlaying = Boolean(this.record);
      this.index = 0;
      if (this._isPlaying) {
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
        }, this.startTime + pose.timestamp - millis());
      }
    }
  
    getNextPose() {
      let ms = millis() - this.startTime;
      let poses = this.record.data.poses;
      for (let i = this.index; i < poses.length; i++) {
        this.index = i;
        let pose = poses[i];
        if (pose.timestamp >= ms) {
          return pose;
        }
      }
      if (this._loop) {
        this.index = 0;
        return poses[0];
      }
      return null;
    }
  }
  