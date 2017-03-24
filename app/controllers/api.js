var express = require('express'),
  router = express.Router(),
  db = require('../models');

module.exports = function (app) {
  app.use('/api', router);
};

//login logout
  router.post('/login', (req, res) => {
    db.User.find({where:{username:req.body.username,password:req.body.password}})
    .then((user)=>{
      if(!user) res.sendStatus(404);
      req.session.user = user;
      res.sendStatus(200);
    })
    .error((error)=>{
      res.sendStatus(500);
    });
  
  });

  router.post('/logout', (req, res) => {
    delete req.session.user;
    res.sendStatus(200);
  });

//login logout end

//User

//建立使用者
router.post('/user', (req, res, next) => {

  db.User.build({
      username: req.body.username,
      password: req.body.password,
      name: req.body.name,
      isActive: req.body.isActive
    }).save()
    .then((user) => {
      console.log(user);
      res.sendStatus(200);
    })
    .error((error) => {
      res.sendStatus(500);
    });


});

//User End


//Group

//建立聊天群組
router.post('/group', function (req, res, next) {

  db.Group.build({
      name: req.body.name,
      isActive: 1
    }).save()
    .then(() => {
      res.sendStatus(200);
    })
    .error((error) => {
      res.sendStatus(500);
    });


});

//Group End

//UserXgroups


//加入群組
router.post('/userxgroup', function (req, res, next) {

  db.UserXgroup.build({
      userId: req.session.user.id,
      groupId: req.body.groupId,
      isActive: req.body.isActive
    }).save()
    .then(() => {
      res.sendStatus(200);
    })
    .error((error) => {
      res.sendStatus(500);
    });


});

//UserXgroups End


//Message

//取得某個USER傳來的訊息

router.get('/message/user/:id', function (req, res, next) {




});

//取得某個USER傳來的訊息 END

//取得群組內的訊息

router.get('/message/group/:id', function (req, res, next) {

   if (!req.params.id) {
    res.sendStatus(500);
  }else{
    
    //確認使用者在群組中
    db.UserXgroup
    .find({where:{groupId:req.params.id,userId:req.session.user.id}})
    .then((result)=>{
      //使用者不在群組中 
      if(!result) res.sendStatus(404);
      
      //使用者在群組中 就找出 MessageRecipient inner join Message 然後 傳回訊息
      db.MessageRecipient
      .findAll({
        include:[
          {
            model:db.Message,
            required:true
          }
        ],
        where:{
          recipientGroupId:result.id
        }
      })
      .then((results)=>{
        res.json(results);
      })
      .error((error)=>{
        res.sendStatus(500);
      });

      


    })
    .error((error)=>{
      res.sendStatus(500);
    });

  }


});

//取得群組內的訊息 END

//傳送訊息至群組
router.post('/message/group/:id', function (req, res, next) {

  if (!req.params.id) {
    res.sendStatus(500);
  } else {
    //建立訊息
    db.Message.build({
        subject: req.body.subject,
        messageBody: req.body.messageBody,
        creatorId: req.body.creatorId,
        parentMessageId: req.body.parentMessageId,
        expiryDate: null,
        isActive: req.body.isActive
      })
      .save()
      .then((msg) => {

        //找出群組內有幾個USER
        db.UserXgroup
          .findAll({
            where: {
              groupId: req.params.id
            }
          })
          .then((results) => {
            //建立訊息紀錄
            let msgRecipients = [];
            results.forEach((result) => {
              msgRecipients.push({
                recipientId: null,
                recipientGroupId: result.id,
                messageId: msg.id,
                isRead: 0
              });
            });
            //儲存訊息紀錄
            db.MessageRecipient.bulkCreate(msgRecipients)
              .then(function () {
                res.sendStatus(201);
              })
              .error(error => {
                res.sendStatus(500);
              });



          });

      })
      .error((error) => {
        res.sendStatus(500);
      });


    }

});

//傳送訊息至個人
router.post('/message/user/:id', function (req, res, next) {

  if (!req.params.id) {
    res.sendStatus(500);
  } else {

    db.Message.build({
        subject: req.body.subject,
        messageBody: req.body.messageBody,
        creatorId: req.body.creatorId,
        parentMessageId: req.body.parentMessageId,
        expiryDate: null,
        isActive: req.body.isActive
      })
      .save()
      .then((msg) => {

        db.MessageRecipient.build({
            recipientId: req.params.id,
            recipientGroupId: null,
            messageId: msg.id,
            isRead: 0
          })
          .save()
          .then(() => {
            res.sendStatus(200);
          })
          .error((error) => {
            res.sendStatus(500);
          });

      })
      .error((error) => {
        res.sendStatus(500);
      });
  }



}); //Message End

/*
//messageRecipient

router.post('/message-recipient', function (req, res, next) {

  db.MessageRecipient.build({
      recipientId: DataTypes.INTEGER,
      recipientGroupId: DataTypes.INTEGER,
      messageId: DataTypes.INTEGER,
      isRead:DataTypes.INTEGER
    }).save()
    .then(() => {
      res.sendStatus(200);
    })
    .error((error) => {
      res.sendStatus(500);
    });


});

//messageRecipient End
*/
