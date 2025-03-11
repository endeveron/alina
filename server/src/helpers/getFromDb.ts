import { FilterQuery, Model, Types } from 'mongoose';

import { HttpError } from './error';
import logger from './logger';

const handleResData = <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const handleHttpError = <T>(err: Error | unknown, itemModel: Model<T>) => {
  logger.error(`getItem 500 ${itemModel.modelName}`, err);
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
  } catch (err: unknown) {
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
