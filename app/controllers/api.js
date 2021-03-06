import formatMessagesForUser from "../../libs/formatMessagesForUser";
var express = require("express"),
  router = express.Router(),
  db = require("../models");

module.exports = function(app) {
  app.use("/api", router);
};

//login logout
router.post("/login", (req, res) => {
  db.ChatUser.find({
    where: {
      username: req.body.username,
      password: req.body.password
    }
  })
    .then(user => {
      if (!user) {
        return res.sendStatus(404);
      }

      req.session.user = user;
      return res.json(user);
    })
    .error(error => {
      console.error(error);
      return res.sendStatus(404);
    });
});

router.post("/logout", (req, res) => {
  delete req.session.user;
  res.sendStatus(200);
});

router.get("/login", (req, res) => {
  if (req.session && req.session.user) {
    return res.json(req.session.user);
  } else {
    console.error(error);
    return res.sendStatus(404);
  }
});

//login logout end

//User

//取得所有使用者清單
router.get("/user", (req, res, next) => {
  db.ChatUser.findAll({
    attributes: ["idno", "username", "name"]
  })
    .then(chatUsers => {
      return res.json(chatUsers);
    })
    .error(error => {
      return res.sendStatus(500);
    });
});
//取得所有使用者清單 END

//取得某group內的使用者清單
router.get("/user/group/:id", (req, res, next) => {
  //如果沒輸入group id 就 response 500
  if (!req.params.id) {
    return res.sendStatus(500);
  }

  //找group內的users 只回傳userId
  db.ChatUserXgroup.findAll({
    attributes: ["userId"],
    where: {
      groupId: req.params.id
    }
  })
    .then(chatUserXgroups => {
      return res.json(chatUserXgroups);
    })
    .error(error => {
      return res.sendStatus(500);
    });
});
//取得某group內的使用者清單 END

//建立使用者
router.post("/user", (req, res, next) => {
  db.ChatUser.find({
    where: {
      username: req.body.username
    }
  }).then(user => {
    //如果有已經有一樣的username就返回 409 conflict
    if (user !== null) {
      return res.sendStatus(409);
    }

    db.ChatUser.build({
      username: req.body.username,
      password: req.body.password,
      name: req.body.name,
      isActive: req.body.isActive
    })
      .save()
      .then(user => {
        req.session.user = user;
        return res.sendStatus(201);
      })
      .error(error => {
        return res.sendStatus(500);
      });
  });
});

//User End

//Group

//取得所有群組清單

router.get("/group", function(req, res, next) {
  db.ChatGroup.findAll({
    where: {
      isActive: 1
    }
  })
    .then(chatgroups => {
      return res.json(chatgroups);
    })
    .error(error => {
      return res.sendStatus(500);
    });
});

router.get("/mygroup", async (req, res, next) => {
  try {
    let chatUserXgroups = await db.ChatUserXgroup.findAll({
      include: [
        {
          model: db.ChatGroup,
          required: true
        }
      ],
      where: {
        userId: req.session.user.idno,
        isActive: 1
      }
    });

    let chatgroups = chatUserXgroups.map(ele => {
      return ele.ChatGroup;
    });
    return res.json(chatgroups);
  } catch (err) {
    return res.sendStatus(500);
  }
});

//取得所有群組清單 END

//建立聊天群組
router.post("/group", function(req, res, next) {
  db.ChatGroup.findOne({
    where: {
      name: req.body.name,
      isActive: 1
    }
  })
    .then(group => {
      if (group) {
        return res.status(409).send("Duplicated Name");
      }
      db.ChatGroup.build({
        name: req.body.name,
        desc: req.body.desc,
        isActive: 1
      })
        .save()
        .then(chatGroup => {
          return res.json(chatGroup);
        })
        .error(error => {
          return res.status(500).send("CREATE GROUP FAILED");
        });
    })
    .error(error => {
      return res.sendStatus(500);
    });
});

//Group End

//UserXgroups

//加入群組
router.post("/userxgroup", function(req, res, next) {
  console.log("join group api", req.body);
  db.ChatGroup.find({
    where: {
      idno: req.body.groupId,
      isActive: 1
    }
  }).then(chatGroup => {
    //如果群組不存在 就404 not found
    if (chatGroup == null) {
      return res.sendStatus(404);
    }

    db.ChatUserXgroup.find({
      where: {
        userId: req.session.user.idno,
        groupId: req.body.groupId,
        isActive: 1
      }
    }).then(userXGroup => {
      //如果有已經有一樣的userId和groupId就代表該使用者已經加入過群組 返回 409 conflict
      if (userXGroup !== null) {
        return res.status(409).send("ALREADY IN THE GROUP");
      }

      //建立加入群組的紀錄 insert ChatUserXgroup
      db.ChatUserXgroup.build({
        userId: req.session.user.idno,
        groupId: req.body.groupId,
        isActive: 1
      })
        .save()
        .then(chatUserXgroup => {
          db.ChatGroup.findOne({
            where: { idno: chatUserXgroup.groupId }
          })
            .then(chatGroup => {
              res.json(chatGroup);
            })
            .catch(err => {
              return res.sendStatus(500);
            });
        })
        .error(error => {
          return res.sendStatus(500);
        });
    });
  });
});

//離開群組
router.delete("/userxgroup/:groupId", function(req, res, next) {
  var groupId = req.params.groupId;
  db.ChatGroup.find({
    where: {
      idno: groupId
    }
  }).then(chatGroup => {
    //如果群組不存在 就404 not found
    if (chatGroup == null) {
      return res.status(404).send("NOT FOUND GROUP");
    }
    db.ChatUserXgroup.findOne({
      where: {
        userId: req.session.user.idno,
        groupId: groupId,
        isActive: 1
      }
    }).then(userXGroup => {
      if (userXGroup == null) {
        return res.status(404).send("DID NOT JOINED THE GROUP");
      }
      userXGroup
        .update({
          isActive: 0
        })
        .then(updatedUserXGroup => {
          return res.json(updatedUserXGroup);
        })
        .catch(err => {
          return res.status(500).send("updated error");
        });
    });
  });
});

//UserXgroups End

//Message

//取得使用者收到的所有訊息

router.get("/message/user", function(req, res, next) {
  //加上時間before after 條件
  var whereOption = {
    groupId: null,
    $or: [
      { recipientId: req.session.user.idno },
      { senderId: req.session.user.idno }
    ]
  };
  if (req.query.after || req.query.before) {
    whereOption.createdAt = {};
    if (req.query.after) {
      whereOption.createdAt["$gt"] = req.query.after; //$gt是 where CreatedAt >  ，要輸入的時間格式 2012-02-21T18:10:00
    }

    if (req.query.before) {
      whereOption.createdAt["$lte"] = req.query.before; //$lte是 where CreatedAt <= ，要輸入的時間格式 2012-02-21T18:10:00
    }
  }
  //加上時間before after 條件 END

  // 就找出 MessageRecipient inner join ChatMessage 然後 傳回訊息
  db.ChatMessageRecipient.findAll({
    include: [
      {
        model: db.ChatMessage,
        required: true
      }
    ],
    where: whereOption
  })
    .then(chatMessageRecipients => {
      chatMessageRecipients = chatMessageRecipients.map(ele =>
        ele.get({ plain: true })
      );
      const currentUser = req.session.user;
      const chatMessages = formatMessagesForUser(
        chatMessageRecipients,
        currentUser
      );
      return res.json(chatMessages);
    })
    .error(error => {
      console.log(error);
      return res.sendStatus(500);
    });
});

////取得使用者收到的所有訊息 END
//取得登入使用者已加入的所有群組訊息
router.get("/message/group", async (req, res, next) => {
  // return res.json([]);
  const currentUser = req.session.user;
  let userXGroups = await db.ChatUserXgroup.findAll({
    where: {
      userId: currentUser.idno,
      isActive: 1
    }
  });
  let groupIdUserXGroupIdMap = userXGroups.reduce((result, ele) => {
    return {
      ...result,
      [ele.idno]: ele.groupId
    };
  }, {});
  let userXGroupsIds = userXGroups.map(userXGroup => userXGroup.idno);
  let ChatMessageRecipients = await db.ChatMessageRecipient.findAll({
    include: [
      {
        model: db.ChatMessage,
        required: true
      }
    ],
    where: {
      recipientId: currentUser.idno,
      recipientGroupId: { $in: userXGroupsIds }
    }
  });

  //整理成 map 方便前端使用
  let chatMessagesObject = ChatMessageRecipients.reduce((result, ele) => {
    const groupId = groupIdUserXGroupIdMap[ele.recipientGroupId];
    return {
      ...result,
      [groupId]: result[`${groupId}`]
        ? [...result[groupId], ele.ChatMessage]
        : [ele.ChatMessage]
    };
  }, {});
  return res.json(chatMessagesObject);
});
//取得登入使用者已加入的所有群組訊息 END
//取得群組內的訊息

// router.get("/message/group/:id", function(req, res, next) {
//   if (!req.params.id) {
//     return res.sendStatus(500);
//   }

//   //確認使用者在群組中
//   db.ChatUserXgroup.find({
//     where: {
//       groupId: req.params.id,
//       userId: req.session.user.idno
//     }
//   })
//     .then(chatUserXgroup => {
//       //使用者不在群組中 403 Forbidden
//       if (chatUserXgroup == null) {
//         return res.sendStatus(403);
//       }

//       //加上時間before after 條件
//       var whereOption = {
//         groupId: chatUserXgroup.idno
//       };
//       if (req.query.after || req.query.before) {
//         whereOption.createdAt = {};
//         if (req.query.after) {
//           whereOption.createdAt["$gt"] = req.query.after; //$gt是 where CreatedAt >  ，要輸入的時間格式 2012-02-21T18:10:00
//         }

//         if (req.query.before) {
//           console.log("entering before if");
//           whereOption.createdAt["$lte"] = req.query.before; //$lte是 where CreatedAt <= ，要輸入的時間格式 2012-02-21T18:10:00
//         }
//       }
//       //加上時間before after 條件 END

//       //使用者在群組中 就找出 MessageRecipient inner join ChatMessage 然後 傳回訊息
//       db.ChatMessageRecipient.findAll({
//         include: [
//           {
//             model: db.ChatMessage,
//             required: true
//           }
//         ],
//         where: whereOption
//       })
//         .then(chatMessageRecipients => {
//           return res.json(chatMessageRecipients);
//         })
//         .error(error => {
//           return res.sendStatus(500);
//         });
//     })
//     .error(error => {
//       return res.sendStatus(500);
//     });
// });

// //取得群組內的訊息 END

//傳送訊息至個人
router.post("/message/user/:id", function(req, res, next) {
  if (!req.params.id) {
    return res.sendStatus(500);
  }

  db.ChatUser.find({
    where: {
      idno: req.params.id
    }
  })
    .then(chatUser => {
      //找不到使用者
      if (chatUser == null) {
        return res.sendStatus(404);
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
        .then(msg => {
          db.ChatMessageRecipient.build({
            recipientId: req.params.id,
            senderId: req.session.user.idno,
            groupId: null,
            messageId: msg.idno,
            isRead: 0
          })
            .save()
            .then(() => {
              return res.sendStatus(201);
            })
            .error(error => {
              return res.sendStatus(500);
            });
        })
        .error(error => {
          return res.sendStatus(500);
        });
    })
    .error(error => {
      return res.sendStatus(500);
    });
});
//傳送訊息至個人 END

//傳送訊息至群組
// router.post("/message/group/:id", function(req, res, next) {});
//傳送訊息至群組 END
// //傳送訊息至群組 2018.02.28 實做群組聊天時覺得原設計太麻煩 改了schema 所以下面這段用不到了
// router.post("/message/group/:id", function(req, res, next) {
//   if (!req.params.id) {
//     return res.sendStatus(500);
//   } else {
//     //建立訊息
//     db.ChatMessage.build({
//       subject: req.body.subject,
//       messageBody: req.body.messageBody,
//       creatorId: req.session.user.idno,
//       parentMessageId: req.body.parentMessageId,
//       expiryDate: null,
//       isActive: req.body.isActive
//     })
//       .save()
//       .then(msg => {
//         //找出群組內有幾個USER及這些USER的idno
//         db.ChatUserXgroup.findAll({
//           where: {
//             groupId: req.params.id
//           }
//         }).then(chatUserXGroups => {
//           //如果群組內沒人
//           if (chatUserXGroups.length == 0) {
//             return res.sendStatus(404);
//           }

//           //群組有人
//           //建立群組每個人的訊息紀錄
//           let msgRecipients = [];
//           chatUserXGroups.forEach(chatUserXGroup => {
//             msgRecipients.push({
//               recipientId: null,
//               groupId: chatUserXGroup.idno,
//               senderId: req.session.user.idno,
//               messageId: msg.idno,
//               isRead: 0
//             });
//           });
//           //儲存訊息紀錄
//           db.ChatMessageRecipient.bulkCreate(msgRecipients)
//             .then(function() {
//               return res.sendStatus(201);
//             })
//             .error(error => {
//               return res.sendStatus(500);
//             });
//         });
//       })
//       .error(error => {
//         return res.sendStatus(500);
//       });
//   }
// });

//傳送訊息至群組 END

//Message End

/*
//messageRecipient

router.post('/message-recipient', function (req, res, next) {

  db.MessageRecipient.build({
      recipientId: DataTypes.INTEGER,
      groupId: DataTypes.INTEGER,
      messageId: DataTypes.INTEGER,
      isRead:DataTypes.INTEGER
    }).save()
    .then(() => {
      return res.sendStatus(200);
    })
    .error((error) => {
      return res.sendStatus(500);
    });


});

//messageRecipient End
*/
