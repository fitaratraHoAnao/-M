module.exports.config = {
  name: "log",
  eventType: ["log:unsubscribe", "log:subscribe", "log:thread-name"],
  version: "1.0.0",
  credits: "MrTomXxX",
  description: "سجل إشعارات نشاط البوت!",
  envConfig: {
      enable: true
  }
};

module.exports.run = async function ({ api, event, Users, Threads }) {
  const logger = require("../../utils/log");
  if (!global.configModule[this.config.name].enable) return;
  let botID = api.getCurrentUserID();
  var allThreadID = global.data.allThreadID;
  for (const singleThread of allThreadID) {
      const thread = global.data.threadData.get(singleThread) || {};
      if (typeof thread["log"] != "undefined" && thread["log"] == false) return;
  }

  const moment = require("moment-timezone");
  const time = moment.tz("Africa/Algiers").format("D/MM/YYYY HH:mm:ss");
  //let nameThread = (await Threads.getData(event.threadID)).threadInfo.threadName || "اسم غير موجود";
  let nameThread = global.data.threadInfo.get(event.threadID).threadName || "اسم غير موجود"; 

  let threadInfo = await api.getThreadInfo(event.threadID);
  nameThread = threadInfo.threadName;
  const nameUser = global.data.userName.get(event.author) || await Users.getNameUser(event.author);

  console.log(nameThread);

  var formReport = "[⚜️] 𝙇𝙚𝙩𝙩𝙚𝙧 𝙤𝙛 𝘼 𝙂𝙧𝙤𝙪𝙥 [⚜️]" +
      "\n\n[⚜️] 𝙂𝙧𝙤𝙪𝙥 𝙉𝙖𝙢𝙚: " + nameThread +
      "\n\n[⚜️] 𝙂𝙧𝙤𝙪𝙥 𝙐𝙞𝙙: " + event.threadID +
      "\n\n[⚜️] 𝘼𝙘𝙩𝙞𝙤𝙣: {task}" +
      "\n\n[⚜️] 𝙋𝙚𝙧𝙨𝙤𝙣 𝙉𝙖𝙢𝙚: " + nameUser +
      "\n\n[⚜️] 𝙃𝙞𝙨 𝙐𝙞𝙙: " + event.author +
      "\n\n[⚜️] 𝙏𝙞𝙢𝙚: " + time + "",
      task = "";

  switch (event.logMessageType) {
      case "log:thread-name": {
          newName = event.logMessageData.name || "اسم غير موجود";
          //task = "قام المستخدم بتغيير اسم المجموعة إلى " + newName + "";
          await Threads.setData(event.threadID, { name: newName });
          break;
      }
      case "log:subscribe": {
          if (event.logMessageData.addedParticipants.some(i => i.userFbId == botID)) 
              task = "[⚜️] تم إضافته إلى مجموعة جديدة [⚜️]";
          break;
      }
      case "log:unsubscribe": {
          if (event.logMessageData.leftParticipantFbId == botID) {
              if (event.senderID == botID) return;
              const data = (await Threads.getData(event.threadID)).data || {};
              data.banned = true;
              var reason = "[⚜️] اضغط على البوت بحرية، دون إذن🚫";
              data.reason = reason || null;
              data.dateAdded = time;
              await Threads.setData(event.threadID, { data });
              global.data.threadBanned.set(event.threadID, { reason: data.reason, dateAdded: data.dateAdded });

              task = "[⚜️] تم طرد البوت";
          }
          break;
      }
      default:
          break;
  }

  if (task.length == 0) return;

  formReport = formReport.replace(/\{task}/g, task);

  return api.sendMessage(formReport, global.config.ADMINBOT[0], (error, info) => {
      if (error) return logger(formReport, "تسجيل الحدث");
  });
}
