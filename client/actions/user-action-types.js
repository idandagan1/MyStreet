import createActionTypes from 'util/create-action-types';

export default createActionTypes('USER', [
    'FACEBOOK_LOGIN_SUCCEEDED',
    'LOGIN_SUCCEEDED',
    'LOGIN_FAILED',
]);