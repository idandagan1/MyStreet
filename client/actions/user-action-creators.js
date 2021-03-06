import * as userApi from 'api/user-api';
import * as streetApi from 'api/streets-api';
import { push } from 'react-router-redux';
import headerActionTypes from 'views/header/state/header-action-types';
import userActionTypes from './user-action-types';
import myStreetsActionTypes from './my-streets-action-types';

export function getActiveUser(user, streetSelected) {
    return dispatch => {
        if (user && user._id) {
            dispatch(getUserLoginSucceeded(user));
            return;
        }
        userApi.getActiveUser()
            .then(
                response => dispatch(loginSucceeded(response, streetSelected)),
                error => dispatch(loginFailed(error)),
            );
    };
}

function getUserLoginSucceeded(user) {
    return dispatch => {
        dispatch({
            type: userActionTypes.GET_USER_LOGIN_SUCCEEDED,
            data: { ...user },
        });

        if (user.local.primaryStreet) {
            streetApi.getStreetByPlaceId(user.local.primaryStreet.placeId)
                .then(
                    response => dispatch(searchStreetSucceeded(response, user.local.primaryStreet)),
                    error => dispatch(searchStreetFailed(error)),
                );
        }
    };
}

export function facebookLoginSubmitted(user) {
    return dispatch => {
        dispatch({
            type: userActionTypes.FACEBOOK_LOGIN_SUBMITTED,
            data: { user },
        });

        userApi.getFacebookLogin(user)
            .then(
                response => dispatch(loginSucceeded(response)),
                error => dispatch(loginFailed(error)),
            );
    };
}

export function updatedProfileSubmitted(user) {
    return dispatch => {

        userApi.updateUserInfo(user)
            .then(
                response => dispatch(updateUserSucceeded(response)),
                error => dispatch(updateUserFailed(error)),
            );
    };
}

export function logoutUser(user) {
    return dispatch => {
        userApi.logoutUser(user)
            .then(
                response => dispatch(logoutSucceeded(response)),
                error => dispatch(logoutFailed(error)),
            );
    };
}

function updateUserSucceeded({ activeUser }) {
    return dispatch => {
        dispatch({
            type: userActionTypes.UPDATE_USER_SUCCEEDED,
            data: { activeUser },
        });
    };
}

function updateUserFailed() {
    return {
        type: userActionTypes.UPDATE_USER_FAILED,
    };
}

function logoutSucceeded(response) {
    return dispatch => {
        dispatch({
            type: userActionTypes.LOGOUT_SUCCEEDED,
            data: { response },
        });
    };
}

function logoutFailed() {
    return {
        type: userActionTypes.LOGOUT_FAILED,
    };
}

export function userSelected(userId) {
    return dispatch => {
        userApi.getUserById(userId)
            .then(
                response => dispatch(getUserSucceeded(response)),
                error => dispatch(getUserFailed(error)),
            );
    };
}

function getUserSucceeded({ selectedUser }) {
    return dispatch => {

        dispatch({
            type: userActionTypes.GET_USER_SUCCEEDED,
            data: { selectedUser },
        })

        dispatch(push(`/user/${selectedUser.facebook.id}`));
    };
}

function getUserFailed(error) {
    return {
        type: userActionTypes.GET_USER_FAILED,
    };
}

function loginSucceeded({ activeUser, msg }, streetSelected) {
    return dispatch => {

        if (!activeUser) {
            dispatch({
                type: userActionTypes.USER_NOT_FOUND,
                data: { msg },
            });
            return;
        }

        dispatch({
            type: userActionTypes.LOGIN_SUCCEEDED,
            data: { ...activeUser },
        });

        if (!streetSelected && activeUser.local.primaryStreet) {
            streetApi.getStreetByPlaceId(activeUser.local.primaryStreet.placeId)
                .then(
                    response => dispatch(searchStreetSucceeded(response, activeUser.local.primaryStreet)),
                    error => dispatch(searchStreetFailed(error)),
            );

            dispatch(push('/mystreets'));
        }
    };
}

function searchStreetSucceeded(response, primaryStreet) {
    const { selectedStreet } = response;
    return {
        type: myStreetsActionTypes.SEARCH_SUCCEEDED,
        data: { selectedStreet: selectedStreet || primaryStreet },
    };
}

function searchStreetFailed(error) {
    return {
        type: userActionTypes.SEARCH_FAILED,
    };
}

function loginFailed() {
    return {
        type: userActionTypes.LOGIN_FAILED,
    };
}

export function getPostsSucceeded(streetObject) {
    const { postsfeed } = streetObject;
    return {
        type: headerActionTypes.GET_POSTS_SUCCEEDED,
        data: { postsfeed },
    };
}

export function getPostsFailed(error) {
    return {
        type: headerActionTypes.GET_POSTS_FAILED,
        data: { error },
    };
}
