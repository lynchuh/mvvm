# 观察者模式

关于观察者模式在网上有很多资料可以查阅，其中大部分会将它与发布订阅模式放在一起讨论。

## 观察者模式 & 发布订阅模式

首先，从维基百科上查看他们各自的定义。

[观察者模式](https://en.wikipedia.org/wiki/Observer_pattern)

[发布订阅模式](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern)

从两个模式的名称中，我们可以看到几个关键字：`观察`、`发布`、`订阅`

我个人的理解：

观察者模式的发布者跟订阅者是紧紧关联的，甚至是“同一个人”（同一个接口）--- 观察者A告诉被观察者B，当B某个状态改变时，立马通知A。

而发布订阅模式，明显发布者跟订阅者是互不相关的，甚至他们不关心对方是谁。这里就需要一个eventBus来作消息的过滤分类及通知。

## 简单实现一个观察者模式

```javaScript
function Subject(){ //主题中心
    this.Observers = [] //所有观察者
  }
  Subject.prototype.addObserver=function(observe){
    const isTargetExist = this.Observers.indexOf(observe) !== -1
    isTargetExist ? console.log('observer already exists') : this.Observers.push(observer)
  }
  Subject.prototype.removeObserver=function(observe){
    const index = this.Observers.indexOf(observe)
    if(index > -1){
      this.Observers.slice(index,1)
    }
  Subject.prototype.notify=function(){
    this.Observers.forEach( observer=>{
      observer.update.call(undefined)
    })
  }
}

function Observer (){ // 观察者
  this.update= function(){
    // ...
  }
  this.subscribeTo = function(Subject){
    Subject.addObserver(this)
  }
}

// 创建一个主题
const 发工资 = new Subject()

const A = new Observer()
const B = new Observer()
A.update = function(){
  console.log('买买买')
}
B.update = function(){
  console.log('存起来~')
}
A.subscribeTo(发工资) //订阅发工资主题
B.subscribeTo(发工资) //订阅发工资主题


//某处通知观察者要发工资了
发工资.notify()
```

## 简单实现一个发布订阅中心：

```javascript
function EventHub() {
  this.observes = {}
}
EventHub.prototype.emit =function(observer,data) {
  Object.keys(this.observes).forEach(key=>{
    if(key=== observer){
      this.observes[key].forEach(fn=>fn.call(undefined,data))
    }
  })
}
EventHub.prototype.on = function(observer,fn) {
  const current = this.observes[observer]  
  current ? current.push(fn):(this.observes[observer] = [])
}

const eventHub = new EventHub()

// A发布一个主题：
function A (){
  //do something
  if(xxx){ //当xxx的时候
    eventHub.emit('发工资')
  }
}
// B订阅这个主题
function B(){
  eventHub.on('发工资',function(){
    console.log('买买买')
  })
}
// C也订阅了这个主题
function C(){
  eventHub.on('发工资',function(){
    console.log('存起来~')
  })
}
```


## 总结
通过代码分析，可以总结到：

1. 观察者模式

    分析代码后，个人认为观察者里并不存在发布者与订阅者这两个角色，而是观察者与主题这两个概念。并且**每个主题可以清晰地知道订阅它的观察者是谁。**

    这时候，再回头看看维基百科对观察者模式的描述。或许能更理解这段话的描述。
    > The observer pattern is a software design pattern in which an object, called the subject, maintains a list of its dependents, called observers, and notifies them automatically of any state changes

    它在软件设计中是一个对象，并维护一个依赖列表，当任何状态发生改变自动通知它们。

2. 发布订阅模式

    发布订阅模式里，更重要的是处理消息的eventBus。它并不关心谁发布了哪一条消息，也不关心谁订阅了这个消息。在发布订阅模式里，发布者与订阅者是松耦合的，eventBus只关心有哪些主题被发布了。
