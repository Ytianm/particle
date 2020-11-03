/**
 * canvas粒子
 * @param {string} element 
 * @param {object} config 
 */
const Particle = function Particle(element, config) {
  const _this = this;
  if (config === void 0) config = {};
  this.config = config;
  this.element = document.querySelector(element);
  this.color = config.color || '#fff';
  this.width = this.element.clientWidth;
  this.height = this.element.clientHeight;
  this.distance = config.distance || this.width / 10;
  this.mouseField = config.mouseField || 100;
  this.radius = config.radius || 2;
  this.points = [];
  this.count = config.count || 100;
  this.zIndex = config.zIndex || 1;
  this.rate = config.rate || this.width / 10000;
  this.rateX = typeof config.rateX === 'number' ? config.rateX : 2;
  this.rateY = typeof config.rateY === 'number' ? config.rateY : 2;
  this.directionFixed = config.directionFixed;
  this.resize = typeof config.resize === 'boolean' ? config.resize : true;
  this.line = typeof config.line === 'boolean' ? config.line : true;
  this.bounce = typeof config.bounce === 'boolean' ? config.bounce : false;
  this.appendCanvas();
  for (let i = 0; i < this.count; i++) {
    this.points.push(this.createPoint());
  }

  if (this.resize) {
    window.onresize = function () {
      _this.width = _this.element.clientWidth;
      _this.height = _this.element.clientHeight;
      _this.distance = config.distance || _this.width / 10;
      _this.rate = config.rate || _this.width / 10000;
      _this.canvas.width = _this.width;
      _this.canvas.height = _this.height;
    };
  }
};

// 创建canvas
Particle.prototype.appendCanvas = function appendCanvas() {
  this.canvas = document.createElement('canvas');
  this.ctx = this.canvas.getContext('2d');
  this.canvas.width = this.width;
  this.canvas.height = this.height;
  this.canvas.style.zIndex = this.zIndex;
  this.element.appendChild(this.canvas);
  this.handleMouse();
};

// 生成点
Particle.prototype.createPoint = function createPoint(pointX, pointY) {
  const num = this.directionFixed ? 0 : 1; // num为0时rateX/Y计算值只有正或者负，为1时正负都有
  let x = pointX || Math.ceil(Math.random() * this.width), // x坐标
    y = pointY || Math.ceil(Math.random() * this.height), // y坐标
    r = +(Math.random() * this.radius).toFixed(4), // 半径可
    rateX = (Math.random() * this.rateX - num).toFixed(4), // x方向速度
    rateY = (Math.random() * this.rateY - num).toFixed(4); // y方向速度

  if (this.directionFixed && this.rateX === 0) { // x固定方向
    rateX = 0;
  }
  if (this.directionFixed && this.rateY === 0) { // x固定方向
    rateY = 0;
  }

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
  this.drawLines();
  window.requestAnimationFrame(this.draw.bind(this)); // 开启动画
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
      if (item.x >= item.r && item.x <= _this.width - item.r && item.y >= item.r 
        && item.y <= _this.height - item.r) { // 窗口范围内
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
      if (item.x >= -item.r && item.x <= _this.width + item.r && item.y >= -item.r 
        && item.y <= _this.height + item.r) { // 窗口范围内
        item.x += item.rateX * _this.rate;
        item.y += item.rateY * _this.rate;
      } else {
        _this.points.splice(i, 1); // 超出窗口范围后清除
        _this.points.push(_this.createPoint(_this.radius)); // 重新生成一个
      }
    }
  });
};

// 画线
Particle.prototype.drawLines = function drawLines(mouseX, mouseY) {
  if (!this.line && !this.mousemove ) return;

  const len = this.points.length;
  for (let i = 0; i < len; i++) {
    for (let j = len - 1; j >= 0; j--) {
      let x1 = this.points[i].x,
        y1 = this.points[i].y,
        x2 = this.points[j].x,
        y2 = this.points[j].y,
        disPoint = this.disPoints(x1, y1, x2, y2);

       // this.line || (this.mousemove && 在鼠标一定范围内)
      if ((this.line && !this.mousemove)
        || (!this.line && this.mousemove && (x1 > this.mouseX - this.mouseField && x1 < this.mouseX + this.mouseField
        && x2 > this.mouseX - this.mouseField && x2 < this.mouseX + this.mouseField
        && y1 > this.mouseY - this.mouseField && y1 < this.mouseY + this.mouseField
        && y2 > this.mouseY - this.mouseField && y2 < this.mouseY + this.mouseField))) {
        if (disPoint <= this.distance) {
          this.ctx.beginPath();
          this.ctx.moveTo(x1, y1); // 起点
          // this.ctx.lineTo(x2, y2); // 终点
          this.ctx.moveTo(this.mouseX, this.mouseY); // 连接鼠标
          this.ctx.lineTo(x2, y2); // 终点
          this.ctx.strokeStyle = this.color;
          this.ctx.lineWidth = 1 - disPoint / this.distance; // 通过控制两点连线线宽实现渐显效果
          this.ctx.stroke();
        }
      }
    }
  }
};

// 鼠标移动
Particle.prototype.handleMouse = function handleMouse() {
  this.canvas.addEventListener('mousemove', pos => {
    this.mouseX = pos.x;
    this.mouseY = pos.y;
    this.mousemove = this.config.mousemove;
  })
  this.canvas.addEventListener('mouseleave', () => {
    this.mousemove = false;
  })
}

function init(element, color) {
  new Particle(element, color).draw();
}

// export default init;
