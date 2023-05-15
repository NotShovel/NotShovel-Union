<template>
  <div class="editor-all">
    <div class="editor-form">
      <div class="editor-menu">
        <input type="text" class="form-control editor-title" v-model="title" placeholder="제목">
        <input type="date" class="form-control editor-date" v-model="date"> 
        <input type="text" class="form-control editor-date" v-model="location" placeholder="장소">
      </div>
      <div class="editor-content">
        <Editor ref="toastEditor" initialEditType="wysiwyg" height="550px" previewStyle="vertical" />
      </div>
    </div>
    <div class="editor-right">
      <div class="editor-right-menu">
        <button type="submit" class="btn btn-outline-primary" @click="save()">작성완료</button>
        <button type="button" class="btn btn-outline-secondary" @click="goMeetingMinutes()">나가기</button>
      </div>
      <div class="editor-chat">
        <div class="editor-chat-content" ref="chatBox">
          <li v-for="(log, index) in logs" :key="index">
            {{log.member_name}}: {{log.context}}
          </li>
        </div>
        <div class="input-group mb-3">
        <input type="text" v-model="context" @keyup.enter="send($event)" class="form-control" placeholder="채팅" aria-describedby="button-addon2">
        <button class="btn btn-outline-secondary" type="button" id="button-addon2" @click="send">전송</button>
      </div>
    </div>
    </div>
  </div>
</template>
 
<script>
import axios from 'axios'
import { Editor } from '@toast-ui/vue-editor'
import '@toast-ui/editor/dist/toastui-editor.css' // Editor style
import io from "socket.io-client";

export default {
  data() {
    return {
      board_id: null,
      member_id: null,
      title: null,
      date: null,
      location: null,
      main: false, 
      logs: [],
      context: null,       // input 바인딩,
      member_name: sessionStorage.getItem('member_name'),
    }
  },
  props: {
    isWrite: Boolean,
    post_id: String,
  },
  components: {
    Editor,
  },
  mounted() {
    this.member_id = sessionStorage.getItem('member_id');
    this.board_id = sessionStorage.getItem('board_id');
    this.date = new Date().toISOString().slice(0,10);
	  window.addEventListener('beforeunload', this.leave);



    // 채팅 추가
    
    const list = axios.get('/api/chat/list',{
      params: {
        postId: this.$props.post_id,
        boardId: this.board_id
      }
    })
      .then((res) => {
        console.log(res);
        this.logs = res.data.chattings;
        this.$nextTick(() => { 
      // this.$refs.chatBox.scrollTop = this.$refs.chatBox.scrollHeight; 
    });
      })
      .catch((err) => console.log(err));
    console.log(list.data);

    const postId = this.$props.post_id;
    // 다른 네트워크 주소로 통신할 경우 url을 변경해줘야함
    const serverUrl = 'http://localhost:3000';
    this.socket = io(serverUrl);
    this.socket.on("welcome", () => {console.log("new member join!")});
    this.socket.emit("enter_openChat", this.$props.post_id);
    this.socket.on("new_message", chat => {
      // console.log(`${chat.msg}`);
      this.logs.push(chat);
      this.$nextTick(() => {
        // 모든 DOM 업데이트가 완료된 후에 실행
          this.$refs.chatBox.scrollTop = this.$refs.chatBox.scrollHeight;
        });
    });

  }, 
  beforeUnmount() {
    window.removeEventListener('beforeunload', this.leave);
    // 채팅 리스너 제거 추가
    this.socket.off('new_message');
    this.socket.off("welcome");
    this.socket.disconnect();
  },
  methods: {
    leave(event) {
      // 리스트에 있거나 나가기 버튼 외에 새로고침 방지 메소드
      if (this.main === false && this.isWrite === true) {
      event.preventDefault();
      event.returnValue = '';
      }
    },
    async save() {
      if(this.title == '' || this.date == '' || this.place == ''){
        alert('빈 값을 다 채워주세요');
        return;
      }
      try {
        const board_id = this.board_id;
        const member_id = this.member_id;

        await axios.post('/api/meeting', {
          board_id: this.board_id,
          title: this.title,
          date: this.date,
          context: this.getContent(),
          place: this.place,
          member_id 
        })
        this.main = true;
        alert('회의록 저장 완료');
        this.$router.go();
      } catch (err) {
        console.error(err);
        alert('회의록 저장 실패');
      }
    },
    goMeetingMinutes(){
      this.main = true;
      const chk = confirm('저장되지 않은 변경 사항이 있습니다. 정말 나가시겠습니까?');
      if(chk) {
        this.$router.go();
      }
      else return;
    },
    getContent() {
      return this.$refs.toastEditor.invoke('getMarkdown');
    },
    setContent(content) {
      this.$refs.toastEditor.invoke('setMarkdown', content);
    },

    // 채팅 전송 이벤트 추가
    send(event) {
      event.stopPropagation(); // 이벤트 전파를 멈춥니다.
      if(this.context !== "") {
        const chat = {
          boardId: this.board_id,
          roomName: this.$props.post_id,
          context: this.context,
          member_id: sessionStorage.getItem('member_id'),
          member_name: this.member_name,
          type: 'normal'
        }
      
        this.socket.emit("new_message", chat, () => {
          this.logs.push(chat);
          this.$nextTick(() => {
          // 모든 DOM 업데이트가 완료된 후에 실행
            // this.scrollToBottom();
            this.$refs.chatBox.scrollTop = this.$refs.chatBox.scrollHeight;
            axios.post('/api/meeting/chat', chat, {
              params: {
                postId: this.$props.post_id,
                boardId: this.board_id
              }
            })
              .then((res) => console.log(res))
              .catch((err) => console.log(err));
          });
      });
        this.context = "";
    }}
  },
}
</script>
<style scoped>
.editor-all {
  display: flex;
  width: 80%;
  /* height: 90vh; */
  align-items: center;
  justify-content: center;
}

.editor-form {
  width: 100%;
  height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.editor-menu {
  margin: 10px;
  display: flex;
  height: 5vh;
  width: 100%;
}

.editor-title {
  width: 70%;
  margin-right: 10px;
}
.editor-content {
  width: 100%;
}

.editor-date {
  width: 30%;
  margin-right: 10px;
}
.editor-location {
  width: 30%;
}
.editor-right {
  margin-left: 10px;
  height: 90vh;
  width: 30%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.editor-right-menu {
  margin: 10px;
  height: 5vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.editor-chat{
  border: 1px solid #ccc;
  height: 550px;
  width: 100%;
  border-radius: 10px;
}
.editor-chat-content{
  height: 512px;
}

.btn {
  margin-left: 10px;
}
</style>