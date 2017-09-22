import createReducer from 'util/create-reducer';
import postActionTypes from 'actions/post-action-types';
import myStreetsActionTypes from 'actions/my-streets-action-types';
import headerActionTypes from 'views/header/state/header-action-types';
import appActionTypes from 'actions/app-action-types';

const initialState = {
    newPost: {
        author: '',
        body: '',
        createdDate: '',
    },
    postsfeed: [],
    Strings: {},
};

export default createReducer(initialState, {

    [postActionTypes.ADD_POST_SUCCEEDED](state, action) {
        const { data: { post: { newPost } } } = action;
        const { postsfeed } = state;
        const newPostsfeed = postsfeed ? postsfeed.slice() : [];
        newPostsfeed.unshift(newPost);

        return {
            ...state,
            postsfeed: newPostsfeed,
        };
    },

    [appActionTypes.SET_LANGUAGE](state, action) {
        const { data: Strings } = action;

        return {
            ...state,
            Strings,
        };
    },

    [headerActionTypes.GET_POSTS_SUCCEEDED](state, action) {
        const { data: { postsfeed } } = action;
        return {
            ...state,
            postsfeed,
        };
    },

    [myStreetsActionTypes.SEARCH_SUCCEEDED](state, action) {
        const { data: { selectedStreet: { postsfeed } } } = action;
        return {
            ...state,
            postsfeed,
        };
    },

    [postActionTypes.GET_POSTSFEED_SUCCEEDED](state, action) {
        const { data: { postsfeed } } = action;
        return {
            ...state,
            postsfeed,
        };
    },

});
