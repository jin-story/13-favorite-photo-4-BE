import * as photoCardService from "./photo-card.service.js";

export async function createPhotoCard(req, res, next) {
  try {
    const photoCard = await photoCardService.createPhotoCard(req.user.userId, req.body);
    res.status(201).json(photoCard);
  } catch (error) {
    next(error);
  }
}

export async function listPhotoCards(req, res, next) {
  try {
    const photoCards = await photoCardService.listPhotoCards(req.query);
    res.status(200).json(photoCards);
  } catch (error) {
    next(error);
  }
}

export async function getPhotoCard(req, res, next) {
  try {
    const photoCard = await photoCardService.getPhotoCard(req.params.photoCardId);
    res.status(200).json(photoCard);
  } catch (error) {
    next(error);
  }
}

export async function listMyPhotoCards(req, res, next) {
  try {
    const photoCards = await photoCardService.listMyPhotoCards(req.user.userId, req.query);
    res.status(200).json(photoCards);
  } catch (error) {
    next(error);
  }
}
