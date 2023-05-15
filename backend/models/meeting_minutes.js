const { trusted } = require('mongoose');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const meeting_minutes = new Schema({
    // 게시판 공통 내용
    project_id: { type: Schema.Types.ObjectId, ref: 'projects', required: true },
    board_name: { type: String, required: true },
    board_order: { type: Number, required: true}, // 중복이 안돼야 정렬할때 편하게 작업 가능
    
    // 회의록 내용 - 채팅
    meeting_chattings: [{
        context: { type: String }, // req
        type: { type: String, enum: ['normal', 'reply', 'mention', 'file']}, // req
        date: { type: Date, default: Date.now },
        member_id: { type: Schema.Types.ObjectId, ref: 'members'}, // req
        attached_file: {
            file_name: { type: String}, // req
            file_extension: String, // 확장자 없는 파일 올렸을 때 에러 방지용으로 required설정 x
        },
        roomName: { type: String }
    }],

    // 회의록 내용 - 본문
    meeting_minutes : [ {title: { type: String }, // req
        context: { type: String }, // req
        date: { type: Date, default: Date.now }, // 회의한 날짜
        place: String,
        create_date: { type: Date, default: Date.now }, // 회의록 작성한 날짜
        modify_date: [ { type: Date, default: Date.now } ],
        member_ids: { type: Schema.Types.ObjectId, ref: 'members' }
    }]
});

module.exports = mongoose.model('meeting_minutes', meeting_minutes);