<template>
  <div id="app">
    <h1>一起来</h1>
    <div>
      <strong>{{source}}</strong>
      <input type="text" v-model="target">
      <button v-on:click="link">连接</button>
    </div> 
    <div class="chess">
      <div class="row" v-for="(items,i) in chesses.length">
          <div class="item" :class="[chesses[`${wrapIndex(j)}${wrapIndex(i)}`]]" v-for="(item,j) in chesses.length" v-on:click="tick(j,i)"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      count: 20,
      player: 'r',
      chesses: {},
      target: '',
      source: '',
      linked: false,
      isOver: false
    }
  },
  created () {
    let chesses = {}
    for (var i = 0; i < this.count; i++) {
      for (var j = 0; j < this.count; j++) {
        chesses[`${this.wrapIndex(i)}${this.wrapIndex(j)}`] = ''
      }
    }
    chesses.length = this.count
    this.chesses = chesses
    let socket = io.connect('http://10.14.230.78:9000')
    socket.on('connect', () => {
      this.socket = socket
      this.source = this.socket.id
      console.log(this.socket.id)
    })
    socket.on('other-tick', (data) => {
      this.audio.play()
      this.chesses = data
    })
    socket.on('linkSuccess', () => {
      window.alert('link success')
      this.linked = true
    })
    socket.on('linkFail', (data) => {
      window.alert(data.msg)
    })
    socket.on('linked', () => {
      window.alert('has been linked, just wait')
      this.linked = true
      this.player = 'b'
    })
    socket.on('lose', (data) => {
      this.audio.play()
      this.chesses = data
      this.isOver = true
      window.alert('you lose')
    })
    let audio = new window.Audio('/static/tick.mp3')
    console.log(audio)
    audio.addEventListener('canplaythrough', () => {
      // audio.play()
      this.audio = audio
    }, false)
  },
  computed: {
  },
  methods: {
    link () {
      if (this.target) {
        this.socket.emit('link', {
          target: this.target.trim(),
          source: this.socket.id
        })
      }
      return false
    },
    tick (i, j) {
      if (this.isOver) {
        return
      }
      if (this.chesses[`${this.wrapIndex(i)}${this.wrapIndex(j)}`] === '') {
        this.audio.play()
        if (!this.linked) {
          this.player = this.player === 'b' ? 'r' : 'b'
        }
        this.chesses[`${this.wrapIndex(i)}${this.wrapIndex(j)}`] = this.player
        this.check(i, j)
        this.socket.emit('tick', this.chesses)
      }
    },
    wrapIndex (index) {
      return index >= 10 ? index : `0${index}`
    },
    check (x, y) {
      //  横向
      let num = 0
      for (var j = 0; j < this.count; j++) {
        if (this.chesses[`${this.wrapIndex(x)}${this.wrapIndex(j)}`] === this.player) {
          num = num + 1
        } else {
          num = 0
        }
        if (num === 5) {
          this.socket.emit('other-lose', this.chesses)
          this.isOver = true
          window.alert('you win')
        }
      }
      //  纵向
      for (var i = 0; i < this.count; i++) {
        if (this.chesses[`${this.wrapIndex(i)}${this.wrapIndex(y)}`] === this.player) {
          num = num + 1
        } else {
          num = 0
        }
        if (num === 5) {
          this.socket.emit('other-lose', this.chesses)
          this.isOver = true
          window.alert('you win')
        }
      }
      //  左斜上\
      let sub = Math.min(x, y)
      sub = sub > 5 ? 5 : sub
      let xx = x - sub
      let yy = y - sub
      for (var k = 0; k < this.count; k++) {
        if (this.chesses[`${this.wrapIndex(xx++)}${this.wrapIndex(yy++)}`] === this.player) {
          num = num + 1
        } else {
          num = 0
        }
        if (num === 5) {
          this.socket.emit('other-lose', this.chesses)
          this.isOver = true
          window.alert('you win')
        }
      }
      //  右斜上/
      xx = this.count - x - 1
      yy = y
      sub = Math.min(xx, yy)
      sub = sub > 5 ? 5 : sub
      xx = xx - sub
      yy = yy - sub
      for (var m = 0; m < this.count; m++) {
        if (this.chesses[`${this.wrapIndex(yy++)}${this.wrapIndex(this.count - xx++ - 1)}`] === this.player) {
          num = num + 1
        } else {
          num = 0
        }
        if (num === 5) {
          this.socket.emit('other-lose', this.chesses)
          this.isOver = true
          window.alert('you win')
        }
      }
    }
  },
  components: {
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.chess{
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.row {
  display: flex;
  flex-direction: row;
  background-color: #C89C5C;
}
.item {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  cursor: pointer;
}
.item:before {
  position: absolute;
  left: 0;
  top: 20px;
  width: 40px;
  height:0;
  border:1px solid #000;
  content:'';
}
.item:after { 
  position: absolute;
  right: 20px;
  width: 0;
  height:40px;
  border:1px solid #000;
  content:'';  
}
.b.item {
  background: #AAA;
  box-shadow: 0px 0px 25px 4px #000 inset;
}
.b:before,.b:after,.r:before,.r:after {
  background: transparent;
  border-color: transparent;
}
.r.item {
  background: #FFF;
  box-shadow: 0px 0px 25px 4px #CCC inset;
}
</style>
