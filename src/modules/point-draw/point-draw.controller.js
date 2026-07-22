import pointDrawService from "./point-draw.service.js";

async function getDrawStatus(req, res) {
  const result = await pointDrawService.getDrawStatus(req.user.userId);

  return res.status(200).json(result);
}

async function drawPoint(req, res) {
  const result = await pointDrawService.drawPoint(req.user.userId);

  return res.status(201).json(result);
}

export default {
  getDrawStatus,
  drawPoint,
};
