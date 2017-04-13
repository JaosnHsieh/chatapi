var express = require('express'),
  router = express.Router(),
  db = require('../models');

module.exports = function (app) {
  app.use('/api', router);
};

//login logout
router.post('/login', (req, res) => {
  db.ChatUser.find({
      where: {
        username: req.body.username,
        password: req.body.password
      }
    })
    .then((user) => {
      if (!user) {
        res.sendStatus(404);
        return;
      }

      req.session.user = user;
      res.sendStatus(200);

    })
    .error((error) => {
      res.sendStatus(500);
    });

});

router.post('/logout', (req, res) => {
  delete req.session.user;
  res.sendStatus(200);
});

//login logout end

//User

//取得所有使用者清單
router.get('/user', (req, res, next) => {
  db.ChatUser
    .findAll({attributes: ['idno', 'username','name']})
    .then((chatUsers) => {
        res.json(chatUsers);
    })
    .error((error)=>{
        res.sendStatus(500);
    });
});
//取得所有使用者清單 END

//取得某group內的使用者清單
router.get('/user/group/:id', (req, res, next) => {
    //如果沒輸入group id 就 response 500
    if (!req.params.id) {
        res.sendStatus(500);
        return;
    } 
    
    //找group內的users 只回傳userId
    db.ChatUserXgroup 
    .findAll({attributes: ['userId'],where:{groupId:req.params.id}})
    .then((chatUserXgroups) => {
        res.json(chatUserXgroups);
    })
    .error((error)=>{
        res.sendStatus(500);
    });
   
});
//取得某group內的使用者清單 END

//建立使用者
router.post('/user', (req, res, next) => {
  db.ChatUser
    .find({
      where: {
        username: req.body.username
      }
    })
    .then((user) => {

      //如果有已經有一樣的username就返回 409 conflict
      if (user != null) {
        res.sendStatus(409);
        return;
      }

      db.ChatUser.build({
          username: req.body.username,
          password: req.body.password,
          name: req.body.name,
          isActive: req.body.isActive
        }).save()
        .then((user) => {
          res.sendStatus(201);
        })
        .error((error) => {
          res.sendStatus(500);
        });


    });


});

//User End


//Group

//取得所有群組清單

router.get('/group', function (req, res, next) {

  db.ChatGroup.findAll()
  .then((chatgroups)=>{
    res.json(chatgroups);
  })
  .error((error)=>{
    res.sendStatus(500);
  });

});

//取得所有群組清單 END

//建立聊天群組
router.post('/group', function (req, res, next) {

  db.ChatGroup.build({
      name: req.body.name,
      isActive: 1
    }).save()
    .then(() => {
      res.sendStatus(201);
    })
    .error((error) => {
      res.sendStatus(500);
    });


});

//Group End

//UserXgroups


//加入群組
router.post('/userxgroup', function (req, res, next) {

  db.ChatGroup
    .find({
      where: {
        idno: req.body.groupId
      }
    })
    .then((chatGroup) => {
      //如果群組不存在 就404 not found
      if (chatGroup == null) {
        res.sendStatus(404);
        return;
      };


      db.ChatUserXgroup
        .find({
          where: {
            userId: req.session.user.idno,
            groupId: req.body.groupId
          }
        })
        .then((userXGroup) => {

          //如果有已經有一樣的userId和groupId就代表該使用者已經加入過群組 返回 409 conflict
          if (userXGroup != null) {
            res.sendStatus(409);
            return;
          }

          //建立加入群組的紀錄 insert ChatUserXgroup
          db.ChatUserXgroup.build({
              userId: req.session.user.idno,
              groupId: req.body.groupId,
              isActive: req.body.isActive
            }).save()
            .then(() => {
              res.sendStatus(201);
            })
            .error((error) => {
              res.sendStatus(500);
            });

        });

    });




});

//UserXgroups End


//Message

//取得使用者收到的所有訊息

router.get('/message/user', function (req, res, next) {

   // 就找出 MessageRecipient inner join ChatMessage 然後 傳回訊息
        db.ChatMessageRecipient
          .findAll({
            include: [{
              model: db.ChatMessage,
              required: true
            }],
            where: {
              recipientId: req.session.user.idno
            }
          })
          .then((chatMessageRecipients) => {
            res.json(chatMessageRecipients);
          })
          .error((error) => {
            res.sendStatus(500);
          });


});

////取得使用者收到的所有訊息 END



//取得群組內的訊息

router.get('/message/group/:id', function (req, res, next) {
  

  if (!req.params.id) {
    res.sendStatus(500);
    return;
  } 


    //確認使用者在群組中
    db.ChatUserXgroup
      .find({
        where: {
          groupId: req.params.id,
          userId: req.session.user.idno
        }
      })
      .then((chatUserXgroup) => {
        
        //使用者不在群組中 403 Forbidden
        if (chatUserXgroup==null) {
          res.sendStatus(403);
          return;
        }

        //使用者在群組中 就找出 MessageRecipient inner join ChatMessage 然後 傳回訊息
        db.ChatMessageRecipient
          .findAll({
            include: [{
              model: db.ChatMessage,
              required: true
            }],
            where: {
              recipientGroupId: chatUserXgroup.idno
            }
          })
          .then((chatMessageRecipients) => {
            res.json(chatMessageRecipients);
          })
          .error((error) => {
            res.sendStatus(500);
          });




      })
      .error((error) => {
        res.sendStatus(500);
      });

  

});

//取得群組內的訊息 END

//傳送訊息至個人
router.post('/message/user/:id', function (req, res, next) {

  if (!req.params.id) {
    res.sendStatus(500);
    return;
  } 

  db.ChatUser
  .find({where:{idno:req.params.id}})
  .then((chatUser)=>{
    //找不到使用者
    if(chatUser==null){
      res.sendStatus(404);
      return;
    }

     db.ChatMessage.build({
        subject: req.body.subject,
        messageBody: req.body.messageBody,
        creatorId: req.session.user.idno,
        parentMessageId: req.body.parentMessageId,
        expiryDate: null,
        isActive: req.body.isActive
      })
      .save()
      .then((msg) => {

        db.ChatMessageRecipient.build({
            recipientId: req.params.id,
            recipientGroupId: null,
            messageId: msg.idno,
            isRead: 0
          })
          .save()
          .then(() => {
            res.sendStatus(201);
          })
          .error((error) => {
            res.sendStatus(500);
          });

      })
      .error((error) => {
        res.sendStatus(500);
      });

  })
  .error((error)=>{
      res.sendStatus(500);
  });
  
   
  



}); 
//傳送訊息至個人 END

//傳送訊息至群組
router.post('/message/group/:id', function (req, res, next) {

  if (!req.params.id) {
    res.sendStatus(500);
  } else {
    //建立訊息
    db.ChatMessage.build({
        subject: req.body.subject,
        messageBody: req.body.messageBody,
        creatorId: req.session.user.idno,
        parentMessageId: req.body.parentMessageId,
        expiryDate: null,
        isActive: req.body.isActive
      })
      .save()
      .then((msg) => {

        //找出群組內有幾個USER及這些USER的idno
        db.ChatUserXgroup
          .findAll({
            where: {
              groupId: req.params.id
            }
          })
          .then((chatUserXGroups) => {
            //如果群組內沒人
            if(chatUserXGroups.length==0){
              res.sendStatus(404);
              return
            }
 
            //群組有人
            //建立群組每個人的訊息紀錄
            let msgRecipients = [];
            chatUserXGroups.forEach((chatUserXGroup) => {
              msgRecipients.push({
                recipientId: null,
                recipientGroupId: chatUserXGroup.idno,
                messageId: msg.idno,
                isRead: 0
              });
            });
            //儲存訊息紀錄
            db.ChatMessageRecipient.bulkCreate(msgRecipients)
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

//傳送訊息至群組 END


//Message End

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
