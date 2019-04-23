// 单向绑定
function Subject() {
  if(!new.target||new.target !==Subject){
    throw new Error('请使用new操作符')
  }
  console.log(new.target)
  this.observes = []
}
Subject.prototype.constructor = Subject
Subject.prototype.addObserve = function(observe){
  if(this.observes.indexOf(observe) >= 0){
    return
  }
  this.observes.push(observe)
}
Subject.prototype.removeObserve = function(observe){
  const observeIndex = this.observes.indexOf(observe)
  if(observeIndex < 0){
    return
  }
  this.observes.splice(observeIndex,1)
}
Subject.prototype.notify = function(data){
  this.observes.forEach(observe=>{
    observe.update(data)
  })
}


function Observe(options) {
  if(!new.target||new.target!==Observe){
    throw new Error('请使用new操作符')
  }
  this.value = options.value
  this.update = function (newValue) {
    options.callback.call(this,newValue)
    this.value = newValue
  }
}
Observe.prototype = {
  constructor: Observe,
  subscribe(subject){
    subject.addObserve(this)
  },
}


// Mvvm
function Mvvm (options) {
  if (!new.target) {
    throw new Error('请使用new操作符')
  }
  this.$el = document.getElementById(options.el)
  if(!this.$el){
    throw new Error('请指定正确的ID选择器')
  }
  this.$data = options.data
  // 获取所有节点
  let AllNode = document.getElementsByTagName('*')
  AllNode = [...AllNode].filter(item=>this.$el.contains(item))
  // 只读属性 $nodes
  Object.defineProperty(this,'$nodes',{
    configurable: false,
    get (){return AllNode}
  })
  // 保存所有订阅中心
  const subjects = {}
  this.defineReactive(this.$data,subjects)
  this.renderText(subjects)
}
Mvvm.prototype = {
  defineReactive(data,subjects){
    Object.keys(data).forEach((key) => {
      const isExit = Object.keys(subjects).some(item=>item === key)
      if(isExit) return
      const subject = new Subject(key)
      subjects[key] =subject
      let val = data[key]
      Object.defineProperty(data,key,{
        configurable: false,
        get(){
          return val
        },
        set(newVal){
          subject.notify(newVal)
          val = newVal
        }
      })
    })
  },
  renderText(subjects){
    let textNode = []
    this.$nodes.forEach(node=>{
      const texts = [...node.childNodes].filter(node=>node.nodeType === 3)
      textNode = textNode.concat(texts)
    })
    const reg = /{{(.+?)}}/g
    textNode.forEach(node=>{
      const matches = node.data.match(reg)
      if(!matches) return
      matches.forEach(item=>{
        const key = item.replace('{{','').replace('}}','')
        const initData = this.$data[key]
        node.data = node.data.replace(item,initData)
        const observe = new Observe({
          value: initData,
          callback(newVal){
            node.data = node.data.replace(this.value,newVal)
          }
        })
        if(`${key}` in subjects) observe.subscribe(subjects[key])
      })
    })
  }
}
const vm = new Mvvm({
  el: 'root',
  data:{
    msg: 'hello world',
    name:'marry',
    age: 18
  }
})
console.log(vm)
