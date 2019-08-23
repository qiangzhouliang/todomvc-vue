(function (Vue) { //表示依赖了全局的vue
  var STORAGE_KEY = 'items-vuejs';
  // 本地存储数据对象
  const itemStorage = {
    fetch: function () { // 获取本地数据
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    },
    save: function (items) { // 保存数据到本地
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }

  //自定义全局指令，用于 增加输入框
  //定义时不要在前面加v-, 引用指令时要加上v
  Vue.directive('app-focus', {
    //聚集元素
    inserted (el, binding) {
      el.focus()
    }
  })
  //表示申明的变量是不可变的
  const items = []
  var app = new Vue({
    el: '#todoapp',
    data: {
      items: itemStorage.fetch(), //获取本地数据进行初始化,
      currentItem: null, //上面不要少了逗号， 接收当前点击的任务项
      filterStatus: 'all' //接收变化的状态值
    },
    // 监听器
    watch: {
      // 如果 items 发生改变，这个函数就会运行
      items: {
        deep: true, // 发现对象内部值的变化, 要在选项参数中指定 deep: true。
        handler: function(newItems, oldItems) {
          //本地进行存储
          itemStorage.save(newItems)
        }
      }
    },
    //自定义局部指令，用于编辑输入框
    directives: {
      //定义时不要在前面加v-, 引用指令时要加上v-
      'todo-focus' : {
        update (el, binding) { // 每当指令的值更新后，会调用此函数
          if (binding.value) {
            el.focus()
          }
        }
      }
    },
    methods: {
      addItem (event) {
        console.log('add',event.target.value)
        // 1 获取文本框中的内容
        const content = event.target.value.trim()
        // 2 判断数据是否为空
        if (!content.length) { // content.length 如果为0 代表的就是false
          return
        }
        // 3 如果不为空，则添加到数组中
        const id = this.items.length + 1
        this.items.push(
          {
            id, //主键
            content, //输入的内容
            completed: false //是否完成
          }
        )
        // 4 清空输入框的内容
        event.target.value = ''
      },
      //删除任务项
      removeItem(index) {
        // 移除索引为index的一条记录
        this.items.splice(index,1)
      },
      //移除所有已完成的任务项
      removeCompleted () {
        // 过滤出所有未完成的任务，重新赋值数组即可
        this.items = this.items.filter(item => !item.completed)
      },
      // 进入编辑状态,当前点击的任务项item赋值currentItem，用于页面判断显示 .editing
      toEdit (item) {
        this.currentItem = item
      },
      //取消编辑
      cancelEdit () {
        // 移除样式
        this.currentItem = null
      },
      //编辑完成
      finishEdit (item, index, event) {
        console.log('编辑完成'+index)
        const content = event.target.value.trim();
        // 1. 如果为空, 则进行删除任务项
        if (!event.target.value.trim() && item === this.currentItem){
          //重用 removeItem 函数进行删除
          this.removeItem(index)
          // 3. 移除 .editing 样式
          this.currentItem = null
          return
        }
         // 2. 添加数据到任务项中
        item.content = content
        // 3. 移除 .editing 样式
        this.currentItem = null
      }
    },
    //计算属性
    computed: {
      //剩余未完成任务量
      remaining () {
        // 数组 filter函数过滤出所有为未完成的任务项
        //unItems 用于接收过滤之后所有未完成的任务项，它是一个数组
        const unItems = this.items.filter(function(item){
          return !item.completed // !item.completed 表示未完成的
        })
        return unItems.length
      },
      toggleAll: {
        //当任务列表中的状态发生变化之后，就更新复选框的状态
        get () {
          return this.remaining === 0
        },
        //当复选框的状态发生变化之后，更新任务列表的状态
        set (newStatus) {
          //1. 当点击 checkbox 复选框后状态变化后，就会触发该方法运行,
          // 迭代出数组每个元素,把当前状态值赋给每个元素的 completed
          this.items.forEach((item) => {
            item.completed = newStatus
          })
        }
      },
      // 过滤出不同状态数据
      filterItems () {
        //this.filterStatus 作为条件，变化后过滤不同数据
        switch (this.filterStatus) {
          case "active": // 过滤出未完成的数据
            return this.items.filter( item => !item.completed)
            break
          case "completed": // 过滤出已完成的数据
            return this.items.filter( item => item.completed)
            break
          default: // 其他，返回所有数据
            return this.items
        }
      },
    },
  })

  //当路由 hash 值改变后会自动调用此函数
  window.onhashchange = function() {
    console.log('hash改变了', window.location.hash)
    // 1.获取点击的路由 hash , 当截取的 hash 不为空返回截取的，为空时返回 'all'
    const hash = window.location.hash.substr(2) || 'all'
    console.log('hash', hash)
    // 2. 状态一旦改变，将 hash 赋值给 filterStatus
    // 当计算属性 filterItems 感知到 filterStatus 变化后，就会重新过滤
    // 当 filterItems 重新过滤出目标数据后，则自动同步更新到视图中
    app.filterStatus = hash
  }
  // 第一次访问页面时,调用一次让状态生效
  window.onhashchange()

})(Vue);
