module.exports = function () {
  var elm = document.querySelectorAll(".c-canvasSlider01");
  var sliderArray = {};

  createjs.CSSPlugin.install();

  var init = function init() {
    [].slice.call(elm).forEach(function (event, i) {
      sliderArray[i] = new sliderSetFunc({
        tg: event,
        mainCanvas: event.querySelector(".is-mainCanvas"),
        prog: event.querySelector(".is-progress"),
        parent: document.querySelector(".c-topCanvasSlider01"),
      });
      sliderArray[i].set();
    });
  };

  var sliderSetFunc = (function () {
    function sliderSetFunc(op) {
      _classCallCheck(this, sliderSetFunc);

      var _t = this;
      (_t.target = op.tg), (_t.canvas = op.mainCanvas);
      _t.canvasProgress = op.prog;
      _t.parent = op.parent;
      _t.slideImage = {};
      _t.maskShape = {};
      _t.graphics = {};
      _t.graphicsPoint = [];
      _t.queue = new createjs.LoadQueue(false);
      _t.mv = [];
      _t.BREAK_POINT = 768;
      (_t.M_WIDTH = 440), (_t.M_HEIGHT = 297);
      _t.SLIDE_TIME = 3000;
      _t.CHANGE_SPEED = 600;
      _t.CURRENT_SLIDE = 0;
      _t.NEXT_SLIDE = _t.CURRENT_SLIDE + 1;
      _t.progressbarWidth = 100;
      _t.progressbarHeight = 1;
      _t.delay = _t.target.dataset.delay;
      _t.scrollFlag = true;
      _t.hiddenFlag = false;
      _t.progressFlag = true;
    }

    _createClass(sliderSetFunc, [
      {
        key: "set",
        value: function set() {
          var _t = this;

          var initSet = function initSet() {
            function loadImage() {
              $(_t.target)
                .find(".is-image img")
                .each(function (index, el) {
                  loadFunc($(this), index);
                });
              function loadFunc($tg, ind) {
                _t.mv[ind] = {};
                _t.mv[ind].src = $tg.attr("src");
                _t.mv[ind].width = $tg[0].naturalWidth;
                _t.mv[ind].height = $tg[0].naturalHeight;

                if (_t.mv[ind].width <= 0) {
                  // alert(_t.mv[ind].src);
                  clearTimeout(_t.mv[ind].timeoutId);
                  _t.mv[ind].timeoutId = setTimeout(function () {
                    loadFunc($tg, ind);
                  }, 300);
                }
              }
            }
            loadImage();

            _t.queue.loadManifest(_t.mv);
            _t.queue.setMaxConnections(3);
            _t.queue.addEventListener("complete", function (e) {
              setTimeout(function () {
                sliderInit();
                handleResize();

                sliderSet();
                tweenSet();
              }, 500);
            });
          };
          var sliderInit = function sliderInit() {
            _t.stage = new createjs.Stage(_t.canvas);
            _t.container = new createjs.Container();
            $(_t.target).find(".slider li").eq(0).addClass("is-current");
          };
          var update = function update(event) {
            $.each(_t.mv, function (index, val) {
              _t.maskShape[index].updateCache();
            });
            _t.stage.update();
          };
          var handleResize = function handleResize(event) {
            function set() {
              _t.stage.canvas.width = _t.M_WIDTH;
              _t.stage.canvas.height = _t.M_HEIGHT;
              _t.stage.update(); // 画面更新
            }
            set();
          };
          var sliderSet = function sliderSet() {
            _t.$sliderContents = $(_t.target).find(".slider li");

            $.each(_t.mv, function (index, val) {
              _t.slideImage[index] = new createjs.Bitmap(val.src);
              _t.maskShape[index] = new createjs.Shape();
              _t.graphics[index] = new createjs.Graphics();
              _t.container.addChild(_t.slideImage[index]);

              _t.stage.addChild(_t.container);
            });

            /** Draw band */
            _t.overRect = new createjs.Shape();
            _t.progressBar = $(_t.target).find(".is-progress")[0];
            _t.stage.addChild(_t.overRect);

            _t.overRectFill = _t.overRect.graphics.beginFill("#a78a6d").command;
            _t.overPoint01 = _t.overRect.graphics.moveTo(0, 0).command;
            _t.overPoint02 = _t.overRect.graphics.lineTo(
              _t.stage.canvas.width,
              0
            ).command;
            _t.overPoint03 = _t.overRect.graphics.lineTo(
              _t.stage.canvas.width + 50,
              _t.stage.canvas.height
            ).command;
            _t.overPoint04 = _t.overRect.graphics.lineTo(
              0,
              _t.stage.canvas.height
            ).command;
            _t.overPoint05 = _t.overRect.graphics.closePath().command;
            _t.overRect.set({
              x: 0,
              y: 0,
            });

            function maskReset() {
              $.each(_t.mv, function (index, val) {
                _t.graphicsPoint[index] = [];
                _t.graphicsPoint[index][0] = _t.graphics[index].moveTo(
                  -150,
                  0
                ).command;
                _t.graphicsPoint[index][1] = _t.graphics[index].lineTo(
                  _t.stage.canvas.width,
                  0
                ).command;
                _t.graphicsPoint[index][2] = _t.graphics[index].lineTo(
                  _t.stage.canvas.width + 150,
                  _t.stage.canvas.height
                ).command;
                _t.graphicsPoint[index][3] = _t.graphics[index].lineTo(
                  0,
                  _t.stage.canvas.height
                ).command;
                _t.graphicsPoint[index][4] =
                  _t.graphics[index].closePath().command;

                _t.maskShape[index].set({
                  x: index == 0 ? 0 : _t.stage.canvas.width + 150,
                  y: 0,
                  graphics: _t.graphics[index],
                  scaleX: 1.0,
                  scaleY: 1.0,
                });
                _t.maskShape[index].cache(
                  _t.maskShape[index].x,
                  _t.maskShape[index].y,
                  _t.M_WIDTH,
                  _t.M_HEIGHT
                );

                //画像を中央から拡大
                _t.slideImage[index].x = _t.stage.canvas.width / 2;
                _t.slideImage[index].y = _t.stage.canvas.height / 2;

                if (
                  (val.height * _t.stage.canvas.width) / val.width <
                  _t.stage.canvas.height
                ) {
                  _t.slideImage[index].scaleY =
                    _t.stage.canvas.height / val.height;
                  _t.slideImage[index].scaleX = _t.slideImage[index].scaleY;
                } else {
                  _t.slideImage[index].scaleX =
                    _t.stage.canvas.width / val.width;
                  _t.slideImage[index].scaleY = _t.slideImage[index].scaleX;
                }

                _t.imageTargetBeforeScale = _t.slideImage[index].scaleX * 1.05;
                _t.imageTargetAfterScale = _t.slideImage[index].scaleX;

                _t.slideImage[index].scale = _t.imageTargetAfterScale;

                _t.slideImage[index].regX = val.width / 2;
                _t.slideImage[index].regY = val.height / 2;

                _t.slideImage[index].set({
                  mask: _t.maskShape[index],
                });
              });
              _t.stage.update();
            }

            maskReset();
          };
          var tweenSet = function tweenSet(event) {
            function slideCountSet() {
              _t.CURRENT_SLIDE++;
              if (_t.CURRENT_SLIDE == _t.mv.length) _t.CURRENT_SLIDE = 0;
              _t.NEXT_SLIDE = _t.CURRENT_SLIDE + 1;
              if (_t.NEXT_SLIDE == _t.mv.length) _t.NEXT_SLIDE = 0;
              contentsReset();
            }
            function progressSet() {
              createjs.Ticker.removeEventListener("tick", update);
              _t.progressBar.style.transform = "translate(-100%, 0%)";
              createjs.Tween.get(_t.progressBar)
                .to({ transform: "translate(-100%, 0%)" }, 0)
                .to({ transform: "translate(0%, 0%)" }, _t.SLIDE_TIME)
                .call(function () {
                  _t.progressFlag = false;
                  if (_t.hiddenFlag == false) {
                    currentSlide(_t.CURRENT_SLIDE);
                    NEXT_SLIDE(_t.NEXT_SLIDE);
                    slideCountSet();
                    _t.progressFlag = true;
                  }
                });
            }

            var hidden, visibilityChange;
            if (typeof document.hidden !== "undefined") {
              hidden = "hidden";
              visibilityChange = "visibilitychange";
            } else if (typeof document.mozHidden !== "undefined") {
              hidden = "mozHidden";
              visibilityChange = "mozvisibilitychange";
            } else if (typeof document.msHidden !== "undefined") {
              hidden = "msHidden";
              visibilityChange = "msvisibilitychange";
            } else if (typeof document.webkitHidden !== "undefined") {
              hidden = "webkitHidden";
              visibilityChange = "webkitvisibilitychange";
            }

            if (
              typeof document.addEventListener != "undefined" &&
              typeof document[hidden] != "undefined"
            ) {
              document.addEventListener("visibilitychange", function () {
                if (document[hidden]) {
                  _t.hiddenFlag = true;
                }
              });
            }
            $(window).on("mousemove scroll", function () {
              if (_t.progressFlag == false) {
                currentSlide(_t.CURRENT_SLIDE);
                NEXT_SLIDE(_t.NEXT_SLIDE);
                slideCountSet();
                _t.hiddenFlag = false;
                _t.progressFlag = true;
              }
            });

            // 現在のスライド用
            function currentSlide(tg) {
              createjs.Tween.get(_t.maskShape[tg])
                .to({ x: -50 }, 0)
                .to(
                  { x: -_t.stage.canvas.width - 50 },
                  _t.CHANGE_SPEED,
                  createjs.Ease.cubicInOut
                );
              maskAnimation(tg);
            }
            function contentsReset() {
              _t.$sliderContents.removeClass("is-current");
              _t.$sliderContents.eq(_t.CURRENT_SLIDE).addClass("is-current");
            }
            // 次のスライド用
            function NEXT_SLIDE(tg) {
              createjs.Tween.get(_t.slideImage[tg])
                .to(
                  { scale: _t.imageTargetBeforeScale },
                  0,
                  createjs.Ease.cubicInOut
                )
                .to(
                  { scale: _t.imageTargetAfterScale },
                  500,
                  createjs.Ease.cubicInOut
                );
              createjs.Tween.get(_t.maskShape[tg])
                .to({ x: _t.stage.canvas.width }, 0)
                .to({ x: 0 }, _t.CHANGE_SPEED, createjs.Ease.cubicInOut)
                .call(progressSet);
              maskAnimation(tg);
            }
            // メインビジュアルマスクアニメーション
            function maskAnimation(tg) {
              createjs.Ticker.addEventListener("tick", update, false);
              createjs.Tween.get(_t.graphicsPoint[tg][0])
                .to({ x: 50 }, 0)
                .to({ x: -50 }, _t.CHANGE_SPEED, createjs.Ease.cubicInOut);
              createjs.Tween.get(_t.graphicsPoint[tg][1])
                .to({ x: _t.stage.canvas.width + 100 }, 0)
                .to(
                  { x: _t.stage.canvas.width },
                  _t.CHANGE_SPEED,
                  createjs.Ease.cubicInOut
                );
              createjs.Tween.get(_t.graphicsPoint[tg][2])
                .to({ x: _t.stage.canvas.width }, 0)
                .to(
                  { x: _t.stage.canvas.width + 50 },
                  _t.CHANGE_SPEED,
                  createjs.Ease.cubicInOut
                );
              createjs.Tween.get(_t.graphicsPoint[tg][3])
                .to({ x: -50 }, 0)
                .to({ x: 0 }, _t.CHANGE_SPEED, createjs.Ease.cubicInOut);
            }
            // 捲頁效果
            function overRectAnimation() {
              createjs.Ticker.addEventListener("tick", update, false);
              createjs.Tween.get(_t.overRect)
                .wait(_t.delay)
                .to({ x: 0 }, 0)
                .to(
                  { x: -_t.stage.canvas.width - 50 },
                  _t.CHANGE_SPEED,
                  createjs.Ease.cubicInOut
                )
                .call(function () {
                  progressSet();
                });
            }
            $(window).on("load scroll", function () {
              if (
                $(window).scrollTop() + $(window).innerHeight() >
                  $(_t.parent).offset().top &&
                _t.scrollFlag == true
              ) {
                _t.scrollFlag = false;
                overRectAnimation();
              }
            });
          };
          setTimeout(function () {
            initSet();
          }, 500);
        },
      },
    ]);

    return sliderSetFunc;
  })();

  setTimeout(function () {
    init();
  }, 300);
};
