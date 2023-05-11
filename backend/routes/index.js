const memberController = require('../controllers/members');
const projectController = require('../controllers/projects');
const ganttController = require('../controllers/gantt_charts');
const boardController= require('../controllers/common/board');
const meetingController = require('../controllers/meeting_minutes');

module.exports = (app) => {
  //member
  app.post('/api/member/signup', memberController.signUp);
  app.post('/api/member/signin', memberController.signIn);
  app.patch('/api/member/edit', memberController.editMember);
  app.delete('/api/member/delete', memberController.deleteMemeber);
  app.post('/api/member/image', memberController.imageUpload);
  app.post('/api/member/chkPw', memberController.chkPW);

  // project
  app.post('/api/project', projectController.save);
  app.get('/api/project', projectController.findProjects);
  app.patch('/api/project', projectController.updateProject);
  app.delete('/api/project', projectController.deleteProject);

  app.post('/api/project/upload', projectController.imageUpload);
  app.get('/api/project/authority/', projectController.findAuth);

  app.get('/api/project/members', projectController.findMembers);
  app.post('/api/project/grade', projectController.changeGrade);
  app.delete('/api/project/exit', projectController.exitProject);
  app.patch('/api/project/register', projectController.registerToProject);

  // gantt
  app.post('/api/gantt', ganttController.save);

  // board
  app.patch('/api/board/order', boardController.changeBoardOrder);
  app.post('/api/board', boardController.createBoard);
  app.get('/api/board', boardController.getBoardList);

  // meeting_minutes
  app.post('/api/meeting', meetingController.save);
};