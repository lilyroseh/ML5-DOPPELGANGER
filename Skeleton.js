class Skeleton {
  x;
  y;
  context;

  constructor(x, y, context) {
    this.x = x;
    this.y = y;
    this.context = context;
  }

  draw(results) {
    if (results.length > 0) {
      // this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      const keypoints = results[0].pose.keypoints;

      keypoints.forEach((point) => {
        const x = point.position.x;
        const y = point.position.y;

        this.context.beginPath();
        this.context.arc(x, y, 10, 0, Math.PI * 2, false);
        this.context.fill();
        this.context.closePath();
      });

      return keypoints;
    }
    return null;
  }
}