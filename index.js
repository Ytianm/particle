function scale(canvasList, opt) {
  const ratio = window.devicePixelRatio || 1;
  let  ctx = null;

  canvasList.forEach(function (canvas) {
    ctx = canvas.getContext('2d');
    canvas.style.position = opt.position;
    canvas.style.width = opt.width + 'px';
    canvas.style.height = opt.height + 'px';
    canvas.width = opt.width * ratio;
    canvas.height = opt.height * ratio;
    ctx.scale(ratio, ratio);
  });

  return canvasList;
}

const Particle = function Particle(element, config) {
  const _this = this;
  if (config === void 0) config = {};

  this.element = document.querySelector(element);
  this.color = config.color || '#fff';
  this.width = this.element.clientWidth;
  this.height = this.element.clientHeight;
  this.distance = config.distance || this.width / 10;
  this.radius = config.radius || 2;
  this.points = [];
  this.count = config.count || 100;
  this.zIndex = config.zIndex || 1;
  this.rate = config.rate || this.width / 10000;
  this.resize = typeof config.resize === 'boolean' ? config.resize : true;
  this.line = typeof config.line === 'boolean' ? config.line : true;
  this.bounce = typeof config.bounce === 'boolean' ? config.bounce : false;
  this.appendCanvas();
  for (let i = 0; i < this.count; i++) {
    this.points.push(this.getPoint());
  }

  if (this.resize) {
    window.onresize = function () {
      _this.width = _this.element.clientWidth;
      _this.height = _this.element.clientHeight;
      _this.distance = config.distance || _this.width / 10;
      _this.rate = config.rate || _this.width / 10000;
      _this.canvas.width = _this.width;
      _this.canvas.height = _this.height;
      scale([_this.canvas], {
        width: _this.width,
        height: _this.height
      });
    };
  }
};

// 创建canvas
Particle.prototype.appendCanvas = function appendCanvas() {
  this.canvas = document.createElement('canvas');
  this.ctx = this.canvas.getContext('2d');
  this.canvas.width = this.width;
  this.canvas.height = this.height;
  scale([this.canvas], {
    width: this.width,
    height: this.height
  });
  this.canvas.style.zIndex = this.zIndex;
  this.element.appendChild(this.canvas);
};

// 生成点
Particle.prototype.getPoint = function getPoint() {
  const x = Math.ceil(Math.random() * this.width), // x坐标
    y = Math.ceil(Math.random() * this.height), // y坐标
    r = +(Math.random() * this.radius).toFixed(4), // 半径
    rateX = +(Math.random() * 2 - 1).toFixed(4), // x方向速度
    rateY = +(Math.random() * 2 - 1).toFixed(4); // y方向速度

  return { x, y, r, rateX, rateY };
};

// 两点距离计算
Particle.prototype.disPoints = function disPoints(x1, y1, x2, y2) {
  const disX = Math.abs(x1 - x2),
      disY = Math.abs(y1 - y2);

  return Math.sqrt(disX * disX + disY * disY);
};

// 绘制
Particle.prototype.draw = function draw() {
  this.ctx.clearRect(0, 0, this.width, this.height);
  this.drawPoints();
  this.line && this.drawLines();
  window.requestAnimationFrame(this.draw.bind(this));
};

// 画点
Particle.prototype.drawPoints = function drawPoints() {
  const _this = this;

  this.points.forEach(function (item, i) {
    _this.ctx.beginPath();
    _this.ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2, false);
    _this.ctx.fillStyle = _this.color;
    _this.ctx.fill();
    if (_this.bounce) { // 边界反弹
      if (item.x >= item.r && item.x <= _this.width - item.r && item.y >= item.r && item.y <= _this.height - item.r) { // 窗口范围内
        item.x += item.rateX * _this.rate;
        item.y += item.rateY * _this.rate;
      } else { 
        if (item.x < item.r || item.x > _this.width - item.r) { // 到达x边界后x速度方向取反
          item.rateX = -item.rateX;
        }
        if (item.y < item.r || item.y > _this.height - item.r) { // 到达y边界后y速度方向取反
          item.rateY = -item.rateY;
        }
        item.x += item.rateX * _this.rate;
        item.y += item.rateY * _this.rate;
      }
    } else {
      if (item.x >= -item.r && item.x <= _this.width + item.r && item.y >= -item.r && item.y <= _this.height + item.r) { // 窗口范围内
        item.x += item.rateX * _this.rate;
        item.y += item.rateY * _this.rate;
      } else {
        _this.points.splice(i, 1); // 超出窗口范围后清除
        _this.points.push(_this.getPoint(_this.radius)); // 重新生成一个
      }
    }
  });
};

// 画线
Particle.prototype.drawLines = function drawLines() {
  const len = this.points.length;
  for (let i = 0; i < len; i++) {
    for (let j = len - 1; j >= 0; j--) {
      const x1 = this.points[i].x,
        y1 = this.points[i].y,
        x2 = this.points[j].x,
        y2 = this.points[j].y,
        disPoint = this.disPoints(x1, y1, x2, y2);

      if (disPoint <= this.distance) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1); // 起点
        this.ctx.lineTo(x2, y2); // 终点
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = 1 - disPoint / this.distance; // 通过控制两点连线线宽实现渐显效果
        this.ctx.stroke();
      }
    }
  }
};

function init(element, color) {
  new Particle(element, color).draw();
}

// export default init;
