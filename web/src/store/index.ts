import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);
interface State {
  currNovelChanel: string | null;
}
export default new Vuex.Store<State>({
  state: {
    currNovelChanel: sessionStorage.getItem("currNovelChanel"),
  },
  mutations: {
    setCurrNovelChanel(state, chanel) {
      state.currNovelChanel = chanel;
      sessionStorage.setItem("currNovelChanel", chanel);
    },
  },
  getters: {},
  actions: {},
  modules: {},
});
