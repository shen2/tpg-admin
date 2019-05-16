import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'
import apollo from '@/utils/apolloRequest'
import graphqlQuery from '@/api/graphql/query'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    jwt : null,
    viewer : {},
  },
  mutations: {
    setJwt (state, jwt){
      state.jwt = jwt;
    },
    setViewer (state, viewer){
      state.viewer = viewer;
    },
  },
  actions: {
    initialize (context){
      let jwt = window.localStorage.getItem('jwt');
      if (jwt){
        context.commit('setJwt', jwt);

        let viewerJson = window.localStorage.getItem('viewer');
        if (viewerJson){
          context.commit('setViewer', JSON.parse(viewerJson));
        }
      }

      apollo.defaultClient
        .query({query: graphqlQuery.initialize})
        .then(({data,errors}) => {
          context.commit('setViewer', data.viewer);
          window.localStorage.setItem('viewer', JSON.stringify(data.viewer));
        })
        .catch(error=>{
          console.log('getUserInfoError'+error);
        });
    }
  },
  modules: {
    app,
    settings,
    user
  },
  getters,
})

export default store
