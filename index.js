const ComfyJS = require("comfy.js");
const fs = require("fs");
const dotenv = require('dotenv-safe');

dotenv.config(); // Enables .env file to be used

// Make sure the directory containing the text files exists
// Create directory if it doesn't exist
fs.mkdir(process.env.FILE_PATH, { recursive: true }, (err) => {
  if (err) {
    console.error(err.message);
  }
});

ComfyJS.onSub = (user, message, subTierInfo, extra) => {
  let { tier, content } = buildSubscriptionContent(user, subTierInfo);
  console.log(content);
  writeToFile(`${process.env.FILE_NAME_ON_SUB}-${tier}`, content);
};

ComfyJS.onResub = ( user, message, streamMonths, cumulativeMonths, subTierInfo, extra ) => {
  let { tier, content } = buildSubscriptionContent(user, subTierInfo);

  // Add additional message if streamed longer than 0 months
  if (cumulativeMonths > 0) {
    content += ` for ${cumulativeMonths} months`;
  }

  console.log(content);
  writeToFile(`${process.env.FILE_NAME_ON_RESUB}-${tier}`, content);
};

ComfyJS.onHosted = ( user, viewers, autohost, extra ) => {
  if (autohost) return;
  const content = `${user} is hosting with ${viewers} viewers`;
  console.log(content);
  writeToFile(`${process.env.FILE_NAME_ON_HOSTED}`, content);
};

ComfyJS.onRaid = ( user, viewers, extra ) => {
  const content = `${user} is raiding with ${viewers} viewers`;
  console.log(content);
  writeToFile(`${process.env.FILE_NAME_ON_RAID}`, content);
};

ComfyJS.onCheer = ( user, message, bits, flags, extra ) => {
  const content = `${user} has just cheered ${bits} bits`;
  console.log(content);
  writeToFile(`${process.env.FILE_NAME_ON_CHEER}`, content);
};

ComfyJS.onSubGift = ( gifterUser, streakMonths, recipientUser, senderCount, subTierInfo, extra ) => {
  const content = `${gifterUser} has gifted a sub to ${recipientUser}`;
  console.log(content);
  writeToFile(`${process.env.FILE_NAME_ON_SUB_GIFT}`, content);
}

ComfyJS.onSubMysteryGift = ( gifterUser, numbOfSubs, senderCount, subTierInfo, extra ) => {
  let content = `${gifterUser} has gifted ${numbOfSubs} subs to members of the community`;
  console.log(content);
  writeToFile(`${process.env.FILE_NAME_ON_SUB_MYSTERY_GIFT}`, content);
};

ComfyJS.onGiftSubContinue = ( user, sender, extra ) => {
  const content = `${user} has continued their subscription, originally gifted by ${sender}`;
  console.log(content);
  writeToFile(`${process.env.FILE_NAME_ON_GIFT_SUB_CONTINUE}`, content);
}

ComfyJS.onError = (error) => {
  if (error) {
    console.error(error.message);
    writeToFile(`${process.env.FILE_NAME_ERROR}`, error.message);
  }
}

ComfyJS.Init(process.env.CHANNEL_NAME);

// Helper functions

buildSubscriptionContent = (user, subTierInfo) => {
    let tier;
    let content = `${user} has subscribed`;
  
    //Determine if sub is prime, tier 1, tier 2 or tier 3
    if (subTierInfo.prime) {
      tier = "twitch-prime";
      content += ` with Twitch Prime`;
    } else {
      tier = getSubscriptionTier(subTierInfo);
      content += ` at Tier ${tier}`;
    }

    return { tier, content };
};

getSubscriptionTier = (subTierInfo) => {
  switch (subTierInfo.plan) {
    case "1000":
      return "1";
    case "2000":
      return "2";
    case "3000":
      return "3";
    default:
      console.error("Unable to determine valid tier subscription from Twitch");
  }
};

writeToFile = (fileName, message) => {
  const filePath = `${process.env.FILE_PATH}${fileName}${process.env.FILE_FORMAT}`;
  fs.writeFile(filePath, message, (err) => {
    if (err) console.error(err.message);
  });
};
