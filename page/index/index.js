import {$, Vue} from '../main.js'

var data = { a: 1 }
var vm = new Vue({
  el: '#app',
  data: data
});


console.info($, Vue);

//弹出一个actionsheet
$.actions({
  actions: [{
    text: "编辑",
    onClick: function() {
      //do something
    }
  },{
    text: "删除",
    onClick: function() {
      //do something
    }
  }]
});