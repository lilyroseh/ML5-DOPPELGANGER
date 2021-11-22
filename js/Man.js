class Man{
    constructor(x,y,ctx){
        this.x = x;
        this.y = y;
        this.ctx = ctx;
    }

    draw(results){
        if (results.length > 0) {
            // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            // console.log(poses);
            const keypoints = results[0].pose.keypoints;
            const data = [];
            keypoints.forEach((point) => {
              // console.log('Keypoints JS Object', pose.keypoints);
              // console.log('Keypoints JSON', JSON.stringify(pose.keypoints));
              const x = point.position.x;
              const y = point.position.y;
            //   data.push(x);
            //   data.push(y);
              this.ctx.save();
              this.ctx.translate(this.x,this.y);
              this.ctx.beginPath();
              this.ctx.arc(x, y, 10, 0, Math.PI * 2, false);
              this.ctx.fill();
              this.ctx.closePath();
              this.ctx.restore();
            });
            return keypoints;
        }
        return null;
    }
}