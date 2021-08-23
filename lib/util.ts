

import { view, lensPath } from 'ramda';
import { PropertyPath } from './types';
export const viewPath = (path: PropertyPath) => view(lensPath(path));

