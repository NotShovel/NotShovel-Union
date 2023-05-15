const meeting_minutes = require("../models/meeting_minutes");
const meetingMinutes = require("../models/meeting_minutes");

exports.save = async (req, res) => {
  try {
    const { board_id, title, date, context, place, member_id } = req.body;

    const meeting_minutes = {
        title,
        date,
        context,
        place,
        member_ids: member_id,
    }

    const result = await meetingMinutes.findOneAndUpdate(
      { _id: board_id },
      { $push: {meeting_minutes} },
      { upsert: true },
      { new: true }
    );
    
    const findResult = await meetingMinutes.findOne({_id: board_id});
    const minutes = findResult.meeting_minutes;
    const minute = minutes[minutes.length-1];
    
    // console.log("meeting 배열 길이: " + result.meeting_minutes.length);
    console.log(`추가된 객체 : ${minute}`);

    res.status(200).json({ message: "회의록 저장 완료", data: minute });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "회의록 저장 실패" });
  }
};



exports.getChatList = async(req, res) => {
  // const postId = req.query.postId;

  // try {
  //   const chatLogs = await chat.findOne({ _id: boardId });
  //   console.log(chatLogs);
  //   res.status(200).json(chatLogs);
  // } catch(e) {
  //   console.log(e);
  //   res.status(500).json({ message: "채팅 로그 불러오기 실패" });
  // }
};


exports.insertChat = async(req, res) => {
  const receiveChat = req.body;
  const postId = req.query.postId;
  const boardId = receiveChat.boardId;
  console.log("boardId: " + boardId);

  console.log(`receiveChat from minute: ${receiveChat.context}, memberId: ${receiveChat.member_id}, postId: ${postId}`);

  try {

    await meetingMinutes.findOneAndUpdate(
      { _id: boardId },
      { $push: {
        meeting_chattings: {
          context: receiveChat.context, member_id: receiveChat.member_id,
          roomName: postId
        }
      } 
    });
    res.status(200).json({ message: "채팅 로그 저장성공" });
  } catch(e) {
    console.log(e);
    res.status(500).json({ message: "채팅 로그 저장실패" });
  }
};