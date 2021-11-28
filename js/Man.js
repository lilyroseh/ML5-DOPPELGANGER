class Man {
  constructor(x, y, ctx) {
    this.x = x;
    this.y = y;
    this.radius = 1;
    this.ctx = ctx;

   this.lerp = function (start, stop, amt) {
      return amt * (stop - start) + start;
    }
  }



  draw(results) {
    if (results.length > 0) {

    
      // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // console.log(poses);
      const keypoints = results[0].pose.keypoints;
      const data = [];
      keypoints.forEach((point) => {
        // console.log('Keypoints JS Object', pose.keypoints);
        // console.log('Keypoints JSON', JSON.stringify(pose.keypoints));
        let x = point.position.x;
        let y = point.position.y;
        //   data.push(x);
        //   data.push(y);
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.beginPath();
        this.ctx.lineWidth = 16;
        this.ctx.arc(x , y, this.radius, 0, Math.PI * 2, false);
        this.ctx.strokeStyle = "pink";
        this.ctx.stroke();
        this.ctx.closePath();


        this.ctx.restore();
      });
      return keypoints;
    }
    return null;
  }

  
}
