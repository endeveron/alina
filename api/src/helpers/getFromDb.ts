import { FilterQuery, Model, Types } from 'mongoose';

import { HttpError } from './error';
import logger from './logger';

const handleResData = <T>(
  resData: any,
  itemModel: Model<T>,
  notFoundMsg: string
) => {
  if (!resData) {
    return {
      data: null,
      error: new HttpError(
        notFoundMsg || `${itemModel.modelName} not found.`,
        404
      ),
    };
  }
  return {
    data: resData,
    error: null,
  };
};

const handleHttpError = <T>(err: any, itemModel: Model<T>) => {
  logger.r(`getItem 500 ${itemModel.modelName}`, err);
  return {
    data: null,
    error: new HttpError('Server error. Please try again later.', 500),
  };
};

const getItem = async <T>(
  itemModel: Model<T>,
  query: FilterQuery<T>,
  notFoundMsg?: string
) => {
  try {
    const resData = await itemModel.findOne(query);
    return handleResData(resData, itemModel, notFoundMsg || 'Not found.');
  } catch (err) {
    return handleHttpError(err, itemModel);
  }
};

const getItemById = async <T>(
  itemModel: Model<T>,
  id: Types.ObjectId | string,
  notFoundMsg?: string
) => {
  try {
    const resData = await itemModel.findById(id);
    return handleResData(resData, itemModel, notFoundMsg || 'Not found.');
  } catch (err) {
    return handleHttpError(err, itemModel);
  }
};

export { getItem, getItemById };
