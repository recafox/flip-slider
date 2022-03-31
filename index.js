const DELAY = 500;
const CHANGE_SPEED = 600;
const SLIDE_TIME = 3000;
const M_WIDTH = 440;
const M_HEIGHT = 297;
const IMAGE_CONFIG = {};
let IMAGES = [];
let currentSlide = 0;
let nextSlide = 0;
let stage = null;
let rect = null;
let slide = null;
let progressBar = null;

window.addEventListener("load", () => {
  console.log(createjs.CSSPlugin);
  function init() {
    stage = new createjs.Stage("canvas");

    // progress bar
    progressbar = document.querySelector(".is-prog");

    // container
    const slideContainer = new createjs.Container();
    stage.addChild(slideContainer);

    // load images
    const imageQueue = new createjs.LoadQueue(false);
    IMAGES = loadImages();
    imageQueue.loadManifest(IMAGES);
    imageQueue.addEventListener("complete", function (e) {
      console.log("IMAGE QUEUE COMPLETED");
    });

    // create slides
    slide = createSlide(IMAGES);
    slide.slideImages.forEach((image, id) => {
      slideContainer.addChild(image);
    });

    maskReset(slide, IMAGES);

    // draw rect
    rect = drawRect(stage);
    stage.addChild(rect);

    setTween();
  }

  init();
});

const drawRect = (stage) => {
  const rect = new createjs.Shape();
  rect.graphics.beginFill("#a78a6d");
  // 一個比canvas略大的梯形
  rect.graphics.moveTo(0, 0);
  rect.graphics.lineTo(stage.canvas.width, 0);
  rect.graphics.lineTo(stage.canvas.width + 50, stage.canvas.height);
  rect.graphics.lineTo(0, stage.canvas.height);
  rect.graphics.closePath();
  rect.set({
    x: 0,
    y: 0,
  });
  return rect;
};

const loadImages = (stage) => {
  let result = [];
  const images = document.querySelectorAll("img");
  Array.from(images).forEach((image, id) => {
    result[id] = {};
    result[id].src = image.src;
    result[id].width = image.naturalWidth;
    result[id].height = image.naturalHeight;
  });

  return result;
};

const createSlide = (images) => {
  const result = {};
  result.slideImages = [];
  result.maskShapes = [];
  result.graphics = [];

  images.forEach((image, id) => {
    result.slideImages[id] = new createjs.Bitmap(image.src);
    result.maskShapes[id] = new createjs.Shape();
    result.graphics[id] = new createjs.Graphics();
  });

  return result;
};

const maskReset = (slide, images) => {
  slide.graphics.forEach((point, id) => {
    drawGraphic(point);
  });

  slide.maskShapes.forEach((shape, id) => {
    shape.set({
      x: id == 0 ? 0 : stage.canvas.width + 150,
      y: 0,
      graphics: slide.graphics[id],
      scaleX: 1.0,
      scaleY: 1.0,
    });

    shape.cache(shape.x, shape.y, M_WIDTH, M_HEIGHT);
  });

  slide.slideImages.forEach((image, id) => {
    //画像を中央から拡大
    image.x = stage.canvas.width / 2;
    image.y = stage.canvas.height / 2;

    if (
      (images[id].height * stage.canvas.width) / images[id].width <
      stage.canvas.height
    ) {
      image.scaleY = stage.canvas.height / images[id].height;
      image.scaleX = image.scaleY;
    } else {
      image.scaleX = stage.canvas.width / images[id].width;
      image.scaleY = image.scaleX;
    }

    IMAGE_CONFIG.imageTargetBeforeScale = image.scaleX * 1.05;
    IMAGE_CONFIG.imageTargetAfterScale = image.scaleX;

    image.scale = IMAGE_CONFIG.imageTargetAfterScale;

    image.regX = images[id].width / 2;
    image.regY = images[id].height / 2;

    image.set({
      mask: slide.maskShapes[id],
    });
  });

  stage.update();
};

const drawGraphic = (graphic) => {
  graphic[0] = graphic.moveTo(-150, 0).command;
  graphic[1] = graphic.lineTo(stage.canvas.width, 0).command;
  graphic[2] = graphic.lineTo(
    stage.canvas.width + 150,
    stage.canvas.height
  ).command;
  graphic[3] = graphic.lineTo(0, stage.canvas.height).command;
  graphic[4] = graphic.closePath().command;
};

const setTween = (slide) => {
  overRectAnimation();
};

const setSlideCount = () => {
  currentSlide++;
  if (currentSlide == IMAGES.length) currentSlide = 0;
  nextSlide = currentSlide + 1;
  if (nextSlide == IMAGES.length) nextSlide = 0;

  contentsReset();
};

const contentsReset = () => {
  // do some resetting
};

function progressSet() {
  createjs.Ticker.removeEventListener("tick", update);
  progressbar.style.transform = "translate(-100%, 0%)";
  createjs.Tween.get(progressbar)
    .to({ transform: "translate(-100%, 0%)" }, 0)
    .to({ transform: "translate(0%, 0%)" }, SLIDE_TIME)
    .call(function () {
      console.log("PROGRESS SET");
      setCurrentSlide(currentSlide);
      NEXT_SLIDE(nextSlide);
      setSlideCount();
    });
}

// 現在のスライド用
function setCurrentSlide(targetIndex) {
  createjs.Tween.get(slide.maskShapes[targetIndex])
    .to({ x: -50 }, 0)
    .to({ x: stage.canvas.width - 50 }, CHANGE_SPEED, createjs.Ease.cubicInOut);
  maskAnimation(targetIndex);
}

function NEXT_SLIDE(targetIndex) {
  createjs.Tween.get(slide.slideImages[targetIndex])
    .to(
      { scale: IMAGE_CONFIG.imageTargetBeforeScale },
      0,
      createjs.Ease.cubicInOut
    )
    .to(
      { scale: IMAGE_CONFIG.imageTargetAfterScale },
      500,
      createjs.Ease.cubicInOut
    );

  createjs.Tween.get(slide.maskShapes[targetIndex])
    .to({ x: stage.canvas.width }, 0)
    .to({ x: 0 }, CHANGE_SPEED, createjs.Ease.cubicInOut)
    .call(progressSet);

  maskAnimation(targetIndex);
}

// 捲頁效果
function overRectAnimation() {
  createjs.Ticker.addEventListener("tick", update, false);
  createjs.Tween.get(rect)
    .wait(DELAY)
    .to({ x: 0 }, 0)
    .to({ x: -stage.canvas.width - 50 }, CHANGE_SPEED, createjs.Ease.cubicInOut)
    .call(function () {
      console.log("OVER RECT ANIMATION");
      progressSet();
    });
}

function maskAnimation(targetIndex) {
  createjs.Ticker.addEventListener("tick", update, false);

  createjs.Tween.get(slide.graphics[targetIndex][0])
    .to({ x: 50 }, 0)
    .to({ x: -50 }, CHANGE_SPEED, createjs.Ease.cubicInOut);
  createjs.Tween.get(slide.graphics[targetIndex][1])
    .to({ x: stage.canvas.width + 100 }, 0)
    .to({ x: stage.canvas.width }, CHANGE_SPEED, createjs.Ease.cubicInOut);
  createjs.Tween.get(slide.graphics[targetIndex][2])
    .to({ x: stage.canvas.width }, 0)
    .to({ x: stage.canvas.width + 50 }, CHANGE_SPEED, createjs.Ease.cubicInOut);
  createjs.Tween.get(slide.graphics[targetIndex][3])
    .to({ x: -50 }, 0)
    .to({ x: 0 }, CHANGE_SPEED, createjs.Ease.cubicInOut);
}

const update = () => {
  IMAGES.forEach((image, id) => {
    slide.maskShapes[id].updateCache();
  });
  stage.update();
};
